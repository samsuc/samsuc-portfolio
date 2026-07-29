const {
  getAllMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  getStats,
  readMessages,
} = require('../services/messageStore');
const { getAnalyticsSummary } = require('../services/analyticsStore');

function listMessages(req, res) {
  try {
    const { status, archived, search, sort } = req.query;
    const archivedFilter =
      archived === 'true' ? true : archived === 'false' ? false : undefined;
    const messages = getAllMessages({
      status: status || undefined,
      archived: archivedFilter,
      search: search || undefined,
      sort: sort || 'newest',
    });
    res.json({ success: true, messages, stats: getStats() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to load messages' });
  }
}

function getMessage(req, res) {
  const msg = getMessageById(req.params.id);
  if (!msg) return res.status(404).json({ success: false, message: 'Not found' });
  if (msg.status === 'unread') {
    updateMessage(msg.id, { status: 'read' });
    msg.status = 'read';
  }
  res.json({ success: true, message: msg });
}

function updateMsg(req, res) {
  const allowed = ['status', 'starred', 'archived'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const msg = updateMessage(req.params.id, updates);
  if (!msg) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, message: msg });
}

function removeMsg(req, res) {
  const ok = deleteMessage(req.params.id);
  if (!ok) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true });
}

function stats(req, res) {
  res.json({ success: true, stats: getStats() });
}

function dashboard(req, res) {
  try {
    const messages = readMessages();
    const msgStats = getStats();

    // Messages per day (last 14 days)
    const days = [];
    const counts = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push(key.slice(5)); // MM-DD
      const c = messages.filter((m) => (m.createdAt || '').startsWith(key)).length;
      counts.push(c);
    }

    // Countries from messages
    const countryMap = {};
    messages.forEach((m) => {
      const c = m.country || 'Unknown';
      countryMap[c] = (countryMap[c] || 0) + 1;
    });
    const countries = Object.entries(countryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Recent messages preview
    const recent = [...messages]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        subject: m.subject,
        status: m.status,
        createdAt: m.createdAt,
      }));

    const analytics = getAnalyticsSummary();
    res.json({
      success: true,
      overview: {
        messagesTotal: msgStats.total,
        messagesUnread: msgStats.unread,
        messagesRead: msgStats.read,
        messagesStarred: msgStats.starred,
        messagesArchived: msgStats.archived,
        visitorsTotal: analytics.visitorsTotal,
        visitorsOnline: analytics.visitorsOnline,
        newVisitors: analytics.newVisitors,
        returningVisitors: analytics.returningVisitors,
        pageviews: analytics.pageviews,
        resumeDownloads: analytics.resumeDownloads,
        projectClicks: analytics.projectClicks,
        socialClicks: analytics.socialClicks,
        contactClicks: analytics.contactClicks,
        avgSessionSeconds: analytics.avgSessionSeconds,
      },
      chart: {
        labels: days,
        messageCounts: counts,
        pageviews: analytics.chart.pageviews,
        pageviewLabels: analytics.chart.labels,
      },
      countries: analytics.countries.length ? analytics.countries : countries,
      devices: analytics.devices,
      topPages: analytics.topPages,
      referrers: analytics.referrers,
      recent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to load dashboard' });
  }
}

module.exports = {
  listMessages,
  getMessage,
  updateMsg,
  removeMsg,
  stats,
  dashboard,
};
