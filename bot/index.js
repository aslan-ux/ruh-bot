import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Bot, InlineKeyboard, webhookCallback } from 'grammy';
import { validateInitData } from './validateInitData.js';
import crypto from 'crypto';
import {
  initStorage,
  upsertUser,
  getUser,
  getUsers,
  getBook,
  setBook,
  assignBookToUser,
  setUserStatus,
  getUserByToken,
  setSteps,
  getUserSteps,
  getStepsSince,
  getAllSteps,
  getGoal,
  setGoal,
  addTx,
  getUserTx,
  deleteTx,
  addDebt,
  getUserDebts,
  getDebt,
  updateDebt,
  deleteDebt,
  getAllDebts,
  addAsset,
  getUserAssets,
  deleteAsset,
  getUserByFriendCode,
  getFriendDocs,
  addFriendReq,
  acceptFriend,
  removeFriend,
  deleteUser,
  getFinConfig,
  setFinConfig,
  saveBookFile,
  getBookFileStream,
  deleteBookFile,
  getReading,
  saveReading,
  getAllReading,
  addQuote,
  listQuotes,
  likeQuote,
  deleteQuote,
  addComment,
  listComments,
  deleteComment,
  bumpRead,
  getReadDays,
  listBooks,
  addBook,
  updateBook,
  deleteBook,
  setActiveBook,
} from './storage.js';

// ---------- Қаржы: дефолтные категории и банки (управляются из админки) ----------
const DEFAULT_FIN = {
  cats: {
    expense: [
      { k: 'azyk', n: 'Азық-түлік', i: 'i-cart', c: '#FF6B6B' },
      { k: 'kolik', n: 'Көлік', i: 'i-car', c: '#4D96FF' },
      { k: 'uy', n: 'Үй', i: 'i-home', c: '#9B87F5' },
      { k: 'kafe', n: 'Кафе', i: 'i-coffee', c: '#F59E0B' },
      { k: 'kiim', n: 'Киім', i: 'i-shirt', c: '#EC4899' },
      { k: 'oyyn', n: 'Ойын-сауық', i: 'i-film', c: '#8B5CF6' },
      { k: 'densaulyk', n: 'Денсаулық', i: 'i-heart', c: '#22C55E' },
      { k: 'bailanys', n: 'Байланыс', i: 'i-phone', c: '#06B6D4' },
      { k: 'basqa', n: 'Басқа', i: 'i-dots', c: '#94A3B8' },
    ],
    income: [
      { k: 'jalaqy', n: 'Жалақы', i: 'i-cash', c: '#22C55E' },
      { k: 'biznes', n: 'Бизнес', i: 'i-briefcase', c: '#4D96FF' },
      { k: 'investisiya', n: 'Инвестиция', i: 'i-trend', c: '#8B5CF6' },
      { k: 'syilyq', n: 'Сыйлық', i: 'i-gift', c: '#EC4899' },
      { k: 'basqa', n: 'Басқа', i: 'i-dots', c: '#94A3B8' },
    ],
  },
  banks: [
    { n: 'Қолма-қол', d: '', c: '#16a34a' },
    { n: 'Kaspi', d: 'kaspi.kz', c: '#F14635' },
    { n: 'Halyk', d: 'halykbank.kz', c: '#16A34A' },
    { n: 'Jusan', d: 'jusan.kz', c: '#111827' },
    { n: 'ForteBank', d: 'forte.kz', c: '#FF6A00' },
    { n: 'Bereke', d: 'berekebank.kz', c: '#15803D' },
    { n: 'Freedom', d: 'bankffin.kz', c: '#00A651' },
    { n: 'БЦК', d: 'bcc.kz', c: '#0EA5A0' },
    { n: 'Eurasian', d: 'eubank.kz', c: '#DC2626' },
    { n: 'RBK', d: 'bankrbk.kz', c: '#2563EB' },
    { n: 'Home Credit', d: 'home.kz', c: '#E11D48' },
    { n: 'Altyn', d: 'altynbank.kz', c: '#CA8A04' },
    { n: 'Nurbank', d: 'nurbank.kz', c: '#7C3AED' },
    { n: 'VTB', d: 'vtb-bank.kz', c: '#1D4ED8' },
    { n: 'Басқа', d: '', c: '#6B7280' },
  ],
};
function mergeFinConfig(saved) {
  const c = saved && typeof saved === 'object' ? saved : {};
  const cats = c.cats && c.cats.expense && c.cats.income ? c.cats : DEFAULT_FIN.cats;
  const banks = Array.isArray(c.banks) && c.banks.length ? c.banks : DEFAULT_FIN.banks;
  return { cats, banks };
}

// Дата YYYY-MM-DD в часовом поясе Қазақстана (UTC+5)
function kzDate(daysAgo = 0) {
  const t = Date.now() + 5 * 3600 * 1000 - daysAgo * 86400000;
  return new Date(t).toISOString().slice(0, 10);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BOT_TOKEN = process.env.BOT_TOKEN;
// На хостинге (Render и т.п.) публичный адрес приходит автоматически.
const PUBLIC_URL =
  process.env.WEBAPP_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  '';
const WEBAPP_URL = PUBLIC_URL;
const ADMIN_KEY = process.env.ADMIN_KEY || 'change-me';
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) throw new Error('BOT_TOKEN не задан (env BOT_TOKEN)');
if (!WEBAPP_URL) throw new Error('Публичный адрес не задан (env WEBAPP_URL)');

// Подключаем хранилище (MongoDB, либо файлы, если базы нет)
await initStorage();

// ---------- Бот ----------
const bot = new Bot(BOT_TOKEN);

bot.command('start', async (ctx) => {
  const kb = new InlineKeyboard().webApp('🚀 Ruh-ты ашу', WEBAPP_URL);
  await ctx.reply(
    'Ruh қауымдастығына қош келдің! Қосымшаны ашу үшін төмендегі батырманы бас.',
    { reply_markup: kb }
  );
});

// ---------- HTTP-сервер ----------
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'webapp')));

/* Сұраныс шегі: бір қолданушыға минутына 90 */
const rxRate = new Map();
function rxRateOk(key) {
  const now = Date.now();
  const win = 60000;
  let b = rxRate.get(key);
  if (!b || now - b.at > win) { b = { at: now, n: 0 }; rxRate.set(key, b); }
  b.n++;
  if (rxRate.size > 5000) {
    for (const [k, v] of rxRate) { if (now - v.at > win) rxRate.delete(k); }
  }
  return b.n <= 90;
}
function requireTelegram(req, res) {
  const initData = req.body?.initData || req.get('X-Init-Data');
  const check = validateInitData(initData, BOT_TOKEN);
  if (!check.ok) {
    res.status(401).json({ ok: false, error: 'auth: ' + check.error });
    return null;
  }
  const uid = String((check.user && check.user.id) || '');
  if (uid && !rxRateOk(uid)) {
    res.status(429).json({ ok: false, error: 'Тым көп сұраныс. Сәл кідіріңіз' });
    return null;
  }
  return check.user;
}

function requireAdmin(req, res) {
  const key = req.get('X-Admin-Key');
  if (!key || key !== ADMIN_KEY) {
    res.status(401).json({ ok: false, error: 'Қате кілт (wrong admin key)' });
    return false;
  }
  return true;
}

