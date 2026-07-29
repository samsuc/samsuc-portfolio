const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!config.email.user || !config.email.pass) {
    console.warn('[email] EMAIL credentials missing – emails will be logged only.');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: { user: config.email.user, pass: config.email.pass },
  });
  return transporter;
}

/* ---------- HTML Templates (futuristic dark theme) ---------- */

function adminEmailHTML({ name, email, subject, message, date, ip, userAgent, referer, country }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact</title>
</head>
<body style="margin:0;padding:0;background:#050505;font-family:Inter,system-ui,sans-serif;color:#e5e5e5;">
  <div style="max-width:600px;margin:40px auto;background:#0a0f1a;border:1px solid #1a2332;border-radius:16px;overflow:hidden;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#00D4FF22,#A78BFA22);padding:32px 28px;border-bottom:1px solid #1a2332;">
      <div style="font-size:13px;letter-spacing:0.2em;color:#00D4FF;text-transform:uppercase;margin-bottom:8px;">SAMSUC Portfolio</div>
      <h1 style="margin:0;font-size:22px;font-weight:600;color:#ffffff;">New Contact Message</h1>
    </div>

    <!-- Body -->
    <div style="padding:28px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:10px 0;color:#888;width:140px;">Name</td>
          <td style="padding:10px 0;color:#fff;font-weight:500;">${name}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#888;">Email</td>
          <td style="padding:10px 0;"><a href="mailto:${email}" style="color:#00D4FF;text-decoration:none;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#888;">Subject</td>
          <td style="padding:10px 0;color:#fff;">${subject || '—'}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#888;">Date</td>
          <td style="padding:10px 0;color:#fff;">${date}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#888;">IP</td>
          <td style="padding:10px 0;color:#aaa;">${ip || '—'}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#888;">Location</td>
          <td style="padding:10px 0;color:#aaa;">${country || '—'}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#888;">Device</td>
          <td style="padding:10px 0;color:#aaa;font-size:12px;word-break:break-all;">${userAgent || '—'}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#888;">Referrer</td>
          <td style="padding:10px 0;color:#aaa;font-size:12px;word-break:break-all;">${referer || '—'}</td>
        </tr>
      </table>

      <div style="margin-top:28px;padding:20px;background:#08111F;border-radius:12px;border:1px solid #1a2332;">
        <div style="font-size:12px;color:#888;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.1em;">Message</div>
        <div style="color:#e5e5e5;line-height:1.6;white-space:pre-wrap;">${message}</div>
      </div>

      <div style="margin-top:28px;text-align:center;">
        <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Your message')}" 
           style="display:inline-block;padding:12px 28px;background:#00D4FF;color:#050505;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;">
          Reply to ${name.split(' ')[0]}
        </a>
      </div>
    </div>

    <div style="padding:16px 28px;border-top:1px solid #1a2332;font-size:11px;color:#555;text-align:center;">
      Sent from SAMSUC Portfolio contact form
    </div>
  </div>
</body>
</html>`;
}

function confirmationEmailHTML({ name }) {
  const firstName = name.split(' ')[0] || name;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank you</title>
</head>
<body style="margin:0;padding:0;background:#050505;font-family:Inter,system-ui,sans-serif;color:#e5e5e5;">
  <div style="max-width:560px;margin:40px auto;background:#0a0f1a;border:1px solid #1a2332;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#00D4FF22,#A78BFA22);padding:36px 28px;text-align:center;border-bottom:1px solid #1a2332;">
      <div style="font-size:13px;letter-spacing:0.25em;color:#00D4FF;text-transform:uppercase;margin-bottom:12px;">SAMSUC</div>
      <h1 style="margin:0;font-size:24px;font-weight:600;color:#ffffff;">Message Received</h1>
    </div>

    <div style="padding:36px 28px;line-height:1.7;">
      <p style="margin:0 0 20px;font-size:16px;color:#fff;">Hi ${firstName},</p>
      <p style="margin:0 0 16px;color:#bbb;">
        Thank you for reaching out through my portfolio.
      </p>
      <p style="margin:0 0 16px;color:#bbb;">
        I’ve received your message successfully and will get back to you as soon as possible.
      </p>
      <p style="margin:0 0 28px;color:#bbb;">
        I appreciate your interest and look forward to speaking with you.
      </p>
      <p style="margin:0;color:#fff;font-weight:500;">— Samuel Success</p>
    </div>

    <div style="padding:20px 28px;border-top:1px solid #1a2332;text-align:center;">
      <a href="https://github.com/samsuc" style="color:#00D4FF;text-decoration:none;font-size:13px;margin:0 10px;">GitHub</a>
      <a href="https://www.linkedin.com/in/sam-suc" style="color:#00D4FF;text-decoration:none;font-size:13px;margin:0 10px;">LinkedIn</a>
      <a href="https://x.com/sam__suc" style="color:#00D4FF;text-decoration:none;font-size:13px;margin:0 10px;">X</a>
    </div>
  </div>
</body>
</html>`;
}

/* ---------- Send functions ---------- */

async function sendAdminNotification(data) {
  const transport = getTransporter();
  const subject = `📩 New Portfolio Contact — ${data.name}`;

  const mail = {
    from: `"SAMSUC Portfolio" <${config.email.user || 'noreply@samsuc.dev'}>`,
    to: config.email.to,
    replyTo: data.email,
    subject,
    html: adminEmailHTML(data),
    text: `New message from ${data.name} (${data.email})\n\n${data.message}`,
  };

  if (!transport) {
    console.log('[email] ADMIN (dev):', mail.subject);
    return { messageId: 'dev-admin' };
  }
  return transport.sendMail(mail);
}

async function sendConfirmationEmail({ name, email }) {
  const transport = getTransporter();
  const mail = {
    from: `"Samuel Success" <${config.email.user || 'noreply@samsuc.dev'}>`,
    to: email,
    subject: 'Thanks for contacting Samuel Success!',
    html: confirmationEmailHTML({ name }),
    text: `Hi ${name.split(' ')[0]},\n\nThank you for reaching out. I've received your message and will get back to you soon.\n\n— Samuel Success`,
  };

  if (!transport) {
    console.log('[email] CONFIRMATION (dev):', mail.subject);
    return { messageId: 'dev-confirm' };
  }
  return transport.sendMail(mail);
}

/**
 * Main entry – tries to send both emails.
 * Returns { adminOk, confirmOk }
 */
async function sendContactEmails(payload) {
  let adminOk = false;
  let confirmOk = false;

  try {
    await sendAdminNotification(payload);
    adminOk = true;
  } catch (err) {
    console.error('[email] Admin notification failed:', err.message);
  }

  try {
    await sendConfirmationEmail({ name: payload.name, email: payload.email });
    confirmOk = true;
  } catch (err) {
    console.error('[email] Confirmation failed:', err.message);
  }

  return { adminOk, confirmOk };
}

module.exports = { sendContactEmails, sendAdminNotification, sendConfirmationEmail };
