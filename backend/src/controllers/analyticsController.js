const { trackEvent, getAnalyticsSummary } = require('../services/analyticsStore');

function track(req, res) {
  try {
    const { type, path, label, sessionId, referrer } = req.body || {};
    const allowed = [
      'pageview',
      'resume_download',
      'project_click',
      'social_click',
      'contact_click',
    ];
    if (!type || !allowed.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid event type' });
    }

    const country =
      req.headers['cf-ipcountry'] ||
      req.headers['x-vercel-ip-country'] ||
      null;

    trackEvent({
      type,
      path: typeof path === 'string' ? path.slice(0, 200) : null,
      label: typeof label === 'string' ? label.slice(0, 120) : null,
      sessionId: typeof sessionId === 'string' ? sessionId.slice(0, 64) : null,
      referrer: typeof referrer === 'string' ? referrer.slice(0, 300) : req.headers.referer || null,
      userAgent: req.headers['user-agent'] || null,
      country,
    });

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Track failed' });
  }
}

function summary(req, res) {
  try {
    res.json({ success: true, analytics: getAnalyticsSummary() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to load analytics' });
  }
}

module.exports = { track, summary };