// Регистрация участника
app.post('/api/register', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;

  const f = req.body?.form || {};
  const required = ['firstName', 'lastName', 'email', 'phone', 'birthDate'];
  for (const key of required) {
    if (!f[key] || String(f[key]).trim() === '') {
      return res.status(400).json({ ok: false, error: `Бос өріс: ${key}` });
    }
  }

  const existing = await getUser(tgUser.id);
  const saved = await upsertUser({
    telegramId: tgUser.id,
    username: tgUser.username || '',
    firstName: String(f.firstName).trim(),
    lastName: String(f.lastName).trim(),
    patronymic: String(f.patronymic || '').trim(),
    email: String(f.email).trim(),
    phone: String(f.phone).trim(),
    birthDate: String(f.birthDate).trim(),
    assignedBookId: existing?.assignedBookId ?? null,
    status: existing?.status || 'pending',
    syncToken: existing?.syncToken || crypto.randomBytes(16).toString('hex'),
  });

  try {
    const msg = saved.status === 'approved'
      ? `✅ Мәліметтерің жаңартылды, ${saved.firstName}!`
      : `✅ Өтінішің қабылданды, ${saved.firstName}! Әкімші растағаннан кейін қосымша ашылады.`;
    await bot.api.sendMessage(tgUser.id, msg);
  } catch {}

  res.json({ ok: true, status: saved.status });
});

app.post('/api/me', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const user = await getUser(tgUser.id);
  res.json({ ok: true, registered: !!user, user });
});

app.post('/api/book', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const book = await getBook();
  let myProgress = 0;
  if (book && book.fileId) {
    const rd = await getReading(tgUser.id, book.fileId);
    if (rd && typeof rd.percent === 'number') myProgress = rd.percent;
  }
  res.json({ ok: true, book, myProgress });
});

// Файл текущей книги (стрим). Авторизация — initData (заголовок X-Init-Data)
app.get('/api/book/file', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const book = await getBook();
  if (!book || !book.fileId) return res.status(404).json({ ok: false, error: 'Файл жоқ' });
  try {
    const stream = getBookFileStream(book.fileId);
    const type = book.format === 'pdf' ? 'application/pdf' : (book.format === 'epub' ? 'application/epub+zip' : 'application/octet-stream');
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'private, max-age=300');
    stream.on('error', () => { if (!res.headersSent) res.status(404).end(); else res.end(); });
    stream.pipe(res);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Прогресс чтения текущей книги (получить)
app.post('/api/book/read/get', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const book = await getBook();
  const bookId = book && book.fileId ? book.fileId : 'none';
  const rd = await getReading(tgUser.id, bookId);
  res.json({ ok: true, reading: rd || null, bookId });
});
// Прогресс чтения текущей книги (сохранить: позиция/%, закладки, выделения)
app.post('/api/book/read/save', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const book = await getBook();
  if (!book || !book.fileId) return res.status(400).json({ ok: false, error: 'Кітап жоқ' });
  const b = req.body || {};
  const patch = {};
  if (b.location != null) patch.location = String(b.location).slice(0, 500);
  if (b.offset != null) patch.offset = Math.max(0, Math.floor(Number(b.offset) || 0));
  if (b.percent != null) patch.percent = Math.max(0, Math.min(100, Number(b.percent) || 0));
  if (Array.isArray(b.bookmarks)) patch.bookmarks = b.bookmarks.slice(0, 300);
  if (Array.isArray(b.highlights)) patch.highlights = b.highlights.slice(0, 800);
  const rd = await saveReading(tgUser.id, book.fileId, patch);
  res.json({ ok: true, reading: rd });
});

// ---------- Қадам (шаги) ----------
// Мини-апп: мои шаги + рейтинг (день/неделя/месяц)
app.post('/api/steps/me', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const user = await getUser(tgUser.id);
  if (!user) return res.json({ ok: true, registered: false });

  // Токен для iOS «Команд»: если участник зарегистрировался до этой функции — выдаём сейчас
  let syncToken = user.syncToken;
  if (!syncToken) {
    syncToken = crypto.randomBytes(16).toString('hex');
    await upsertUser({ ...user, syncToken });
  }

  const mySteps = await getUserSteps(tgUser.id); // [{date, steps}]
  const today = kzDate(0);
  const weekStart = kzDate(6);
  const monthStart = today.slice(0, 8) + '01';
  const since = monthStart < weekStart ? monthStart : weekStart;

  const all = await getStepsSince(since);
  const users = await getUsers();
  const nameById = {};
  users.forEach((u) => {
    nameById[u.telegramId] = `${u.lastName || ''} ${u.firstName || ''}`.trim() || (u.firstName || 'Қатысушы');
  });

  function board(ok, onlyIds) {
    const sums = {};
    all.forEach((s) => {
      if (!ok(s.date)) return;
      if (onlyIds && !onlyIds.has(Number(s.telegramId))) return;
      sums[s.telegramId] = (sums[s.telegramId] || 0) + s.steps;
    });
    return Object.entries(sums)
      .map(([id, steps]) => ({ name: nameById[id] || 'Қатысушы', steps, you: Number(id) === tgUser.id }))
      .sort((a, b) => b.steps - a.steps);
  }

  // Достар: только принятые друзья + я
  const fdocs = await getFriendDocs(tgUser.id);
  const friendIds = new Set([tgUser.id]);
  fdocs.forEach((d) => { if (d.status === 'accepted') friendIds.add(d.a === tgUser.id ? d.b : d.a); });

  res.json({
    ok: true,
    registered: true,
    syncToken,
    goal: await getGoal(),
    steps: mySteps,
    today,
    leaderboard: {
      day: board((d) => d === today),
      week: board((d) => d >= weekStart),
      month: board((d) => d >= monthStart),
    },
    friendsBoard: {
      day: board((d) => d === today, friendIds),
      week: board((d) => d >= weekStart, friendIds),
      month: board((d) => d >= monthStart, friendIds),
    },
  });
});

// Приём шагов из iOS «Команд» (по токену, без Telegram initData)
app.post('/api/steps/push', async (req, res) => {
  const { token, steps, date } = req.body || {};
  const user = await getUserByToken(token);
  if (!user) return res.status(401).json({ ok: false, error: 'bad token' });
  const d = (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) ? date : kzDate(0);
  await setSteps(user.telegramId, d, steps);
  res.json({ ok: true });
});

// ---------- Қаржы (финансы) ----------
// Список транзакций участника
app.post('/api/fin/list', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const txs = await getUserTx(tgUser.id);
  res.json({ ok: true, txs });
});

// Добавить транзакцию (Шығыс/Кіріс)
app.post('/api/fin/add', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const b = req.body || {};
  const type = b.type === 'income' ? 'income' : 'expense';
  const amount = Math.round(Number(b.amount) || 0);
  if (amount <= 0) return res.status(400).json({ ok: false, error: 'Сома дұрыс емес' });
  const date = (typeof b.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.date)) ? b.date : kzDate(0);
  const tx = {
    id: crypto.randomBytes(9).toString('hex'),
    telegramId: tgUser.id,
    type,
    amount,
    category: String(b.category || 'basqa').slice(0, 40),
    account: String(b.account || '').slice(0, 40),
    date,
    note: String(b.note || '').slice(0, 200),
    createdAt: new Date().toISOString(),
  };
  await addTx(tx);
  res.json({ ok: true, tx });
});

// Удалить транзакцию
app.post('/api/fin/delete', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const ok = await deleteTx(tgUser.id, String((req.body || {}).id || ''));
  res.json({ ok });
});

// ----- Долги / кредиты / рассрочка -----
app.post('/api/fin/debt/list', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  maybeSendReminders();
  const debts = await getUserDebts(tgUser.id);
  res.json({ ok: true, debts });
});

