import twilio from "twilio";

let client;

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken || !process.env.TWILIO_PHONE_NUMBER) {
    throw new Error("SMS is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.");
  }

  if (!client) {
    client = twilio(accountSid, authToken);
  }

  return client;
}

async function sendSms(order, body) {
  const to = order.deliveryInfo?.phone?.trim();
  if (!to) {
    throw new Error(`Cannot send order SMS: missing phone number for order ${order.shortId || order._id}`);
  }

  await getClient().messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
}

export function sendOrderConfirmationSms(order) {
  const orderId = order.shortId || order._id;
  return sendSms(
    order,
    `BlissTechIq: Your order ${orderId} is confirmed and is being prepared. Order total: $${Number(order.total || 0).toFixed(2)}.`
  );
}

export function sendOrderStatusSms(order, status) {
  const orderId = order.shortId || order._id;
  return sendSms(order, `BlissTechIq: Order ${orderId} status updated to ${status}.`);
}