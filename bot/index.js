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
    syncToken: user.syncToken || '',
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

// ---------- Админка ----------
app.get('/api/admin/data', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json({ ok: true, book: await getBook(), users: await getUsers() });
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