app.post('/api/fin/debt/add', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const b = req.body || {};
  const kind = ['qaryz', 'kredit', 'bolip'].includes(b.kind) ? b.kind : 'kredit';
  const total = Math.round(Number(b.total) || 0);
  if (total <= 0) return res.status(400).json({ ok: false, error: 'Сома дұрыс емес' });
  const debt = {
    id: crypto.randomBytes(9).toString('hex'),
    telegramId: tgUser.id,
    kind,
    title: String(b.title || '').slice(0, 60) || '—',
    total,
    paid: Math.min(total, Math.max(0, Math.round(Number(b.paid) || 0))),
    monthly: Math.max(0, Math.round(Number(b.monthly) || 0)),
    direction: b.direction === 'lent' ? 'lent' : (b.direction === 'borrowed' ? 'borrowed' : ''),
    dueDate: (typeof b.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.dueDate)) ? b.dueDate : '',
    note: String(b.note || '').slice(0, 200),
    remind: !!b.remind,
    done: false,
    remindedOn: '',
    createdAt: new Date().toISOString(),
  };
  debt.done = debt.paid >= debt.total;
  await addDebt(debt);
  res.json({ ok: true, debt });
});

// Внести платёж/возврат: уменьшает остаток и пишет связанную транзакцию
app.post('/api/fin/debt/pay', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const b = req.body || {};
  const d = await getDebt(tgUser.id, String(b.id || ''));
  if (!d) return res.status(404).json({ ok: false, error: 'Табылмады' });
  const remaining = Math.max(0, d.total - d.paid);
  if (remaining <= 0) return res.json({ ok: true, debt: d });
  let pay;
  if (b.amount != null) pay = Math.round(Number(b.amount) || 0);
  else if (d.kind === 'qaryz') pay = remaining;
  else pay = d.monthly > 0 ? Math.min(d.monthly, remaining) : remaining;
  pay = Math.max(1, Math.min(pay, remaining));
  const newPaid = d.paid + pay;
  const updated = await updateDebt(tgUser.id, d.id, { paid: newPaid, done: newPaid >= d.total });

  // Связанная транзакция: возврат мне (қарыз бердім) = кіріс, иначе шығыс
  const isIncome = d.kind === 'qaryz' && d.direction === 'lent';
  const label = d.kind === 'kredit' ? 'Кредит' : d.kind === 'bolip' ? 'Бөліп төлеу' : 'Қарыз';
  try {
    await addTx({
      id: crypto.randomBytes(9).toString('hex'),
      telegramId: tgUser.id,
      type: isIncome ? 'income' : 'expense',
      amount: pay,
      category: 'basqa',
      account: String(b.account || ''),
      date: kzDate(0),
      note: label + ': ' + (d.title || ''),
      createdAt: new Date().toISOString(),
    });
  } catch {}
  res.json({ ok: true, debt: updated, paid: pay });
});

app.post('/api/fin/debt/delete', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const ok = await deleteDebt(tgUser.id, String((req.body || {}).id || ''));
  res.json({ ok });
});

// ----- Инвестиции (активы) -----
app.post('/api/fin/asset/list', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const assets = await getUserAssets(tgUser.id);
  res.json({ ok: true, assets });
});

app.post('/api/fin/asset/add', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const b = req.body || {};
  const kind = b.kind === 'tas' ? 'tas' : 'qujat';
  const qty = Number(b.qty) || 0;
  const buyPrice = Math.round(Number(b.buyPrice) || 0);
  if (qty <= 0 || buyPrice <= 0) return res.status(400).json({ ok: false, error: 'Сан/баға дұрыс емес' });
  const asset = {
    id: crypto.randomBytes(9).toString('hex'),
    telegramId: tgUser.id,
    kind,
    name: String(b.name || '').slice(0, 60) || '—',
    market: ['us', 'metal', 'manual'].includes(b.market) ? b.market : 'manual',
    symbol: String(b.symbol || '').slice(0, 20).toLowerCase(),
    qty,
    buyPrice,
    curManual: Math.max(0, Math.round(Number(b.curManual) || 0)),
    unit: String(b.unit || '').slice(0, 10),
    note: String(b.note || '').slice(0, 200),
    createdAt: new Date().toISOString(),
  };
  await addAsset(asset);
  res.json({ ok: true, asset });
});

app.post('/api/fin/asset/delete', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const ok = await deleteAsset(tgUser.id, String((req.body || {}).id || ''));
  res.json({ ok });
});

// Онлайн-котировки (без ключа). Публичный эндпоинт — цены не персональны.
// Единая схема символов: usdkzt (курс), xauusd/xagusd/xptusd (металлы), *.us (акции США).
const priceCache = new Map();
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; RuhBot/1.0)' };

function mapYahoo(sym) {
  if (sym === 'usdkzt') return 'KZT=X';
  if (sym === 'xauusd') return 'GC=F';
  if (sym === 'xagusd') return 'SI=F';
  if (sym === 'xptusd') return 'PL=F';
  if (sym === 'xpdusd') return 'PA=F';
  if (sym.endsWith('.us')) return sym.slice(0, -3).toUpperCase();
  return sym.toUpperCase();
}
async function yahooPrice(sym) {
  try {
    const y = mapYahoo(sym);
    const r = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(y) + '?interval=1d&range=1d', { headers: UA });
    const j = await r.json();
    const p = j && j.chart && j.chart.result && j.chart.result[0] && j.chart.result[0].meta && j.chart.result[0].meta.regularMarketPrice;
    return Number.isFinite(p) ? p : null;
  } catch { return null; }
}
async function stooqPrice(sym) {
  try {
    const r = await fetch('https://stooq.com/q/l/?s=' + encodeURIComponent(sym) + '&f=sd2t2ohlcv&h&e=csv', { headers: UA });
    const txt = await r.text();
    const cols = (txt.trim().split('\n').pop() || '').split(',');
    const close = parseFloat(cols[6]);
    return Number.isFinite(close) ? close : null;
  } catch { return null; }
}
async function fxErApi() {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD', { headers: UA });
    const j = await r.json();
    const p = j && j.rates && j.rates.KZT;
    return Number.isFinite(p) ? p : null;
  } catch { return null; }
}

function mktQuote(sym) {
  let k = String(sym || '').trim().toUpperCase();
  if (k.endsWith('.AIX')) k = k.slice(0, -4);
  if (!k || !MKT.list.length) return 0;
  for (const it of MKT.list) {
    if (it.sym.toUpperCase() !== k) continue;
    if (it.cur === 'KZT') return it.price;
    if (it.cur === 'USD' && MKT.fx) return it.price * MKT.fx;
    return 0;
  }
  return 0;
}

/* Бағалы металдар: gold-api.com (кілтсіз, унция/USD) */
const METAL_MAP = { xauusd: "XAU", xagusd: "XAG", xptusd: "XPT", xpdusd: "XPD" };
const metalCache = new Map();
async function goldApiPrice(sym) {
  const code = METAL_MAP[sym];
  if (!code) return null;
  const hit = metalCache.get(code);
  if (hit && Date.now() - hit.ts < 10 * 60 * 1000) return hit.price;
  try {
    const r = await fetch('https://api.gold-api.com/price/' + code, { headers: UA });
    if (!r.ok) return null;
    const j = await r.json();
    const p = Number(j && j.price);
    if (!isFinite(p) || p <= 0) return null;
    metalCache.set(code, { price: p, ts: Date.now() });
    return p;
  } catch (e) { return null; }
}
async function priceOf(sym) {
  /* Алдымен AIX/KASE тізімінен іздейміз */
  try {
    const mq = mktQuote(sym);
    if (mq) return mq;
  } catch (e) {}
  const cached = priceCache.get(sym);
  if (cached && Date.now() - cached.ts < 10 * 60 * 1000) return cached.price;
  let p = await goldApiPrice(sym);
  if (p == null) p = await yahooPrice(sym);
  if (p == null) p = await stooqPrice(sym);
  if (p == null && sym === 'usdkzt') p = await fxErApi();
  if (p != null) priceCache.set(sym, { price: p, ts: Date.now() });
  return p;
}
app.get('/api/fin/prices', async (req, res) => {
  const syms = String(req.query.symbols || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean).slice(0, 30);
  const out = {};
  await Promise.all(syms.map(async (s) => { const p = await priceOf(s); if (p != null) out[s] = p; }));
  res.json({ ok: true, prices: out, ts: Date.now() });
});

