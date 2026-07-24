import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BOOK_FILE = path.join(DATA_DIR, 'book.json');

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ---------- Пользователи (участники) ----------
export function getUsers() {
  return readJson(USERS_FILE, []);
}

// Сохраняем/обновляем участника по telegramId
export function upsertUser(user) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.telegramId === user.telegramId);
  const now = new Date().toISOString();
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...user, updatedAt: now };
  } else {
    users.push({ ...user, createdAt: now, updatedAt: now });
  }
  writeJson(USERS_FILE, users);
  return user;
}

export function getUser(telegramId) {
  return getUsers().find((u) => u.telegramId === telegramId) || null;
}

// Назначить книгу конкретному участнику (или снять — assignedBookId=null)
export function assignBookToUser(telegramId, assignedBookId) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.telegramId === telegramId);
  if (idx < 0) return null;
  users[idx].assignedBookId = assignedBookId;
  users[idx].updatedAt = new Date().toISOString();
  writeJson(USERS_FILE, users);
  return users[idx];
}

// ---------- Книга месяца ----------
// Модель по умолчанию: одна общая книга сообщества.
export function getBook() {
  return readJson(BOOK_FILE, {
    id: 'default',
    title: 'Кітап әлі таңдалмаған',
    author: '',
    cover: '',       // URL обложки
    progress: 0,     // общий прогресс, %
  });
}

export function setBook(book) {
  const current = getBook();
  const next = { ...current, ...book, id: current.id || 'default' };
  writeJson(BOOK_FILE, next);
  return next;
}
