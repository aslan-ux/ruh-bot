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
} from './storage.js';

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
  const kb = new InlineKeyboard().webApp('🚀 Spirit-ті ашу', WEBAPP_URL);
  await ctx.reply(
    'Spirit қауымдастығына қош келдің! Қосымшаны ашу үшін төмендегі батырманы бас.',
    { reply_markup: kb }
  );
});

// ---------- HTTP-сервер ----------
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'webapp')));

function requireTelegram(req, res) {
  const initData = req.body?.initData || req.get('X-Init-Data');
  const check = validateInitData(initData, BOT_TOKEN);
  if (!check.ok) {
    res.status(401).json({ ok: false, error: 'auth: ' + check.error });
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
  res.json({ ok: true, book: await getBook() });
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

  function board(ok) {
    const sums = {};
    all.forEach((s) => { if (ok(s.date)) sums[s.telegramId] = (sums[s.telegramId] || 0) + s.steps; });
    return Object.entries(sums)
      .map(([id, steps]) => ({ name: nameById[id] || 'Қатысушы', steps, you: Number(id) === tgUser.id }))
      .sort((a, b) => b.steps - a.steps);
  }

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
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; SpiritBot/1.0)' };

function mapYahoo(sym) {
  if (sym === 'usdkzt') return 'KZT=X';
  if (sym === 'xauusd') return 'GC=F';
  if (sym === 'xagusd') return 'SI=F';
  if (sym === 'xptusd') return 'PL=F';
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
async function priceOf(sym) {
  const cached = priceCache.get(sym);
  if (cached && Date.now() - cached.ts < 10 * 60 * 1000) return cached.price;
  let p = await yahooPrice(sym);
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

// ---------- Админка ----------
app.get('/api/admin/data', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json({ ok: true, book: await getBook(), users: await getUsers(), goal: await getGoal() });
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
  const user = await setUserStatus(Number(telegramId), status);
  if (!user) return res.status(404).json({ ok: false, error: 'Қатысушы табылмады' });
  if (status === 'approved') {
    try {
      await bot.api.sendMessage(
        Number(telegramId),
        `🎉 Құттықтаймыз, ${user.firstName}! Сен Spirit қауымдастығына қабылдандың. Қосымшаны қайта аш.`
      );
    } catch {}
  }
  res.json({ ok: true, user });
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

app.listen(PORT, async () => {
  console.log(`HTTP-сервер запущен на порту ${PORT}`);
  console.log(`Публичный адрес: ${WEBAPP_URL}`);
  console.log(`Админка: ${WEBAPP_URL}/admin.html`);

  try {
    await bot.api.setChatMenuButton({
      menu_button: { type: 'web_app', text: 'Spirit', web_app: { url: WEBAPP_URL } },
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