// ---------- Достар (друзья) ----------
function nameOf(u) {
  if (!u) return 'Қатысушы';
  return `${u.lastName || ''} ${u.firstName || ''}`.trim() || (u.firstName || 'Қатысушы');
}
app.post('/api/friends/me', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const user = await getUser(tgUser.id);
  if (!user) return res.json({ ok: true, registered: false });
  let code = user.friendCode;
  if (!code) { code = crypto.randomBytes(3).toString('hex').toUpperCase(); await upsertUser({ ...user, friendCode: code }); }
  const users = await getUsers();
  const byId = {};
  users.forEach((u) => { byId[u.telegramId] = nameOf(u); });
  const docs = await getFriendDocs(tgUser.id);
  const friends = [], incoming = [], outgoing = [];
  docs.forEach((d) => {
    if (d.status === 'accepted') {
      const other = d.a === tgUser.id ? d.b : d.a;
      friends.push({ id: other, name: byId[other] || 'Қатысушы' });
    } else if (d.status === 'pending') {
      if (d.b === tgUser.id) incoming.push({ id: d.a, name: byId[d.a] || 'Қатысушы' });
      else outgoing.push({ id: d.b, name: byId[d.b] || 'Қатысушы' });
    }
  });
  res.json({ ok: true, code, friends, incoming, outgoing });
});
app.post('/api/friends/add', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const code = String((req.body || {}).code || '').trim().toUpperCase();
  const target = await getUserByFriendCode(code);
  if (!target) return res.json({ ok: false, error: 'Код табылмады' });
  if (target.telegramId === tgUser.id) return res.json({ ok: false, error: 'Бұл сенің кодың' });
  const docs = await getFriendDocs(tgUser.id);
  const ex = docs.find((d) => (d.a === target.telegramId && d.b === tgUser.id) || (d.a === tgUser.id && d.b === target.telegramId));
  if (ex) {
    if (ex.status === 'accepted') return res.json({ ok: false, error: 'Қазірдің өзінде дос' });
    if (ex.a === target.telegramId && ex.b === tgUser.id) { await acceptFriend(tgUser.id, target.telegramId); return res.json({ ok: true, accepted: true }); }
    return res.json({ ok: false, error: 'Сұраныс жіберілген' });
  }
  await addFriendReq(tgUser.id, target.telegramId);
  const me = await getUser(tgUser.id);
  try { await bot.api.sendMessage(target.telegramId, `👋 ${nameOf(me)} сені досқа қосқысы келеді. «Профиль» → «Достар» бөлімінде растай аласың.`); } catch {}
  res.json({ ok: true });
});
app.post('/api/friends/accept', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const from = Number((req.body || {}).id);
  const ok = await acceptFriend(tgUser.id, from);
  if (ok) { const me = await getUser(tgUser.id); try { await bot.api.sendMessage(from, `✅ ${nameOf(me)} сенің дос сұранысыңды растады.`); } catch {} }
  res.json({ ok });
});
app.post('/api/friends/remove', async (req, res) => {
  const tgUser = requireTelegram(req, res);
  if (!tgUser) return;
  const ok = await removeFriend(tgUser.id, Number((req.body || {}).id));
  res.json({ ok });
});

// ---------- Админка ----------
app.get('/api/admin/data', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const lib = await listBooks();
  res.json({ ok: true, book: await getBook(), books: lib.books, activeBookId: lib.activeId, users: await getUsers(), goal: await getGoal(), fin: mergeFinConfig(await getFinConfig()) });
});

// Кітапхана: тізім
app.get('/api/admin/books', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const lib = await listBooks();
  res.json({ ok: true, books: lib.books, activeId: lib.activeId });
});

// Кітапты өзгерту (атауы, авторы, мұқабасы)
app.post('/api/admin/book/update', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { id, title, author, cover } = req.body || {};
  if (!id) return res.status(400).json({ ok: false, error: 'id жоқ' });
  const patch = {};
  if (title != null) patch.title = String(title).slice(0, 200);
  if (author != null) patch.author = String(author).slice(0, 200);
  if (cover != null) patch.cover = String(cover).slice(0, 600);
  const b = await updateBook(id, patch);
  if (!b) return res.status(404).json({ ok: false, error: 'Кітап табылмады' });
  res.json({ ok: true, book: b });
});

// Кітапты жою (файлымен бірге)
app.post('/api/admin/book/delete', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ ok: false, error: 'id жоқ' });
  const removed = await deleteBook(id);
  if (!removed) return res.status(404).json({ ok: false, error: 'Кітап табылмады' });
  if (removed.fileId) { try { await deleteBookFile(removed.fileId); } catch {} }
  const lib = await listBooks();
  res.json({ ok: true, books: lib.books, activeId: lib.activeId });
});

// Қатысушыларға көрсетілетін кітапты таңдау
app.post('/api/admin/book/active', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { id } = req.body || {};
  const ok = await setActiveBook(id);
  if (!ok) return res.status(404).json({ ok: false, error: 'Кітап табылмады' });
  const lib = await listBooks();
  res.json({ ok: true, books: lib.books, activeId: lib.activeId });
});

// Изменить общую цель шагов (мақсат) — применится ко всем участникам
app.post('/api/admin/goal', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const goal = await setGoal(req.body?.goal);
  res.json({ ok: true, goal });
});

// Шаги всех участников: сегодня / неделя / месяц / всего
app.get('/api/admin/steps', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const users = await getUsers();
  const all = await getAllSteps();
  const today = kzDate(0);
  const weekStart = kzDate(6);
  const monthStart = today.slice(0, 8) + '01';

  const byUser = {};
  all.forEach((s) => {
    const b = byUser[s.telegramId] || (byUser[s.telegramId] = { today: 0, week: 0, month: 0, total: 0, last: '' });
    const st = Number(s.steps) || 0;
    b.total += st;
    if (s.date === today) b.today += st;
    if (s.date >= weekStart) b.week += st;
    if (s.date >= monthStart) b.month += st;
    if (s.date > b.last) b.last = s.date;
  });

  const rows = users.map((u) => {
    const b = byUser[u.telegramId] || { today: 0, week: 0, month: 0, total: 0, last: '' };
    return {
      telegramId: u.telegramId,
      name: `${u.lastName || ''} ${u.firstName || ''}`.trim() || (u.firstName || 'Қатысушы'),
      email: u.email || '',
      phone: u.phone || '',
      today: b.today, week: b.week, month: b.month, total: b.total, last: b.last,
    };
  }).sort((a, b) => b.today - a.today || b.total - a.total);

  res.json({ ok: true, goal: await getGoal(), today, rows });
});

app.post('/api/admin/book', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { title, author, cover, progress } = req.body || {};
  const book = await setBook({
    title: title ?? undefined,
    author: author ?? undefined,
    cover: cover ?? undefined,
    progress: progress != null ? Math.max(0, Math.min(100, Number(progress))) : undefined,
  });
  res.json({ ok: true, book });
});

