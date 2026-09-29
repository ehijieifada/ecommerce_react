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
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("Email is not configured. Set SMTP_USER to your Gmail address and SMTP_PASS to a Google App Password.");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
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

export async function sendAdminNewOrderEmail(order) {
  const to = (process.env.ADMIN_EMAIL || process.env.ADMIN_SIGNUP_EMAIL || "").trim();
  if (!to) {
    throw new Error("Admin order email is not configured. Set ADMIN_EMAIL.");
  }

  const orderId = order.shortId || order._id;
  const deliveryInfo = order.deliveryInfo || {};
  const items = (order.items || []).map((item) => {
    const name = item.name || item.title || "Item";
    const quantity = item.quantity || 1;
    return `- ${name} x${quantity} (${formatAmount(item.price)})`;
  });
  const address = [deliveryInfo.address, deliveryInfo.city, deliveryInfo.postalCode, deliveryInfo.country]
    .filter(Boolean)
    .join(", ");
  const subject = `New BlissTechIq order ${orderId}`;
  const text = `A new order has been placed.\n\nOrder number: ${orderId}\nCustomer: ${deliveryInfo.fullName || "Customer"}\nEmail: ${deliveryInfo.email || "Not provided"}\nPhone: ${deliveryInfo.phone || "Not provided"}\nDelivery address: ${address || "Not provided"}\nPayment method: ${order.paymentMethod || "Not provided"}\nTotal: ${formatAmount(order.total)}\n\nItems:\n${items.join("\n")}`;
  const htmlItems = (order.items || [])
    .map((item) => `<li>${escapeHtml(item.name || item.title || "Item")} x${item.quantity || 1} (${formatAmount(item.price)})</li>`)
    .join("");
  const html = `<div style="font-family:Arial,sans-serif;color:#111827"><h2>New order received</h2><p><strong>Order number:</strong> ${escapeHtml(orderId)}</p><p><strong>Customer:</strong> ${escapeHtml(deliveryInfo.fullName || "Customer")}<br/><strong>Email:</strong> ${escapeHtml(deliveryInfo.email || "Not provided")}<br/><strong>Phone:</strong> ${escapeHtml(deliveryInfo.phone || "Not provided")}<br/><strong>Delivery address:</strong> ${escapeHtml(address || "Not provided")}<br/><strong>Payment method:</strong> ${escapeHtml(order.paymentMethod || "Not provided")}<br/><strong>Total:</strong> ${formatAmount(order.total)}</p><h3>Items</h3><ul>${htmlItems}</ul></div>`;

  await deliverEmail({ to, subject, text, html });
}

export async function sendPasswordResetEmail(to, resetUrl) {
  const subject = "Reset your BlissTechIq password";
  const text = `We received a request to reset the password for your BlissTechIq account. Use this link within 15 minutes to choose a new password:\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`;
  const html = `<div style="font-family:Arial,sans-serif;color:#111827"><h2>Reset your password</h2><p>We received a request to reset your BlissTechIq account password.</p><p><a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:#111827;color:#ffffff;padding:12px 18px;text-decoration:none">Choose a new password</a></p><p>This link expires in 15 minutes. If you didn't request a reset, you can ignore this email.</p></div>`;

  await deliverEmail({ to, subject, text, html });
}

export default {
  sendAdminNewOrderEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendPasswordResetEmail,
};
