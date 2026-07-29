const { sendContactEmails } = require('../services/emailService');
const { storeMessage, isDuplicate } = require('../services/messageStore');

async function handleContact(req, res) {
  try {
    const { name, email, message, subject } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || null;
    const userAgent = req.headers['user-agent'] || null;
    const referer = req.headers['referer'] || req.headers['referrer'] || null;
    const country = req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'] || null; // common on Cloudflare / Vercel

    // Duplicate check
    if (isDuplicate({ email, message })) {
      return res.status(429).json({
        success: false,
        message: 'You already sent a similar message recently. Please wait a bit.',
      });
    }

    const date = new Date().toLocaleString('en-GB', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Africa/Lagos',
    });

    // Always store the message first
    const saved = storeMessage({
      name,
      email,
      message,
      subject: subject || null,
      ip,
      userAgent,
      referer,
      country,
    });

    // Attempt to send emails
    const { adminOk, confirmOk } = await sendContactEmails({
      name,
      email,
      subject: subject || 'Portfolio Contact',
      message,
      date,
      ip,
      userAgent,
      referer,
      country,
    });

    // Even if emails fail, we still return success because the message is saved
    return res.status(200).json({
      success: true,
      message: 'Message received successfully.',
      id: saved.id,
      emailSent: adminOk,
      confirmationSent: confirmOk,
    });
  } catch (err) {
    console.error('[contact] Unexpected error:', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong on our side. Please try again later.',
    });
  }
}

module.exports = { handleContact };