app.post('/api/admin/assign', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { telegramId, bookId } = req.body || {};
  const user = await assignBookToUser(Number(telegramId), bookId ?? null);
  if (!user) return res.status(404).json({ ok: false, error: 'Қатысушы табылмады' });
  res.json({ ok: true, user });
});

// Подтверждение/отклонение участника
app.post('/api/admin/status', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { telegramId, status } = req.body || {};
  if (!['approved', 'pending', 'rejected'].includes(status)) {
    return res.status(400).json({ ok: false, error: 'Белгісіз статус' });
  }
  const prev = await getUser(Number(telegramId));
  const user = await setUserStatus(Number(telegramId), status);
  if (!user) return res.status(404).json({ ok: false, error: 'Қатысушы табылмады' });
  // Хабарламаны тек статус «approved»-қа НАҚТЫ өзгергенде жібереміз (қайталанбас үшін)
  const justApproved = status === 'approved' && (!prev || prev.status !== 'approved');
  if (justApproved) {
    try {
      await bot.api.sendMessage(
        Number(telegramId),
        `🎉 Құттықтаймыз, ${user.firstName}! Сен Ruh қауымдастығына қабылдандың. Қосымшаны қайта аш.`
      );
    } catch {}
  }
  res.json({ ok: true, user });
});

// ---------- Кітап әлеуметтік блогы ----------
async function bookIdNow() { const b = await getBook(); return (b && b.fileId) ? b.fileId : 'none'; }
function shortName(u) {
  if (!u) return 'Қатысушы';
  const ln = (u.lastName || '').trim(), fn = (u.firstName || '').trim();
  return (fn + (ln ? ' ' + ln.slice(0, 1) + '.' : '')).trim() || 'Қатысушы';
}

app.post('/api/book/quote/add', async (req, res) => {
  const tgUser = requireTelegram(req, res); if (!tgUser) return;
  const text = String(req.body?.text || '').trim().slice(0, 600);
  if (!text) return res.status(400).json({ ok: false, error: 'Мәтін бос' });
  const user = await getUser(tgUser.id);
  const bk = await getBook();
  const q = await addQuote({ bookId: (bk && bk.fileId) ? bk.fileId : 'none', book: (bk && bk.title) || '', telegramId: tgUser.id,
    name: shortName(user), text, ch: Number(req.body?.ch) || 0, color: String(req.body?.color || '#F6C945').slice(0, 24) });
  res.json({ ok: true, quote: q });
});
app.post('/api/book/quote/list', async (req, res) => {
  const tgUser = requireTelegram(req, res); if (!tgUser) return;
  const rows = await listQuotes(await bookIdNow());
  res.json({ ok: true, quotes: rows.map((q) => ({ id: q.id, name: q.name, book: q.book || '', text: q.text, ch: q.ch, color: q.color,
    createdAt: q.createdAt, likes: (q.likes || []).length, liked: (q.likes || []).includes(tgUser.id), mine: q.telegramId === tgUser.id })) });
});
app.post('/api/book/quote/like', async (req, res) => {
  const tgUser = requireTelegram(req, res); if (!tgUser) return;
  const r = await likeQuote(String(req.body?.id || ''), tgUser.id);
  if (!r) return res.status(404).json({ ok: false, error: 'Табылмады' });
  res.json({ ok: true, ...r });
});
app.post('/api/book/quote/delete', async (req, res) => {
  const tgUser = requireTelegram(req, res); if (!tgUser) return;
  res.json({ ok: await deleteQuote(String(req.body?.id || ''), tgUser.id) });
});

app.post('/api/book/comment/add', async (req, res) => {
  const tgUser = requireTelegram(req, res); if (!tgUser) return;
  const text = String(req.body?.text || '').trim().slice(0, 1000);
  if (!text) return res.status(400).json({ ok: false, error: 'Мәтін бос' });
  const user = await getUser(tgUser.id);
  const c = await addComment({ bookId: await bookIdNow(), telegramId: tgUser.id, name: shortName(user), text, ch: Number(req.body?.ch) || 0 });
  res.json({ ok: true, comment: c });
});
app.post('/api/book/comment/list', async (req, res) => {
  const tgUser = requireTelegram(req, res); if (!tgUser) return;
  const ch = (req.body?.ch === null || req.body?.ch === undefined) ? null : Number(req.body.ch);
  const rows = await listComments(await bookIdNow(), ch);
  res.json({ ok: true, comments: rows.map((c) => ({ id: c.id, name: c.name, text: c.text, ch: c.ch, createdAt: c.createdAt, mine: c.telegramId === tgUser.id })) });
});
app.post('/api/book/comment/delete', async (req, res) => {
  const tgUser = requireTelegram(req, res); if (!tgUser) return;
  res.json({ ok: await deleteComment(String(req.body?.id || ''), tgUser.id) });
});

app.post('/api/book/stats/ping', async (req, res) => {
  const tgUser = requireTelegram(req, res); if (!tgUser) return;
  const d = await bumpRead(tgUser.id, kzDate(0), Number(req.body?.seconds) || 0, Number(req.body?.pages) || 0);
  res.json({ ok: true, day: d });
});

const DAY_MIN_SEC = 300, DAY_MIN_PAGES = 2;
app.post('/api/book/stats/me', async (req, res) => {
  const tgUser = requireTelegram(req, res); if (!tgUser) return;
  const days = await getReadDays(tgUser.id);
  const map = {}; days.forEach((d) => { map[d.date] = d; });
  const good = (d) => !!d && (d.seconds || 0) >= DAY_MIN_SEC && (d.pages || 0) >= DAY_MIN_PAGES;
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const dt = kzDate(i);
    if (good(map[dt])) streak++;
    else if (i === 0) continue;
    else break;
  }
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const dt = kzDate(i), d = map[dt] || { seconds: 0, pages: 0 };
    week.push({ date: dt, minutes: Math.round((d.seconds || 0) / 60), pages: d.pages || 0, done: good(d) });
  }
  res.json({ ok: true, streak, week,
    totalMin: week.reduce((s, x) => s + x.minutes, 0),
    totalPages: week.reduce((s, x) => s + x.pages, 0),
    rule: { minutes: DAY_MIN_SEC / 60, pages: DAY_MIN_PAGES } });
});

app.post('/api/book/room', async (req, res) => {
  const tgUser = requireTelegram(req, res); if (!tgUser) return;
  const book = await getBook();
  const bookId = (book && book.fileId) ? book.fileId : 'none';
  const [rows, users] = await Promise.all([getAllReading(bookId), getUsers()]);
  const byId = {}; users.forEach((u) => { byId[u.telegramId] = u; });
  const now = Date.now(), LIVE = 3 * 60 * 1000;
  const readers = rows
    .filter((r) => byId[r.telegramId] && r.updatedAt && (now - new Date(r.updatedAt).getTime()) < LIVE)
    .map((r) => { const nm = shortName(byId[r.telegramId]);
      return { telegramId: r.telegramId, name: nm, av: ((byId || {})[r.telegramId] || {}).avatar || null, initial: (nm[0] || '?').toUpperCase(),
        percent: Math.round(r.percent || 0), page: (Number(r.offset) || 0) + 1, ch: (Number(r.location) || 0) + 1, me: r.telegramId === tgUser.id }; })
    .sort((a, b) => b.percent - a.percent);
  res.json({ ok: true, readers, count: readers.length, book: { title: book?.title || '', author: book?.author || '', cover: book?.cover || '' } });
});

