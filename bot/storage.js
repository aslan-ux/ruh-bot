import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONGODB_URI = process.env.MONGODB_URI || '';

const DEFAULT_BOOK = {
  id: 'default',
  title: 'Кітап әлі таңдалмаған',
  author: '',
  cover: '',
  progress: 0,
};

let useMongo = !!MONGODB_URI;
const col = { users: null, meta: null };

// ---------- Инициализация ----------
export async function initStorage() {
  if (useMongo) {
    try {
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db('spirit');
      col.users = db.collection('users');
      col.meta = db.collection('meta');
      await col.users.createIndex({ telegramId: 1 }, { unique: true });
      console.log('Хранилище: MongoDB (постоянное)');
      return;
    } catch (e) {
      console.error('⚠️ MongoDB қосылмады, файлдарға ауысамыз:', e.message);
      useMongo = false;
    }
  }
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('Хранилище: файлдар (data/) — уақытша');
}

// ---------- Файловый бэкенд (запасной) ----------
const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BOOK_FILE = path.join(DATA_DIR, 'book.json');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ---------- Пользователи ----------
export async function getUsers() {
  if (useMongo) return col.users.find({}, { projection: { _id: 0 } }).toArray();
  return readJson(USERS_FILE, []);
}

export async function getUser(telegramId) {
  if (useMongo) return col.users.findOne({ telegramId }, { projection: { _id: 0 } });
  return (readJson(USERS_FILE, [])).find((u) => u.telegramId === telegramId) || null;
}

export async function upsertUser(user) {
  const now = new Date().toISOString();
  if (useMongo) {
    const existing = await col.users.findOne({ telegramId: user.telegramId });
    if (existing) {
      await col.users.updateOne({ telegramId: user.telegramId }, { $set: { ...user, updatedAt: now } });
    } else {
      await col.users.insertOne({ ...user, createdAt: now, updatedAt: now });
    }
    return user;
  }
  const users = readJson(USERS_FILE, []);
  const idx = users.findIndex((u) => u.telegramId === user.telegramId);
  if (idx >= 0) users[idx] = { ...users[idx], ...user, updatedAt: now };
  else users.push({ ...user, createdAt: now, updatedAt: now });
  writeJson(USERS_FILE, users);
  return user;
}

export async function assignBookToUser(telegramId, assignedBookId) {
  const now = new Date().toISOString();
  if (useMongo) {
    const r = await col.users.updateOne({ telegramId }, { $set: { assignedBookId, updatedAt: now } });
    if (!r.matchedCount) return null;
    return col.users.findOne({ telegramId }, { projection: { _id: 0 } });
  }
  const users = readJson(USERS_FILE, []);
  const idx = users.findIndex((u) => u.telegramId === telegramId);
  if (idx < 0) return null;
  users[idx].assignedBookId = assignedBookId;
  users[idx].updatedAt = now;
  writeJson(USERS_FILE, users);
  return users[idx];
}

export async function setUserStatus(telegramId, status) {
  const now = new Date().toISOString();
  if (useMongo) {
    const r = await col.users.updateOne({ telegramId }, { $set: { status, updatedAt: now } });
    if (!r.matchedCount) return null;
    return col.users.findOne({ telegramId }, { projection: { _id: 0 } });
  }
  const users = readJson(USERS_FILE, []);
  const idx = users.findIndex((u) => u.telegramId === telegramId);
  if (idx < 0) return null;
  users[idx].status = status;
  users[idx].updatedAt = now;
  writeJson(USERS_FILE, users);
  return users[idx];
}

// ---------- Книга ----------
export async function getBook() {
  if (useMongo) {
    const m = await col.meta.findOne({ _id: 'book' });
    return m ? m.book : DEFAULT_BOOK;
  }
  return readJson(BOOK_FILE, DEFAULT_BOOK);
}

export async function setBook(book) {
  const current = await getBook();
  const next = { ...current, ...book, id: current.id || 'default' };
  if (useMongo) {
    await col.meta.updateOne({ _id: 'book' }, { $set: { book: next } }, { upsert: true });
    return next;
  }
  writeJson(BOOK_FILE, next);
  return next;
}
