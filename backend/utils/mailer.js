import nodemailer from "nodemailer";

// Create and cache transporter
let transporter;

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

  const to = order.deliveryInfo?.email;
  const name = order.deliveryInfo?.name || "Customer";
  const orderId = order.shortId || order._id;
  const total = order.total;

  const subject = `Order Confirmation — ${orderId}`;
  const itemsList = (order.items || [])
    .map((i) => `- ${i.name || i.title || 'Item'} x${i.quantity || 1} (${i.price ? `$${i.price}` : 'price N/A'})`)
    .join("\n");

  // Plain-text uses asterisks for emphasis; HTML uses <strong> for bold
  const text = `Dear Valued ${name},\n\nThank you for your order!\n\nOrder ID: ${orderId}\nTotal: $${total}\n\nItems:\n${itemsList}\n\nWe'll notify you when your order is *ready for pickup* or *out for delivery*.\n\nThanks,\nBlissTechIq Team`;

  const html = `<p>Dear Valued ${name},</p><p>Thank you for your order!</p><p><strong>Order ID:</strong> ${orderId}<br/><strong>Total:</strong> $${total}</p><p><strong>Items:</strong><br/><pre style="font-family:inherit">${itemsList}</pre></p><p>We'll notify you when your order is <strong>ready for pickup</strong> or <strong>out for delivery</strong>.</p><p>Thanks,<br/>BlissTechIq Team</p>`;

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

  const to = order.deliveryInfo?.email;
  const name = order.deliveryInfo?.name || "Customer";
  const orderId = order.shortId || order._id;

  let subject;
  let text;
  let html;

  if (status === "Ready for pickup") {
    subject = `Order Ready for pickup — ${orderId}`;
    text = `Dear Valued ${name},\n\nYour order (${orderId}) is ready for pickup. We look forward to welcoming you.\n\nIf you have any questions, reply to this email.\n\nThanks,\nBlissTechIq Team`;
    html = `<p>Dear Valued ${name},</p><p>Your order (<strong>${orderId}</strong>) is <strong>ready for pickup</strong>. We look forward to welcoming you.</p><p>If you have any questions, reply to this email.</p><p>Thanks,<br/>BlissTechIq Team</p>`;
  } else if (status === "Out for Delivery") {
    subject = `Order Out for Delivery — ${orderId}`;
    text = `Dear Valued ${name},\n\nYour order (${orderId}) is out for delivery.\n\nIf you have any questions, reply to this email.\n\nThanks,\nBlissTechIq Team`;
    html = `<p>Dear Valued ${name},</p><p>Your order (<strong>${orderId}</strong>) is <strong>out for delivery</strong>.</p><p>If you have any questions, reply to this email.</p><p>Thanks,<br/>BlissTechIq Team</p>`;
  } else {
    subject = `Order Update — ${status} — ${orderId}`;
    text = `Dear Valued ${name},\n\nYour order (${orderId}) status has been updated to: ${status}.\n\nIf you have any questions, reply to this email.\n\nThanks,\nBlissTechIq Team`;
    html = `<p>Dear Valued ${name},</p><p>Your order (<strong>${orderId}</strong>) status has been updated to: <strong>${status}</strong>.</p><p>If you have any questions, reply to this email.</p><p>Thanks,<br/>BlissTechIq Team</p>`;
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