app.post('/api/book/board', async (req, res) => {
  const tgUser = requireTelegram(req, res); if (!tgUser) return;
  const bookId = await bookIdNow();
  const [rows, users] = await Promise.all([getAllReading(bookId), getUsers()]);
  const byId = {}; users.forEach((u) => { byId[u.telegramId] = u; });
  const board = rows.filter((r) => byId[r.telegramId])
    .map((r) => ({ telegramId: r.telegramId, name: shortName(byId[r.telegramId]), percent: Math.round(r.percent || 0), me: r.telegramId === tgUser.id }))
    .sort((a, b) => b.percent - a.percent);
  res.json({ ok: true, board });
});

// Публичный конфиг Қаржы (категории + банки) — мини-апп берёт отсюда
app.get('/api/fin/config', async (_req, res) => {
  res.json(mergeFinConfig(await getFinConfig()));
});

// Админ: удалить участника
app.post('/api/admin/user/delete', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const telegramId = Number(req.body?.telegramId);
  if (!telegramId) return res.status(400).json({ ok: false, error: 'telegramId жоқ' });
  const ok = await deleteUser(telegramId);
  if (!ok) return res.status(404).json({ ok: false, error: 'Қатысушы табылмады' });
  res.json({ ok: true });
});

// Админ: задать/исправить шаги участника за дату (по умолчанию — сегодня)
app.post('/api/admin/steps/set', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const telegramId = Number(req.body?.telegramId);
  const steps = Math.max(0, Math.floor(Number(req.body?.steps) || 0));
  const date = /^\d{4}-\d{2}-\d{2}$/.test(req.body?.date || '') ? req.body.date : kzDate(0);
  if (!telegramId) return res.status(400).json({ ok: false, error: 'telegramId жоқ' });
  await setSteps(telegramId, date, steps);
  res.json({ ok: true, telegramId, date, steps });
});

// Админ: сохранить конфиг Қаржы (категории + банки)
app.post('/api/admin/fin', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const cfg = mergeFinConfig(req.body || {});
  await setFinConfig(cfg);
  res.json({ ok: true, fin: cfg });
});

