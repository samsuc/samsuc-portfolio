const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'messages.json');

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, JSON.stringify([], null, 2));
}

function readMessages() {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveMessages(messages) {
  ensureStore();
  fs.writeFileSync(STORE_FILE, JSON.stringify(messages, null, 2));
}

function isDuplicate({ email, message }) {
  const messages = readMessages();
  const recent = messages.slice(-50);
  return recent.some(
    (m) =>
      m.email?.toLowerCase() === email.toLowerCase() &&
      m.message?.trim() === message.trim() &&
      Date.now() - new Date(m.createdAt).getTime() < 1000 * 60 * 30
  );
}

function storeMessage(data) {
  const messages = readMessages();
  const entry = {
    id: uuidv4(),
    name: data.name,
    email: data.email,
    subject: data.subject || null,
    message: data.message,
    ip: data.ip || null,
    userAgent: data.userAgent || null,
    referer: data.referer || null,
    country: data.country || null,
    status: 'unread',
    starred: false,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  messages.push(entry);
  saveMessages(messages);
  return entry;
}

function getAllMessages({ status, archived, search, sort = 'newest' } = {}) {
  let list = readMessages();
  if (archived === true) list = list.filter((m) => m.archived);
  else if (archived === false) list = list.filter((m) => !m.archived);
  if (status) list = list.filter((m) => m.status === status);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (m) =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        (m.subject || '').toLowerCase().includes(q) ||
        (m.message || '').toLowerCase().includes(q)
    );
  }
  list.sort((a, b) => {
    const da = new Date(a.createdAt).getTime();
    const db = new Date(b.createdAt).getTime();
    return sort === 'oldest' ? da - db : db - da;
  });
  return list;
}

function getMessageById(id) {
  return readMessages().find((m) => m.id === id) || null;
}

function updateMessage(id, updates) {
  const messages = readMessages();
  const idx = messages.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  messages[idx] = { ...messages[idx], ...updates, updatedAt: new Date().toISOString() };
  saveMessages(messages);
  return messages[idx];
}

function deleteMessage(id) {
  const messages = readMessages();
  const filtered = messages.filter((m) => m.id !== id);
  if (filtered.length === messages.length) return false;
  saveMessages(filtered);
  return true;
}

function getStats() {
  const messages = readMessages();
  return {
    total: messages.length,
    unread: messages.filter((m) => m.status === 'unread' && !m.archived).length,
    read: messages.filter((m) => m.status === 'read' && !m.archived).length,
    starred: messages.filter((m) => m.starred && !m.archived).length,
    archived: messages.filter((m) => m.archived).length,
  };
}

module.exports = {
  storeMessage,
  isDuplicate,
  readMessages,
  getAllMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  getStats,
};
