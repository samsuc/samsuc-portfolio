const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

function readUsers() {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  ensureStore();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function findByEmail(email) {
  return readUsers().find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
}

function findById(id) {
  return readUsers().find((u) => u.id === id) || null;
}

async function createUser({ email, password, name }) {
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email already registered');
  }
  const hash = await bcrypt.hash(password, 12);
  const user = {
    id: uuidv4(),
    email: email.toLowerCase().trim(),
    name: name || 'Admin',
    passwordHash: hash,
    role: 'admin',
    resetToken: null,
    resetExpires: null,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  const { passwordHash, resetToken, resetExpires, ...safe } = user;
  return safe;
}

async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.passwordHash);
}

function setResetToken(email, tokenHash, expiresAt) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return false;
  users[idx].resetToken = tokenHash;
  users[idx].resetExpires = expiresAt;
  saveUsers(users);
  return true;
}

async function resetPassword(tokenHash, newPassword) {
  const users = readUsers();
  const idx = users.findIndex(
    (u) => u.resetToken === tokenHash && u.resetExpires && new Date(u.resetExpires) > new Date()
  );
  if (idx === -1) return false;
  users[idx].passwordHash = await bcrypt.hash(newPassword, 12);
  users[idx].resetToken = null;
  users[idx].resetExpires = null;
  saveUsers(users);
  return true;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  verifyPassword,
  setResetToken,
  resetPassword,
  readUsers,
};