// Админ: загрузка файла книги (EPUB/PDF). Тело — сырые байты файла.
app.post('/api/admin/book/upload', express.raw({ type: '*/*', limit: '35mb' }), async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const buf = req.body;
  if (!buf || !buf.length) return res.status(400).json({ ok: false, error: 'Файл бос' });
  const fileName = (req.get('X-File-Name') || 'book').slice(0, 200);
  let format = (req.get('X-File-Format') || '').toLowerCase();
  if (!['epub', 'pdf'].includes(format)) format = /\.pdf$/i.test(fileName) ? 'pdf' : 'epub';
  try {
    const fileId = await saveBookFile(buf, fileName, format);
    const dec = (v) => { try { return decodeURIComponent(v || ''); } catch { return v || ''; } };
    const replaceId = req.get('X-Book-Id') || '';
    let book;
    if (replaceId) {
      // бар кітаптың файлын ауыстыру
      const lib = await listBooks();
      const old = lib.books.find((b) => b.id === replaceId);
      book = await updateBook(replaceId, { fileId, format, fileName });
      if (old && old.fileId && old.fileId !== fileId) { try { await deleteBookFile(old.fileId); } catch {} }
    } else {
      book = await addBook({
        fileId, format, fileName,
        title: dec(req.get('X-Book-Title')) || fileName.replace(/\.(epub|pdf)$/i, ''),
        author: dec(req.get('X-Book-Author')),
        cover: dec(req.get('X-Book-Cover')),
      });
    }
    const lib2 = await listBooks();
    res.json({ ok: true, book, books: lib2.books, activeId: lib2.activeId });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/health', (_req, res) => res.send('ok'));

// ---------- Напоминания о платежах (по сроку) ----------
let lastRemindCheck = 0;
async function maybeSendReminders() {
  const now = Date.now();
  if (now - lastRemindCheck < 30 * 60 * 1000) return; // не чаще раза в 30 мин
  lastRemindCheck = now;
  try {
    const today = kzDate(0);
    const debts = await getAllDebts();
    for (const d of debts) {
      if (!d.remind || d.done || !d.dueDate) continue;
      if (d.dueDate > today) continue;        // срок ещё не наступил
      if (d.remindedOn === today) continue;   // уже напоминали сегодня
      const remaining = Math.max(0, d.total - (d.paid || 0));
      if (remaining <= 0) continue;
      const label = d.kind === 'kredit' ? 'Кредит' : d.kind === 'bolip' ? 'Бөліп төлеу' : 'Қарыз';
      const msg = `🔔 Еске салу: «${d.title}» (${label}) бойынша төлем мерзімі келді.\nҚалдық: ${Number(remaining).toLocaleString('ru-RU')} ₸.`;
      try { await bot.api.sendMessage(d.telegramId, msg); } catch {}
      try { await updateDebt(d.telegramId, d.id, { remindedOn: today }); } catch {}
    }
  } catch {}
}
setInterval(() => { maybeSendReminders(); }, 60 * 60 * 1000);

// ---------- Запуск: вебхук (хостинг) или long polling (локально) ----------
const USE_WEBHOOK = !!(process.env.WEBHOOK_URL || process.env.RENDER_EXTERNAL_URL);
const WEBHOOK_BASE = process.env.WEBHOOK_URL || process.env.RENDER_EXTERNAL_URL || WEBAPP_URL;
const secretPath = '/tg/' + BOT_TOKEN.split(':')[0];

if (USE_WEBHOOK) {
  app.use(secretPath, webhookCallback(bot, 'express'));
}


/* ================= Прогресс: барлық бөлім бойынша жеке жиынтық ================= */
function pgDay(o) {
  if (!o) return '';
  if (typeof o.date === 'string' && o.date.length >= 10) return o.date.slice(0, 10);
  const c = o.date || o.createdAt || o.ts;
  if (!c) return '';
  try { return new Date(c).toISOString().slice(0, 10); } catch (e) { return ''; }
}
function pgN(v) { const n = Number(v); return isFinite(n) ? n : 0; }
function pgBack(days) { const d = new Date(); d.setUTCDate(d.getUTCDate() - days); return d.toISOString().slice(0, 10); }

app.post('/api/progress', async (req, res) => {
  try {
    const tgUser = requireTelegram(req, res);
    if (!tgUser) return;
    const id = Number(tgUser.id);
    const today = new Date().toISOString().slice(0, 10);
    const safe = (fn) => Promise.resolve().then(fn).catch(() => null);
    const stepsDocs = (await safe(() => getUserSteps(id))) || [];
    const readDocs  = (await safe(() => getReadDays(id))) || [];
    const txDocs    = (await safe(() => getUserTx(id))) || [];
    const debts     = (await safe(() => getUserDebts(id))) || [];
    const assets    = (await safe(() => getUserAssets(id))) || [];
    const goalRaw   = await safe(() => getGoal());
    const goal = pgN(typeof goalRaw === 'number' ? goalRaw : (goalRaw && (goalRaw.goal || goalRaw.value))) || 10000;

    // Құжаттарды бір рет қана қалыпқа келтіреміз
    const rAll = new Map(); const rows = [];
    readDocs.forEach((o) => {
      const d = pgDay(o); if (!d) return;
      const sec = pgN(o.seconds), pg = pgN(o.pages);
      rAll.set(d, (rAll.get(d) || 0) + sec);
      rows.push({ d: d, sec: sec, pg: pg });
    });
    const sRows = [];
    stepsDocs.forEach((o) => {
      const d = pgDay(o); const v = pgN(o.steps);
      if (!d || v <= 0) return;
      sRows.push({ d: d, v: v });
    });
    const tRows = [];
    txDocs.forEach((o) => {
      const d = pgDay(o); if (!d) return;
      const amt = Math.abs(pgN(o.amount !== undefined ? o.amount : (o.sum !== undefined ? o.sum : o.value)));
      if (!amt) return;
      const t = String(o.type || o.kind || '').toLowerCase();
      tRows.push({ d: d, amt: amt, inc: (t.indexOf('income') >= 0 || t.indexOf('kiris') >= 0) });
    });

    let minDate = '';
    const seen = (d) => { if (d && (!minDate || d < minDate)) minDate = d; };
    rows.forEach((x) => seen(x.d)); sRows.forEach((x) => seen(x.d)); tRows.forEach((x) => seen(x.d));

    let streak = 0;
    {
      const d = new Date();
      if ((rAll.get(d.toISOString().slice(0, 10)) || 0) < 300) d.setUTCDate(d.getUTCDate() - 1);
      for (let i = 0; i < 400; i++) {
        const k = d.toISOString().slice(0, 10);
        if ((rAll.get(k) || 0) >= 300) { streak++; d.setUTCDate(d.getUTCDate() - 1); } else break;
      }
    }
    let debtLeft = 0;
    debts.forEach((o) => {
      const left = pgN(o.amount !== undefined ? o.amount : o.total) - pgN(o.paid);
      if (left > 0) debtLeft += left;
    });

    const build = (period) => {
      let from = '0000-01-01', spanDays = 1;
      if (period === 'week') { from = pgBack(6); spanDays = 7; }
      else if (period === 'month') { from = pgBack(29); spanDays = 30; }
      else if (period === 'year') { from = pgBack(364); spanDays = 365; }
      else { spanDays = minDate ? Math.max(1, Math.round((Date.parse(today) - Date.parse(minDate)) / 86400000) + 1) : 1; }
      const byDay = (period === 'week' || period === 'month');
      const key = (d) => byDay ? d : d.slice(0, 7);
      const inR = (d) => d >= from && d <= today;
      const ser = (m) => Array.from(m.entries()).sort((x, y) => x[0] < y[0] ? -1 : 1).map((e) => ({ k: e[0], v: Math.round(e[1]) }));

      const rMap = new Map(); let rSec = 0, rPages = 0, rDays = 0;
      rows.forEach((x) => {
        if (!inR(x.d)) return;
        rSec += x.sec; rPages += x.pg;
        if (x.sec > 0 || x.pg > 0) rDays++;
        rMap.set(key(x.d), (rMap.get(key(x.d)) || 0) + x.sec / 60);
      });
      const sMap = new Map(); let sTotal = 0, sDays = 0, sGoalDays = 0, sBest = { date: '', steps: 0 };
      sRows.forEach((x) => {
        if (!inR(x.d)) return;
        sTotal += x.v; sDays++;
        if (x.v >= goal) sGoalDays++;
        if (x.v > sBest.steps) sBest = { date: x.d, steps: x.v };
        sMap.set(key(x.d), (sMap.get(key(x.d)) || 0) + x.v);
      });
      const fInc = new Map(), fExp = new Map(); let inc = 0, exp = 0, txN = 0;
      tRows.forEach((x) => {
        if (!inR(x.d)) return;
        txN++;
        if (x.inc) { inc += x.amt; fInc.set(key(x.d), (fInc.get(key(x.d)) || 0) + x.amt); }
        else { exp += x.amt; fExp.set(key(x.d), (fExp.get(key(x.d)) || 0) + x.amt); }
      });
      const fKeys = Array.from(new Set(Array.from(fInc.keys()).concat(Array.from(fExp.keys())))).sort();
      return {
        period: period, from: from, to: today, bucket: byDay ? 'day' : 'month', spanDays: spanDays,
        read: { minutes: Math.round(rSec / 60), pages: rPages, days: rDays, streak: streak, series: ser(rMap) },
        steps: { total: sTotal, days: sDays, avg: sDays ? Math.round(sTotal / sDays) : 0, goal: goal, goalDays: sGoalDays, best: sBest, series: ser(sMap) },
        fin: { income: Math.round(inc), expense: Math.round(exp), net: Math.round(inc - exp), tx: txN, debtLeft: Math.round(debtLeft), assets: assets.length,
          series: fKeys.map((k) => ({ k: k, a: Math.round(fInc.get(k) || 0), b: Math.round(fExp.get(k) || 0) })) }
      };
    };

    res.json({ ok: true, periods: { week: build('week'), month: build('month'), year: build('year'), all: build('all') } });
  } catch (e) {
    res.json({ ok: false, error: 'server' });
  }
});


/* ===== Достар: кодсыз іздеу және сұраныс ===== */
function frName(u) {
  const p = [u && u.firstName, u && u.lastName].filter(Boolean).join(' ').trim();
  return p || (u && u.username ? String(u.username) : '') || 'Қатысушы';
}
app.post('/api/friends/search', async (req, res) => {
  try {
    const tgUser = requireTelegram(req, res);
    if (!tgUser) return;
    const me = Number(tgUser.id);
    const q = String((req.body && req.body.q) || '').trim().toLowerCase();
    const users = (await getUsers()) || [];
    const docs = (await getFriendDocs(me)) || [];
    const linked = {};
    docs.forEach((d) => { linked[Number(d.a)] = 1; linked[Number(d.b)] = 1; });
    const out = [];
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      if (String(u.status || '') !== 'approved') continue;
      const uid = Number(u.telegramId);
      if (!uid || uid === me || linked[uid]) continue;
      const nm = frName(u);
      if (q && nm.toLowerCase().indexOf(q) < 0) continue;
      out.push({ id: uid, name: nm, av: u.avatar || null });
      if (out.length >= 30) break;
    }
    out.sort((a, b) => a.name.localeCompare(b.name, 'kk'));
    res.json({ ok: true, users: out });
  } catch (e) {
    res.json({ ok: false, error: 'server' });
  }
});
app.post('/api/friends/invite', async (req, res) => {
  try {
    const tgUser = requireTelegram(req, res);
    if (!tgUser) return;
    const me = Number(tgUser.id);
    const to = Number((req.body && req.body.id) || 0);
    if (!to || to === me) return res.json({ ok: false, error: 'bad id' });
    const u = await getUser(to);
    if (!u || String(u.status || '') !== 'approved') return res.json({ ok: false, error: 'not found' });
    await addFriendReq(me, to);
    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false, error: 'server' });
  }
});

/* ===== Аватар: сақтау және тарату ===== */
app.post('/api/avatar/save', async (req, res) => {
  try {
    const tgUser = requireTelegram(req, res);
    if (!tgUser) return;
    const body = req.body || {};
    const type = String(body.type || '');
    let avatar = null;
    if (type === 'photo') {
      const src = String(body.src || '');
      if (src.indexOf('data:image/') !== 0) return res.json({ ok: false, error: 'bad image' });
      if (src.length > 400000) return res.json({ ok: false, error: 'too big' });
      avatar = { t: 'p', s: src };
    } else if (type === 'char') {
      const cfg = body.cfg && typeof body.cfg === 'object' ? body.cfg : null;
      if (!cfg) return res.json({ ok: false, error: 'bad cfg' });
      const clean = {};
      Object.keys(cfg).slice(0, 20).forEach((k) => {
        const v = cfg[k];
        if (typeof v === 'number') clean[k] = v;
        else if (typeof v === 'string') clean[k] = v.slice(0, 24);
      });
      avatar = { t: 'c', c: clean };
    } else if (type === 'none') {
      avatar = null;
    } else {
      return res.json({ ok: false, error: 'bad type' });
    }
    await upsertUser({ telegramId: Number(tgUser.id), avatar: avatar });
    res.json({ ok: true, avatar: avatar });
  } catch (e) {
    res.json({ ok: false, error: 'server' });
  }
});
app.post('/api/avatars', async (req, res) => {
  try {
    const tgUser = requireTelegram(req, res);
    if (!tgUser) return;
    const users = (await getUsers()) || [];
    const map = {};
    let n = 0;
    for (let i = 0; i < users.length && n < 300; i++) {
      const u = users[i];
      if (!u || !u.avatar) continue;
      const id = Number(u.telegramId);
      if (!id) continue;
      map[id] = u.avatar;
      n++;
    }
    res.json({ ok: true, map: map });
  } catch (e) {
    res.json({ ok: false, error: 'server' });
  }
});


