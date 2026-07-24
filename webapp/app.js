const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ---------- Страны (флаг, код, название) ----------
const COUNTRIES = [
  { c: 'Қазақстан', flag: '🇰🇿', code: '+7' },
  { c: 'Ресей', flag: '🇷🇺', code: '+7' },
  { c: 'Өзбекстан', flag: '🇺🇿', code: '+998' },
  { c: 'Қырғызстан', flag: '🇰🇬', code: '+996' },
  { c: 'Тәжікстан', flag: '🇹🇯', code: '+992' },
  { c: 'Түрікменстан', flag: '🇹🇲', code: '+993' },
  { c: 'Әзірбайжан', flag: '🇦🇿', code: '+994' },
  { c: 'Түркия', flag: '🇹🇷', code: '+90' },
  { c: 'Украина', flag: '🇺🇦', code: '+380' },
  { c: 'Беларусь', flag: '🇧🇾', code: '+375' },
  { c: 'Грузия', flag: '🇬🇪', code: '+995' },
  { c: 'Армения', flag: '🇦🇲', code: '+374' },
  { c: 'Моңғолия', flag: '🇲🇳', code: '+976' },
  { c: 'Қытай', flag: '🇨🇳', code: '+86' },
  { c: 'АҚШ', flag: '🇺🇸', code: '+1' },
  { c: 'Германия', flag: '🇩🇪', code: '+49' },
  { c: 'Ұлыбритания', flag: '🇬🇧', code: '+44' },
  { c: 'БАӘ', flag: '🇦🇪', code: '+971' },
  { c: 'Сауд Арабиясы', flag: '🇸🇦', code: '+966' },
  { c: 'Корея', flag: '🇰🇷', code: '+82' },
];

let selectedCountry = COUNTRIES[0];

// ---------- Утилита запросов ----------
async function api(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData: tg.initData, ...body }),
  });
  return res.json();
}

// ---------- Навигация ----------
const screens = ['register', 'home', 'qadam', 'qarjy', 'progress', 'profile'];
function show(screen) {
  screens.forEach((s) => {
    const el = document.getElementById('screen-' + s);
    if (el) el.classList.toggle('active', s === screen);
  });
  document.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.screen === screen);
  });
  document.getElementById('tabbar').style.display =
    screen === 'register' ? 'none' : 'flex';
  if (screen === 'home') loadBook();
}

document.querySelectorAll('.tab').forEach((t) => {
  t.addEventListener('click', () => show(t.dataset.screen));
});

// ---------- Заполнение даты ----------
const MONTHS = ['қаңтар','ақпан','наурыз','сәуір','мамыр','маусым','шілде','тамыз','қыркүйек','қазан','қараша','желтоқсан'];
function fillDates() {
  const d = document.getElementById('birthDay');
  const m = document.getElementById('birthMonth');
  const y = document.getElementById('birthYear');
  for (let i = 1; i <= 31; i++) d.add(new Option(String(i), String(i)));
  MONTHS.forEach((name, i) => m.add(new Option(name, String(i + 1))));
  const now = new Date().getFullYear();
  for (let i = now - 5; i >= now - 80; i--) y.add(new Option(String(i), String(i)));
  d.value = '1'; m.value = '1'; y.value = String(now - 18);
}

// ---------- Селектор страны ----------
const modal = document.getElementById('countryModal');
function renderCountries(filter = '') {
  const list = document.getElementById('countryList');
  const q = filter.trim().toLowerCase();
  list.innerHTML = '';
  COUNTRIES.filter((x) => x.c.toLowerCase().includes(q) || x.code.includes(q)).forEach((x) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; align-items:center; gap:10px; padding:11px 6px; border-bottom:1px solid #eef4f0; cursor:pointer; font-size:15px;';
    row.innerHTML = `<span style="font-size:20px;">${x.flag}</span><span style="flex:1;">${x.c}</span><span style="color:#4b8a72;">${x.code}</span>`;
    row.addEventListener('click', () => {
      selectedCountry = x;
      document.getElementById('countryFlag').textContent = x.flag;
      document.getElementById('countryCode').textContent = x.code;
      modal.classList.add('hidden');
    });
    list.appendChild(row);
  });
}
document.getElementById('countryBtn').addEventListener('click', () => {
  renderCountries();
  document.getElementById('countrySearch').value = '';
  modal.classList.remove('hidden');
});
document.getElementById('countrySearch').addEventListener('input', (e) => renderCountries(e.target.value));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

// ---------- Регистрация ----------
document.getElementById('submitBtn').addEventListener('click', async () => {
  const hint = document.getElementById('regHint');
  const get = (id) => document.getElementById(id).value.trim();

  const form = {
    firstName: get('firstName'),
    lastName: get('lastName'),
    patronymic: get('patronymic'),
    email: get('email'),
    phone: `${selectedCountry.code} ${get('phone')}`,
    birthDate: `${get('birthDay')}.${get('birthMonth')}.${get('birthYear')}`,
  };

  if (!form.firstName || !form.lastName || !form.patronymic || !get('email') || !get('phone')) {
    hint.textContent = 'Барлық өрісті толтыр';
    tg.HapticFeedback?.notificationOccurred('error');
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    hint.textContent = 'Почта дұрыс емес';
    return;
  }

  const btn = document.getElementById('submitBtn');
  btn.disabled = true; hint.textContent = 'Сақталуда…';
  try {
    const r = await api('/api/register', { form });
    if (r.ok) {
      tg.HapticFeedback?.notificationOccurred('success');
      show('home');
    } else {
      hint.textContent = 'Қате: ' + r.error;
      btn.disabled = false;
    }
  } catch (e) {
    hint.textContent = 'Желі қатесі';
    btn.disabled = false;
  }
});

// ---------- Книга ----------
async function loadBook() {
  try {
    const r = await api('/api/book', {});
    if (!r.ok) return;
    const b = r.book;
    document.getElementById('bookTitle').textContent = b.title || '—';
    document.getElementById('bookAuthor').textContent = b.author || '';
    document.getElementById('bookProgress').textContent = Math.round(b.progress || 0) + '%';
    const cover = document.getElementById('bookCover');
    if (b.cover) cover.innerHTML = `<img src="${b.cover}" alt="" />`;
    else cover.textContent = '📖';
  } catch {}
}

// ---------- Старт ----------
async function init() {
  fillDates();
  try {
    const me = await api('/api/me', {});
    show(me.ok && me.registered ? 'home' : 'register');
  } catch {
    show('register');
  }
}
init();
