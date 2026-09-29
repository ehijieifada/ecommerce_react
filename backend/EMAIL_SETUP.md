# Order email setup

Order confirmations and status notifications are sent by the backend. The frontend deployment on Netlify does not send these messages.

## Configure Gmail

1. Enable 2-Step Verification for the Gmail account that will send order messages.
2. Create a Google App Password for the account. Use this password instead of the account's normal password.
3. Set these environment variables in the backend deployment:
   - `SMTP_USER`: the Gmail address used to send messages.
   - `SMTP_PASS`: the Google App Password.
   - `FROM_EMAIL` (optional): sender name/address. If omitted, the Gmail account is used.
   - `ADMIN_EMAIL` (optional): address that receives new-order notifications. If omitted, `ADMIN_SIGNUP_EMAIL` is used.
4. Remove the previous email provider's API key and any old `SMTP_HOST` or `SMTP_PORT` settings, then redeploy the backend.

The backend sends to the email address entered in delivery information. Gmail may require an app-specific password; normal Gmail account passwords are not accepted for SMTP. `FROM_EMAIL`, if set, should be the authenticated Gmail address or a sender alias configured in that Gmail account.

Password reset emails use the same SMTP configuration. Set `FRONTEND_URL` to the deployed frontend origin if it differs from `https://blisstechiq.netlify.app`; local development defaults to `http://localhost:5173`. Reset links expire after 15 minutes.

## Configure SMS with Twilio

Order confirmations and changed order statuses are also sent to the phone number entered in delivery information. Set these environment variables in the backend deployment:

- `TWILIO_ACCOUNT_SID`: the Twilio account SID.
- `TWILIO_AUTH_TOKEN`: the Twilio auth token.
- `TWILIO_PHONE_NUMBER`: the Twilio sender number in E.164 format, such as `+15551234567`.

Customer phone numbers should also be entered in E.164 format, including the country code. A Twilio trial account can only send messages to verified recipient numbers; upgrade or verify recipients as required by your Twilio account. SMS configuration or delivery failures are logged and do not prevent order placement, status updates, or email notifications.

## Troubleshooting

Check the backend service logs after placing an order or changing its status. A successful log means Gmail accepted the message, not that it reached the inbox; check the spam folder and Gmail account settings. Missing configuration and delivery errors are logged. The order is still saved when email delivery fails.