/* ===== Профиль: атын өзгерту ===== */
app.post('/api/profile/save', async (req, res) => {
  try {
    const tgUser = requireTelegram(req, res);
    if (!tgUser) return;
    const body = req.body || {};
    const clean = (v) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, 40);
    const first = clean(body.firstName);
    const last = clean(body.lastName);
    const patr = clean(body.patronymic);
    if (!first || !last) return res.json({ ok: false, error: 'empty' });
    await upsertUser({
      telegramId: Number(tgUser.id),
      firstName: first,
      lastName: last,
      patronymic: patr
    });
    res.json({ ok: true, user: { firstName: first, lastName: last, patronymic: patr } });
  } catch (e) {
    res.json({ ok: false, error: 'server' });
  }
});


/* ===== Кітап көлемі: сөз саны (шың деңгейі үшін) ===== */
app.post('/api/book/words', async (req, res) => {
  const tgUser = requireTelegram(req, res); if (!tgUser) return;
  try {
    const book = await getBook();
    if (!book) { res.json({ ok: true, words: 0, id: null }); return; }
    const inc = Number((req.body && req.body.words) || 0);
    let words = Number(book.words || 0);
    if (!words && inc > 1000 && inc < 20000000) {
      words = Math.round(inc);
      await updateBook(book.id, { words });
    }
    res.json({ ok: true, words, id: book.id });
  } catch (e) {
    res.json({ ok: false, error: 'server' });
  }
});


/* ===== Биржа: AIX + KASE — бумаги мен бағалар ===== */
const MKT = { at: 0, list: [], src: {}, fx: 0 };

function mktNum(v) {
  const n = Number(String(v == null ? '' : v).replace(/[\s\u00a0]/g, '').replace(',', '.'));
  return isFinite(n) ? n : 0;
}

async function mktAix() {
  const r = await fetch('https://data-feed.aix.kz/api/table/mw-main-records', {
    headers: { 'accept': 'application/json', 'user-agent': 'Mozilla/5.0' }
  });
  if (!r.ok) throw new Error(String(r.status));
  const arr = await r.json();
  if (!Array.isArray(arr)) return [];
  return arr.map((x) => ({
    ex: 'AIX',
    sym: String(x.secCode || '').trim(),
    name: String(x.issuer || x.instrument || '').trim(),
    isin: String(x.isin || '').trim(),
    cur: String(x.currency || 'KZT').trim(),
    price: mktNum(x.lastTrade) || mktNum(x.referencePrice),
    chg: mktNum(x.percentChange),
    kind: x.securityGroup === 'EQTY' ? 'share' : 'bond'
  })).filter((x) => x.sym && x.price > 0);
}

async function mktRefresh(force) {
  const now = Date.now();
  if (!force && MKT.list.length && now - MKT.at < 900000) return MKT;
  try { const fx = await fxErApi(); if (fx) MKT.fx = fx; } catch (e) {}
  const res = await Promise.allSettled([mktAix()]);
  const aix = res[0].status === "fulfilled" ? res[0].value : [];
  const kase = [];
  MKT.src = {
    aix: res[0].status === "fulfilled" ? aix.length : ("err: " + String(res[0].reason && res[0].reason.message).slice(0, 60)),
    kase: 0
  };
  if (aix.length || kase.length) { MKT.list = aix.concat(kase); MKT.at = now; }
  return MKT;
}

/* Стартта бір рет жаңартып, логқа жазамыз */
async function mktWarm() {
  try {
    await mktRefresh(true);
    console.log('Биржа: AIX/KASE —', JSON.stringify(MKT.src), 'барлығы:', MKT.list.length);
    try { const g = await goldApiPrice('xauusd'); console.log('Металл: алтын (унция, USD) —', g); } catch (e) {}
  } catch (e) {
    console.log('Биржа: жаңарту қатесі —', String(e && e.message).slice(0, 120));
  }
}
setTimeout(mktWarm, 8000);
setInterval(mktWarm, 900000);
app.post('/api/fin/market/list', async (req, res) => {
  const tgUser = requireTelegram(req, res); if (!tgUser) return;
  try {
    await mktRefresh(!!(req.body && req.body.force));
    const syms = Array.isArray(req.body && req.body.syms) ? req.body.syms : null;
    if (syms) {
      const want = {};
      syms.forEach((v) => { const k = String(v || '').trim().toUpperCase(); if (k) want[k] = 1; });
      const quotes = {};
      for (const it of MKT.list) {
        const k = it.sym.toUpperCase();
        if (want[k] && !quotes[k]) quotes[k] = { price: it.price, cur: it.cur, chg: it.chg, ex: it.ex, name: it.name };
      }
      res.json({ ok: true, at: MKT.at, quotes: quotes });
      return;
    }
    const q = String((req.body && req.body.q) || '').trim().toLowerCase();
    let list = MKT.list;
    if (q) list = list.filter((x) => x.sym.toLowerCase().includes(q) || x.name.toLowerCase().includes(q));
    list = list.slice(0, 40);
    res.json({
      ok: true, at: MKT.at, total: MKT.list.length, src: MKT.src,
      aix: MKT.list.filter((x) => x.ex === 'AIX').length,
      kase: MKT.list.filter((x) => x.ex === 'KASE').length,
      list: list
    });
  } catch (e) {
    res.json({ ok: false, error: 'server' });
  }
});


/* ===== Қолданушының деректерін жою (App Store талабы) ===== */
app.post('/api/me/delete', async (req, res) => {
  const tgUser = requireTelegram(req, res); if (!tgUser) return;
  try {
    const id = String(tgUser.id);
    await deleteUser(id);
    console.log('Деректер жойылды:', id);
    res.json({ ok: true });
  } catch (e) {
    console.log('Жою қатесі:', String(e && e.message).slice(0, 120));
    res.json({ ok: false, error: 'server' });
  }
});

app.listen(PORT, async () => {
  console.log(`HTTP-сервер запущен на порту ${PORT}`);
  console.log(`Публичный адрес: ${WEBAPP_URL}`);
  console.log(`Админка: ${WEBAPP_URL}/admin.html`);

  try {
    await bot.api.setChatMenuButton({
      menu_button: { type: 'web_app', text: 'Ruh', web_app: { url: WEBAPP_URL } },
    });

    if (USE_WEBHOOK) {
      await bot.api.setWebhook(`${WEBHOOK_BASE}${secretPath}`);
      console.log('Режим: вебхук →', `${WEBHOOK_BASE}${secretPath}`);
    } else {
      await bot.api.deleteWebhook();
      bot.start({ onStart: (info) => console.log(`Режим: long polling. Бот @${info.username} запущен`) });
    }
  } catch (e) {
    console.error('⚠️ Ошибка настройки Telegram (проверь BOT_TOKEN):', e.description || e.message);
  }
});
