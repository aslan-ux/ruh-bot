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
let bucket = null; // GridFS — файлы книг
let OID = null;    // ObjectId
const col = { users: null, meta: null, steps: null, fintx: null, findebt: null, finasset: null, friends: null, reading: null, quotes: null, comments: null, readdays: null };

// ---------- Инициализация ----------
export async function initStorage() {
  if (useMongo) {
    try {
      const { MongoClient, GridFSBucket, ObjectId } = await import('mongodb');
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
      col.findebt = db.collection('findebt');
      await col.findebt.createIndex({ telegramId: 1 });
      col.finasset = db.collection('finasset');
      await col.finasset.createIndex({ telegramId: 1 });
      col.friends = db.collection('friends');
      await col.friends.createIndex({ a: 1 });
      await col.friends.createIndex({ b: 1 });
      col.reading = db.collection('reading');
      await col.reading.createIndex({ telegramId: 1, bookId: 1 }, { unique: true });
      col.quotes = db.collection('quotes');
      await col.quotes.createIndex({ bookId: 1, createdAt: -1 });
      col.comments = db.collection('comments');
      await col.comments.createIndex({ bookId: 1, ch: 1, createdAt: -1 });
      col.readdays = db.collection('readdays');
      await col.readdays.createIndex({ telegramId: 1, date: 1 }, { unique: true });
      bucket = new GridFSBucket(db, { bucketName: 'books' });
      OID = ObjectId;
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
const FINDEBT_FILE = path.join(DATA_DIR, 'findebt.json');
const FINASSET_FILE = path.join(DATA_DIR, 'finasset.json');
const FRIENDS_FILE = path.join(DATA_DIR, 'friends.json');

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

// ---------- Қаржы: долги/кредиты/рассрочка ----------
export async function addDebt(d) {
  if (useMongo) { await col.findebt.insertOne({ ...d }); return d; }
  const arr = readJson(FINDEBT_FILE, []);
  arr.push(d); writeJson(FINDEBT_FILE, arr); return d;
}
export async function getUserDebts(telegramId) {
  if (useMongo) return col.findebt.find({ telegramId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  return (readJson(FINDEBT_FILE, [])).filter((x) => x.telegramId === telegramId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
export async function getDebt(telegramId, id) {
  if (useMongo) return col.findebt.findOne({ telegramId, id }, { projection: { _id: 0 } });
  return (readJson(FINDEBT_FILE, [])).find((x) => x.telegramId === telegramId && x.id === id) || null;
}
export async function updateDebt(telegramId, id, set) {
  if (useMongo) {
    await col.findebt.updateOne({ telegramId, id }, { $set: set });
    return col.findebt.findOne({ telegramId, id }, { projection: { _id: 0 } });
  }
  const arr = readJson(FINDEBT_FILE, []);
  const i = arr.findIndex((x) => x.telegramId === telegramId && x.id === id);
  if (i < 0) return null;
  arr[i] = { ...arr[i], ...set }; writeJson(FINDEBT_FILE, arr); return arr[i];
}
export async function deleteDebt(telegramId, id) {
  if (useMongo) { const r = await col.findebt.deleteOne({ telegramId, id }); return r.deletedCount > 0; }
  const arr = readJson(FINDEBT_FILE, []);
  const next = arr.filter((x) => !(x.telegramId === telegramId && x.id === id));
  writeJson(FINDEBT_FILE, next); return next.length !== arr.length;
}
export async function getAllDebts() {
  if (useMongo) return col.findebt.find({}, { projection: { _id: 0 } }).toArray();
  return readJson(FINDEBT_FILE, []);
}

// ---------- Достар (друзья) ----------
export async function getUserByFriendCode(code) {
  if (!code) return null;
  if (useMongo) return col.users.findOne({ friendCode: code }, { projection: { _id: 0 } });
  return (readJson(USERS_FILE, [])).find((u) => u.friendCode === code) || null;
}
export async function getFriendDocs(telegramId) {
  if (useMongo) return col.friends.find({ $or: [{ a: telegramId }, { b: telegramId }] }, { projection: { _id: 0 } }).toArray();
  return (readJson(FRIENDS_FILE, [])).filter((f) => f.a === telegramId || f.b === telegramId);
}
export async function addFriendReq(a, b) {
  if (useMongo) {
    const exist = await col.friends.findOne({ $or: [{ a, b }, { a: b, b: a }] });
    if (exist) return null;
    const doc = { a, b, status: 'pending', createdAt: new Date().toISOString() };
    await col.friends.insertOne({ ...doc });
    return doc;
  }
  const arr = readJson(FRIENDS_FILE, []);
  if (arr.find((f) => (f.a === a && f.b === b) || (f.a === b && f.b === a))) return null;
  const doc = { a, b, status: 'pending', createdAt: new Date().toISOString() };
  arr.push(doc); writeJson(FRIENDS_FILE, arr); return doc;
}
export async function acceptFriend(me, from) {
  if (useMongo) { const r = await col.friends.updateOne({ a: from, b: me, status: 'pending' }, { $set: { status: 'accepted' } }); return r.modifiedCount > 0; }
  const arr = readJson(FRIENDS_FILE, []);
  const i = arr.findIndex((f) => f.a === from && f.b === me && f.status === 'pending');
  if (i < 0) return false;
  arr[i].status = 'accepted'; writeJson(FRIENDS_FILE, arr); return true;
}
export async function removeFriend(me, other) {
  if (useMongo) { const r = await col.friends.deleteMany({ $or: [{ a: me, b: other }, { a: other, b: me }] }); return r.deletedCount > 0; }
  const arr = readJson(FRIENDS_FILE, []);
  const next = arr.filter((f) => !((f.a === me && f.b === other) || (f.a === other && f.b === me)));
  writeJson(FRIENDS_FILE, next); return next.length !== arr.length;
}

// ---------- Қаржы: инвестиции (активы) ----------
export async function addAsset(a) {
  if (useMongo) { await col.finasset.insertOne({ ...a }); return a; }
  const arr = readJson(FINASSET_FILE, []);
  arr.push(a); writeJson(FINASSET_FILE, arr); return a;
}
export async function getUserAssets(telegramId) {
  if (useMongo) return col.finasset.find({ telegramId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  return (readJson(FINASSET_FILE, [])).filter((x) => x.telegramId === telegramId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
export async function deleteAsset(telegramId, id) {
  if (useMongo) { const r = await col.finasset.deleteOne({ telegramId, id }); return r.deletedCount > 0; }
  const arr = readJson(FINASSET_FILE, []);
  const next = arr.filter((x) => !(x.telegramId === telegramId && x.id === id));
  writeJson(FINASSET_FILE, next); return next.length !== arr.length;
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

// ---------- Кітапхана (бірнеше кітап + көрсетілетінін таңдау) ----------
const BOOKSLIB_FILE = path.join(DATA_DIR, 'bookslib.json');

async function readLibRaw() {
  if (useMongo) {
    const m = await col.meta.findOne({ _id: 'booksLib' });
    return m && m.value ? m.value : null;
  }
  return readJson(BOOKSLIB_FILE, null);
}
async function writeLib(lib) {
  if (useMongo) {
    await col.meta.updateOne({ _id: 'booksLib' }, { $set: { value: lib } }, { upsert: true });
    return lib;
  }
  writeJson(BOOKSLIB_FILE, lib);
  return lib;
}
// Ескі бір кітапты жаңа тізімге көшіру (бір рет)
async function readOldSingleBook() {
  if (useMongo) {
    const m = await col.meta.findOne({ _id: 'book' });
    return m ? m.book : null;
  }
  return readJson(BOOK_FILE, null);
}
export async function getLib() {
  const lib = await readLibRaw();
  if (lib && Array.isArray(lib.list)) return lib;
  const old = await readOldSingleBook();
  if (old && (old.fileId || (old.title && old.title !== DEFAULT_BOOK.title))) {
    const b = { ...old, id: 'b' + Date.now().toString(36), createdAt: new Date().toISOString() };
    const next = { list: [b], activeId: b.id };
    await writeLib(next);
    return next;
  }
  return { list: [], activeId: null };
}
export async function listBooks() {
  const lib = await getLib();
  return { books: lib.list, activeId: lib.activeId };
}
export async function addBook(book) {
  const lib = await getLib();
  const b = {
    id: 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    title: book.title || 'Атауы жоқ',
    author: book.author || '',
    cover: book.cover || '',
    progress: 0,
    fileId: book.fileId || '',
    format: book.format || '',
    fileName: book.fileName || '',
    createdAt: new Date().toISOString(),
  };
  lib.list.push(b);
  if (!lib.activeId) lib.activeId = b.id;
  await writeLib(lib);
  return b;
}
export async function updateBook(id, patch) {
  const lib = await getLib();
  const i = lib.list.findIndex((x) => x.id === id);
  if (i < 0) return null;
  lib.list[i] = { ...lib.list[i], ...patch, id };
  await writeLib(lib);
  return lib.list[i];
}
export async function deleteBook(id) {
  const lib = await getLib();
  const i = lib.list.findIndex((x) => x.id === id);
  if (i < 0) return null;
  const [removed] = lib.list.splice(i, 1);
  if (lib.activeId === id) lib.activeId = lib.list.length ? lib.list[0].id : null;
  await writeLib(lib);
  return removed;
}
export async function setActiveBook(id) {
  const lib = await getLib();
  if (!lib.list.some((x) => x.id === id)) return null;
  lib.activeId = id;
  await writeLib(lib);
  return id;
}

// Мини-апп үшін: ағымдағы (көрсетілетін) кітап
export async function getBook() {
  const lib = await getLib();
  const b = lib.list.find((x) => x.id === lib.activeId);
  return b || DEFAULT_BOOK;
}
// Ескі API-мен үйлесімділік: белсенді кітапты өзгерту
export async function setBook(book) {
  const lib = await getLib();
  if (!lib.activeId || !lib.list.length) return addBook(book);
  return updateBook(lib.activeId, book);
}

// ---------- Удаление участника ----------
export async function deleteUser(telegramId) {
  if (useMongo) {
    const r = await col.users.deleteOne({ telegramId });
    return r.deletedCount > 0;
  }
  const users = readJson(USERS_FILE, []);
  const next = users.filter((u) => u.telegramId !== telegramId);
  writeJson(USERS_FILE, next);
  return next.length !== users.length;
}

// ---------- Настройки Қаржы (категории + банки) — общие для всех ----------
const FINCFG_FILE = path.join(DATA_DIR, 'finconfig.json');
export async function getFinConfig() {
  if (useMongo) {
    const m = await col.meta.findOne({ _id: 'finConfig' });
    return m ? m.value : null;
  }
  return readJson(FINCFG_FILE, null);
}
export async function setFinConfig(cfg) {
  if (useMongo) {
    await col.meta.updateOne({ _id: 'finConfig' }, { $set: { value: cfg } }, { upsert: true });
    return cfg;
  }
  writeJson(FINCFG_FILE, cfg);
  return cfg;
}

// ---------- Файл книги (EPUB/PDF) в GridFS ----------
const BOOKS_DIR = path.join(DATA_DIR, 'books');
export async function saveBookFile(buffer, fileName, format) {
  if (useMongo) {
    const id = await new Promise((resolve, reject) => {
      const up = bucket.openUploadStream(fileName || 'book', { metadata: { format } });
      up.on('error', reject);
      up.on('finish', () => resolve(up.id));
      up.end(buffer);
    });
    return String(id);
  }
  if (!fs.existsSync(BOOKS_DIR)) fs.mkdirSync(BOOKS_DIR, { recursive: true });
  const id = Date.now().toString();
  fs.writeFileSync(path.join(BOOKS_DIR, id), buffer);
  return id;
}
export function getBookFileStream(fileId) {
  if (useMongo) return bucket.openDownloadStream(new OID(fileId));
  return fs.createReadStream(path.join(BOOKS_DIR, String(fileId)));
}
export async function deleteBookFile(fileId) {
  if (!fileId) return false;
  if (useMongo) { try { await bucket.delete(new OID(fileId)); return true; } catch { return false; } }
  try { fs.unlinkSync(path.join(BOOKS_DIR, String(fileId))); return true; } catch { return false; }
}

// ---------- Прогресс чтения (по пользователю и книге) ----------
const READING_FILE = path.join(DATA_DIR, 'reading.json');
export async function getReading(telegramId, bookId) {
  if (useMongo) return col.reading.findOne({ telegramId, bookId }, { projection: { _id: 0 } });
  return (readJson(READING_FILE, [])).find((r) => r.telegramId === telegramId && r.bookId === bookId) || null;
}
// Барлық қатысушының оқу прогресі (рейтинг үшін)
export async function getAllReading(bookId) {
  if (useMongo) return col.reading.find({ bookId }, { projection: { _id: 0 } }).toArray();
  return (readJson(READING_FILE, [])).filter((r) => r.bookId === bookId);
}

// ---------- Дәйексөздер ----------
const QUOTES_FILE = path.join(DATA_DIR, 'quotes.json');
export async function addQuote(q) {
  const doc = { ...q, id: 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), likes: [], createdAt: new Date().toISOString() };
  if (useMongo) { await col.quotes.insertOne({ ...doc }); return doc; }
  const arr = readJson(QUOTES_FILE, []); arr.push(doc); writeJson(QUOTES_FILE, arr); return doc;
}
export async function listQuotes(bookId) {
  if (useMongo) return col.quotes.find({ bookId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(300).toArray();
  return (readJson(QUOTES_FILE, [])).filter((q) => q.bookId === bookId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
export async function likeQuote(id, telegramId) {
  if (useMongo) {
    const q = await col.quotes.findOne({ id });
    if (!q) return null;
    const has = (q.likes || []).includes(telegramId);
    await col.quotes.updateOne({ id }, has ? { $pull: { likes: telegramId } } : { $addToSet: { likes: telegramId } });
    return { id, liked: !has };
  }
  const arr = readJson(QUOTES_FILE, []); const i = arr.findIndex((q) => q.id === id);
  if (i < 0) return null;
  arr[i].likes = arr[i].likes || [];
  const has = arr[i].likes.includes(telegramId);
  arr[i].likes = has ? arr[i].likes.filter((x) => x !== telegramId) : arr[i].likes.concat(telegramId);
  writeJson(QUOTES_FILE, arr);
  return { id, liked: !has };
}
export async function deleteQuote(id, telegramId) {
  if (useMongo) {
    const f = telegramId ? { id, telegramId } : { id };
    const r = await col.quotes.deleteOne(f);
    return r.deletedCount > 0;
  }
  const arr = readJson(QUOTES_FILE, []);
  const next = arr.filter((q) => !(q.id === id && (!telegramId || q.telegramId === telegramId)));
  writeJson(QUOTES_FILE, next);
  return next.length !== arr.length;
}

// ---------- Талқылау ----------
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
export async function addComment(c) {
  const doc = { ...c, id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), createdAt: new Date().toISOString() };
  if (useMongo) { await col.comments.insertOne({ ...doc }); return doc; }
  const arr = readJson(COMMENTS_FILE, []); arr.push(doc); writeJson(COMMENTS_FILE, arr); return doc;
}
export async function listComments(bookId, ch) {
  const f = (ch === null || ch === undefined) ? { bookId } : { bookId, ch: Number(ch) };
  if (useMongo) return col.comments.find(f, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(300).toArray();
  return (readJson(COMMENTS_FILE, []))
    .filter((c) => c.bookId === bookId && (f.ch === undefined || Number(c.ch) === f.ch))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
export async function deleteComment(id, telegramId) {
  if (useMongo) {
    const f = telegramId ? { id, telegramId } : { id };
    const r = await col.comments.deleteOne(f);
    return r.deletedCount > 0;
  }
  const arr = readJson(COMMENTS_FILE, []);
  const next = arr.filter((c) => !(c.id === id && (!telegramId || c.telegramId === telegramId)));
  writeJson(COMMENTS_FILE, next);
  return next.length !== arr.length;
}

// ---------- Оқу статистикасы ----------
const READDAYS_FILE = path.join(DATA_DIR, 'readdays.json');
export async function bumpRead(telegramId, date, seconds, pages) {
  const inc = { seconds: Math.max(0, Math.min(600, Number(seconds) || 0)), pages: Math.max(0, Math.min(50, Number(pages) || 0)) };
  if (useMongo) {
    await col.readdays.updateOne({ telegramId, date }, { $inc: { seconds: inc.seconds, pages: inc.pages }, $set: { updatedAt: new Date().toISOString() } }, { upsert: true });
    return col.readdays.findOne({ telegramId, date }, { projection: { _id: 0 } });
  }
  const arr = readJson(READDAYS_FILE, []);
  let d = arr.find((x) => x.telegramId === telegramId && x.date === date);
  if (!d) { d = { telegramId, date, seconds: 0, pages: 0 }; arr.push(d); }
  d.seconds += inc.seconds; d.pages += inc.pages; d.updatedAt = new Date().toISOString();
  writeJson(READDAYS_FILE, arr);
  return d;
}
export async function getReadDays(telegramId) {
  if (useMongo) return col.readdays.find({ telegramId }, { projection: { _id: 0 } }).sort({ date: -1 }).limit(120).toArray();
  return (readJson(READDAYS_FILE, [])).filter((x) => x.telegramId === telegramId).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function saveReading(telegramId, bookId, patch) {
  const set = { ...patch, telegramId, bookId, updatedAt: new Date().toISOString() };
  if (useMongo) {
    await col.reading.updateOne({ telegramId, bookId }, { $set: set }, { upsert: true });
    return set;
  }
  const arr = readJson(READING_FILE, []);
  const i = arr.findIndex((r) => r.telegramId === telegramId && r.bookId === bookId);
  if (i < 0) arr.push(set); else arr[i] = { ...arr[i], ...set };
  writeJson(READING_FILE, arr);
  return set;
}
