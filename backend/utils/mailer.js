import nodemailer from "nodemailer";

// Create and cache transporter
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

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[mailer] SMTP not fully configured. Emails will be logged to console instead of sent.");
    transporter = null;
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: port || 587,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: false },
  });

  return transporter;
}

export async function sendOrderConfirmationEmail(order) {
  const t = getTransporter();

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

  if (!t) {
    console.log("[mailer] (dry-run) would send email to:", to);
    console.log("[mailer] subject:", subject);
    console.log("[mailer] text:\n", text);
    return;
  }

  const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER;

  try {
    const info = await t.sendMail({ from: fromAddress, to, subject, text, html });
    console.log("[mailer] Order confirmation email sent:", info.messageId || info.response);
  } catch (err) {
    console.error("[mailer] Error sending order confirmation email:", err);
    try {
      console.log("[mailer] Attempting Ethereal fallback (development only)...");
      const testAccount = await nodemailer.createTestAccount();
      const etherealTransport = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });

      const info = await etherealTransport.sendMail({ from: fromAddress, to, subject, text, html });
      console.log('[mailer] Ethereal test email sent. Preview URL:', nodemailer.getTestMessageUrl(info));
      console.log('[mailer] Ethereal messageId:', info.messageId || info.response);
      return;
    } catch (fallbackErr) {
      console.error('[mailer] Ethereal fallback also failed:', fallbackErr);
      throw err;
    }
  }
}

export async function sendOrderStatusEmail(order, status) {
  const t = getTransporter();

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

  if (!t) {
    console.log("[mailer] (dry-run) would send status email to:", to);
    console.log("[mailer] subject:", subject);
    console.log("[mailer] text:\n", text);
    return;
  }

  const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER;

  try {
    const info = await t.sendMail({ from: fromAddress, to, subject, text, html });
    console.log("[mailer] Order status email sent:", info.messageId || info.response);
  } catch (err) {
    console.error("[mailer] Error sending order status email:", err);
    try {
      console.log("[mailer] Attempting Ethereal fallback for status email...");
      const testAccount = await nodemailer.createTestAccount();
      const etherealTransport = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });

      const info = await etherealTransport.sendMail({ from: fromAddress, to, subject, text, html });
      console.log('[mailer] Ethereal status email sent. Preview URL:', nodemailer.getTestMessageUrl(info));
      console.log('[mailer] Ethereal messageId:', info.messageId || info.response);
      return;
    } catch (fallbackErr) {
      console.error('[mailer] Ethereal fallback for status email also failed:', fallbackErr);
      throw err;
    }
  }
}

export default { sendOrderConfirmationEmail, sendOrderStatusEmail };
