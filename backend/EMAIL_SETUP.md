# Order email setup

Order confirmations and status notifications are sent by the backend. The frontend deployment on Netlify does not send these messages.

## Render with Resend

1. Create a Resend account and verify the sending domain. Configure the domain's DNS records as Resend instructs so messages can be authenticated and delivered reliably.
2. In the Render backend service, add these environment variables:
   - `RESEND_API_KEY`: API key from Resend.
   - `FROM_EMAIL`: sender address on the verified domain, for example `orders@your-domain.com`.
3. Save the environment variables and redeploy the backend.

The backend sends to the email address entered in delivery information. Resend may restrict recipients to verified addresses until the sending domain is verified.

## SMTP alternative

For an SMTP provider that is reachable from the hosting platform, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `FROM_EMAIL`. Port 465 uses implicit TLS; other ports use the standard non-implicit-TLS connection. Render may restrict outbound SMTP, so the Resend HTTPS API is the recommended option there.

## Troubleshooting

Check the Render service logs after placing an order or changing its status. A successful log means the provider accepted the message, not that it reached the inbox; check the provider's delivery events, spam folder, and sender-domain authentication. Missing configuration and provider rejections are logged as email errors. The order is still saved when email delivery fails.