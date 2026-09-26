import nodemailer from "nodemailer";

let transporter;

function getRecipient(order) {
  const recipient = order.deliveryInfo?.email?.trim();
  if (!recipient) {
    throw new Error(`Cannot send order email: missing recipient for order ${order.shortId || order._id}`);
  }
  return recipient;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatAmount(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

async function deliverEmail({ to, subject, text, html }) {
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    if (!process.env.FROM_EMAIL) {
      throw new Error("FROM_EMAIL must be set to a verified sender address when using Resend");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, text, html }),
      signal: AbortSignal.timeout(10000),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(`Resend rejected the email (${response.status}): ${result.message || "Unknown provider error"}`);
    }

    console.log("[mailer] Email accepted by Resend:", result.id || "message id unavailable");
    return;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("Email is not configured. Set RESEND_API_KEY and FROM_EMAIL, or configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and FROM_EMAIL.");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      tls: { rejectUnauthorized: false },
    });
  }

  const info = await transporter.sendMail({ from, to, subject, text, html });
  console.log("[mailer] Email accepted by SMTP:", info.messageId || info.response);
}

export async function sendOrderConfirmationEmail(order) {
  const to = getRecipient(order);
  const name = order.deliveryInfo?.fullName || "Customer";
  const orderId = order.shortId || order._id;
  const total = formatAmount(order.total);

  const subject = `Your BlissTechIq order ${orderId} is confirmed`;
  const itemsList = (order.items || [])
    .map((i) => `- ${i.name || i.title || "Item"} x${i.quantity || 1} (${formatAmount(i.price)})`)
    .join("\n");

  const text = `Hi ${name},\n\nThank you for shopping with BlissTechIq. Your order has been confirmed and is now being prepared.\n\nOrder number: ${orderId}\nOrder total: ${total}\n\nItems:\n${itemsList}\n\nWe'll email you again when your order status changes.\n\nBest regards,\nThe BlissTechIq Team`;

  const htmlItems = (order.items || [])
    .map((i) => `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#374151">${escapeHtml(i.name || i.title || "Item")}</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151">${i.quantity || 1}</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;color:#374151">${formatAmount(i.price)}</td></tr>`)
    .join("");
  const html = `<div style="margin:0;background:#f3f4f6;padding:32px 16px;font-family:Arial,sans-serif;color:#111827"><div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden"><div style="background:#111827;padding:24px 28px;color:#ffffff"><div style="font-size:22px;font-weight:700">BlissTechIq</div><div style="margin-top:6px;color:#d1d5db;font-size:14px">Order confirmation</div></div><div style="padding:28px"><p style="margin-top:0">Hi ${escapeHtml(name)},</p><p>Thank you for shopping with BlissTechIq. Your order has been confirmed and is now being prepared.</p><p><strong>Order number:</strong> ${escapeHtml(orderId)}</p><table style="width:100%;border-collapse:collapse;margin:20px 0"><thead><tr><th style="padding:10px 0;border-bottom:2px solid #111827;text-align:left;font-size:13px">Item</th><th style="padding:10px 0;border-bottom:2px solid #111827;text-align:center;font-size:13px">Qty</th><th style="padding:10px 0;border-bottom:2px solid #111827;text-align:right;font-size:13px">Price</th></tr></thead><tbody>${htmlItems}</tbody><tfoot><tr><td colspan="2" style="padding:16px 0 0;text-align:right;font-weight:700">Total</td><td style="padding:16px 0 0;text-align:right;font-weight:700">${total}</td></tr></tfoot></table><p>We'll email you again when your order status changes.</p><p style="margin-bottom:0">Best regards,<br/><strong>The BlissTechIq Team</strong></p></div></div></div>`;

  await deliverEmail({ to, subject, text, html });
}

export async function sendOrderStatusEmail(order, status) {
  const to = getRecipient(order);
  const name = order.deliveryInfo?.fullName || "Customer";
  const orderId = order.shortId || order._id;

  let subject;
  let text;
  let html;

  if (status === "Ready for pickup") {
    subject = `Your BlissTechIq order ${orderId} is ready for pickup`;
    text = `Hi ${name},\n\nYour BlissTechIq order ${orderId} is ready for pickup.\n\nPlease bring your order number when you arrive.\n\nBest regards,\nThe BlissTechIq Team`;
    html = `<div style="font-family:Arial,sans-serif;color:#111827"><h2>Your order is ready for pickup</h2><p>Hi ${escapeHtml(name)},</p><p>Your BlissTechIq order <strong>${escapeHtml(orderId)}</strong> is ready for pickup.</p><p>Please bring your order number when you arrive.</p><p>Best regards,<br/><strong>The BlissTechIq Team</strong></p></div>`;
  } else if (status === "Out for Delivery") {
    subject = `Your BlissTechIq order ${orderId} is out for delivery`;
    text = `Hi ${name},\n\nYour BlissTechIq order ${orderId} is out for delivery and should arrive soon.\n\nBest regards,\nThe BlissTechIq Team`;
    html = `<div style="font-family:Arial,sans-serif;color:#111827"><h2>Your order is out for delivery</h2><p>Hi ${escapeHtml(name)},</p><p>Your BlissTechIq order <strong>${escapeHtml(orderId)}</strong> is out for delivery and should arrive soon.</p><p>Best regards,<br/><strong>The BlissTechIq Team</strong></p></div>`;
  } else if (status === "Delivered") {
    subject = `Your BlissTechIq order ${orderId} has been delivered`;
    text = `Hi ${name},\n\nYour BlissTechIq order ${orderId} has been delivered. Thank you for shopping with us!\n\nWe hope you enjoy your purchase and look forward to serving you again.\n\nBest regards,\nThe BlissTechIq Team`;
    html = `<div style="font-family:Arial,sans-serif;color:#111827"><h2>Your order has been delivered</h2><p>Hi ${escapeHtml(name)},</p><p>Your BlissTechIq order <strong>${escapeHtml(orderId)}</strong> has been delivered.</p><p>Thank you for shopping with BlissTechIq! We hope you enjoy your purchase and look forward to serving you again.</p><p>Best regards,<br/><strong>The BlissTechIq Team</strong></p></div>`;
  } else {
    subject = `Update on your BlissTechIq order ${orderId}`;
    text = `Hi ${name},\n\nYour BlissTechIq order ${orderId} has been updated to: ${status}.\n\nWe'll keep you informed about the next step.\n\nBest regards,\nThe BlissTechIq Team`;
    html = `<div style="font-family:Arial,sans-serif;color:#111827"><h2>Order status update</h2><p>Hi ${escapeHtml(name)},</p><p>Your BlissTechIq order <strong>${escapeHtml(orderId)}</strong> has been updated to:</p><p style="font-size:18px;font-weight:700">${escapeHtml(status)}</p><p>We'll keep you informed about the next step.</p><p>Best regards,<br/><strong>The BlissTechIq Team</strong></p></div>`;
  }

  await deliverEmail({ to, subject, text, html });
}

export default { sendOrderConfirmationEmail, sendOrderStatusEmail };
