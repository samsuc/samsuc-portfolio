const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const FILE = path.join(DATA_DIR, 'profile.json');

const DEFAULTS = {
  displayName: 'Samuel Success',
  brand: 'SAMSUC',
  tagline: 'Founder • Computer Engineering Student • Frontend Developer • UI/UX Designer • Building the Future of Connected Digital Experiences',
  shortTagline: 'Building technology that brings the world into one place.',
  heroQuote: "The future isn't something I wait for. It's something I build.",
  mission: 'Bringing the world into one place.',
  vision:
    'I believe technology should connect people instead of separating them. Today, our lives are scattered across dozens of websites and applications. My long-term vision is to build digital experiences that simplify the way people learn, work, communicate, create, buy, sell, and grow—all within one connected ecosystem.',
  about:
    "Hi, I'm Samuel Success, a Computer Engineering student and passionate software developer from Nigeria. I enjoy designing immersive digital experiences that combine creativity, modern technology, and thoughtful user experience.",
  location: 'Nigeria',
  availability: 'Available for freelance and collaboration',
  email: 'samsuc34@gmail.com',
  github: 'https://github.com/samsuc',
  linkedin: 'https://www.linkedin.com/in/sam-suc',
  x: 'https://x.com/sam__suc',
  portraitUrl: '/images/portrait.png',
  cvUrl: '/assets/Samuel-Success-CV.pdf',
  updatedAt: null,
};

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({ ...DEFAULTS, updatedAt: new Date().toISOString() }, null, 2));
  }
}

function getProfile() {
  ensure();
  try {
    return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(FILE, 'utf8')) };
  } catch {
    return { ...DEFAULTS };
  }
}

function updateProfile(data) {
  const current = getProfile();
  const allowed = Object.keys(DEFAULTS);
  const next = { ...current };
  allowed.forEach((k) => {
    if (data[k] !== undefined && data[k] !== null) next[k] = data[k];
  });
  next.updatedAt = new Date().toISOString();
  fs.writeFileSync(FILE, JSON.stringify(next, null, 2));
  return next;
}

module.exports = { getProfile, updateProfile, DEFAULTS };
