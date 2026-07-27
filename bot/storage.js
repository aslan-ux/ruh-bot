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
const col = { users: null, meta: null, steps: null, fintx: null };

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
      col.steps = db.collection('steps');
      await col.steps.createIndex({ telegramId: 1, date: 1 }, { unique: true });
      col.fintx = db.collection('fintx');
      await col.fintx.createIndex({ telegramId: 1, date: 1 });
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
const STEPS_FILE = path.join(DATA_DIR, 'steps.json');
const FINTX_FILE = path.join(DATA_DIR, 'fintx.json');

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

// Найти участника по его sync-токену (для приёма шагов из iOS «Команд»)
export async function getUserByToken(token) {
  if (!token) return null;
  if (useMongo) return col.users.findOne({ syncToken: token }, { projection: { _id: 0 } });
  return (readJson(USERS_FILE, [])).find((u) => u.syncToken === token) || null;
}

// ---------- Қадам (шаги) ----------
export async function setSteps(telegramId, date, steps) {
  const now = new Date().toISOString();
  const s = Math.max(0, Math.floor(Number(steps) || 0));
  if (useMongo) {
    await col.steps.updateOne(
      { telegramId, date },
      { $set: { telegramId, date, steps: s, updatedAt: now } },
      { upsert: true }
    );
    return { telegramId, date, steps: s };
  }
  const arr = readJson(STEPS_FILE, []);
  const idx = arr.findIndex((x) => x.telegramId === telegramId && x.date === date);
  if (idx >= 0) arr[idx] = { telegramId, date, steps: s, updatedAt: now };
  else arr.push({ telegramId, date, steps: s, updatedAt: now });
  writeJson(STEPS_FILE, arr);
  return { telegramId, date, steps: s };
}

export async function getUserSteps(telegramId) {
  if (useMongo) return col.steps.find({ telegramId }, { projection: { _id: 0 } }).toArray();
  return (readJson(STEPS_FILE, [])).filter((x) => x.telegramId === telegramId);
}

export async function getAllSteps() {
  if (useMongo) return col.steps.find({}, { projection: { _id: 0 } }).toArray();
  return readJson(STEPS_FILE, []);
}

// ---------- Қаржы (финансы: транзакции) ----------
export async function addTx(tx) {
  if (useMongo) { await col.fintx.insertOne({ ...tx }); return tx; }
  const arr = readJson(FINTX_FILE, []);
  arr.push(tx);
  writeJson(FINTX_FILE, arr);
  return tx;
}

export async function getUserTx(telegramId) {
  if (useMongo) {
    return col.fintx.find({ telegramId }, { projection: { _id: 0 } }).sort({ date: -1, createdAt: -1 }).toArray();
  }
  return (readJson(FINTX_FILE, []))
    .filter((x) => x.telegramId === telegramId)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (a.createdAt < b.createdAt ? 1 : -1)));
}

export async function deleteTx(telegramId, id) {
  if (useMongo) {
    const r = await col.fintx.deleteOne({ telegramId, id });
    return r.deletedCount > 0;
  }
  const arr = readJson(FINTX_FILE, []);
  const next = arr.filter((x) => !(x.telegramId === telegramId && x.id === id));
  writeJson(FINTX_FILE, next);
  return next.length !== arr.length;
}

export async function getStepsSince(dateStr) {
  if (useMongo) return col.steps.find({ date: { $gte: dateStr } }, { projection: { _id: 0 } }).toArray();
  return (readJson(STEPS_FILE, [])).filter((x) => x.date >= dateStr);
}

// ---------- Настройки: күнделікті мақсат (общая цель шагов) ----------
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const DEFAULT_GOAL = 10000;

export async function getGoal() {
  if (useMongo) {
    const m = await col.meta.findOne({ _id: 'goal' });
    return (m && Number(m.value)) || DEFAULT_GOAL;
  }
  const s = readJson(SETTINGS_FILE, {});
  return Number(s.goal) || DEFAULT_GOAL;
}

export async function setGoal(goal) {
  const g = Math.max(1, Math.floor(Number(goal) || DEFAULT_GOAL));
  if (useMongo) {
    await col.meta.updateOne({ _id: 'goal' }, { $set: { value: g } }, { upsert: true });
    return g;
  }
  const s = readJson(SETTINGS_FILE, {});
  s.goal = g;
  writeJson(SETTINGS_FILE, s);
  return g;
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
