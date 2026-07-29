const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'analytics.json');

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify({ events: [], sessions: {} }, null, 2)
    );
  }
}

function read() {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
  } catch {
    return { events: [], sessions: {} };
  }
}

function save(data) {
  ensureStore();
  // Keep last 10k events to avoid unbounded growth
  if (data.events.length > 10000) {
    data.events = data.events.slice(-10000);
  }
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
}

function trackEvent(evt) {
  const data = read();
  const entry = {
    id: uuidv4(),
    type: evt.type,
    path: evt.path || null,
    label: evt.label || null,
    sessionId: evt.sessionId || null,
    referrer: evt.referrer || null,
    userAgent: evt.userAgent || null,
    country: evt.country || null,
    createdAt: new Date().toISOString(),
  };
  data.events.push(entry);

  if (evt.sessionId) {
    if (!data.sessions[evt.sessionId]) {
      data.sessions[evt.sessionId] = {
        firstSeen: entry.createdAt,
        lastSeen: entry.createdAt,
        hits: 0,
        country: evt.country || null,
        userAgent: evt.userAgent || null,
      };
    }
    data.sessions[evt.sessionId].lastSeen = entry.createdAt;
    data.sessions[evt.sessionId].hits += 1;
    if (evt.country) data.sessions[evt.sessionId].country = evt.country;
  }

  save(data);
  return entry;
}

function getAnalyticsSummary() {
  const data = read();
  const events = data.events || [];
  const sessions = data.sessions || {};
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const onlineWindow = 5 * 60 * 1000;

  const pageviews = events.filter((e) => e.type === 'pageview');
  const resumeDownloads = events.filter((e) => e.type === 'resume_download').length;
  const projectClicks = events.filter((e) => e.type === 'project_click').length;
  const socialClicks = events.filter((e) => e.type === 'social_click').length;
  const contactClicks = events.filter((e) => e.type === 'contact_click').length;

  const sessionIds = Object.keys(sessions);
  const totalSessions = sessionIds.length;

  // Returning vs new (sessions with >1 hit roughly)
  let returning = 0;
  sessionIds.forEach((id) => {
    if (sessions[id].hits > 1) returning += 1;
  });
  const newVisitors = Math.max(0, totalSessions - returning);

  // Online now
  let online = 0;
  sessionIds.forEach((id) => {
    if (now - new Date(sessions[id].lastSeen).getTime() < onlineWindow) online += 1;
  });

  // Countries
  const countryMap = {};
  sessionIds.forEach((id) => {
    const c = sessions[id].country || 'Unknown';
    countryMap[c] = (countryMap[c] || 0) + 1;
  });
  const countries = Object.entries(countryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Devices (rough from UA)
  const devices = { mobile: 0, desktop: 0, tablet: 0, other: 0 };
  sessionIds.forEach((id) => {
    const ua = (sessions[id].userAgent || '').toLowerCase();
    if (/ipad|tablet/.test(ua)) devices.tablet += 1;
    else if (/mobi|android|iphone/.test(ua)) devices.mobile += 1;
    else if (ua) devices.desktop += 1;
    else devices.other += 1;
  });

  // Top pages
  const pageMap = {};
  pageviews.forEach((e) => {
    const p = e.path || '/';
    pageMap[p] = (pageMap[p] || 0) + 1;
  });
  const topPages = Object.entries(pageMap)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  // Pageviews last 14 days
  const labels = [];
  const counts = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    labels.push(key.slice(5));
    counts.push(pageviews.filter((e) => (e.createdAt || '').startsWith(key)).length);
  }

  // Avg session duration estimate (first to last seen)
  let totalDuration = 0;
  let durationCount = 0;
  sessionIds.forEach((id) => {
    const s = sessions[id];
    const dur = new Date(s.lastSeen) - new Date(s.firstSeen);
    if (dur > 0 && dur < dayMs) {
      totalDuration += dur;
      durationCount += 1;
    }
  });
  const avgSessionMs = durationCount ? Math.round(totalDuration / durationCount) : 0;

  // Referrers
  const refMap = {};
  events.forEach((e) => {
    if (!e.referrer) return;
    try {
      const host = new URL(e.referrer).hostname;
      refMap[host] = (refMap[host] || 0) + 1;
    } catch {
      refMap[e.referrer] = (refMap[e.referrer] || 0) + 1;
    }
  });
  const referrers = Object.entries(refMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return {
    visitorsTotal: totalSessions,
    visitorsOnline: online,
    newVisitors,
    returningVisitors: returning,
    pageviews: pageviews.length,
    resumeDownloads,
    projectClicks,
    socialClicks,
    contactClicks,
    avgSessionSeconds: Math.round(avgSessionMs / 1000),
    countries,
    devices,
    topPages,
    referrers,
    chart: { labels, pageviews: counts },
  };
}

module.exports = { trackEvent, getAnalyticsSummary, read };
