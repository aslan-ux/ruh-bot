const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ---------- Тема (авто по Telegram/системе + ручной выбор) ----------
const THEME_KEY = 'ruh-theme';
function themePref() { try { return localStorage.getItem(THEME_KEY) || 'auto'; } catch { return 'auto'; } }
function systemDark() {
  if (tg && tg.colorScheme) return tg.colorScheme === 'dark';
  return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}
function applyTheme() {
  const pref = themePref();
  const dark = pref === 'dark' || (pref === 'auto' && systemDark());
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  try {
    tg.setBackgroundColor && tg.setBackgroundColor(dark ? '#0F0F14' : '#FFFFFF');
    tg.setHeaderColor && tg.setHeaderColor(dark ? '#0F0F14' : '#FFFFFF');
  } catch {}
  document.querySelectorAll('#themeSeg button').forEach((b) => {
    b.classList.toggle('active', b.dataset.themeVal === pref);
  });
}
function initThemeControls() {
  document.querySelectorAll('#themeSeg button').forEach((b) => {
    b.addEventListener('click', () => {
      try { localStorage.setItem(THEME_KEY, b.dataset.themeVal); } catch {}
      applyTheme();
    });
  });
  try { tg.onEvent && tg.onEvent('themeChanged', applyTheme); } catch {}
  const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  if (mq && mq.addEventListener) mq.addEventListener('change', applyTheme);
  applyTheme();
}
applyTheme(); // применить как можно раньше (до полной инициализации)

// ---------- Страны (флаг, код, название) ----------
const COUNTRIES = [
  { c: 'Казахстан', flag: '🇰🇿', code: '+7' },
  { c: 'Россия', flag: '🇷🇺', code: '+7' },
  { c: 'Узбекистан', flag: '🇺🇿', code: '+998' },
  { c: 'Кыргызстан', flag: '🇰🇬', code: '+996' },
  { c: 'Таджикистан', flag: '🇹🇯', code: '+992' },
  { c: 'Туркменистан', flag: '🇹🇲', code: '+993' },
  { c: 'Азербайджан', flag: '🇦🇿', code: '+994' },
  { c: 'Армения', flag: '🇦🇲', code: '+374' },
  { c: 'Грузия', flag: '🇬🇪', code: '+995' },
  { c: 'Беларусь', flag: '🇧🇾', code: '+375' },
  { c: 'Украина', flag: '🇺🇦', code: '+380' },
  { c: 'Молдова', flag: '🇲🇩', code: '+373' },
  { c: 'Турция', flag: '🇹🇷', code: '+90' },
  { c: 'Китай', flag: '🇨🇳', code: '+86' },
  { c: 'Монголия', flag: '🇲🇳', code: '+976' },
  { c: 'Афганистан', flag: '🇦🇫', code: '+93' },
  { c: 'Албания', flag: '🇦🇱', code: '+355' },
  { c: 'Алжир', flag: '🇩🇿', code: '+213' },
  { c: 'Андорра', flag: '🇦🇩', code: '+376' },
  { c: 'Ангола', flag: '🇦🇴', code: '+244' },
  { c: 'Антигуа и Барбуда', flag: '🇦🇬', code: '+1' },
  { c: 'Аргентина', flag: '🇦🇷', code: '+54' },
  { c: 'Австралия', flag: '🇦🇺', code: '+61' },
  { c: 'Австрия', flag: '🇦🇹', code: '+43' },
  { c: 'Багамы', flag: '🇧🇸', code: '+1' },
  { c: 'Бахрейн', flag: '🇧🇭', code: '+973' },
  { c: 'Бангладеш', flag: '🇧🇩', code: '+880' },
  { c: 'Барбадос', flag: '🇧🇧', code: '+1' },
  { c: 'Бельгия', flag: '🇧🇪', code: '+32' },
  { c: 'Белиз', flag: '🇧🇿', code: '+501' },
  { c: 'Бенин', flag: '🇧🇯', code: '+229' },
  { c: 'Бутан', flag: '🇧🇹', code: '+975' },
  { c: 'Боливия', flag: '🇧🇴', code: '+591' },
  { c: 'Босния и Герцеговина', flag: '🇧🇦', code: '+387' },
  { c: 'Ботсвана', flag: '🇧🇼', code: '+267' },
  { c: 'Бразилия', flag: '🇧🇷', code: '+55' },
  { c: 'Бруней', flag: '🇧🇳', code: '+673' },
  { c: 'Болгария', flag: '🇧🇬', code: '+359' },
  { c: 'Буркина-Фасо', flag: '🇧🇫', code: '+226' },
  { c: 'Бурунди', flag: '🇧🇮', code: '+257' },
  { c: 'Камбоджа', flag: '🇰🇭', code: '+855' },
  { c: 'Камерун', flag: '🇨🇲', code: '+237' },
  { c: 'Канада', flag: '🇨🇦', code: '+1' },
  { c: 'Кабо-Верде', flag: '🇨🇻', code: '+238' },
  { c: 'ЦАР', flag: '🇨🇫', code: '+236' },
  { c: 'Чад', flag: '🇹🇩', code: '+235' },
  { c: 'Чили', flag: '🇨🇱', code: '+56' },
  { c: 'Колумбия', flag: '🇨🇴', code: '+57' },
  { c: 'Коморы', flag: '🇰🇲', code: '+269' },
  { c: 'Конго', flag: '🇨🇬', code: '+242' },
  { c: 'ДР Конго', flag: '🇨🇩', code: '+243' },
  { c: 'Коста-Рика', flag: '🇨🇷', code: '+506' },
  { c: 'Кот-д’Ивуар', flag: '🇨🇮', code: '+225' },
  { c: 'Хорватия', flag: '🇭🇷', code: '+385' },
  { c: 'Куба', flag: '🇨🇺', code: '+53' },
  { c: 'Кипр', flag: '🇨🇾', code: '+357' },
  { c: 'Чехия', flag: '🇨🇿', code: '+420' },
  { c: 'Дания', flag: '🇩🇰', code: '+45' },
  { c: 'Джибути', flag: '🇩🇯', code: '+253' },
  { c: 'Доминика', flag: '🇩🇲', code: '+1' },
  { c: 'Доминиканская Республика', flag: '🇩🇴', code: '+1' },
  { c: 'Эквадор', flag: '🇪🇨', code: '+593' },
  { c: 'Египет', flag: '🇪🇬', code: '+20' },
  { c: 'Сальвадор', flag: '🇸🇻', code: '+503' },
  { c: 'Экваториальная Гвинея', flag: '🇬🇶', code: '+240' },
  { c: 'Эритрея', flag: '🇪🇷', code: '+291' },
  { c: 'Эстония', flag: '🇪🇪', code: '+372' },
  { c: 'Эсватини', flag: '🇸🇿', code: '+268' },
  { c: 'Эфиопия', flag: '🇪🇹', code: '+251' },
  { c: 'Фиджи', flag: '🇫🇯', code: '+679' },
  { c: 'Финляндия', flag: '🇫🇮', code: '+358' },
  { c: 'Франция', flag: '🇫🇷', code: '+33' },
  { c: 'Габон', flag: '🇬🇦', code: '+241' },
  { c: 'Гамбия', flag: '🇬🇲', code: '+220' },
  { c: 'Германия', flag: '🇩🇪', code: '+49' },
  { c: 'Гана', flag: '🇬🇭', code: '+233' },
  { c: 'Греция', flag: '🇬🇷', code: '+30' },
  { c: 'Гренада', flag: '🇬🇩', code: '+1' },
  { c: 'Гватемала', flag: '🇬🇹', code: '+502' },
  { c: 'Гвинея', flag: '🇬🇳', code: '+224' },
  { c: 'Гвинея-Бисау', flag: '🇬🇼', code: '+245' },
  { c: 'Гайана', flag: '🇬🇾', code: '+592' },
  { c: 'Гаити', flag: '🇭🇹', code: '+509' },
  { c: 'Гондурас', flag: '🇭🇳', code: '+504' },
  { c: 'Венгрия', flag: '🇭🇺', code: '+36' },
  { c: 'Исландия', flag: '🇮🇸', code: '+354' },
  { c: 'Индия', flag: '🇮🇳', code: '+91' },
  { c: 'Индонезия', flag: '🇮🇩', code: '+62' },
  { c: 'Иран', flag: '🇮🇷', code: '+98' },
  { c: 'Ирак', flag: '🇮🇶', code: '+964' },
  { c: 'Ирландия', flag: '🇮🇪', code: '+353' },
  { c: 'Израиль', flag: '🇮🇱', code: '+972' },
  { c: 'Италия', flag: '🇮🇹', code: '+39' },
  { c: 'Ямайка', flag: '🇯🇲', code: '+1' },
  { c: 'Япония', flag: '🇯🇵', code: '+81' },
  { c: 'Иордания', flag: '🇯🇴', code: '+962' },
  { c: 'Кения', flag: '🇰🇪', code: '+254' },
  { c: 'Кирибати', flag: '🇰🇮', code: '+686' },
  { c: 'КНДР', flag: '🇰🇵', code: '+850' },
  { c: 'Республика Корея', flag: '🇰🇷', code: '+82' },
  { c: 'Кувейт', flag: '🇰🇼', code: '+965' },
  { c: 'Лаос', flag: '🇱🇦', code: '+856' },
  { c: 'Латвия', flag: '🇱🇻', code: '+371' },
  { c: 'Ливан', flag: '🇱🇧', code: '+961' },
  { c: 'Лесото', flag: '🇱🇸', code: '+266' },
  { c: 'Либерия', flag: '🇱🇷', code: '+231' },
  { c: 'Ливия', flag: '🇱🇾', code: '+218' },
  { c: 'Лихтенштейн', flag: '🇱🇮', code: '+423' },
  { c: 'Литва', flag: '🇱🇹', code: '+370' },
  { c: 'Люксембург', flag: '🇱🇺', code: '+352' },
  { c: 'Мадагаскар', flag: '🇲🇬', code: '+261' },
  { c: 'Малави', flag: '🇲🇼', code: '+265' },
  { c: 'Малайзия', flag: '🇲🇾', code: '+60' },
  { c: 'Мальдивы', flag: '🇲🇻', code: '+960' },
  { c: 'Мали', flag: '🇲🇱', code: '+223' },
  { c: 'Мальта', flag: '🇲🇹', code: '+356' },
  { c: 'Маршалловы Острова', flag: '🇲🇭', code: '+692' },
  { c: 'Мавритания', flag: '🇲🇷', code: '+222' },
  { c: 'Маврикий', flag: '🇲🇺', code: '+230' },
  { c: 'Мексика', flag: '🇲🇽', code: '+52' },
  { c: 'Микронезия', flag: '🇫🇲', code: '+691' },
  { c: 'Монако', flag: '🇲🇨', code: '+377' },
  { c: 'Черногория', flag: '🇲🇪', code: '+382' },
  { c: 'Марокко', flag: '🇲🇦', code: '+212' },
  { c: 'Мозамбик', flag: '🇲🇿', code: '+258' },
  { c: 'Мьянма', flag: '🇲🇲', code: '+95' },
  { c: 'Намибия', flag: '🇳🇦', code: '+264' },
  { c: 'Науру', flag: '🇳🇷', code: '+674' },
  { c: 'Непал', flag: '🇳🇵', code: '+977' },
  { c: 'Нидерланды', flag: '🇳🇱', code: '+31' },
  { c: 'Новая Зеландия', flag: '🇳🇿', code: '+64' },
  { c: 'Никарагуа', flag: '🇳🇮', code: '+505' },
  { c: 'Нигер', flag: '🇳🇪', code: '+227' },
  { c: 'Нигерия', flag: '🇳🇬', code: '+234' },
  { c: 'Северная Македония', flag: '🇲🇰', code: '+389' },
  { c: 'Норвегия', flag: '🇳🇴', code: '+47' },
  { c: 'Оман', flag: '🇴🇲', code: '+968' },
  { c: 'Пакистан', flag: '🇵🇰', code: '+92' },
  { c: 'Палау', flag: '🇵🇼', code: '+680' },
  { c: 'Палестина', flag: '🇵🇸', code: '+970' },
  { c: 'Панама', flag: '🇵🇦', code: '+507' },
  { c: 'Папуа — Новая Гвинея', flag: '🇵🇬', code: '+675' },
  { c: 'Парагвай', flag: '🇵🇾', code: '+595' },
  { c: 'Перу', flag: '🇵🇪', code: '+51' },
  { c: 'Филиппины', flag: '🇵🇭', code: '+63' },
  { c: 'Польша', flag: '🇵🇱', code: '+48' },
  { c: 'Португалия', flag: '🇵🇹', code: '+351' },
  { c: 'Катар', flag: '🇶🇦', code: '+974' },
  { c: 'Румыния', flag: '🇷🇴', code: '+40' },
  { c: 'Руанда', flag: '🇷🇼', code: '+250' },
  { c: 'Сент-Китс и Невис', flag: '🇰🇳', code: '+1' },
  { c: 'Сент-Люсия', flag: '🇱🇨', code: '+1' },
  { c: 'Сент-Винсент и Гренадины', flag: '🇻🇨', code: '+1' },
  { c: 'Самоа', flag: '🇼🇸', code: '+685' },
  { c: 'Сан-Марино', flag: '🇸🇲', code: '+378' },
  { c: 'Сан-Томе и Принсипи', flag: '🇸🇹', code: '+239' },
  { c: 'Саудовская Аравия', flag: '🇸🇦', code: '+966' },
  { c: 'Сенегал', flag: '🇸🇳', code: '+221' },
  { c: 'Сербия', flag: '🇷🇸', code: '+381' },
  { c: 'Сейшелы', flag: '🇸🇨', code: '+248' },
  { c: 'Сьерра-Леоне', flag: '🇸🇱', code: '+232' },
  { c: 'Сингапур', flag: '🇸🇬', code: '+65' },
  { c: 'Словакия', flag: '🇸🇰', code: '+421' },
  { c: 'Словения', flag: '🇸🇮', code: '+386' },
  { c: 'Соломоновы Острова', flag: '🇸🇧', code: '+677' },
  { c: 'Сомали', flag: '🇸🇴', code: '+252' },
  { c: 'ЮАР', flag: '🇿🇦', code: '+27' },
  { c: 'Южный Судан', flag: '🇸🇸', code: '+211' },
  { c: 'Испания', flag: '🇪🇸', code: '+34' },
  { c: 'Шри-Ланка', flag: '🇱🇰', code: '+94' },
  { c: 'Судан', flag: '🇸🇩', code: '+249' },
  { c: 'Суринам', flag: '🇸🇷', code: '+597' },
  { c: 'Швеция', flag: '🇸🇪', code: '+46' },
  { c: 'Швейцария', flag: '🇨🇭', code: '+41' },
  { c: 'Сирия', flag: '🇸🇾', code: '+963' },
  { c: 'Тайвань', flag: '🇹🇼', code: '+886' },
  { c: 'Танзания', flag: '🇹🇿', code: '+255' },
  { c: 'Таиланд', flag: '🇹🇭', code: '+66' },
  { c: 'Восточный Тимор', flag: '🇹🇱', code: '+670' },
  { c: 'Того', flag: '🇹🇬', code: '+228' },
  { c: 'Тонга', flag: '🇹🇴', code: '+676' },
  { c: 'Тринидад и Тобаго', flag: '🇹🇹', code: '+1' },
  { c: 'Тунис', flag: '🇹🇳', code: '+216' },
  { c: 'Тувалу', flag: '🇹🇻', code: '+688' },
  { c: 'Уганда', flag: '🇺🇬', code: '+256' },
  { c: 'ОАЭ', flag: '🇦🇪', code: '+971' },
  { c: 'Великобритания', flag: '🇬🇧', code: '+44' },
  { c: 'США', flag: '🇺🇸', code: '+1' },
  { c: 'Уругвай', flag: '🇺🇾', code: '+598' },
  { c: 'Вануату', flag: '🇻🇺', code: '+678' },
  { c: 'Ватикан', flag: '🇻🇦', code: '+379' },
  { c: 'Венесуэла', flag: '🇻🇪', code: '+58' },
  { c: 'Вьетнам', flag: '🇻🇳', code: '+84' },
  { c: 'Йемен', flag: '🇾🇪', code: '+967' },
  { c: 'Замбия', flag: '🇿🇲', code: '+260' },
  { c: 'Зимбабве', flag: '🇿🇼', code: '+263' },
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
const screens = ['register', 'pending', 'home', 'qadam', 'qarjy', 'progress', 'profile'];
function show(screen) {
  screens.forEach((s) => {
    const el = document.getElementById('screen-' + s);
    if (el) el.classList.toggle('active', s === screen);
  });
  document.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.screen === screen);
  });
  document.getElementById('tabbar').style.display =
    (screen === 'register' || screen === 'pending') ? 'none' : 'flex';
  if (screen === 'home') { loadBook(); try { roomStart(); } catch {} }
  if (screen === 'qadam') loadQadam();
  if (screen === 'qarjy') loadFin();
  if (screen === 'profile') loadFriends();
}

document.querySelectorAll('.tab').forEach((t) => {
  t.addEventListener('click', () => show(t.dataset.screen));
});

// ---------- Заполнение даты ----------
const MONTHS = ['қаңтар','ақпан','наурыз','сәуір','мамыр','маусым','шілде','тамыз','қыркүйек','қазан','қараша','желтоқсан'];
['firstName','lastName','email','phone'].forEach((id)=>{
  const el=document.getElementById(id);
  if(el) el.addEventListener('input',()=>{ el.style.borderColor=''; });
});

function fillDates() {
  const d = document.getElementById('birthDay');
  const m = document.getElementById('birthMonth');
  const y = document.getElementById('birthYear');
  for (let i = 1; i <= 31; i++) d.add(new Option(String(i), String(i)));
  MONTHS.forEach((name, i) => m.add(new Option(name, String(i + 1))));
  const now = new Date().getFullYear();
  for (let i = now; i >= now - 90; i--) y.add(new Option(String(i), String(i)));
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

  // Обязательные поля: Аты, Жөні, Почта, Нөмірі (Әкесінің аты — необязательно)
  const requiredIds = ['firstName', 'lastName', 'email', 'phone'];
  let missing = false;
  requiredIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el.value.trim()) { el.style.borderColor = '#d9534f'; missing = true; }
    else { el.style.borderColor = ''; }
  });
  if (missing) {
    hint.textContent = 'Міндетті өрістерді толтырыңыз (белгіленген *)';
    tg.HapticFeedback?.notificationOccurred('error');
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    document.getElementById('email').style.borderColor = '#d9534f';
    hint.textContent = 'Почта дұрыс емес';
    return;
  }

  const btn = document.getElementById('submitBtn');
  btn.disabled = true; hint.textContent = 'Сақталуда…';
  try {
    const r = await api('/api/register', { form });
    if (r.ok) {
      tg.HapticFeedback?.notificationOccurred('success');
      show('pending');
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
let RD_BOOK = null;
async function loadBook() {
  try {
    const r = await api('/api/book', {});
    if (!r.ok) return;
    const b = r.book; RD_BOOK = b;
    document.getElementById('bookTitle').textContent = b.title || '—';
    document.getElementById('bookAuthor').textContent = b.author || '';
    const pct = b.fileId ? Math.round(r.myProgress || 0) : Math.round(b.progress || 0);
    try { ROOM.myPercent = pct; } catch {}
    document.getElementById('bookProgress').textContent = pct + '%';
    const cover = document.getElementById('bookCover');
    if (b.cover) cover.innerHTML = `<img src="${b.cover}" alt="" />`;
    else cover.innerHTML = '<svg class="ic-svg" viewBox="0 0 24 24"><use href="#i-book"/></svg>';
    const rb = document.getElementById('readBookBtn');
    if (rb) rb.style.display = b.fileId ? 'inline-flex' : 'none';
  } catch {}
}

/* ================= РИДЕР (EPUB/PDF) ================= */
const RD_CDN = {
  jszip: ['https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js', 'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js'],
  epub: ['https://cdn.jsdelivr.net/npm/epubjs@0.3.93/dist/epub.min.js', 'https://unpkg.com/epubjs@0.3.93/dist/epub.min.js'],
  pdf: ['https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'],
  pdfw: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
};
const RD_THEMES = { day:{bg:'#ffffff',fg:'#17171F'}, sepia:{bg:'#F4ECD8',fg:'#5B4636'}, night:{bg:'#15151C',fg:'#E7E7EE'} };
const RD = { fmt:null, book:null, pdf:null, page:1, total:1, ch:0, chapters:[], pg:0, pages:1, step:0,
  reading:{ location:'', offset:0, percent:0, bookmarks:[], highlights:[] }, theme:'day', font:100, anim:'slide', chWords:0, saveT:null, sel:null };

function rdScript(list){ const urls=Array.isArray(list)?list:[list]; return new Promise((resolve,reject)=>{ let i=0; const tryNext=()=>{ if(i>=urls.length) return reject(new Error('CDN')); const src=urls[i++]; if([...document.scripts].some(s=>s.src===src)) return resolve(); const s=document.createElement('script'); s.src=src; s.onload=()=>resolve(); s.onerror=()=>{ s.remove(); tryNext(); }; document.head.appendChild(s); }; tryNext(); }); }
function rdMsg(t){ const e=document.getElementById('rdMsg'); e.textContent=t; e.classList.remove('hidden'); }
function rdMsgHide(){ document.getElementById('rdMsg').classList.add('hidden'); }
function rdSetProg(p){ document.getElementById('rdFill').style.width=p+'%'; document.getElementById('rdPct').textContent=p+'%'; }
function rdToast(msg){ let t=document.getElementById('rdToastEl'); if(!t){ t=document.createElement('div'); t.id='rdToastEl'; t.style.cssText='position:fixed;left:50%;bottom:84px;transform:translateX(-50%);background:var(--text);color:var(--bg);padding:9px 16px;border-radius:10px;font-size:13px;font-weight:600;z-index:1100;opacity:0;transition:opacity .2s;pointer-events:none'; document.body.appendChild(t);} t.textContent=msg; t.style.opacity='1'; clearTimeout(t._t); t._t=setTimeout(()=>t.style.opacity='0',1500); }
function rdPanel(id){ ['rdToc','rdNotes','rdAa','rdSearch'].forEach(x=>document.getElementById(x).classList.toggle('hidden', x!==id)); }
function rdPanelClose(){ ['rdToc','rdNotes','rdAa','rdSearch'].forEach(x=>document.getElementById(x).classList.add('hidden')); }
function rdToggle(id, fill){ const open=!document.getElementById(id).classList.contains('hidden'); if(open) rdPanelClose(); else { if(fill) fill(); rdPanel(id); } }

async function openReader(){
  if(!RD_BOOK || !RD_BOOK.fileId) return;
  const rd=document.getElementById('reader');
  rd.classList.remove('hidden');
  rd.classList.add('immersive');           // бірден толық экран
  document.getElementById('rdTitle').textContent = RD_BOOK.title || 'Кітап';
  try { tg.expand && tg.expand(); } catch {}
  try { tg.requestFullscreen && tg.requestFullscreen(); } catch {}
  try { tg.disableVerticalSwipes && tg.disableVerticalSwipes(); } catch {}
  rdApplyInsets();
  rdChromeSpace();
  try { RPING.active=true; RPING.last=Date.now(); RPING.pages=0; } catch {}
  try {
    if(tg && tg.onEvent && !window.__rdInsetEv){
      window.__rdInsetEv=1;
      const upd=()=>{ rdApplyInsets(); if(RD.fmt==='epub'){ rdLayout(); rdGoPage(RD.pg, false); } };
      tg.onEvent('safeAreaChanged', upd);
      tg.onEvent('contentSafeAreaChanged', upd);
      tg.onEvent('fullscreenChanged', upd);
      tg.onEvent('viewportChanged', upd);
    }
  } catch {}
  rdPanelClose(); rdMsg('Жүктелуде…');
  try {
    RD.theme=localStorage.getItem('ruh-rd-theme')||'day';
    RD.font=+(localStorage.getItem('ruh-rd-font')||100);
    RD.anim=localStorage.getItem('ruh-rd-anim')||'slide';
  } catch {}
  rdApplyAnim();
  try { const rr=await api('/api/book/read/get',{}); if(rr.ok&&rr.reading) RD.reading=Object.assign({location:'',percent:0,bookmarks:[],highlights:[]}, rr.reading); } catch {}
  RD.reading.bookmarks=RD.reading.bookmarks||[]; RD.reading.highlights=RD.reading.highlights||[];
  let buf;
  try { const resp=await fetch('/api/book/file',{ headers:{ 'X-Init-Data': tg.initData } }); if(!resp.ok) throw 0; buf=await resp.arrayBuffer(); }
  catch { rdMsg('Файлды жүктеу қатесі'); return; }
  RD.fmt = RD_BOOK.format==='pdf' ? 'pdf' : 'epub';
  try { if(RD.fmt==='pdf') await rdLoadPdf(buf); else await rdLoadEpub(buf); rdMsgHide(); }
  catch(e){ rdMsg('Ашу қатесі: '+(e&&e.message||e)); }
}
function closeReader(){
  rdSave(true);
  const rd=document.getElementById('reader');
  rd.classList.add('hidden');
  rd.classList.remove('immersive');
  try { tg.exitFullscreen && tg.exitFullscreen(); } catch {}
  try { tg.enableVerticalSwipes && tg.enableVerticalSwipes(); } catch {}
  try { rdPingTick(true); RPING.active=false; } catch {}
  try { loadRoom(); loadRoomStats(); } catch {}
  rdPanelClose();
  try { if(RD.book && RD.book.destroy) RD.book.destroy(); } catch {}
  RD.book=null; RD.pdf=null; RD.chapters=[]; RD.ch=0;
  document.getElementById('rdView').innerHTML=''; document.getElementById('rdView').className='rd-view';
  loadBook();
}

async function rdLoadEpub(buf){
  await rdScript(RD_CDN.jszip); await rdScript(RD_CDN.epub);
  const view=document.getElementById('rdView');
  view.className='rd-view epub';
  view.innerHTML='<div class="rd-pager" id="rdPager"><div id="rdPage" class="rd-page"></div><div class="rd-sheen"></div></div>';
  RD.book = ePub(buf);
  await RD.book.ready;
  const items=(RD.book.spine && RD.book.spine.spineItems) ? RD.book.spine.spineItems : [];
  RD.chapters = items.map((s)=>({ href:s.href }));
  RD.total = RD.chapters.length || 1;
  let start=parseInt(RD.reading.location); if(!(start>=0) || start>=RD.total) start=0;
  rdApplyTheme(); rdApplyFont();
  await rdRenderChapter(start, RD.reading.offset||0);
  rdDrag(view);
  // Тап: оң жақ — келесі, сол жақ — алдыңғы, орта — панельдерді жасыру
  view.addEventListener('click', (e)=>{
    if(e.target && e.target.closest && e.target.closest('.rd-hl')) return;
    if(!document.getElementById('rdSel').classList.contains('hidden')){ rdSelHide(); return; }
    const s=window.getSelection();
    if(s && !s.isCollapsed && String(s).trim()) return;
    const r=view.getBoundingClientRect(); const x=e.clientX-r.left;
    if(x < r.width*0.34) rdPrev();
    else if(x > r.width*0.66) rdNext();
    else rdToggleImmersive();
  });
  if(!window.__rdResize){
    window.__rdResize=1;
    const relayout=()=>{
      rdApplyInsets(); rdChromeSpace();
      if(RD.fmt==='epub'){
        const frac = RD.pages ? RD.pg/RD.pages : 0;
        rdLayout();
        rdGoPage(Math.min(RD.pages-1, Math.round(frac*RD.pages)), false);
        try {
          const pg=document.getElementById('rdPage');
          const v0=document.getElementById('rdView');
          const mx=Math.max(160,(v0?v0.clientHeight:520)-120);
          pg.style.setProperty('--rd-imgmax', mx+'px');
          pg.querySelectorAll('img,svg,picture,table').forEach(im=>{ im.style.maxHeight=mx+'px'; });
        } catch {}
      } else if(RD.fmt==='pdf'){ rdRenderPdf(RD.page); }
      rdSelHide();
    };
    const kick=()=>{ relayout(); setTimeout(relayout,250); setTimeout(relayout,700); };
    window.addEventListener('resize', kick);
    window.addEventListener('orientationchange', kick);
    try { if(window.visualViewport) window.visualViewport.addEventListener('resize', kick); } catch {}
  }
  const page=document.getElementById('rdPage');
  page.addEventListener('mouseup', ()=>setTimeout(rdOnSelect,10));
  page.addEventListener('touchend', ()=>setTimeout(rdOnSelect,120));
  page.addEventListener('touchstart',(e)=>{
    if(e.target && e.target.closest && e.target.closest('.rd-h, .rd-sel, .rd-hl')) return;
    if(RD.sel){ page.classList.remove('rd-locked'); const v0=document.getElementById('rdView'); if(v0) v0.classList.remove('rd-locked'); }
  }, { passive:true, capture:true });
  page.addEventListener('click', (e)=>{
    const sp=e.target&&e.target.closest?e.target.closest('.rd-hl'):null; if(!sp) return;
    const i=(RD.reading.highlights||[]).findIndex(h=>String(h.id)===String(sp.dataset.hid));
    if(i<0) return;
    const h=RD.reading.highlights[i];
    RD.sel={ ch:h.ch, start:h.start, end:h.end, text:h.text||'', existing:i };
    const r=sp.getBoundingClientRect();
    rdSelShow({ left:r.left, top:r.top, bottom:r.bottom, width:r.width }, true);
  });
}

/* ---------- Бөлімді шығару ---------- */
async function rdFixImages(root){
  const imgs=[...root.querySelectorAll('img,image')];
  for(const im of imgs){
    const src=im.getAttribute('src')||im.getAttribute('xlink:href')||'';
    if(!src||/^(data:|blob:|https?:)/.test(src)) continue;
    try{
      const abs=RD.book.resolve?RD.book.resolve(src):src;
      const url=await RD.book.archive.createUrl(abs, { base64:false });
      im.setAttribute('src', url); im.removeAttribute('xlink:href');
      im.style.maxWidth='100%'; im.style.height='auto';
    }catch{ im.remove(); }
  }
}
// Бөлімді бетке бөлу (CSS бағандары)
function rdLayout(){
  const view=document.getElementById('rdView'), page=document.getElementById('rdPage');
  if(!view||!page) return 1;
  const W=Math.max(240, view.clientWidth);
  page.style.maxWidth='none';
  page.style.width=W+'px';
  const cs=getComputedStyle(page);
  const padL=parseFloat(cs.paddingLeft)||20, padR=parseFloat(cs.paddingRight)||20;
  const gap=(padL+padR)||40;                 // қадам дәл W болуы үшін
  const inner=Math.max(160, W-padL-padR);
  const cols=inner>=620?2:1;                 // көлденең — кітап жайылмасы
  const col=Math.max(160, Math.floor((inner-gap*(cols-1))/cols));
  page.style.columnWidth=col+'px'; page.style.webkitColumnWidth=col+'px';
  page.style.columnGap=gap+'px'; page.style.webkitColumnGap=gap+'px';
  RD.cols=cols;
  RD.step=W;
  RD.pages=Math.max(1, Math.round(page.scrollWidth / W));
  return RD.pages;
}
// Telegram тақырыбы мен статус-бар астына мәтін кірмеуі үшін шегініс
function rdApplyInsets(){
  const rd=document.getElementById('reader'); if(!rd) return;
  let top=0, bot=0;
  try {
    const s=(tg && tg.safeAreaInset) || {};
    const c=(tg && tg.contentSafeAreaInset) || {};
    top=(Number(s.top)||0)+(Number(c.top)||0);
    bot=(Number(s.bottom)||0)+(Number(c.bottom)||0);
  } catch {}
  if(!top) top=(window.innerWidth>window.innerHeight?18:46);            // ескі Telegram нұсқалары үшін
  rd.style.setProperty('--rd-top-inset', (top+8)+'px');
  rd.style.setProperty('--rd-bot-inset', (bot+4)+'px');
}
// Панельдер шыққанда мәтін аймағы солардың биіктігіне тарылады
function rdChromeSpace(){
  const rd=document.getElementById('reader'); if(!rd) return;
  const top=document.querySelector('.rd-top'), bot=document.querySelector('.rd-bottom');
  // Орын ӘРҚАШАН резервте тұрады — сондықтан мәтін ешқашан қайта беттелмейді
  const th = top ? Math.round(top.getBoundingClientRect().height) : 0;
  const bh = bot ? Math.round(bot.getBoundingClientRect().height) : 0;
  rd.style.setProperty('--rd-ch-top', th+'px');
  rd.style.setProperty('--rd-ch-bot', bh+'px');
}
// Толық экран: панельдерді жасыру/көрсету + беттерді қайта есептеу
function rdToggleImmersive(force){
  const rd=document.getElementById('reader');
  const on = (force===undefined) ? !rd.classList.contains('immersive') : !!force;
  rd.classList.toggle('immersive', on);
  rdApplyInsets();
  rdChromeSpace();
  rdHaptic('light');
  // Оқу аймағы өзгермейді → мәтін сол бетте қалады
  // Панельдер мәтіннің үстінен шығады — қайта беттеудің қажеті жоқ (мәтін орнында тұрады)
}
function rdHaptic(kind){
  try { if(tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred) tg.HapticFeedback.impactOccurred(kind||'light'); } catch {}
}
function rdGoPage(i, anim, dir){
  const page=document.getElementById('rdPage'), pager=document.getElementById('rdPager');
  if(!page) return;
  const prev=RD.pg;
  i=Math.min(RD.pages-1, Math.max(0, i)); RD.pg=i;
  const x=-i*RD.step;
  page.classList.remove('curl-next','curl-prev','fade-in');
  if(pager) pager.classList.remove('turn-next','turn-prev');
  page.style.opacity='';
  if(anim===false){
    page.style.transition='none';
    page.style.transform='translateX(' + x + 'px)';
    setTimeout(()=>{ page.style.transition=''; }, 20);
  } else if(RD.anim==='fade'){
    page.style.transition='none';
    page.style.transform='translateX(' + x + 'px)';
    page.classList.remove('fade-in');
    void page.offsetWidth;
    page.classList.add('fade-in');
  } else if(RD.anim==='curl'){
    const d = dir || (i>prev ? 'next' : 'prev');
    const mid = x + (d==='next' ? RD.step*0.06 : -RD.step*0.06);
    page.style.setProperty('--rd-x', 'translateX(' + x + 'px)');
    page.style.setProperty('--rd-mid', 'translateX(' + mid + 'px)');
    page.style.transition='transform .4s cubic-bezier(.22,1,.36,1)';
    page.style.transform='translateX(' + x + 'px)';
    void page.offsetWidth;
    page.classList.add(d==='next' ? 'curl-next' : 'curl-prev');
    if(pager) pager.classList.add(d==='next' ? 'turn-next' : 'turn-prev');
  } else {
    page.style.transition='transform .3s cubic-bezier(.22,1,.36,1)';
    page.style.transform='translateX(' + x + 'px)';
  }
  if(i!==prev){ rdHaptic('light'); try{ RPING.pages++; }catch{} }
  rdUpdateProgress();
}
// Саусақпен сүйреу: бет саусақтың артынан жүреді
function rdDrag(view){
  if(!view || view._rdDrag) return; view._rdDrag=1;
  let x0=0, y0=0, dx=0, on=false;
  const pageEl=()=>document.getElementById('rdPage');
  const busy=()=>{
    if(RD.fmt!=='epub') return true;
    if(!document.getElementById('rdSel').classList.contains('hidden')) return true;
    const s=window.getSelection();
    return !!(s && !s.isCollapsed && String(s).trim());
  };
  view.addEventListener('touchstart',(e)=>{
    if(e.touches.length!==1 || busy()) return;
    x0=e.touches[0].clientX; y0=e.touches[0].clientY; dx=0; on=false;
  },{passive:true});
  view.addEventListener('touchmove',(e)=>{
    if(e.touches.length!==1 || busy()) return;
    const ddx=e.touches[0].clientX-x0, ddy=e.touches[0].clientY-y0;
    if(!on){
      if(Math.abs(ddx)>10 && Math.abs(ddx)>Math.abs(ddy)*1.2){ on=true; const p=pageEl(); if(p){ p.style.transition='none'; p.classList.remove('curl-next','curl-prev'); } }
      else return;
    }
    dx=ddx;
    const atStart=(RD.pg===0 && RD.ch===0), atEnd=(RD.pg===RD.pages-1 && RD.ch===RD.total-1);
    let d=dx;
    if((atStart && dx>0) || (atEnd && dx<0)) d=dx*0.32;
    const p=pageEl(); if(p) p.style.transform='translateX(' + ((-RD.pg*RD.step)+d) + 'px)';
  },{passive:true});
  view.addEventListener('touchend',()=>{
    if(!on) return; on=false;
    const p=pageEl(); if(p) p.style.transition='';
    const th=Math.min(90, RD.step*0.2);
    if(dx<-th) rdNext();
    else if(dx>th) rdPrev();
    else rdGoPage(RD.pg);
    dx=0;
  },{passive:true});
}
async function rdRenderChapter(i, offset){
  if(!RD.book) return;
  i=Math.min(RD.total-1, Math.max(0, i)); RD.ch=i;
  const page=document.getElementById('rdPage');
  if(!page) return;
  page.style.transition='none';
  page.style.transform='translateX(0)';
  page.innerHTML='<p class="rd-loading">Жүктелуде…</p>';
  let html='';
  try{
    const doc=await RD.book.load(RD.chapters[i].href);
    let body=(doc&&doc.body)?doc.body:null;
    if(!body&&typeof doc==='string'){ body=new DOMParser().parseFromString(doc,'text/html').body; }
    if(body){
      const clone=body.cloneNode(true);
      clone.querySelectorAll('script,style,link,iframe,object,embed,video,audio').forEach(n=>n.remove());
      await rdFixImages(clone);
      html=clone.innerHTML;
    }
  }catch{ html='<p>Бөлімді ашу мүмкін болмады</p>'; }
  page.innerHTML=html||'<p>Бос бөлім</p>';
  try {
    const view0=document.getElementById('rdView');
    const maxH=Math.max(160, (view0?view0.clientHeight:520) - 120);
    page.style.setProperty('--rd-imgmax', maxH+'px');
    page.querySelectorAll('img,svg,picture,table').forEach((im)=>{
      im.style.maxHeight=maxH+'px'; im.style.height='auto'; im.style.maxWidth='100%';
      im.removeAttribute('height'); im.removeAttribute('width');
      const p=im.parentElement;
      if(p && p!==page){ p.style.breakInside='avoid'; p.style.webkitColumnBreakInside='avoid'; }
    });
  } catch {}
  RD.chWords=((page.textContent||'').trim().match(/\S+/g)||[]).length;
  rdPaintHighlights();
  rdLayout();
  rdGoPage(offset==='last' ? RD.pages-1 : (Number(offset)||0), false);
}
function rdUpdateProgress(){
  if(RD.fmt!=='epub') return;
  const within=RD.pages ? (RD.pg+1)/RD.pages : 1;
  const pct=Math.min(100, Math.round(((RD.ch+within)/RD.total)*100));
  RD.reading.location=String(RD.ch);
  RD.reading.offset=RD.pg;
  RD.reading.percent=pct;
  rdSetProg(pct);
  const pgEl=document.getElementById('rdPages');
  if(pgEl) pgEl.textContent=(RD.pg+1)+' / '+RD.pages+' бет';
  const leftEl=document.getElementById('rdLeft');
  if(leftEl){
    const per=RD.chWords ? RD.chWords/RD.pages : 0;      // бір беттегі сөз
    const leftWords=Math.max(0, per*(RD.pages-1-RD.pg));
    const mins=Math.round(leftWords/180);                 // ~180 сөз/мин
    leftEl.textContent = RD.pages>1
      ? (mins>=1 ? ('бөлімде ~'+mins+' мин қалды') : 'бөлім аяқталды')
      : '';
  }
  rdSave();
}

/* ---------- Ерекшелеу: мәтін орындары бойынша ---------- */
function rdTextNodes(root){ const out=[]; const w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null); let n; while((n=w.nextNode())) out.push(n); return out; }
function rdOffsetOf(root, node, off){ let sum=0; for(const t of rdTextNodes(root)){ if(t===node) return sum+off; sum+=t.nodeValue.length; } return -1; }
function rdRangeFrom(root, start, end){
  let sum=0, started=false; const r=document.createRange();
  for(const t of rdTextNodes(root)){
    const len=t.nodeValue.length;
    if(!started && start>=sum && start<=sum+len){ r.setStart(t, start-sum); started=true; }
    if(started && end>=sum && end<=sum+len){ r.setEnd(t, end-sum); return r; }
    sum+=len;
  }
  return null;
}
function rdWrapRange(range, h){
  const root=range.commonAncestorContainer;
  const scope=root.nodeType===3?root.parentNode:root;
  const nodes=[]; const w=document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, null); let n;
  while((n=w.nextNode())){ try{ if(range.intersectsNode(n)) nodes.push(n); }catch{} }
  nodes.forEach((t)=>{
    const s=(t===range.startContainer)?range.startOffset:0;
    const e=(t===range.endContainer)?range.endOffset:t.nodeValue.length;
    if(e<=s) return;
    const sub=document.createRange(); sub.setStart(t,s); sub.setEnd(t,e);
    const span=document.createElement('span');
    span.className='rd-hl'; span.dataset.hid=h.id;
    if(h.underline){ span.style.textDecoration='underline'; span.style.textDecorationColor=h.color||'#F6C945'; span.style.textDecorationThickness='2px'; }
    else { span.style.background=h.color||'#F6C945'; }
    try{ sub.surroundContents(span); }catch{}
  });
}
function rdPaintHighlights(){
  const page=document.getElementById('rdPage'); if(!page) return;
  (RD.reading.highlights||[]).filter(h=>Number(h.ch)===RD.ch).forEach((h)=>{
    const r=rdRangeFrom(page, h.start, h.end); if(r) rdWrapRange(r, h);
  });
}
function rdRepaint(){ if(RD.fmt==='epub') rdRenderChapter(RD.ch, RD.pg||0); }
function rdOnSelect(){
  const sel=window.getSelection();
  if(!sel||sel.isCollapsed||!String(sel).trim()) return;
  const page=document.getElementById('rdPage'); if(!page) return;
  let range; try{ range=sel.getRangeAt(0); }catch{ return; }
  if(!page.contains(range.commonAncestorContainer)) return;
  const start=rdOffsetOf(page, range.startContainer, range.startOffset);
  const end=rdOffsetOf(page, range.endContainer, range.endOffset);
  if(start<0||end<0||end<=start) return;
  const found=(RD.reading.highlights||[]).findIndex(h=>Number(h.ch)===RD.ch && h.start===start && h.end===end);
  RD.sel={ ch:RD.ch, start, end, text:String(sel).trim(), existing:found };
  let rect=null; try{ const r=range.getBoundingClientRect(); rect={ left:r.left, top:r.top, bottom:r.bottom, width:r.width }; }catch{}
  // өз белгімізді саламыз да, жүйелік мәзір шықпас үшін таңдауды алып тастаймыз
  if(found<0){ try{ rdMarkTemp(range.cloneRange()); }catch{} }
  try{ rdHandles(range.cloneRange()); }catch{}
  rdLock(true);
  rdSelShow(rect, found>=0);
}
function rdSelShow(rect, existing){
  const el=document.getElementById('rdSel');
  RD.shownAt=Date.now();
  el.classList.remove('hidden');
  el.querySelector('.rd-sel-del').style.display = existing ? '' : 'none';
  const cur=(existing && RD.sel && RD.reading.highlights[RD.sel.existing]) ? RD.reading.highlights[RD.sel.existing] : null;
  el.querySelectorAll('.rd-sel-c').forEach(b=>b.classList.toggle('on', !!cur && ((b.dataset.underline && cur.underline) || (!b.dataset.underline && !cur.underline && b.dataset.color===cur.color))));
  const box=el.getBoundingClientRect(), vw=window.innerWidth, vh=window.innerHeight;
  let left=vw/2-box.width/2, top=vh/2-box.height/2;
  if(rect){
    left=Math.min(Math.max(8, rect.left+(rect.width/2)-box.width/2), vw-box.width-8);
    top=rect.top-box.height-10;
    if(top<66) top=Math.min(rect.bottom+10, vh-box.height-70);
  }
  el.style.left=Math.round(left)+'px'; el.style.top=Math.round(Math.max(66,top))+'px';
}
// Жүйелік таңдау маркерлері көрінбеуі үшін бетті "құлыптаймыз"
function rdLock(on){
  const page=document.getElementById('rdPage'), view=document.getElementById('rdView');
  if(page) page.classList.toggle('rd-locked', !!on);
  if(view) view.classList.toggle('rd-locked', !!on);
  if(RD.lockT){ clearInterval(RD.lockT); RD.lockT=null; }
  if(!on) return;
  let n=0;
  const wipe=()=>{
    try{ const s=window.getSelection(); if(s && !s.isCollapsed) s.removeAllRanges(); }catch(e){}
    if(++n>16){ clearInterval(RD.lockT); RD.lockT=null; }
  };
  wipe();
  RD.lockT=setInterval(wipe, 40);
}
function rdSelHide(){ rdClearTemp(); rdHandlesClear(); rdLock(false); document.getElementById('rdSel').classList.add('hidden'); RD.sel=null; }
function rdCaretRect(range, atEnd){
  try {
    const n = atEnd ? range.endContainer : range.startContainer;
    const o = atEnd ? range.endOffset : range.startOffset;
    if (n && n.nodeType === 3) {
      const r2 = document.createRange();
      if (atEnd && o > 0) {
        r2.setStart(n, o - 1); r2.setEnd(n, o);
        const bb = r2.getBoundingClientRect();
        if (bb && bb.height > 0) return { left: bb.right, right: bb.right, top: bb.top, height: bb.height };
      }
      if (!atEnd && o < n.nodeValue.length) {
        r2.setStart(n, o); r2.setEnd(n, o + 1);
        const bb = r2.getBoundingClientRect();
        if (bb && bb.height > 0) return { left: bb.left, right: bb.left, top: bb.top, height: bb.height };
      }
    }
  } catch (e) {}
  try {
    const rs = Array.prototype.slice.call(range.getClientRects()).filter(function (r) { return r.height > 0 && r.width > 0; });
    if (rs.length) {
      const bb = atEnd ? rs[rs.length - 1] : rs[0];
      return { left: atEnd ? bb.right : bb.left, right: atEnd ? bb.right : bb.left, top: bb.top, height: bb.height };
    }
  } catch (e) {}
  try {
    const r = range.cloneRange(); r.collapse(!atEnd);
    const bb = r.getBoundingClientRect();
    if (bb && bb.height > 0) return { left: bb.left, right: bb.left, top: bb.top, height: bb.height };
  } catch (e) {}
  return null;
}
function rdHandlesClear(){ document.querySelectorAll('.rd-h').forEach(e=>e.remove()); RD.handles=null; }
function rdHandlesPos(range){
  const view=document.getElementById('rdView');
  if(!view||!range||!RD.handles) return;
  const f=rdCaretRect(range,false), l=rdCaretRect(range,true);
  if(!f||!l) return;
  const vb=view.getBoundingClientRect();
  const { hs, he } = RD.handles;
  hs.style.left=(f.left-vb.left)+'px'; hs.style.top=(f.top-vb.top)+'px'; hs.style.height=Math.max(14,f.height)+'px';
  he.style.left=(l.left-vb.left)+'px'; he.style.top=(l.top-vb.top)+'px'; he.style.height=Math.max(14,l.height)+'px';
}
function rdHandles(range){
  rdHandlesClear();
  const view=document.getElementById('rdView'); if(!view||!range) return;
  const vb=view.getBoundingClientRect();
  const first=rdCaretRect(range,false), last=rdCaretRect(range,true);
  if(!first||!last) return;
  const mk=(cls,x,y,h)=>{
    const el=document.createElement('div');
    el.className='rd-h '+cls;
    el.style.left=(x-vb.left)+'px'; el.style.top=(y-vb.top)+'px'; el.style.height=Math.max(14,h)+'px';
    view.appendChild(el); return el;
  };
  const hs=mk('start', first.left, first.top, first.height);
  const he=mk('end', last.left, last.top, last.height);
  RD.handles={ hs, he };
  const page=document.getElementById('rdPage');
  const drag=(el,which)=>{
    el.addEventListener('touchstart',(e)=>{
      e.preventDefault(); e.stopPropagation();
      RD.dragH=true; el.classList.add('grab');
      const t0=e.touches[0];
      let anchor=null;
      try{ const pg0=document.getElementById('rdPage');
        const r0=(pg0&&RD.sel)?rdRangeFrom(pg0, RD.sel.start, RD.sel.end):null;
        if(r0) anchor=rdCaretRect(r0, which==='end');
      }catch(err){}
      RD.dragOff=(t0&&anchor)?{ x:anchor.left-t0.clientX, y:(anchor.top+anchor.height/2)-t0.clientY }:{ x:0, y:(which==='end'?-20:20) };
      document.getElementById('rdSel').classList.add('hidden');
      rdHaptic('light');
    },{passive:false});
    const endDrag=(e)=>{
      if(!RD.dragH) return;
      RD.dragH=false; el.classList.remove('grab');
      const page2=document.getElementById('rdPage');
      const r3=RD.sel ? rdRangeFrom(page2, RD.sel.start, RD.sel.end) : null;
      let rect=null; try{ if(r3){ const rr=r3.getBoundingClientRect(); rect={left:rr.left, top:rr.top, bottom:rr.bottom, width:rr.width}; } }catch{}
      rdSelShow(rect, RD.sel && RD.sel.existing>=0);
      rdHaptic('light');
    };
    el.addEventListener('touchend', endDrag, {passive:true});
    el.addEventListener('touchcancel', endDrag, {passive:true});
    el.addEventListener('touchmove',(e)=>{
      e.preventDefault(); e.stopPropagation();
      const t=e.touches[0]; if(!t||!RD.sel) return;
      const dof=RD.dragOff||{x:0,y:-6};
      const vw=document.getElementById('rdView');
      const vb2=(vw||page).getBoundingClientRect();
      let px=t.clientX+dof.x, py=t.clientY+dof.y;
      px=Math.min(Math.max(px, vb2.left+6), vb2.right-6);
      py=Math.min(Math.max(py, vb2.top+6), vb2.bottom-6);
      let cr=null;
      try { cr = document.caretRangeFromPoint ? document.caretRangeFromPoint(px, py) : null; } catch {}
      if(!cr || !page.contains(cr.startContainer)){
        try { cr = document.caretRangeFromPoint ? document.caretRangeFromPoint(Math.min(Math.max(px, vb2.left+16), vb2.right-16), py) : null; } catch {}
      }
      if(!cr || !page.contains(cr.startContainer)) return;
      const off=rdOffsetOf(page, cr.startContainer, cr.startOffset);
      if(off<0) return;
      let s=RD.sel.start, e2=RD.sel.end;
      if(which==='start') s=Math.min(off, e2-1); else e2=Math.max(off, s+1);
      if(e2<=s) return;
      RD.sel.start=s; RD.sel.end=e2;
      rdClearTemp();
      const r2=rdRangeFrom(page, s, e2);
      if(r2){
        RD.sel.text=r2.toString().trim();
        rdMarkTemp(r2.cloneRange());
        rdHandlesPos(r2);
      }
    },{passive:false});
  };
  drag(hs,'start'); drag(he,'end');
}
// Уақытша белгі: жүйелік мәзір шықпауы үшін өз бояуымызбен көрсетеміз
function rdMarkTemp(range){
  try { rdWrapRange(range, { id:'__tmp', color:'rgba(94,92,230,.28)' }); } catch {}
  document.querySelectorAll('#rdPage .rd-hl[data-hid="__tmp"]').forEach(s=>s.classList.add('rd-tmp'));
}
function rdClearTemp(){
  document.querySelectorAll('#rdPage .rd-tmp').forEach((s)=>{
    const p=s.parentNode; if(!p) return;
    while(s.firstChild) p.insertBefore(s.firstChild, s);
    p.removeChild(s); p.normalize();
  });
}
function rdClearSelection(){ rdClearTemp(); try { window.getSelection().removeAllRanges(); } catch {} }
function rdSelMark(color, underline){
  const s=RD.sel; if(!s) return;
  if(s.existing>=0){
    const old=RD.reading.highlights[s.existing];
    old.color=color||old.color; old.underline=!!underline;
  } else {
    RD.reading.highlights.push({ id:'h'+Date.now()+Math.random().toString(36).slice(2,6), ch:s.ch, start:s.start, end:s.end, text:(s.text||'').slice(0,220), color:color||'#F6C945', underline:!!underline });
  }
  rdSave(true); rdClearSelection(); rdSelHide(); rdRepaint(); rdToast(underline?'Асты сызылды':'Ерекшеленді');
}
async function rdSelCopy(){
  const t=(RD.sel&&RD.sel.text)||''; if(!t) return;
  try { await navigator.clipboard.writeText(t); rdToast('Көшірілді'); }
  catch {
    try { const ta=document.createElement('textarea'); ta.value=t; ta.style.cssText='position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); rdToast('Көшірілді'); }
    catch { rdToast('Көшіру мүмкін емес'); }
  }
  rdClearSelection(); rdSelHide();
}
function rdSelNote(){
  const s=RD.sel; if(!s) return;
  const cur=s.existing>=0?(RD.reading.highlights[s.existing].note||''):'';
  const val=prompt('Жазба:', cur);
  if(val===null){ rdSelHide(); return; }
  if(s.existing>=0){ RD.reading.highlights[s.existing].note=val.slice(0,500); }
  else { RD.reading.highlights.push({ id:'h'+Date.now()+Math.random().toString(36).slice(2,6), ch:s.ch, start:s.start, end:s.end, text:(s.text||'').slice(0,220), color:'#F6C945', note:val.slice(0,500) }); }
  rdSave(true); rdClearSelection(); rdSelHide(); rdRepaint(); rdToast('Жазба сақталды');
}
function rdSelRemove(){
  const s=RD.sel; if(!s||s.existing<0) return;
  RD.reading.highlights.splice(s.existing,1);
  rdSave(true); rdClearSelection(); rdSelHide(); rdRepaint(); rdToast('Жойылды');
}

/* ---------- Свайп: беттерді саусақпен аудару ---------- */
function rdSwipe(target, win){
  if(!target||target._rdSw) return; target._rdSw=1;
  let x0=0, y0=0, t0=0, moved=false;
  target.addEventListener('touchstart',(e)=>{ if(e.touches.length!==1) return; x0=e.touches[0].clientX; y0=e.touches[0].clientY; t0=Date.now(); moved=false; },{passive:true});
  target.addEventListener('touchmove',()=>{ moved=true; },{passive:true});
  target.addEventListener('touchend',(e)=>{
    if(!moved) return;
    if(RD.fmt==='epub') return; // EPUB-те rdDrag өзі басқарады (қосарланбауы үшін)
    const t=e.changedTouches&&e.changedTouches[0]; if(!t) return;
    const dx=t.clientX-x0, dy=t.clientY-y0, dt=Date.now()-t0;
    let hasSel=false;
    try { const sel=(win||window).getSelection(); hasSel=!!(sel&&String(sel).trim().length); } catch {}
    if(hasSel) return;
    if(dt<800 && Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)*1.6){ rdSelHide(); if(dx<0) rdNext(); else rdPrev(); }
  },{passive:true});
}

/* ---------- Кітаптан іздеу ---------- */
async function rdDoSearch(q){
  const wrap=document.getElementById('rdSearch');
  const list=document.getElementById('rdSrchList');
  q=(q||'').trim(); if(q.length<2){ list.innerHTML='<div class="rd-empty">Кемінде 2 әріп жаз</div>'; return; }
  list.innerHTML='<div class="rd-empty">Ізделуде…</div>';
  const esc=(s)=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  let res=[];
  try {
    if(RD.fmt==='pdf'){
      for(let p=1;p<=RD.total && res.length<80;p++){
        const page=await RD.pdf.getPage(p);
        const tc=await page.getTextContent();
        const txt=tc.items.map(i=>i.str).join(' ');
        const li=txt.toLowerCase().indexOf(q.toLowerCase());
        if(li>=0) res.push({ page:p, excerpt:txt.slice(Math.max(0,li-45), li+q.length+55), loc:'Бет '+p });
      }
    } else {
      const ql=q.toLowerCase();
      for(let i=0;i<RD.chapters.length && res.length<80;i++){
        try{
          const doc=await RD.book.load(RD.chapters[i].href);
          const txt=((doc&&doc.body)?doc.body.textContent:'')||'';
          const tl=txt.toLowerCase();
          let from=0, li;
          while((li=tl.indexOf(ql, from))>=0 && res.length<80){
            res.push({ ch:i, excerpt:txt.slice(Math.max(0,li-45), li+q.length+55), loc:'Бөлім '+(i+1) });
            from=li+q.length;
          }
        }catch{}
      }
    }
  } catch {}
  if(!res.length){ list.innerHTML='<div class="rd-empty">Табылмады</div>'; return; }
  list.innerHTML=res.map((r,i)=>{
    const ex=esc(r.excerpt||'').replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'),'<b>$1</b>');
    return '<div class="rd-srch-item" data-i="'+i+'">'+ex+'<span class="loc">'+esc(r.loc||'')+'</span></div>';
  }).join('');
  list.querySelectorAll('.rd-srch-item').forEach(el=>el.addEventListener('click',()=>{
    const r=res[+el.dataset.i]; rdPanelClose();
    if(RD.fmt==='pdf') rdRenderPdf(r.page); else rdRenderChapter(r.ch, 0);
  }));
}
function rdOpenSearch(prefill){
  const p=document.getElementById('rdSearch');
  p.innerHTML='<div class="rd-srch-row"><input id="rdSrchInput" placeholder="Кітаптан іздеу…" value="'+String(prefill||'').replace(/"/g,'&quot;')+'" /><button id="rdSrchGo">Іздеу</button></div><div id="rdSrchList"></div>';
  const inp=document.getElementById('rdSrchInput');
  document.getElementById('rdSrchGo').addEventListener('click',()=>rdDoSearch(inp.value));
  inp.addEventListener('keydown',(e)=>{ if(e.key==='Enter') rdDoSearch(inp.value); });
  if(prefill) rdDoSearch(prefill); else setTimeout(()=>inp.focus(),150);
}
async function rdLoadPdf(buf){
  await rdScript(RD_CDN.pdf);
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = RD_CDN.pdfw;
  const view=document.getElementById('rdView'); view.className='rd-view pdf'; view.innerHTML='';
  RD.pdf = await window.pdfjsLib.getDocument({ data:new Uint8Array(buf) }).promise;
  RD.total = RD.pdf.numPages;
  RD.page = Math.min(RD.total, Math.max(1, parseInt(RD.reading.location)||1));
  rdSwipe(view, window);
  rdApplyTheme(); await rdRenderPdf(RD.page);
}
async function rdRenderPdf(n){
  if(!RD.pdf) return; n=Math.min(RD.total, Math.max(1,n)); RD.page=n;
  const view=document.getElementById('rdView'); view.innerHTML='';
  const page=await RD.pdf.getPage(n);
  const vw=Math.max(280, view.clientWidth-20);
  const base=page.getViewport({ scale:1 });
  const scale=Math.min(3, Math.max(0.5, vw/base.width))*(RD.font/100);
  const vp=page.getViewport({ scale });
  const canvas=document.createElement('canvas'); canvas.width=vp.width; canvas.height=vp.height;
  view.appendChild(canvas);
  await page.render({ canvasContext:canvas.getContext('2d'), viewport:vp }).promise;
  const pct=Math.round(n/RD.total*100);
  RD.reading.location=String(n); RD.reading.percent=pct; rdSetProg(pct); rdSave();
}
function rdNext(){
  if(RD.fmt==='pdf') return rdRenderPdf(RD.page+1);
  if(RD.pg < RD.pages-1) rdGoPage(RD.pg+1, true, 'next');
  else if(RD.ch < RD.total-1){ rdHaptic('medium'); try{ RPING.pages++; }catch{} rdRenderChapter(RD.ch+1, 0); }
  else rdGoPage(RD.pg);
}
function rdPrev(){
  if(RD.fmt==='pdf') return rdRenderPdf(RD.page-1);
  if(RD.pg > 0) rdGoPage(RD.pg-1, true, 'prev');
  else if(RD.ch > 0){ rdHaptic('medium'); rdRenderChapter(RD.ch-1, 'last'); }
  else rdGoPage(RD.pg);
}
const RD_CHROME = { day:'rgba(255,255,255,.88)', sepia:'rgba(244,236,216,.90)', night:'rgba(21,21,28,.86)' };
const RD_UI = {
  day:   { btn:'rgba(23,23,31,.055)',   line:'rgba(23,23,31,.13)',    mut:'rgba(23,23,31,.55)' },
  sepia: { btn:'rgba(91,70,54,.09)',    line:'rgba(91,70,54,.20)',    mut:'rgba(91,70,54,.62)' },
  night: { btn:'rgba(231,231,238,.10)', line:'rgba(231,231,238,.17)', mut:'rgba(231,231,238,.58)' },
};
function rdApplyTheme(){
  const v=document.getElementById('rdView'); const t=RD_THEMES[RD.theme]||RD_THEMES.day;
  v.style.background=t.bg; v.style.color=t.fg;
  const rd=document.getElementById('reader');
  if(rd){
    rd.style.setProperty('--rd-chrome-bg', RD_CHROME[RD.theme]||RD_CHROME.day);
    rd.style.setProperty('--rd-chrome-fg', t.fg);
    const ui=RD_UI[RD.theme]||RD_UI.day;
    rd.style.setProperty('--rd-btn-bg', ui.btn);
    rd.style.setProperty('--rd-btn-line', ui.line);
    rd.style.setProperty('--rd-btn-mut', ui.mut);
  }
  document.querySelectorAll('.rd-th').forEach(b=>b.classList.toggle('sel', b.dataset.th===RD.theme));
  if(RD.fmt==='pdf') v.classList.toggle('night', RD.theme==='night');
}
function rdApplyAnim(){
  document.querySelectorAll('.rd-an').forEach(b=>b.classList.toggle('sel', b.dataset.an===RD.anim));
}
function rdApplyFont(){
  document.getElementById('rdFontVal').textContent=RD.font+'%';
  const p=document.getElementById('rdPage'); if(!p) return;
  p.style.fontSize=RD.font+'%';
  if(RD.fmt==='epub'){ const frac=RD.pages?RD.pg/RD.pages:0; rdLayout(); rdGoPage(Math.round(frac*RD.pages), false); }
}
function rdSave(now){
  clearTimeout(RD.saveT);
  const go=()=>api('/api/book/read/save',{ location:RD.reading.location, offset:RD.reading.offset||0, percent:RD.reading.percent, bookmarks:RD.reading.bookmarks, highlights:RD.reading.highlights }).catch(()=>{});
  if(now) go(); else RD.saveT=setTimeout(go, 1200);
}
async function rdOpenToc(){
  const panel=document.getElementById('rdToc'); let items=[];
  if(RD.fmt==='pdf'){ try{ const out=await RD.pdf.getOutline(); items=(out||[]).map(o=>({label:o.title,dest:o.dest})); }catch{} }
  else if(RD.book){
    try{ items=(RD.book.navigation.toc||[]).map(t=>({ label:(t.label||'').trim(), href:t.href })); }catch{}
    if(!items.length) items=RD.chapters.map((c,i)=>({ label:'Бөлім '+(i+1), idx:i }));
  }
  panel.innerHTML='<div class="rd-panel-title">Мазмұны</div>'+(items.length?items.map((it,i)=>`<div class="rd-toc-item" data-i="${i}">${it.label||('Бөлім '+(i+1))}</div>`).join(''):'<div class="rd-empty">Мазмұны табылмады</div>');
  const baseOf=(s)=>String(s||'').split('#')[0].replace(/^.*\//,'');
  panel.querySelectorAll('.rd-toc-item').forEach(el=>el.addEventListener('click', async ()=>{
    const it=items[+el.dataset.i]; rdPanelClose();
    if(RD.fmt==='pdf'){ try{ let d=it.dest; if(typeof d==='string') d=await RD.pdf.getDestination(d); const pn=await RD.pdf.getPageIndex(d[0])+1; rdRenderPdf(pn); }catch{} }
    else {
      let idx=(it.idx!=null)?it.idx:RD.chapters.findIndex(c=>baseOf(c.href)===baseOf(it.href));
      rdRenderChapter(idx>=0?idx:0, 0);
    }
  }));
}
function rdAddBookmark(){
  const label=RD.fmt==='pdf'?('Бет '+RD.page):('Бөлім '+(RD.ch+1)+' · бет '+(RD.pg+1)+'/'+RD.pages);
  RD.reading.bookmarks.push({ loc:RD.reading.location, off:(RD.fmt==='pdf'?0:RD.pg), label, pct:RD.reading.percent });
  rdSave(true); rdToast('Бетбелгі қосылды'); rdOpenNotes();
}
function rdOpenNotes(){
  const p=document.getElementById('rdNotes'); const bm=RD.reading.bookmarks||[], hl=RD.reading.highlights||[];
  let h='<button type="button" class="read-btn" id="rdAddBm" style="margin:0 0 14px;"><svg class="ic-svg" viewBox="0 0 24 24"><use href="#i-bookmark"/></svg>Осы жерге бетбелгі</button>';
  h+='<div class="rd-panel-title">Бетбелгілер</div>';
  h+=bm.length?bm.map((b,i)=>`<div class="rd-note-item" data-t="bm" data-i="${i}"><span class="dot" style="background:var(--accent)"></span><span class="txt">${b.label||''}</span><span class="rd-note-del" data-del="bm" data-i="${i}">жою</span></div>`).join(''):'<div class="rd-empty">Әзірге жоқ</div>';
  h+='<div class="rd-panel-title" style="margin-top:18px;">Ерекшелеулер мен жазбалар</div>';
  h+=hl.length?hl.map((x,i)=>{
    const note=x.note?('<span style="display:block;color:var(--accent);font-size:12px;margin-top:3px;">✎ '+String(x.note).slice(0,120)+'</span>'):'';
    const st=x.underline?'text-decoration:underline;text-decoration-thickness:2px;':'';
    return `<div class="rd-note-item" data-t="hl" data-i="${i}"><span class="dot" style="background:${x.color||'#F6C945'}"></span><span class="txt"><span style="${st}">${(x.text||'').slice(0,100)||'—'}</span>${note}</span><span class="rd-note-del" data-del="hl" data-i="${i}">жою</span></div>`;
  }).join(''):'<div class="rd-empty">Әзірге жоқ</div>';
  p.innerHTML=h;
  document.getElementById('rdAddBm').addEventListener('click', rdAddBookmark);
  p.querySelectorAll('.rd-note-item').forEach(el=>el.addEventListener('click',(e)=>{
    if(e.target.dataset.del!=null) return; const t=el.dataset.t, i=+el.dataset.i; rdPanelClose();
    if(t==='bm'){ const b=RD.reading.bookmarks[i]; if(RD.fmt==='pdf') rdRenderPdf(parseInt(b.loc)||1); else rdRenderChapter(parseInt(b.loc)||0, b.off||0); }
    else { const x=RD.reading.highlights[i]; if(RD.fmt!=='pdf') rdRenderChapter(Number(x.ch)||0, 0); }
  }));
  p.querySelectorAll('[data-del]').forEach(el=>el.addEventListener('click',(e)=>{
    e.stopPropagation(); const t=el.dataset.del, i=+el.dataset.i;
    if(t==='bm') RD.reading.bookmarks.splice(i,1);
    else { RD.reading.highlights.splice(i,1); rdRepaint(); }
    rdSave(true); rdOpenNotes();
  }));
}

document.getElementById('readBookBtn')?.addEventListener('click', openReader);
document.getElementById('rdClose')?.addEventListener('click', closeReader);
document.getElementById('rdNext')?.addEventListener('click', rdNext);
document.getElementById('rdPrev')?.addEventListener('click', rdPrev);
document.getElementById('rdTocBtn')?.addEventListener('click', ()=>rdToggle('rdToc', rdOpenToc));
document.getElementById('rdMarkBtn')?.addEventListener('click', ()=>rdToggle('rdNotes', rdOpenNotes));
document.getElementById('rdAaBtn')?.addEventListener('click', ()=>rdToggle('rdAa'));
document.getElementById('rdFontMinus')?.addEventListener('click', ()=>{ RD.font=Math.max(70,RD.font-10); try{localStorage.setItem('ruh-rd-font',RD.font);}catch{} rdApplyFont(); if(RD.fmt==='pdf') rdRenderPdf(RD.page); });
document.getElementById('rdFontPlus')?.addEventListener('click', ()=>{ RD.font=Math.min(180,RD.font+10); try{localStorage.setItem('ruh-rd-font',RD.font);}catch{} rdApplyFont(); if(RD.fmt==='pdf') rdRenderPdf(RD.page); });
document.querySelectorAll('.rd-th').forEach(b=>b.addEventListener('click', ()=>{ RD.theme=b.dataset.th; try{localStorage.setItem('ruh-rd-theme',RD.theme);}catch{} rdApplyTheme(); }));
document.querySelectorAll('.rd-an').forEach(b=>b.addEventListener('click', ()=>{
  RD.anim=b.dataset.an; try{localStorage.setItem('ruh-rd-anim',RD.anim);}catch{}
  rdApplyAnim(); rdHaptic('light');
}));

// Ерекшелеу мәзірінің батырмалары
document.querySelectorAll('#rdSel .rd-sel-c').forEach(b=>b.addEventListener('click', ()=>{
  if(b.dataset.underline){ const cur=(RD.sel&&RD.sel.existing>=0)?RD.reading.highlights[RD.sel.existing].color:null; rdSelMark(cur||'#F6C945', true); }
  else rdSelMark(b.dataset.color, false);
}));
document.querySelectorAll('#rdSel .rd-sel-list button').forEach(b=>b.addEventListener('click', ()=>{
  const a=b.dataset.act;
  if(a==='copy') rdSelCopy();
  else if(a==='note') rdSelNote();
  else if(a==='remove') rdSelRemove();
  else if(a==='search'){ const q=(RD.sel&&RD.sel.text)||''; rdClearSelection(); rdSelHide(); rdOpenSearch(q.slice(0,60)); rdPanel('rdSearch'); }
  else if(a==='share'){
    const s=RD.sel; if(!s||!s.text) return;
    const color=(s.existing>=0 && RD.reading.highlights[s.existing]) ? RD.reading.highlights[s.existing].color : '#F6C945';
    api('/api/book/quote/add', { text:s.text, ch:(RD.ch||0)+1, color })
      .then((r)=>{ rdToast(r&&r.ok ? 'Оқу залына жіберілді' : 'Қате'); })
      .catch(()=>rdToast('Қате'));
    rdClearSelection(); rdSelHide();
  }
}));
// iOS: ұзақ басу арқылы ерекшелеу touchend бермейді — selectionchange бойынша ұстаймыз
let rdSelT=null;
document.addEventListener('selectionchange', ()=>{
  const rd=document.getElementById('reader');
  if(!rd||rd.classList.contains('hidden')) return;
  clearTimeout(rdSelT);
  rdSelT=setTimeout(()=>{
    const s=window.getSelection();
    if(!s||s.isCollapsed||!String(s).trim()){
      // өз мәзірімізді жаңа ғана аштық — жабуға болмайды
      if(RD.shownAt && Date.now()-RD.shownAt < 2000) return;
      if(!document.getElementById('rdSel').classList.contains('hidden')) return;
      return;
    }
    rdOnSelect();
  }, 350);
});
// Клик по пустому месту — закрыть меню выделения
document.getElementById('rdView')?.addEventListener('click', (e)=>{ if(!document.getElementById('rdSel').contains(e.target)) rdSelHide(); });
// Свайп по контейнеру ридера (для PDF и как запасной для EPUB)
rdSwipe(document.getElementById('rdView'), window);

// Кнопка «Тексеру» на экране ожидания
document.getElementById('checkStatusBtn')?.addEventListener('click', async () => {
  const el = document.getElementById('checkStatusHint');
  if (el) el.textContent = 'Тексерілуде…';
  try {
    const me = await api('/api/me', {});
    if (me.ok && me.registered && me.user && me.user.status === 'approved') {
      show('home');
    } else if (el) {
      el.textContent = 'Әзірше расталмаған. Кейінірек қайта тексер.';
    }
  } catch { if (el) el.textContent = 'Желі қатесі'; }
});

// Enter в полях регистрации → отправка
['firstName', 'lastName', 'patronymic', 'email', 'phone'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('submitBtn').click(); }
  });
});

// ---------- Қадам (шаги) ----------
const QD = { stepsMap: {}, today: '', leaderboard: { day: [], week: [], month: [] }, friendsBoard: { day: [], week: [], month: [] }, period: 'day', scope: 'ruh', selMonth: null };
const KK_WD = ['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб']; // index = getUTCDay()
const KK_MON_SHORT = ['Қаң', 'Ақп', 'Нау', 'Сәу', 'Мам', 'Мау', 'Шіл', 'Там', 'Қыр', 'Қаз', 'Қар', 'Жел'];
let QD_GOAL = 10000;
const QD_C = 540.35;

function qdFmt(n) { return (Number(n) || 0).toLocaleString('ru-RU'); }
function qdPad(n) { return n < 10 ? '0' + n : '' + n; }
function qdShort(s) { return s ? (s >= 1000 ? (s / 1000).toFixed(s >= 10000 ? 0 : 1) + 'к' : String(s)) : '—'; }
function qdStepsOn(d) { return QD.stepsMap[d] || 0; }
function qdSetRing(s) {
  const arc = document.getElementById('qdArc');
  arc.setAttribute('stroke-dashoffset', (QD_C * (1 - Math.min(1, (s || 0) / QD_GOAL))).toFixed(1));
  const st = document.getElementById('qdSteps');
  st.textContent = qdFmt(s);
  fitRingText(st);
}

async function loadQadam() {
  let r;
  try { r = await api('/api/steps/me', {}); } catch { return; }
  if (!r || !r.ok || !r.registered) return;
  QD.stepsMap = {};
  (r.steps || []).forEach((x) => { QD.stepsMap[x.date] = x.steps; });
  QD.today = r.today || new Date().toISOString().slice(0, 10);
  QD.leaderboard = r.leaderboard || { day: [], week: [], month: [] };
  QD.friendsBoard = r.friendsBoard || { day: [], week: [], month: [] };
  QD_GOAL = Number(r.goal) || 10000;
  const goalEl = document.getElementById('qdGoal');
  if (goalEl) goalEl.textContent = 'мақсат: ' + qdFmt(QD_GOAL);
  document.getElementById('qdToken').textContent = r.syncToken || '—';
  document.getElementById('qdUrl').textContent = location.origin + '/api/steps/push';
  QD.selMonth = null;
  qdRenderWeek();
  qdRenderMonths();
  qdHideMonth();
  qdSetRing(qdStepsOn(QD.today));
  document.getElementById('qdSelDay').textContent = 'Бүгін · ' + qdFmt(qdStepsOn(QD.today)) + ' қадам';
  qdRenderLb();
}

function qdRenderWeek() {
  const wk = document.getElementById('qdWeek');
  wk.innerHTML = '';
  const base = new Date(QD.today + 'T12:00:00Z');
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base.getTime() - i * 86400000);
    const ds = d.toISOString().slice(0, 10);
    const steps = qdStepsOn(ds);
    const el = document.createElement('div');
    el.className = 'qd-day' + (i === 0 ? ' active' : '');
    el.innerHTML = '<div class="wd">' + KK_WD[d.getUTCDay()] + '</div>' +
      '<div class="dot">' + d.getUTCDate() + '</div>' +
      '<div class="st">' + (steps ? qdFmt(steps) : '—') + '</div>';
    el.onclick = () => {
      document.querySelectorAll('.qd-day').forEach((x) => x.classList.remove('active'));
      document.querySelectorAll('.qd-cell').forEach((x) => x.classList.remove('sel'));
      el.classList.add('active');
      qdSetRing(steps);
      document.getElementById('qdSelDay').textContent =
        (i === 0 ? 'Бүгін' : d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()]) + ' · ' + qdFmt(steps) + ' қадам';
    };
    wk.appendChild(el);
  }
}

function qdRenderMonths() {
  const m = document.getElementById('qdMonths');
  m.innerHTML = '';
  KK_MON_SHORT.forEach((nm, mi) => {
    const el = document.createElement('div');
    el.className = 'qd-mon';
    el.textContent = nm;
    el.onclick = () => qdToggleMonthView(mi);
    m.appendChild(el);
  });
}

// Тап по месяцу: показать его календарь; повторный тап по активному — скрыть
function qdToggleMonthView(mi) {
  const wrap = document.getElementById('qdCalWrap');
  const shown = QD.selMonth === mi && !wrap.classList.contains('hidden');
  if (shown) { qdHideMonth(); return; }
  qdRenderMonth(mi);
}

function qdHideMonth() {
  QD.selMonth = null;
  document.getElementById('qdCalWrap').classList.add('hidden');
  document.querySelectorAll('#qdMonths .qd-mon').forEach((x) => x.classList.remove('active'));
}

function qdRenderMonth(mi) {
  QD.selMonth = mi;
  document.getElementById('qdCalWrap').classList.remove('hidden');
  const year = Number(QD.today.slice(0, 4));
  document.querySelectorAll('#qdMonths .qd-mon').forEach((x, i) => x.classList.toggle('active', i === mi));
  const active = document.querySelector('#qdMonths .qd-mon.active');
  if (active) active.scrollIntoView({ inline: 'center', block: 'nearest' });

  const n = new Date(Date.UTC(year, mi + 1, 0)).getUTCDate();
  let total = 0;
  for (let d = 1; d <= n; d++) total += qdStepsOn(year + '-' + qdPad(mi + 1) + '-' + qdPad(d));
  document.getElementById('qdMonTotal').innerHTML =
    '<b>' + qdFmt(total) + '</b> <span>қадам · ' + KK_MON_SHORT[mi] + '</span>';

  const cal = document.getElementById('qdCal');
  cal.innerHTML = '';
  const first = new Date(Date.UTC(year, mi, 1)).getUTCDay(); // 0=Sun..6=Sat
  const off = (first + 6) % 7; // Пн-первый
  for (let o = 0; o < off; o++) {
    const e = document.createElement('div');
    e.className = 'qd-cell empty';
    cal.appendChild(e);
  }
  for (let d = 1; d <= n; d++) {
    const ds = year + '-' + qdPad(mi + 1) + '-' + qdPad(d);
    const steps = qdStepsOn(ds);
    const c = document.createElement('div');
    c.className = 'qd-cell' + (ds === QD.today ? ' today' : '');
    c.innerHTML = '<div class="d">' + d + '</div><div class="s">' + (steps ? qdFmt(steps) : '') + '</div>';
    c.onclick = () => {
      document.querySelectorAll('.qd-cell').forEach((x) => x.classList.remove('sel'));
      document.querySelectorAll('.qd-day').forEach((x) => x.classList.remove('active'));
      c.classList.add('sel');
      qdSetRing(steps);
      document.getElementById('qdSelDay').textContent = d + ' ' + MONTHS[mi] + ' · ' + qdFmt(steps) + ' қадам';
    };
    cal.appendChild(c);
  }
}

function qdRenderLb() {
  const src = QD.scope === 'dostar' ? (QD.friendsBoard || {}) : (QD.leaderboard || {});
  const arr = src[QD.period] || [];
  const lb = document.getElementById('qdLb');
  lb.innerHTML = '';
  if (!arr.length) {
    lb.innerHTML = QD.scope === 'dostar'
      ? '<div class="qd-empty">Достар әлі жоқ немесе деректер жоқ. «Профиль» → «Достар» бөлімінде дос қос.</div>'
      : '<div class="qd-empty">Әзірше деректер жоқ. Қадам қосылғаннан кейін көрінеді.</div>';
    return;
  }
  arr.forEach((x, i) => {
    const el = document.createElement('div');
    el.className = 'qd-lbitem' + (x.you ? ' you' : '');
    const ini = (x.name || '?').split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
    el.innerHTML = '<div class="r">' + (i + 1) + '</div>' +
      '<div class="av">' + ini + '</div>' +
      '<div class="nm">' + x.name + (x.you ? ' <span style="color:var(--green)">(сен)</span>' : '') + '</div>' +
      '<div class="sp">' + qdFmt(x.steps) + '</div>';
    lb.appendChild(el);
  });
}

document.querySelectorAll('#qdScope button').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('#qdScope button').forEach((x) => x.classList.remove('active'));
    b.classList.add('active'); QD.scope = b.dataset.s; qdRenderLb();
  });
});
document.querySelectorAll('#qdSeg button').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('#qdSeg button').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    QD.period = b.dataset.p;
    qdRenderLb();
  });
});
document.getElementById('qdSetupBtn')?.addEventListener('click', () => {
  document.getElementById('qdSetupBox').classList.toggle('hidden');
});

// Кнопки «Көшіру» (копировать токен / адрес)
async function copyText(text) {
  if (!text) return false;
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch {}
    document.body.removeChild(ta); return ok;
  }
}
document.querySelectorAll('.qd-copy').forEach((b) => {
  b.addEventListener('click', async () => {
    const el = document.getElementById(b.dataset.copy);
    const text = el ? el.textContent.trim() : '';
    if (!text || text === '—') return;
    const ok = await copyText(text);
    const old = b.textContent;
    b.textContent = ok ? '✓ Көшірілді' : 'Қате';
    b.classList.add('done');
    tg.HapticFeedback?.notificationOccurred(ok ? 'success' : 'error');
    setTimeout(() => { b.textContent = old; b.classList.remove('done'); }, 1500);
  });
});

// ---------- Автообновление шагов ----------
let qdRefreshing = false;
async function qdRefresh(manual) {
  const screen = document.getElementById('screen-qadam');
  if (!screen || !screen.classList.contains('active')) return;
  if (qdRefreshing) return;
  qdRefreshing = true;
  const btn = document.getElementById('qdRefreshBtn');
  if (btn) btn.classList.add('spin');
  try { await loadQadam(); } catch {}
  if (manual) tg.HapticFeedback?.impactOccurred('light');
  setTimeout(() => { if (btn) btn.classList.remove('spin'); qdRefreshing = false; }, 500);
}
// Обновлять данные при возврате в приложение (например, после отправки шагов «Пәрмендер»)
document.addEventListener('visibilitychange', () => { if (!document.hidden) qdRefresh(); });
window.addEventListener('focus', () => qdRefresh());
document.getElementById('qdRefreshBtn')?.addEventListener('click', () => qdRefresh(true));

// ================= Қаржы (финансы) =================
const FIN_TABS = [
  { k: 'expense', n: 'Шығыс', kind: 'tx' },
  { k: 'income', n: 'Кіріс', kind: 'tx' },
  { k: 'qaryz', n: 'Қарыз', kind: 'debt' },
  { k: 'kredit', n: 'Кредит', kind: 'debt' },
  { k: 'bolip', n: 'Бөліп төлеу', kind: 'debt' },
  { k: 'qujat', n: 'Құнды қағаздар', kind: 'invest' },
  { k: 'tas', n: 'Бағалы тастар', kind: 'invest' },
];
const FIN_INVEST = {
  qujat: { c: '#5E5CE6', i: 'i-chart', unit: 'дана' },
  tas: { c: '#F59E0B', i: 'i-diamond', unit: 'г' },
};
const FIN_METALS = [
  { n: 'Алтын', s: 'xauusd' },
  { n: 'Күміс', s: 'xagusd' },
  { n: 'Платина', s: 'xptusd' },
  { n: 'Басқа (қолмен)', s: '' },
];
const FIN_DEBT = {
  qaryz: { c: '#8B5CF6', i: 'i-people', titleLbl: 'Кім', dueLbl: 'Қайтару күні', dir: true, monthly: false },
  kredit: { c: '#F59E0B', i: 'i-cash', titleLbl: 'Банк / атауы', dueLbl: 'Келесі төлем күні', dir: false, monthly: true },
  bolip: { c: '#06B6D4', i: 'i-cart', titleLbl: 'Тауар', dueLbl: 'Келесі төлем күні', dir: false, monthly: true },
};
let FIN_CATS = {
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
};
const FIN_ACCOUNTS = ['Қолма-қол', 'Kaspi', 'Halyk', 'Карта', 'Жинақ'];
const FIN_PER = [
  { k: 'yesterday', n: 'Кеше' },
  { k: 'today', n: 'Бүгін' },
  { k: 'week', n: 'Осы апта' },
  { k: 'month', n: 'Осы ай' },
];
const FIN = { txs: [], debts: [], assets: [], prices: {}, fx: null, tabI: 0, per: 1, menuOpen: false, perOpen: false, modalCat: null, debtMetric: 'remaining' };

// Автоподбор размера шрифта суммы в круге (чтобы большие числа влезали)
function fitRingText(el) {
  if (!el) return;
  const n = (el.textContent || '').replace(/\s/g, '').length;
  const size = n <= 6 ? 28 : n <= 8 ? 24 : n <= 10 ? 20 : n <= 12 ? 17 : 15;
  el.style.fontSize = size + 'px';
}
// Банки Казахстана (лого по домену, фолбэк — инициалы)
let BANKS = [
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
];
// Категории и банки Қаржы можно менять из админки — берём их с сервера (fallback — значения выше)
async function loadFinConfig() {
  try {
    const r = await fetch('/api/fin/config', { cache: 'no-store' });
    const j = await r.json();
    if (j && j.cats && Array.isArray(j.cats.expense) && Array.isArray(j.cats.income)) FIN_CATS = j.cats;
    if (j && Array.isArray(j.banks) && j.banks.length) BANKS = j.banks;
    const scr = document.getElementById('screen-qarjy');
    if (scr && scr.classList.contains('active') && typeof renderFin === 'function') renderFin();
  } catch {}
}
loadFinConfig();

function finRenderBanks() {
  const box = document.getElementById('finAccount');
  box.innerHTML = BANKS.map((b, i) => {
    const ini = b.n === 'Қолма-қол' ? '₸' : b.n === 'Басқа' ? '•' : b.n.slice(0, 2);
    const logo = b.d
      ? '<img src="https://www.google.com/s2/favicons?domain=' + b.d + '&sz=128" alt="" loading="eager" decoding="async" onerror="if(!this.dataset.f){this.dataset.f=1;this.src=\'https://icons.duckduckgo.com/ip3/' + b.d + '.ico\'}else{this.remove()}"/>'
      : '';
    return '<div class="fin-bank' + (i === 0 ? ' sel' : '') + '" data-n="' + b.n + '"><div class="fin-bank-ic" style="color:' + b.c + '"><span>' + ini + '</span>' + logo + '</div><div class="fin-bank-n">' + b.n + '</div></div>';
  }).join('');
  FIN.selAccount = BANKS[0].n;
  box.querySelectorAll('.fin-bank').forEach((el) => el.addEventListener('click', () => {
    box.querySelectorAll('.fin-bank').forEach((x) => x.classList.remove('sel'));
    el.classList.add('sel'); FIN.selAccount = el.dataset.n;
  }));
}

// Красивое форматирование суммы при вводе: 1000000 -> 1 000 000
function finFormatAmountInput(el) {
  const d = (el.value || '').replace(/\D/g, '');
  el.value = d ? d.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
}
['finAmount', 'finDTotal', 'finDMonthly', 'finABuy', 'finACur'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => finFormatAmountInput(el));
});

function finToday() { return new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10); }
function finShift(days) { return new Date(Date.now() + 5 * 3600 * 1000 - days * 86400000).toISOString().slice(0, 10); }
function finFmt(n) { return (Math.round(Number(n)) || 0).toLocaleString('ru-RU') + ' ₸'; }
function finCatDef(type, key) {
  const arr = FIN_CATS[type] || [];
  return arr.find((c) => c.k === key) || arr[arr.length - 1] || { n: '—', i: 'i-dots', c: '#94A3B8' };
}
function finInPeriod(date, perKey) {
  const t = finToday();
  if (perKey === 'today') return date === t;
  if (perKey === 'yesterday') return date === finShift(1);
  if (perKey === 'week') return date >= finShift(6);
  if (perKey === 'month') return date >= t.slice(0, 8) + '01';
  return true;
}

async function loadFin() {
  try {
    const [r1, r2, r3] = await Promise.all([api('/api/fin/list', {}), api('/api/fin/debt/list', {}), api('/api/fin/asset/list', {})]);
    if (r1 && r1.ok) FIN.txs = r1.txs || [];
    if (r2 && r2.ok) FIN.debts = r2.debts || [];
    if (r3 && r3.ok) FIN.assets = r3.assets || [];
  } catch {}
  renderFin();
  finLoadPrices();
}
async function finLoadPrices() {
  const syms = new Set();
  FIN.assets.forEach((a) => { if ((a.market === 'us' || a.market === 'metal') && a.symbol) syms.add(a.symbol); });
  if (!syms.size) { FIN.prices = {}; FIN.fx = null; return; }
  syms.add('usdkzt');
  try {
    const r = await fetch('/api/fin/prices?symbols=' + encodeURIComponent([...syms].join(',')));
    const j = await r.json();
    FIN.prices = (j && j.prices) || {};
    FIN.fx = FIN.prices['usdkzt'] || null;
  } catch { FIN.prices = {}; FIN.fx = null; }
  if (FIN_TABS[FIN.tabI].kind === 'invest') renderFin();
}
function finAssetCur(a) {
  if (a.market === 'us' && a.symbol && FIN.prices[a.symbol] && FIN.fx) return FIN.prices[a.symbol] * FIN.fx;
  if (a.market === 'metal' && a.symbol && FIN.prices[a.symbol] && FIN.fx) return FIN.prices[a.symbol] / 31.1035 * FIN.fx;
  return a.curManual || a.buyPrice;
}
function finAssetLive(a) {
  return (a.market === 'us' || a.market === 'metal') && a.symbol && FIN.prices[a.symbol] && FIN.fx;
}

function renderFin() {
  const tab = FIN_TABS[FIN.tabI];
  document.getElementById('finTabName').textContent = tab.n;
  finRenderTabMenu();

  const kind = tab.kind;
  const isInvest = kind === 'invest';
  const showCircle = kind === 'tx' || kind === 'debt';
  document.getElementById('finCircle').style.display = showCircle ? 'block' : 'none';
  document.getElementById('finCats').style.display = kind === 'tx' ? 'flex' : 'none';
  document.getElementById('finList').style.display = (showCircle || isInvest) ? 'flex' : 'none';
  document.getElementById('finInvestHead').classList.toggle('hidden', !isInvest);
  document.getElementById('finNoCircle').classList.toggle('hidden', kind !== 'soon');
  if (kind === 'soon') { document.getElementById('finNoCircleT').textContent = tab.n; return; }
  if (kind === 'debt') { renderDebt(tab.k); return; }
  if (kind === 'invest') { renderInvest(tab.k); return; }

  const type = tab.k;
  const perKey = FIN_PER[FIN.per].k;
  document.getElementById('finPeriodName').textContent = FIN_PER[FIN.per].n;
  finRenderPerMenu();

  const typed = FIN.txs.filter((x) => x.type === type);
  const periodTx = typed.filter((x) => finInPeriod(x.date, perKey));
  const periodSum = periodTx.reduce((s, x) => s + x.amount, 0);
  const monthSum = typed.filter((x) => finInPeriod(x.date, 'month')).reduce((s, x) => s + x.amount, 0);

  const rv = document.getElementById('finRingVal');
  rv.textContent = finFmt(periodSum);
  fitRingText(rv);
  const frac = monthSum > 0 ? Math.min(1, periodSum / monthSum) : 0;
  document.getElementById('finArc').setAttribute('stroke-dashoffset', (540.35 * (1 - frac)).toFixed(1));

  finRenderCats(type, periodTx, periodSum);
  finRenderList(type, periodTx);
}

function finRenderTabMenu() {
  const m = document.getElementById('finTabMenu');
  m.classList.toggle('hidden', !FIN.menuOpen);
  m.innerHTML = FIN_TABS.map((t, i) =>
    '<div class="fin-mi' + (i === FIN.tabI ? ' active' : '') + '" data-i="' + i + '">' + t.n +
    (i === FIN.tabI ? '<svg class="ic-svg" viewBox="0 0 24 24"><use href="#i-check"></use></svg>' : '') + '</div>'
  ).join('');
  m.querySelectorAll('[data-i]').forEach((el) => el.addEventListener('click', (e) => {
    e.stopPropagation(); FIN.tabI = +el.dataset.i; FIN.menuOpen = false; FIN.perOpen = false; renderFin();
  }));
}

function finRenderPerMenu() {
  const m = document.getElementById('finPeriodMenu');
  m.classList.toggle('hidden', !FIN.perOpen);
  m.innerHTML = FIN_PER.map((p, i) =>
    '<div class="fin-mi' + (i === FIN.per ? ' active' : '') + '" data-p="' + i + '">' + p.n +
    (i === FIN.per ? '<svg class="ic-svg" viewBox="0 0 24 24"><use href="#i-check"></use></svg>' : '') + '</div>'
  ).join('');
  m.querySelectorAll('[data-p]').forEach((el) => el.addEventListener('click', (e) => {
    e.stopPropagation(); FIN.per = +el.dataset.p; FIN.perOpen = false; renderFin();
  }));
}

function finRenderCats(type, periodTx, total) {
  const box = document.getElementById('finCats');
  const sums = {};
  periodTx.forEach((x) => { sums[x.category] = (sums[x.category] || 0) + x.amount; });
  const rows = Object.entries(sums).sort((a, b) => b[1] - a[1]);
  if (!rows.length) { box.innerHTML = ''; return; }
  box.innerHTML = rows.map(([key, sum]) => {
    const d = finCatDef(type, key);
    const pct = total > 0 ? Math.round((sum / total) * 100) : 0;
    return '<div class="fin-catrow"><div class="top">' +
      '<div class="fin-cat-ic" style="background:' + d.c + '22;color:' + d.c + '"><svg class="ic-svg" viewBox="0 0 24 24"><use href="#' + d.i + '"></use></svg></div>' +
      '<div class="nm">' + d.n + '</div><div class="am">' + finFmt(sum) + '</div><div class="pct">' + pct + '%</div></div>' +
      '<div class="fin-bar"><span style="width:' + pct + '%;background:' + d.c + '"></span></div></div>';
  }).join('');
}

function finRenderList(type, periodTx) {
  const box = document.getElementById('finList');
  if (!periodTx.length) { box.innerHTML = '<div class="fin-empty">Әзірше жазба жоқ. «+» арқылы қос.</div>'; return; }
  box.innerHTML = periodTx.map((x) => {
    const d = finCatDef(type, x.category);
    const sub = [x.account, x.note].filter(Boolean).join(' · ') || d.n;
    return '<div class="fin-item">' +
      '<div class="ic-c" style="background:' + d.c + '22;color:' + d.c + '"><svg class="ic-svg" viewBox="0 0 24 24"><use href="#' + d.i + '"></use></svg></div>' +
      '<div class="mid"><div class="nm">' + d.n + '</div><div class="sb">' + sub + '</div></div>' +
      '<div class="rt"><div class="am" style="color:' + (type === 'income' ? '#22C55E' : 'var(--text)') + '">' + (type === 'income' ? '+' : '−') + finFmt(x.amount) + '</div><div class="dt">' + x.date.slice(5) + '</div></div>' +
      '<button class="del" data-id="' + x.id + '" aria-label="Жою"><svg class="ic-svg" viewBox="0 0 24 24"><use href="#i-trash"></use></svg></button></div>';
  }).join('');
  box.querySelectorAll('.del').forEach((el) => el.addEventListener('click', async () => {
    tg.HapticFeedback?.impactOccurred('light');
    try { await api('/api/fin/delete', { id: el.dataset.id }); } catch {}
    await loadFin();
  }));
}

// ----- Инвестиции (портфель) -----
function renderInvest(kind) {
  const def = FIN_INVEST[kind];
  const assets = FIN.assets.filter((a) => a.kind === kind);
  let invested = 0, value = 0;
  assets.forEach((a) => { invested += a.qty * a.buyPrice; value += a.qty * finAssetCur(a); });
  const pl = value - invested;
  const plPct = invested > 0 ? (pl / invested) * 100 : 0;
  const plColor = pl > 0 ? '#16a34a' : pl < 0 ? '#dc2626' : 'var(--green-soft)';
  const sgn = pl > 0 ? '+' : pl < 0 ? '−' : '';
  document.getElementById('finInvestHead').innerHTML =
    '<div class="fin-pv-cap">Портфель құны</div>' +
    '<div class="fin-pv">' + finFmt(value) + '</div>' +
    '<div class="fin-pl" style="color:' + plColor + '">' + sgn + finFmt(Math.abs(pl)) + ' · ' + sgn + Math.abs(plPct).toFixed(1) + '%</div>' +
    '<div class="fin-pv-sub">Салынған: ' + finFmt(invested) + (FIN.fx ? '' : ' · онлайн баға жүктелуде…') + '</div>';

  const box = document.getElementById('finList');
  if (!assets.length) { box.innerHTML = '<div class="fin-empty">Әзірше актив жоқ. «+» арқылы қос.</div>'; return; }
  box.innerHTML = assets.map((a) => {
    const cur = finAssetCur(a);
    const av = a.qty * cur, ai = a.qty * a.buyPrice;
    const p = av - ai, ppct = ai > 0 ? (p / ai) * 100 : 0;
    const col = p > 0 ? '#16a34a' : p < 0 ? '#dc2626' : 'var(--green-soft)';
    const s = p > 0 ? '+' : p < 0 ? '−' : '';
    const live = finAssetLive(a) ? '' : ' <span class="fin-manual">қолмен</span>';
    const sub = a.qty + ' ' + (a.unit === 'gram' ? 'г' : def.unit) + ' · ' + finFmt(cur) + live;
    return '<div class="fin-item">' +
      '<div class="ic-c" style="background:' + def.c + '22;color:' + def.c + '"><svg class="ic-svg" viewBox="0 0 24 24"><use href="#' + def.i + '"></use></svg></div>' +
      '<div class="mid"><div class="nm">' + a.name + '</div><div class="sb">' + sub + '</div></div>' +
      '<div class="rt"><div class="am">' + finFmt(av) + '</div><div class="dt" style="color:' + col + '">' + s + Math.abs(ppct).toFixed(1) + '%</div></div>' +
      '<button class="del" data-del="' + a.id + '" aria-label="Жою"><svg class="ic-svg" viewBox="0 0 24 24"><use href="#i-trash"></use></svg></button></div>';
  }).join('');
  box.querySelectorAll('.del[data-del]').forEach((el) => el.addEventListener('click', async () => {
    tg.HapticFeedback?.impactOccurred('light');
    try { await api('/api/fin/asset/delete', { id: el.dataset.del }); } catch {}
    await loadFin();
  }));
}
function finNormTicker(t) { t = (t || '').trim().toLowerCase(); if (!t) return ''; return t.includes('.') ? t : t + '.us'; }
function finOpenAssetModal(kind) {
  const m = document.getElementById('finAssetModal');
  m.dataset.kind = kind;
  document.getElementById('finAssetTitle').textContent = FIN_TABS[FIN.tabI].n + ' қосу';
  const isQujat = kind === 'qujat';
  document.getElementById('finATickerWrap').classList.toggle('hidden', !isQujat);
  document.getElementById('finATypeWrap').classList.toggle('hidden', isQujat);
  document.getElementById('finAQtyLbl').textContent = 'Саны (' + (isQujat ? 'дана' : 'грамм') + ')';
  document.getElementById('finABuyLbl').textContent = 'Сатып алу бағасы / ' + (isQujat ? 'дана' : 'г');
  ['finAName', 'finATicker', 'finAQty', 'finABuy', 'finACur', 'finANote'].forEach((id) => { document.getElementById(id).value = ''; });
  if (!isQujat) {
    const sel = document.getElementById('finAType');
    sel.innerHTML = FIN_METALS.map((mt, i) => '<option value="' + i + '">' + mt.n + '</option>').join('');
    sel.value = '0';
  }
  document.getElementById('finAHint').textContent = '';
  m.classList.remove('hidden');
}
function finCloseAssetModal() { document.getElementById('finAssetModal').classList.add('hidden'); }
document.getElementById('finAssetClose')?.addEventListener('click', finCloseAssetModal);
document.getElementById('finAssetModal')?.addEventListener('click', (e) => { if (e.target.id === 'finAssetModal') finCloseAssetModal(); });
document.getElementById('finASave')?.addEventListener('click', async () => {
  const kind = document.getElementById('finAssetModal').dataset.kind || 'qujat';
  const hint = document.getElementById('finAHint');
  const name = document.getElementById('finAName').value.trim();
  const qty = Number((document.getElementById('finAQty').value || '').replace(',', '.')) || 0;
  const buyPrice = Math.round(Number((document.getElementById('finABuy').value || '').replace(/\s/g, '')) || 0);
  if (!name) { hint.textContent = 'Атауын жаз'; return; }
  if (qty <= 0) { hint.textContent = 'Санын енгіз'; return; }
  if (buyPrice <= 0) { hint.textContent = 'Сатып алу бағасын енгіз'; return; }
  let market = 'manual', symbol = '', unit = 'piece';
  if (kind === 'qujat') {
    const tick = finNormTicker(document.getElementById('finATicker').value);
    if (tick) { market = 'us'; symbol = tick; unit = 'share'; } else { market = 'manual'; unit = 'share'; }
  } else {
    const mt = FIN_METALS[+document.getElementById('finAType').value] || FIN_METALS[3];
    if (mt.s) { market = 'metal'; symbol = mt.s; unit = 'gram'; } else { market = 'manual'; unit = 'piece'; }
  }
  const curManual = Math.max(0, Math.round(Number((document.getElementById('finACur').value || '').replace(/\s/g, '')) || 0));
  hint.textContent = 'Сақталуда…';
  try {
    const r = await api('/api/fin/asset/add', { kind, name, market, symbol, qty, buyPrice, curManual, unit });
    if (r && r.ok) { tg.HapticFeedback?.notificationOccurred('success'); finCloseAssetModal(); await loadFin(); }
    else hint.textContent = 'Қате: ' + ((r && r.error) || '');
  } catch { hint.textContent = 'Қате'; }
});

// ----- Долги/кредиты/рассрочка -----
function renderDebt(kind) {
  const def = FIN_DEBT[kind];
  const debts = FIN.debts.filter((d) => d.kind === kind);
  const totalAll = debts.reduce((s, d) => s + d.total, 0);
  const paidAll = debts.reduce((s, d) => s + Math.min(d.paid, d.total), 0);
  const remainAll = Math.max(0, totalAll - paidAll);
  const m = FIN.debtMetric;
  const val = m === 'paid' ? paidAll : m === 'total' ? totalAll : remainAll;
  const mlabel = m === 'paid' ? 'Төленген' : m === 'total' ? 'Барлығы' : 'Қалдық';
  const rv = document.getElementById('finRingVal');
  rv.textContent = finFmt(val);
  fitRingText(rv);
  document.getElementById('finPeriodName').textContent = mlabel;
  const pm = document.getElementById('finPeriodMenu');
  pm.classList.toggle('hidden', !FIN.perOpen);
  const METRICS = [['remaining', 'Қалдық'], ['paid', 'Төленген'], ['total', 'Барлығы']];
  pm.innerHTML = METRICS.map(([mk, ml]) =>
    '<div class="fin-mi' + (FIN.debtMetric === mk ? ' active' : '') + '" data-m="' + mk + '">' + ml +
    (FIN.debtMetric === mk ? '<svg class="ic-svg" viewBox="0 0 24 24"><use href="#i-check"></use></svg>' : '') + '</div>').join('');
  pm.querySelectorAll('[data-m]').forEach((el) => el.addEventListener('click', (e) => {
    e.stopPropagation(); FIN.debtMetric = el.dataset.m; FIN.perOpen = false; renderFin();
  }));
  const frac = totalAll > 0 ? Math.min(1, paidAll / totalAll) : 0;
  document.getElementById('finArc').setAttribute('stroke-dashoffset', (540.35 * (1 - frac)).toFixed(1));

  const box = document.getElementById('finList');
  if (!debts.length) { box.innerHTML = '<div class="fin-empty">Әзірше жазба жоқ. «+» арқылы қос.</div>'; return; }
  box.innerHTML = debts.map((d) => {
    const remaining = Math.max(0, d.total - d.paid);
    const pct = d.total > 0 ? Math.round((d.paid / d.total) * 100) : 0;
    let payLbl = 'Төлеу';
    if (kind === 'qaryz') payLbl = d.direction === 'lent' ? 'Қайтарылды' : 'Қайтару';
    const badge = kind === 'qaryz'
      ? '<span class="fin-dir ' + (d.direction === 'lent' ? 'lent' : 'bor') + '">' + (d.direction === 'lent' ? 'Бердім' : 'Алдым') + '</span>' : '';
    const sub = 'Қалдық: ' + finFmt(remaining) + ' / ' + finFmt(d.total) + (d.dueDate ? ' · ' + d.dueDate.slice(5) : '');
    const action = d.done
      ? '<span class="fin-done">Жабылды</span>'
      : '<button class="fin-pay" data-id="' + d.id + '">' + payLbl + '</button>';
    return '<div class="fin-item fin-debt">' +
      '<div class="ic-c" style="background:' + def.c + '22;color:' + def.c + '"><svg class="ic-svg" viewBox="0 0 24 24"><use href="#' + def.i + '"></use></svg></div>' +
      '<div class="mid"><div class="nm">' + d.title + badge + '</div><div class="sb">' + sub + '</div>' +
      '<div class="fin-bar" style="margin-top:6px"><span style="width:' + pct + '%;background:' + def.c + '"></span></div></div>' +
      '<div class="rt">' + action + '</div>' +
      '<button class="del" data-del="' + d.id + '" aria-label="Жою"><svg class="ic-svg" viewBox="0 0 24 24"><use href="#i-trash"></use></svg></button></div>';
  }).join('');
  box.querySelectorAll('.fin-pay').forEach((el) => el.addEventListener('click', async () => {
    el.disabled = true; tg.HapticFeedback?.impactOccurred('medium');
    try { await api('/api/fin/debt/pay', { id: el.dataset.id }); } catch {}
    await loadFin();
  }));
  box.querySelectorAll('.del[data-del]').forEach((el) => el.addEventListener('click', async () => {
    tg.HapticFeedback?.impactOccurred('light');
    try { await api('/api/fin/debt/delete', { id: el.dataset.del }); } catch {}
    await loadFin();
  }));
}
function finCycleMetric() {
  FIN.debtMetric = FIN.debtMetric === 'remaining' ? 'paid' : FIN.debtMetric === 'paid' ? 'total' : 'remaining';
  renderFin();
}
function finOpenDebtModal(kind) {
  const def = FIN_DEBT[kind];
  document.getElementById('finDebtModal').dataset.kind = kind;
  document.getElementById('finDebtTitle').textContent = FIN_TABS[FIN.tabI].n + ' қосу';
  document.getElementById('finDTitleLbl').textContent = def.titleLbl;
  document.getElementById('finDDueLbl').textContent = def.dueLbl;
  document.getElementById('finDDirWrap').classList.toggle('hidden', !def.dir);
  document.getElementById('finDMonthlyWrap').classList.toggle('hidden', !def.monthly);
  ['finDTitle', 'finDTotal', 'finDMonthly', 'finDDue', 'finDNote'].forEach((id) => { document.getElementById(id).value = ''; });
  document.getElementById('finDRemind').checked = true;
  document.getElementById('finDHint').textContent = '';
  document.querySelectorAll('#finDDir button').forEach((b, i) => b.classList.toggle('active', i === 0));
  FIN.debtDir = 'borrowed';
  document.getElementById('finDebtModal').classList.remove('hidden');
}
function finCloseDebtModal() { document.getElementById('finDebtModal').classList.add('hidden'); }

document.querySelectorAll('#finDDir button').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('#finDDir button').forEach((x) => x.classList.remove('active'));
  b.classList.add('active'); FIN.debtDir = b.dataset.d;
}));
document.getElementById('finDebtClose')?.addEventListener('click', finCloseDebtModal);
document.getElementById('finDebtModal')?.addEventListener('click', (e) => { if (e.target.id === 'finDebtModal') finCloseDebtModal(); });
document.getElementById('finDSave')?.addEventListener('click', async () => {
  const kind = document.getElementById('finDebtModal').dataset.kind || 'kredit';
  const def = FIN_DEBT[kind];
  const hint = document.getElementById('finDHint');
  const title = document.getElementById('finDTitle').value.trim();
  const total = Math.round(Number((document.getElementById('finDTotal').value || '').replace(/\s/g, '')) || 0);
  if (!title) { hint.textContent = 'Атауын жаз'; return; }
  if (total <= 0) { hint.textContent = 'Жалпы соманы енгіз'; return; }
  hint.textContent = 'Сақталуда…';
  try {
    const r = await api('/api/fin/debt/add', {
      kind, title, total,
      monthly: def.monthly ? Math.round(Number((document.getElementById('finDMonthly').value || '').replace(/\s/g, '')) || 0) : 0,
      direction: def.dir ? (FIN.debtDir || 'borrowed') : '',
      dueDate: document.getElementById('finDDue').value || '',
      remind: document.getElementById('finDRemind').checked,
      note: document.getElementById('finDNote').value.trim(),
    });
    if (r && r.ok) { tg.HapticFeedback?.notificationOccurred('success'); finCloseDebtModal(); await loadFin(); }
    else hint.textContent = 'Қате: ' + ((r && r.error) || '');
  } catch { hint.textContent = 'Қате'; }
});

// ----- Модалка добавления -----
function finOpenModal(type) {
  document.getElementById('finModalTitle').textContent = (type === 'income' ? 'Кіріс' : 'Шығыс') + ' қосу';
  const pick = document.getElementById('finCatPick');
  FIN.modalCat = null;
  pick.innerHTML = (FIN_CATS[type] || []).map((c) =>
    '<div class="fin-chip" data-c="' + c.k + '"><div class="cic" style="background:' + c.c + '22;color:' + c.c + '"><svg class="ic-svg" viewBox="0 0 24 24"><use href="#' + c.i + '"></use></svg></div><div class="cl">' + c.n + '</div></div>'
  ).join('');
  pick.querySelectorAll('.fin-chip').forEach((el) => el.addEventListener('click', () => {
    pick.querySelectorAll('.fin-chip').forEach((x) => x.classList.remove('sel'));
    el.classList.add('sel'); FIN.modalCat = el.dataset.c;
  }));
  finRenderBanks();
  document.getElementById('finDate').value = finToday();
  document.getElementById('finAmount').value = '';
  document.getElementById('finNote').value = '';
  document.getElementById('finSaveHint').textContent = '';
  document.getElementById('finModal').classList.remove('hidden');
  document.getElementById('finModal').dataset.type = type;
  setTimeout(() => document.getElementById('finAmount').focus(), 60);
}
function finCloseModal() { document.getElementById('finModal').classList.add('hidden'); }

document.getElementById('finTabBtn')?.addEventListener('click', (e) => { e.stopPropagation(); FIN.menuOpen = !FIN.menuOpen; FIN.perOpen = false; renderFin(); });
document.getElementById('finPeriodBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  FIN.perOpen = !FIN.perOpen; FIN.menuOpen = false; renderFin();
});
document.addEventListener('click', () => { if (FIN.menuOpen || FIN.perOpen) { FIN.menuOpen = false; FIN.perOpen = false; renderFin(); } });
document.getElementById('finAddBtn')?.addEventListener('click', () => {
  const tab = FIN_TABS[FIN.tabI];
  if (tab.kind === 'tx') finOpenModal(tab.k);
  else if (tab.kind === 'debt') finOpenDebtModal(tab.k);
  else if (tab.kind === 'invest') finOpenAssetModal(tab.k);
  else tg.HapticFeedback?.notificationOccurred('warning');
});
document.getElementById('finModalClose')?.addEventListener('click', finCloseModal);
document.getElementById('finModal')?.addEventListener('click', (e) => { if (e.target.id === 'finModal') finCloseModal(); });
document.getElementById('finSave')?.addEventListener('click', async () => {
  const type = document.getElementById('finModal').dataset.type || 'expense';
  const amount = Math.round(Number((document.getElementById('finAmount').value || '').replace(/\s/g, '')) || 0);
  const hint = document.getElementById('finSaveHint');
  if (amount <= 0) { hint.textContent = 'Соманы енгіз'; return; }
  if (!FIN.modalCat) { hint.textContent = 'Категорияны таңда'; return; }
  hint.textContent = 'Сақталуда…';
  try {
    const r = await api('/api/fin/add', {
      type, amount, category: FIN.modalCat,
      account: FIN.selAccount || '',
      date: document.getElementById('finDate').value || finToday(),
      note: document.getElementById('finNote').value.trim(),
    });
    if (r && r.ok) { tg.HapticFeedback?.notificationOccurred('success'); finCloseModal(); await loadFin(); }
    else hint.textContent = 'Қате: ' + ((r && r.error) || '');
  } catch (e) { hint.textContent = 'Қате'; }
});

// ---------- Достар (друзья) ----------
function frIni(n) { return (n || '?').split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase(); }
async function loadFriends() {
  let r;
  try { r = await api('/api/friends/me', {}); } catch { return; }
  if (!r || !r.ok) return;
  document.getElementById('frCode').textContent = r.code || '—';
  renderFriends(r);
}
function renderFriends(r) {
  const inc = document.getElementById('frIncoming');
  inc.innerHTML = (r.incoming || []).length
    ? '<div class="qd-note">Сұраныстар:</div>' + r.incoming.map((f) =>
      '<div class="fr-item"><div class="fr-av">' + frIni(f.name) + '</div><div class="fr-nm">' + f.name + '</div>' +
      '<button class="fr-ok" data-acc="' + f.id + '">Растау</button>' +
      '<button class="fr-x" data-rem="' + f.id + '" aria-label="Бас тарту"><svg class="ic-svg" viewBox="0 0 24 24"><use href="#i-x"></use></svg></button></div>').join('')
    : '';
  const list = document.getElementById('frList');
  list.innerHTML = (r.friends || []).length
    ? '<div class="qd-note">Достарым (' + r.friends.length + '):</div>' + r.friends.map((f) =>
      '<div class="fr-item"><div class="fr-av">' + frIni(f.name) + '</div><div class="fr-nm">' + f.name + '</div>' +
      '<button class="fr-x" data-rem="' + f.id + '" aria-label="Өшіру"><svg class="ic-svg" viewBox="0 0 24 24"><use href="#i-trash"></use></svg></button></div>').join('')
    : '<div class="qd-empty">Әзірше досың жоқ. Кодыңды досыңа беріп, оны қос.</div>';
  document.querySelectorAll('#frIncoming [data-acc]').forEach((el) => el.addEventListener('click', async () => {
    tg.HapticFeedback?.impactOccurred('light');
    try { await api('/api/friends/accept', { id: Number(el.dataset.acc) }); } catch {}
    await loadFriends(); loadQadam();
  }));
  document.querySelectorAll('#frIncoming [data-rem], #frList [data-rem]').forEach((el) => el.addEventListener('click', async () => {
    try { await api('/api/friends/remove', { id: Number(el.dataset.rem) }); } catch {}
    await loadFriends(); loadQadam();
  }));
}
document.getElementById('frAddBtn')?.addEventListener('click', async () => {
  const inp = document.getElementById('frAddInput');
  const hint = document.getElementById('frAddHint');
  const code = inp.value.trim().toUpperCase();
  if (!code) { hint.textContent = 'Кодты енгіз'; return; }
  hint.textContent = 'Жіберілуде…';
  try {
    const r = await api('/api/friends/add', { code });
    if (r && r.ok) { hint.textContent = r.accepted ? '✅ Дос қосылды' : '✅ Сұраныс жіберілді'; inp.value = ''; await loadFriends(); loadQadam(); }
    else hint.textContent = (r && r.error) || 'Қате';
  } catch { hint.textContent = 'Қате'; }
});
document.getElementById('frAddInput')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('frAddBtn').click(); });

// ---------- Профиль: имя ----------
function setProfileName(user) {
  const el = document.getElementById('profileName');
  if (!el) return;
  const name = user
    ? `${user.lastName || user.last_name || ''} ${user.firstName || user.first_name || ''}`.trim()
    : '';
  el.textContent = name || 'Профиль';
}

// ---------- Старт ----------
async function init() {
  initThemeControls();
  fillDates();
  setProfileName(tg.initDataUnsafe && tg.initDataUnsafe.user);
  try {
    const me = await api('/api/me', {});
    if (me.ok && me.registered) {
      if (me.user) setProfileName(me.user);
      show(me.user && me.user.status === 'approved' ? 'home' : 'pending');
    } else {
      show('register');
    }
  } catch {
    show('register');
  }
}
init();


/* ================= ОҚУ ЗАЛЫ (басты бет) ================= */
const ROOM = { tab:'board', timer:null, quotes:[], board:[], comments:[] };
function roomEsc(s){ return String(s==null?'':s).replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

async function loadRoom(){
  try{
    const r = await api('/api/book/room', {});
    if(!r.ok) return;
    const seats = document.getElementById('roomSeats');
    const cnt = document.getElementById('roomCount');
    let list = r.readers || [];
    cnt.textContent = list.length ? (list.length + ' адам қазір оқып отыр') : 'Әзірге ешкім оқымай тұр';
    const mine = list.some(x=>x.me);
    const lanes=[];
    const place=(p)=>{ for(let L=0;L<3;L++){ if(!lanes[L]) lanes[L]=[]; if(lanes[L].every(v=>Math.abs(v-p)>13)){ lanes[L].push(p); return L; } } return 0; };
    if(!list.some(x=>x.me) && ROOM.myPercent>0){
      list=list.concat([{ telegramId:'me', name:'Сен', initial:'С', percent:ROOM.myPercent, page:ROOM.myPage||1, me:true, idle:true }]);
    }
    const sorted=[...list].sort((a,b)=>a.percent-b.percent);
    const maxP = sorted.length ? Math.max(...sorted.map(x=>x.percent)) : 0;
    const marks = sorted.map((x)=>{
      const p=Math.max(0,Math.min(100,x.percent));
      const lane=place(p);
      return '<div class="mk'+(x.me?' me':'')+(x.idle?' idle':'')+'" style="left:'+p+'%;--lane:'+lane+'" data-nm="'+roomEsc(x.me?'Сен':x.name)+'" data-pg="'+p+'% · '+x.page+'-бет">'+
        '<span class="mk-stem"></span>'+
        '<span class="mk-dot">'+roomEsc(x.initial)+'</span>'+
        '<span class="mk-lbl">'+(x.me?('Сен · '+p+'%'):roomEsc(x.name))+'</span></div>';
    }).join('');
    const html =
      '<div class="track">'+
        '<div class="track-line"><i style="width:'+maxP+'%"></i></div>'+
        '<span class="track-cap start">0</span><span class="track-cap end">100%</span>'+
        marks+
      '</div>';
    seats.innerHTML = html;
    seats.querySelectorAll('.mk').forEach(el=>el.addEventListener('click', ()=>{ el.classList.toggle('open'); }));
  }catch{}
}

async function loadRoomStats(){
  try{
    const r = await api('/api/book/stats/me', {});
    if(!r.ok) return;
    document.getElementById('stWeek').textContent = r.totalMin || 0;
    document.getElementById('stPages').textContent = r.totalPages || 0;
    document.getElementById('stStreak').textContent = r.streak || 0;
  }catch{}
}

async function roomRender(){
  const pane = document.getElementById('roomPane');
  if(!pane) return;
  if(ROOM.tab==='board'){
    pane.innerHTML = '<div class="rp-empty">Жүктелуде…</div>';
    const r = await api('/api/book/board', {});
    const b = (r && r.board) || [];
    pane.innerHTML = b.length ? b.map((x,i)=>(
      '<div class="rp-row'+(x.me?' me':'')+'"><div class="rp-rank">'+(i+1)+'</div>'+
      '<div class="rp-main"><div class="rp-nm">'+roomEsc(x.me?'Сен':x.name)+'</div>'+
      '<div class="rp-bar"><i style="width:'+Math.min(100,x.percent)+'%"></i></div></div>'+
      '<div class="rp-pct">'+x.percent+'%</div></div>'
    )).join('') : '<div class="rp-empty">Әзірге оқыған ешкім жоқ</div>';
  }
  else if(ROOM.tab==='quotes'){
    pane.innerHTML = '<div class="rp-empty">Жүктелуде…</div>';
    const r = await api('/api/book/quote/list', {});
    ROOM.quotes = (r && r.quotes) || [];
    pane.innerHTML = ROOM.quotes.length ? ROOM.quotes.map((q)=>(
      '<div class="rp-q"><div class="q-txt" style="border-color:'+roomEsc(q.color||'#F6C945')+'">'+roomEsc(q.text)+'</div>'+
      '<div class="q-foot"><span>'+roomEsc(q.name)+(q.book?(' · '+roomEsc(q.book)):'')+' · '+q.ch+'-бөлім</span>'+
      '<span><button class="rp-like'+(q.liked?' on':'')+'" data-like="'+q.id+'">'+
      '<svg class="ic-svg" viewBox="0 0 24 24"><use href="#i-heart"/></svg>'+q.likes+'</button>'+
      (q.mine?'<button class="rp-like" data-delq="'+q.id+'">жою</button>':'')+'</span></div></div>'
    )).join('') : '<div class="rp-empty">Кітаптан мәтінді ерекшелеп, «Бөлісу» бас — осы жерде шығады</div>';
    pane.querySelectorAll('[data-like]').forEach(el=>el.addEventListener('click', async ()=>{
      const r2 = await api('/api/book/quote/like', { id: el.dataset.like });
      if(r2 && r2.ok) roomRender();
    }));
    pane.querySelectorAll('[data-delq]').forEach(el=>el.addEventListener('click', async ()=>{
      if(!confirm('Дәйексөзді жоямыз ба?')) return;
      await api('/api/book/quote/delete', { id: el.dataset.delq }); roomRender();
    }));
  }
  else {
    const r = await api('/api/book/comment/list', {});
    const cs = (r && r.comments) || [];
    const body = cs.length ? cs.map((c)=>(
      '<div class="rp-q"><div style="font-size:14px;line-height:1.5">'+roomEsc(c.text)+'</div>'+
      '<div class="q-foot"><span>'+roomEsc(c.name)+' · '+c.ch+'-бөлім</span>'+
      (c.mine?'<button class="rp-like" data-delc="'+c.id+'">жою</button>':'')+'</div></div>'
    )).join('') : '<div class="rp-empty">Әзірге пікір жоқ — бірінші болып жаз</div>';
    pane.innerHTML = '<div class="rp-add"><input id="rcInput" placeholder="Пікіріңді жаз…" maxlength="500"/><button id="rcSend">Жіберу</button></div>'+body;
    const send=async ()=>{
      const inp=document.getElementById('rcInput'); const t=(inp.value||'').trim();
      if(!t) return;
      inp.value='';
      await api('/api/book/comment/add', { text:t, ch:(typeof RD!=='undefined' && RD.ch!=null ? RD.ch+1 : 0) });
      roomRender();
    };
    document.getElementById('rcSend').addEventListener('click', send);
    document.getElementById('rcInput').addEventListener('keydown', (e)=>{ if(e.key==='Enter') send(); });
    pane.querySelectorAll('[data-delc]').forEach(el=>el.addEventListener('click', async ()=>{
      await api('/api/book/comment/delete', { id: el.dataset.delc }); roomRender();
    }));
  }
}

document.querySelectorAll('#roomSeg button').forEach(b=>b.addEventListener('click', ()=>{
  document.querySelectorAll('#roomSeg button').forEach(x=>x.classList.remove('on'));
  b.classList.add('on'); ROOM.tab=b.dataset.rs; roomRender();
}));
document.getElementById('roomRefresh')?.addEventListener('click', ()=>{ loadRoom(); loadRoomStats(); roomRender(); });
document.getElementById('roomSit')?.addEventListener('click', ()=>{ const b=document.getElementById('readBookBtn'); if(b) b.click(); });

const RQ_AUTHOR=[
  { t:'Кел, балалар, оқылық!', a:'Ыбырай Алтынсарин' },
  { t:'Ғылым таппай мақтанба', a:'Абай Құнанбайұлы' },
  { t:'Білімдіден шыққан сөз, талаптыға болсын кез', a:'Абай Құнанбайұлы' },
];
const RQ_PROVERB=["Оқу — білім бұлағы, білім — өмір шырағы","Білекті бірді жығады, білімді мыңды жығады","Оқыған озар, оқымаған тозар","Кітап — білім бұлағы","Білім — таусылмас қазына","Кітапсыз үй — терезесіз үй","Жақсы кітап — жан азығы","Оқу инемен құдық қазғандай","Білімдіге дүние жарық, білімсіздің күні кәріп","Көп оқыған көп біледі","Аз сөйле, көп тыңда","Білгенге маржан, білмеске арзан","Ғылым — теңіз, білім — қайық","Ұстазы жақсының — ұстамы жақсы","Оқусыз білім жоқ, білімсіз күнің жоқ","Кітап — адал дос","Білім — қуат","Оқу — жақсылықтың бастауы","Тіл — ойдың кілті, кітап — білімнің кілті","Еңбек түбі — береке, білім түбі — мереке","Жасында білім алмаған, қартайғанда өкінер","Білім — ақылдың шырағы","Ойлы адам — оқыған адам","Кітап оқысаң — көп білесің","Білім — байлықтың атасы","Оқып жүріп ойлан, ойланып жүріп оқы","Ақыл — тозбайтын киім, білім — таусылмайтын кен","Мың сөзден бір іс артық","Білімге жеткізер — ізденіс","Оқу — өмірлік жол","Кітап — үнсіз ұстаз","Білім қуған — мұратына жеткен","Оқыған адам — озық адам","Ізденген — жетер мұратқа","Оқу — ұзақ жол, шыдамдылық — азық","Білім алу — үлкен еңбек","Тәрбие — тал бесіктен","Ұяда не көрсең, ұшқанда соны ілесің","Досың жақсы болса — жолың жақсы, кітабың жақсы болса — ойың жақсы","Білімсіз бір күн — жоғалған күн","Кітап — ақылдың кені","Оқығанды ойға түй, ойға түйгенді іске асыр","Сабыр түбі — сары алтын","Аз оқып, көп ойлан","Оқуға ерінбе, білімге серік бол"];
const RQ=RQ_AUTHOR.concat(RQ_PROVERB.map((t)=>({ t, a:'Қазақ мақалы' })));
function roomQuote(){
  const b=document.getElementById('roomSit'); if(!b) return;
  const q=RQ[Math.floor(Math.random()*RQ.length)];
  const long=(q.t||'').length>34;
  b.innerHTML='<span class="cta-q'+(long?' long':'')+'">«'+q.t+'»</span><span class="cta-a">'+q.a+'</span><span class="cta-go">Оқуды бастау</span>';
}
function roomStart(){
  roomQuote();
  loadRoom(); loadRoomStats(); roomRender();
  clearInterval(ROOM.timer);
  ROOM.timer=setInterval(()=>{ const s=document.getElementById('screen-home'); if(s&&s.classList.contains('active')) loadRoom(); }, 20000);
}

/* ---- Оқу «тірі сигналы»: шынымен оқығанда ғана ---- */
const RPING = { last:0, pages:0, active:false };
function rdPingTick(force){
  if(!RPING.active) return;
  const now=Date.now();
  if(!force && now-RPING.last < 30000) return;
  const secs=Math.min(120, Math.round((now-RPING.last)/1000));
  RPING.last=now;
  const pages=RPING.pages; RPING.pages=0;
  if(secs<5) return;
  api('/api/book/stats/ping', { seconds:secs, pages }).catch(()=>{});
}
setInterval(rdPingTick, 15000);

/* ================= Оқу залы: Іле Алатауының шыңына апарар жол ================= */
const MTN_PEAKS = [
  { at:20,  name:'Фурманов шыңы',     h:'3053 м' },
  { at:40,  name:'Күмбел шыңы',       h:'3200 м' },
  { at:60,  name:'Үлкен Алматы шыңы', h:'3681 м' },
  { at:80,  name:'Нұрсұлтан шыңы',    h:'4376 м' },
  { at:100, name:'Талғар шыңы',       h:'4979 м' }
];
const MTN_D = 'M12,138C46,132 58,117 84,111C112,105 122,97 146,93C176,88 186,75 212,65C238,55 252,45 278,29';
// Тау рельефі: фракталды жалдар, көлеңке қыры, жон сызықтары және мәңгі қар
function mtnRnd(seed){
  let t=seed>>>0;
  return function(){
    t=(t+0x6D2B79F5)>>>0;
    let r=Math.imul(t^(t>>>15), 1|t);
    r=(r+Math.imul(r^(r>>>7), 61|r))^r;
    return ((r^(r>>>14))>>>0)/4294967296;
  };
}
function mtnFract(anchors, iters, rough, rnd){
  let p=anchors.map(function(q){ return [q[0], q[1]]; });
  for(let it=0; it<iters; it++){
    const out=[p[0]];
    for(let i=1;i<p.length;i++){
      const u=p[i-1], v=p[i];
      const w=Math.abs(v[0]-u[0]);
      const amp=rough*Math.pow(0.54,it)*Math.min(30,w);
      out.push([ (u[0]+v[0])/2, (u[1]+v[1])/2 + (rnd()-0.5)*amp ]);
      out.push(v);
    }
    p=out;
  }
  return p;
}
function mtnSeg(pts){ return pts.map(function(q){ return q[0].toFixed(1)+','+q[1].toFixed(1); }).join('L'); }
function mtnLine(pts){ return 'M'+mtnSeg(pts); }
function mtnMass(pts){ return mtnLine(pts)+'L320,150L0,150Z'; }
let MTN_SCENE=null;
function mtnScene(){
  if(MTN_SCENE) return MTN_SCENE;
  const rnd=mtnRnd(20260813);
  const far  = mtnFract([[0,88],[44,66],[88,84],[132,58],[178,80],[224,54],[268,74],[320,60]], 3, 0.55, rnd);
  const mid  = mtnFract([[0,112],[50,90],[96,108],[142,82],[190,96],[232,70],[276,90],[320,76]], 3, 0.5, rnd);
  const near = mtnFract([[0,150],[8,134],[40,123],[76,105],[112,97],[146,85],[180,77],[210,59],[240,45],[262,31],[278,21],[290,42],[302,58],[320,76]], 2, 0.22, rnd);
  const nearD = mtnMass(near);
  const spur = [[278,21],[286,52],[292,88],[297,124],[300,150]];
  const shd = mtnLine(near.filter(function(q){ return q[0]>=278; }))+'L320,150L'+mtnSeg(spur.slice().reverse())+'Z';
  const snowL = mtnFract([[198,70],[226,56],[248,44],[266,32],[278,21],[290,40],[304,54],[320,64]], 3, 0.55, rnd);
  const snow = mtnLine(snowL)+'L320,0L198,0Z';
  const ribs = [
    [[277,24],[268,46],[260,74],[252,104],[247,134]],
    [[262,34],[250,58],[240,86],[233,116]],
    [[240,48],[228,72],[219,102],[214,130]],
    [[210,62],[199,88],[192,118]]
  ].map(function(s){ return '<path class="mtn-rib" d="'+mtnLine(s)+'"/>'; }).join('');
  MTN_SCENE = '<svg class="mtn-svg" viewBox="0 0 320 150" preserveAspectRatio="none" aria-hidden="true">'
    + '<defs>'
      + '<linearGradient id="mtnG" x1="0" y1="0" x2="0" y2="1">'
        + '<stop offset="0" stop-color="currentColor" stop-opacity="1"/>'
        + '<stop offset=".6" stop-color="currentColor" stop-opacity=".74"/>'
        + '<stop offset="1" stop-color="currentColor" stop-opacity=".4"/>'
      + '</linearGradient>'
      + '<clipPath id="mtnClip"><path d="'+nearD+'"/></clipPath>'
    + '</defs>'
    + '<path class="mtn-far" d="'+mtnMass(far)+'"/>'
    + '<path class="mtn-mid" d="'+mtnMass(mid)+'"/>'
    + '<path class="mtn-near" d="'+nearD+'"/>'
    + '<g clip-path="url(#mtnClip)">'
      + '<path class="mtn-shd" d="'+shd+'"/>'
      + ribs
      + '<path class="mtn-snow" d="'+snow+'"/>'
    + '</g>'
    + '<path class="mtn-trail" d="' + MTN_D + '"/>'
    + '<path class="mtn-done" id="mtnDone" d="' + MTN_D + '"/>'
    + '<g id="mtnMs"></g>'
  + '</svg>';
  return MTN_SCENE;
}
function mtnHtml(){
  return '<div class="mtn">'
    + mtnScene()
    + '<div class="mtn-top"><b>Талғар шыңы</b> · 4979 м</div>'
    + '<div class="mtn-marks" id="mtnMarks"></div>'
    + '<div class="mtn-goal"><span id="mtnGoal"></span></div>'
  + '</div>';
}
async function loadRoom(){
  try{
    const r = await api('/api/book/room', {});
    const box = document.getElementById('roomSeats');
    if(!box) return;
    let list = (r && r.readers) ? r.readers.slice() : [];
    const live = list.filter((x)=>!x.idle).length;
    const cnt = document.getElementById('roomCount');
    if(cnt) cnt.textContent = live ? (live + ' адам жолда') : 'Әзірге жолда ешкім жоқ';
    const myPct = Math.max(0, Math.min(100, Math.round(Number(ROOM.myPercent)||0)));
    if(!list.some((x)=>x.me) && (myPct>0 || (Number(ROOM.myPage)||0)>0)){
      list.push({ me:true, idle:true, percent:myPct, page:ROOM.myPage||0, name:'Сен', initial:'С' });
    }
    box.innerHTML = mtnHtml();
    const trail=box.querySelector('.mtn-trail');
    const done=box.querySelector('#mtnDone');
    const msG=box.querySelector('#mtnMs');
    const marks=box.querySelector('#mtnMarks');
    if(!trail||!marks) return;
    const TL=trail.getTotalLength();
    const ptAt=(pct)=>trail.getPointAtLength(TL*Math.max(0,Math.min(100,pct))/100);
    const normAt=(pct)=>{
      const l=TL*Math.max(0,Math.min(100,pct))/100;
      const a=trail.getPointAtLength(Math.max(0,l-2)), b=trail.getPointAtLength(Math.min(TL,l+2));
      const dx=b.x-a.x, dy=b.y-a.y, m=Math.sqrt(dx*dx+dy*dy)||1;
      return { x:dy/m, y:-dx/m };
    };
    if(done){
      done.style.strokeDasharray=TL+' '+TL;
      done.style.strokeDashoffset=String(TL);
      requestAnimationFrame(()=>{ done.style.strokeDashoffset=String(TL*(1-myPct/100)); });
    }
    if(msG){
      msG.innerHTML = MTN_PEAKS.map((pk)=>{
        if(pk.at>=100) return '';
        const p=ptAt(pk.at);
        return '<circle class="mtn-ms'+(myPct>=pk.at?' on':'')+'" cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="2.6"/>';
      }).join('');
    }
    const used=[];
    const lane=(pct)=>{ let l=0; while(used.some((u)=>Math.abs(u.p-pct)<9 && u.l===l)) l++; used.push({p:pct,l:l}); return l; };
    const sorted=list.slice().sort((a,b)=>(Number(a.percent)||0)-(Number(b.percent)||0));
    marks.innerHTML = sorted.map((x)=>{
      const pct=Math.max(0, Math.min(100, Math.round(Number(x.percent)||0)));
      const p=ptAt(pct), n=normAt(pct), l=lane(pct);
      const ox=(n.x*l*27).toFixed(1), oy=(n.y*l*27).toFixed(1);
      const lbl = x.me ? ('Сен · '+pct+'%') : (roomEsc(x.name||'')+(x.page?(' · '+x.page+'-бет'):''));
      return '<div class="mk2'+(x.me?' me':'')+(x.idle?' idle':'')+'" style="left:'+(p.x/320*100).toFixed(2)+'%;top:'+(p.y/150*100).toFixed(2)+'%;--ox:'+ox+'px;--oy:'+oy+'px">'
        + '<span class="d av">'+avHtml(x.av, x.name||'')+'</span>'
        + '<span class="l">'+lbl+'</span></div>';
    }).join('');
    marks.querySelectorAll('.mk2').forEach((el)=>el.addEventListener('click',()=>el.classList.toggle('open')));
    const goal=document.getElementById('mtnGoal');
    if(goal){
      const nx=MTN_PEAKS.filter((pk)=>myPct<pk.at)[0];
      goal.innerHTML = nx ? ('Келесі белес — <b>'+nx.name+'</b> · '+(nx.at-myPct)+'% қалды') : ('<b>Талғар шыңы</b> — бағындырылды');
    }
  }catch(e){}
}

/* ================= Прогресс: жеке жиынтық ================= */
const PG = { period:'all', data:null, busy:false, at:0 };
const PG_C = { r1: 2*Math.PI*86, r2: 2*Math.PI*63, r3: 2*Math.PI*40 };
const PG_MON = ['қаңтар','ақпан','наурыз','сәуір','мамыр','маусым','шілде','тамыз','қыркүйек','қазан','қараша','желтоқсан'];
function pgFmt(n){ return (Number(n)||0).toLocaleString('ru-RU'); }
function pgShort(n){
  n=Number(n)||0; const a=Math.abs(n);
  if(a>=1e6) return (n/1e6).toFixed(a>=1e7?0:1).replace('.0','')+'М';
  if(a>=1e3) return (n/1e3).toFixed(a>=1e4?0:1).replace('.0','')+'к';
  return String(Math.round(n));
}
function pgLabel(k){
  k=String(k||'');
  const p=k.split('-');
  if(p.length>=3) return Number(p[2])+' '+(PG_MON[Number(p[1])-1]||'');
  if(p.length===2) return (PG_MON[Number(p[1])-1]||'')+' '+p[0];
  return k;
}
function pgSet(id, v){ const e=document.getElementById(id); if(e) e.textContent=v; }
function pgCount(id, to, fmt){
  const el=document.getElementById(id); if(!el) return;
  to=Number(to)||0; const f=fmt||pgFmt;
  el.textContent=f(to);
  if(document.hidden || !window.requestAnimationFrame) return;
  const t0=performance.now(), dur=700;
  const step=(t)=>{
    const k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,3);
    el.textContent=f(k>=1 ? to : Math.round(to*e));
    if(k<1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function pgRing(id, frac, circ){
  const el=document.getElementById(id); if(!el) return;
  const p=Math.max(0, Math.min(1, Number(frac)||0));
  el.style.strokeDasharray=circ+' '+circ;
  if(el.dataset.seeded!=='1'){
    el.style.strokeDashoffset=String(circ);
    el.getBoundingClientRect();
    el.dataset.seeded='1';
  }
  el.style.strokeDashoffset=String(circ*(1-p));
}
function pgSmooth(pts){
  if(pts.length<2) return 'M0,0';
  let d='M'+pts[0][0].toFixed(1)+','+pts[0][1].toFixed(1);
  for(let i=0;i<pts.length-1;i++){
    const p0=pts[i-1]||pts[i], p1=pts[i], p2=pts[i+1], p3=pts[i+2]||p2;
    const c1x=p1[0]+(p2[0]-p0[0])/6, c1y=p1[1]+(p2[1]-p0[1])/6;
    const c2x=p2[0]-(p3[0]-p1[0])/6, c2y=p2[1]-(p3[1]-p1[1])/6;
    d+='C'+c1x.toFixed(1)+','+c1y.toFixed(1)+' '+c2x.toFixed(1)+','+c2y.toFixed(1)+' '+p2[0].toFixed(1)+','+p2[1].toFixed(1);
  }
  return d;
}
function pgArea(el, items){
  if(!el) return;
  const arr=(items||[]).slice(-40);
  if(arr.length<2){ el.innerHTML='<div class="pg-empty">Дерек жинала бастады</div>'; return; }
  const W=300, H=84, pad=8;
  const vals=arr.map(function(x){ return Math.max(0, Number(x.v)||0); });
  const max=Math.max.apply(null,[1].concat(vals));
  const stepX=W/(arr.length-1);
  const pts=vals.map(function(v,i){ return [i*stepX, H-pad-(v/max)*(H-pad*2)]; });
  const d=pgSmooth(pts);
  const last=pts[pts.length-1];
  el.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none">'
    + '<defs><linearGradient id="pgGrad" x1="0" y1="0" x2="0" y2="1">'
    + '<stop offset="0" class="g0"/><stop offset="1" class="g1"/></linearGradient></defs>'
    + '<path class="pg-fill" d="'+d+'L'+W+','+H+'L0,'+H+'Z"/>'
    + '<path class="pg-line" d="'+d+'" vector-effect="non-scaling-stroke"/>'
    + '<circle class="pg-dot" cx="'+last[0].toFixed(1)+'" cy="'+last[1].toFixed(1)+'" r="3.2"/>'
    + '</svg>';
}
function pgBars(el, items, goal){
  if(!el) return;
  const arr=(items||[]).slice(-31);
  if(!arr.length){ el.innerHTML='<div class="pg-empty">Дерек жинала бастады</div>'; return; }
  const vals=arr.map(function(x){ return Math.max(0, Number(x.v)||0); });
  const max=Math.max.apply(null,[1].concat(vals));
  const g=(Number(goal)||0);
  const line=(g>0 && g<=max) ? '<div class="pg-goal" style="bottom:'+(g/max*100).toFixed(1)+'%"></div>' : '';
  el.innerHTML=line+'<div class="pg-tip" id="pgTip"></div>'+arr.map(function(x,i){
    const v=Math.max(0,Number(x.v)||0);
    const h=Math.max(4, Math.round(v/max*100));
    const on=(g>0 && v>=g) ? ' on' : '';
    return '<div class="pg-bar'+on+'" data-k="'+String(x.k)+'" data-v="'+v+'" data-i="'+i+'" data-n="'+arr.length+'">'
      + '<span style="height:'+h+'%;animation-delay:'+(i*16)+'ms"></span></div>';
  }).join('');
}
function pgBars2(el, items){
  if(!el) return;
  const arr=(items||[]).slice(-24);
  if(!arr.length){ el.innerHTML='<div class="pg-empty">Дерек жинала бастады</div>'; return; }
  const max=Math.max.apply(null,[1].concat(arr.map(function(x){ return Math.max(Number(x.a)||0, Number(x.b)||0); })));
  el.innerHTML=arr.map(function(x,i){
    const ha=Math.max(4, Math.round((Number(x.a)||0)/max*100));
    const hb=Math.max(4, Math.round((Number(x.b)||0)/max*100));
    return '<div class="pg-b2"><span class="a" style="height:'+ha+'%;animation-delay:'+(i*18)+'ms"></span>'
      + '<span class="b" style="height:'+hb+'%;animation-delay:'+(i*18+70)+'ms"></span></div>';
  }).join('');
}
let PG_TIP_T=null;
function pgShowTip(bar){
  const chart=document.getElementById('pgSChart'); if(!chart||!bar) return;
  const tip=document.getElementById('pgTip'); if(!tip) return;
  chart.querySelectorAll('.pg-bar.sel').forEach(function(b){ b.classList.remove('sel'); });
  bar.classList.add('sel');
  const i=Number(bar.dataset.i)||0, n=Math.max(1, Number(bar.dataset.n)||1);
  const pos=Math.min(88, Math.max(12, ((i+0.5)/n)*100));
  tip.innerHTML='<b>'+pgFmt(bar.dataset.v)+'</b><i>'+pgLabel(bar.dataset.k)+'</i>';
  tip.style.left=pos.toFixed(1)+'%';
  tip.classList.add('on');
  try{ if(typeof rdHaptic==='function') rdHaptic('light'); }catch(e){}
  clearTimeout(PG_TIP_T);
  PG_TIP_T=setTimeout(function(){
    tip.classList.remove('on');
    bar.classList.remove('sel');
  }, 2600);
}
function pgPct(x){ return Math.round(Math.max(0, Math.min(1, x||0))*100)+'%'; }
function pgRender(){
  const d = PG.data && PG.data[PG.period];
  if(!d) return;
  const rd=d.read||{}, st=d.steps||{}, fn=d.fin||{};
  const span=Math.max(1, Number(d.spanDays)||1);
  const f1=(rd.days||0)/span, f2=(st.goalDays||0)/span;
  const f3=(fn.income>0) ? Math.max(0,(fn.net||0))/fn.income : 0;
  pgRing('pgRing1', f1, PG_C.r1);
  pgRing('pgRing2', f2, PG_C.r2);
  pgRing('pgRing3', f3, PG_C.r3);
  pgSet('pgPct1', pgPct(f1)); pgSet('pgPct2', pgPct(f2)); pgSet('pgPct3', pgPct(f3));
  pgSet('pgLg1', (rd.days||0)+' / '+span+' күн оқыдың');
  pgSet('pgLg2', (st.goalDays||0)+' / '+span+' күн мақсатта');
  pgSet('pgLg3', 'кірістің жинақталған үлесі');
  pgSet('pgStreak', (rd.streak||0)+' күн қатар');
  pgCount('pgRMin', rd.minutes||0);
  pgSet('pgRSub', pgFmt(rd.pages||0)+' бет · '+pgFmt(rd.days||0)+' күн');
  pgArea(document.getElementById('pgRChart'), rd.series);
  pgSet('pgRFoot', rd.days ? ('Күніне орта есеппен '+Math.round((rd.minutes||0)/rd.days)+' мин') : 'Оқуды бастасаң, график осында пайда болады');
  pgSet('pgSGoal', (st.goalDays||0)+' күн мақсатта');
  pgCount('pgSTotal', st.total||0, pgShort);
  pgSet('pgSSub', 'Күніне орта '+pgFmt(st.avg||0)+' · мақсат '+pgFmt(st.goal||0));
  pgBars(document.getElementById('pgSChart'), st.series, (d.bucket==='day' ? st.goal : 0));
  pgSet('pgSFoot', (st.best && st.best.date) ? ('Рекорд: '+pgLabel(st.best.date)+' · '+pgFmt(st.best.steps)+' қадам') : 'Әзірге қадам жазбасы жоқ');
  pgSet('pgFTx', (fn.tx||0)+' операция');
  pgCount('pgFNet', fn.net||0, pgShort);
  pgSet('pgFSub', 'Кіріс '+pgShort(fn.income)+' · Шығыс '+pgShort(fn.expense));
  pgBars2(document.getElementById('pgFChart'), fn.series);
  const parts=[];
  if(fn.debtLeft) parts.push('Қарыз қалдығы: '+pgFmt(fn.debtLeft)+' ₸');
  if(fn.assets) parts.push('Активтер: '+fn.assets);
  pgSet('pgFFoot', parts.length ? parts.join(' · ') : 'Қарыз да, актив те жоқ');
}
async function loadProgress(force){
  if(PG.data && !force && (Date.now()-PG.at) < 120000){ pgRender(); return; }
  if(PG.busy) return;
  PG.busy=true;
  const scr=document.getElementById('screen-progress');
  if(scr && !PG.data) scr.classList.add('pg-loading');
  try{
    const r = await api('/api/progress', {});
    if(r && r.ok && r.periods){ PG.data=r.periods; PG.at=Date.now(); pgRender(); }
  }catch(e){}
  finally{
    PG.busy=false;
    if(scr) scr.classList.remove('pg-loading');
  }
}
(function(){
  const seg=document.getElementById('pgSeg');
  if(seg) seg.addEventListener('click', function(e){
    const b=(e.target && e.target.closest) ? e.target.closest('.pg-sb') : null;
    if(!b) return;
    PG.period=b.dataset.p||'all';
    seg.querySelectorAll('.pg-sb').forEach(function(x){ x.classList.toggle('on', x===b); });
    try{ if(typeof rdHaptic==='function') rdHaptic('light'); }catch(err){}
    pgRender();
    loadProgress();
  });
  const chart=document.getElementById('pgSChart');
  if(chart) chart.addEventListener('click', function(e){
    const b=(e.target && e.target.closest) ? e.target.closest('.pg-bar') : null;
    if(b) pgShowTip(b);
  });
  const tab=document.querySelector('.tab[data-screen="progress"]');
  if(tab) tab.addEventListener('click', function(){ setTimeout(function(){ loadProgress(); }, 40); });
})();

/* ================= Қаржы: жоғарғы қойындылар ================= */
(function(){
  function build(){
    const top=document.querySelector('#screen-qarjy .fin-top');
    const btn=document.getElementById('finTabBtn');
    if(!top || !btn || typeof FIN_TABS==='undefined' || document.getElementById('finTabs')) return;
    btn.style.display='none';
    const menu=document.getElementById('finTabMenu'); if(menu) menu.style.display='none';
    const strip=document.createElement('div');
    strip.className='fin-tabs'; strip.id='finTabs';
    top.insertBefore(strip, top.firstChild);
    const paint=function(){
      strip.innerHTML=FIN_TABS.map(function(t,i){
        return '<button type="button" class="fin-tb'+(i===FIN.tabI?' on':'')+'" data-i="'+i+'">'+t.n+'</button>';
      }).join('');
    };
    paint();
    window.__finPaintTabs=paint;
    strip.addEventListener('click', function(e){
      const b=(e.target && e.target.closest) ? e.target.closest('.fin-tb') : null;
      if(!b) return;
      FIN.tabI=Number(b.dataset.i)||0;
      const nm=document.getElementById('finTabName');
      if(nm && FIN_TABS[FIN.tabI]) nm.textContent=FIN_TABS[FIN.tabI].n;
      paint();
      const act=strip.querySelector('.fin-tb.on');
      if(act && act.scrollIntoView) act.scrollIntoView({ inline:'center', block:'nearest', behavior:'smooth' });
      try{ if(typeof rdHaptic==='function') rdHaptic('light'); }catch(err){}
      if(typeof renderFin==='function') renderFin();
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();

/* ================= Профиль: Duolingo стиліндегі бет ================= */
const PF = { data:null, friends:[], busy:false };
const PF_ACH = [
  { n:'Алғашқы бет',    d:'Кітап оқуды баста',        goal:1,      ic:'i-book',   f:function(p){ return p.read.days; } },
  { n:'Апталық серия',  d:'7 күн қатарынан оқы',      goal:7,      ic:'i-target', f:function(p){ return p.read.streak; } },
  { n:'Кітапқұмар',     d:'1000 минут оқы',           goal:1000,   ic:'i-clock',  f:function(p){ return p.read.minutes; } },
  { n:'Марафоншы',      d:'100 000 қадам жаса',       goal:100000, ic:'i-steps',  f:function(p){ return p.steps.total; } },
  { n:'Темірдей тәртіп',d:'30 күн мақсатқа жет',      goal:30,     ic:'i-shield', f:function(p){ return p.steps.goalDays; } }
];
function pfEsc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
function pfIni(name){
  const p=String(name||'').trim().split(/\s+/).filter(Boolean);
  if(!p.length) return '•';
  return (p[0][0]+(p[1]?p[1][0]:'')).toUpperCase();
}
function pfIcon(n){ return '<svg class="ic-svg" viewBox="0 0 24 24"><use href="#'+n+'"/></svg>'; }
function pfBuild(){
  const sec=document.getElementById('screen-profile');
  if(!sec || document.getElementById('pfHero')) return;
  const oldName=document.getElementById('profileName');
  const nameTxt=oldName ? oldName.textContent : '';
  const seg=document.getElementById('themeSeg');
  const inc=document.getElementById('frIncoming');
  const list=document.getElementById('frList');
  if(seg) seg.remove();
  if(inc) inc.remove();
  if(list) list.remove();
  sec.innerHTML=[
    '<div class="pf-hero" id="pfHero">',
    '  <div class="pf-ava" id="pfAva">•</div>',
    '  <div class="pf-name" id="profileName"></div>',
    '  <div class="pf-since" id="pfSince">Ruh қауымдастығы</div>',
    '</div>',
    '<div class="pf-stats">',
    '  <div class="pf-st"><span class="ic s1">'+pfIcon('i-clock')+'</span><div><b id="pfMin">0</b><i>оқыған минут</i></div></div>',
    '  <div class="pf-st"><span class="ic s2">'+pfIcon('i-steps')+'</span><div><b id="pfSteps">0</b><i>қадам</i></div></div>',
    '  <div class="pf-st"><span class="ic s3">'+pfIcon('i-target')+'</span><div><b id="pfStreak">0</b><i>күн қатар</i></div></div>',
    '  <div class="pf-st"><span class="ic s4">'+pfIcon('i-people')+'</span><div><b id="pfFriends">0</b><i>дос</i></div></div>',
    '</div>',
    '<div class="pf-h">Жетістіктер</div>',
    '<div class="pf-ach" id="pfAch"></div>',
    '<div class="pf-h">Достар</div>',
    '<button type="button" class="pf-addbtn" id="pfAddBtn">'+pfIcon('i-plus')+'<span>Дос қосу</span></button>',
    '<div id="pfFrSlot"></div>',
    '<div class="pf-h">Тема</div>',
    '<div id="pfSegSlot"></div>',
    '<div class="profile-hint">«Авто» — телефон/Telegram параметріне сай ауысады.</div>',
    '<div class="fin-modal hidden" id="pfFrModal">',
    '  <div class="fin-sheet">',
    '    <div class="fin-sheet-top"><div class="fin-sheet-title">Дос қосу</div>',
    '      <button type="button" class="fin-x" id="pfFrX">'+pfIcon('i-x')+'</button></div>',
    '    <input class="input" id="pfFrQ" placeholder="Атын жаз…" autocomplete="off">',
    '    <div class="pf-res" id="pfFrRes"></div>',
    '  </div>',
    '</div>'
  ].join('\n');
  const slotFr=document.getElementById('pfFrSlot');
  if(inc) slotFr.appendChild(inc);
  if(list) slotFr.appendChild(list);
  const slotSeg=document.getElementById('pfSegSlot');
  if(seg) slotSeg.appendChild(seg);
  const nm=document.getElementById('profileName');
  if(nm) nm.textContent=nameTxt;
  const ava=document.getElementById('pfAva');
  if(ava) ava.textContent=pfIni(nameTxt);
  const add=document.getElementById('pfAddBtn');
  if(add) add.addEventListener('click', function(){ pfOpenFr(); });
  const x=document.getElementById('pfFrX');
  if(x) x.addEventListener('click', function(){ pfCloseFr(); });
  const modal=document.getElementById('pfFrModal');
  if(modal) modal.addEventListener('click', function(e){ if(e.target===modal) pfCloseFr(); });
  const q=document.getElementById('pfFrQ');
  if(q) q.addEventListener('input', function(){ clearTimeout(PF.t); PF.t=setTimeout(pfSearch, 260); });
}
function pfAchRender(p){
  const box=document.getElementById('pfAch'); if(!box||!p) return;
  box.innerHTML=PF_ACH.map(function(a){
    let cur=0; try{ cur=Number(a.f(p))||0; }catch(e){}
    const done=cur>=a.goal;
    const pct=Math.min(100, Math.round(cur/a.goal*100));
    return '<div class="pf-a'+(done?' done':'')+'">'
      + '<span class="pf-a-ic">'+pfIcon(a.ic)+'</span>'
      + '<div class="pf-a-tx"><b>'+pfEsc(a.n)+'</b><i>'+pfEsc(a.d)+'</i>'
      + '<div class="pf-a-bar"><span style="width:'+pct+'%"></span></div></div>'
      + '<span class="pf-a-n">'+(done ? '✓' : (pgShort(cur)+'/'+pgShort(a.goal)))+'</span></div>';
  }).join('');
}
async function pfLoad(){
  if(PF.busy) return; PF.busy=true;
  try{
    if(!PG.data){ await loadProgress(); }
    const p=PG.data && PG.data.all;
    if(p){
      pgCount('pfMin', p.read.minutes||0, pgShort);
      pgCount('pfSteps', p.steps.total||0, pgShort);
      pgCount('pfStreak', p.read.streak||0, pgShort);
      pfAchRender(p);
    }
    const fr=await api('/api/friends/me', {});
    const arr=(fr && (fr.friends || fr.list || fr.items)) || [];
    PF.friends=Array.isArray(arr)?arr:[];
    pgCount('pfFriends', PF.friends.length, pgShort);
  }catch(e){}
  finally{ PF.busy=false; }
}
function pfOpenFr(){
  const m=document.getElementById('pfFrModal'); if(!m) return;
  m.classList.remove('hidden');
  const q=document.getElementById('pfFrQ'); if(q){ q.value=''; }
  pfSearch();
}
function pfCloseFr(){
  const m=document.getElementById('pfFrModal'); if(m) m.classList.add('hidden');
}
async function pfSearch(){
  const box=document.getElementById('pfFrRes'); if(!box) return;
  const q=(document.getElementById('pfFrQ')||{}).value||'';
  box.innerHTML='<div class="pf-res-e">Ізделуде…</div>';
  try{
    const r=await api('/api/friends/search', { q:q });
    const list=(r && r.users) || [];
    if(!list.length){ box.innerHTML='<div class="pf-res-e">'+(q?'Табылмады':'Әзірге ұсыныс жоқ')+'</div>'; return; }
    box.innerHTML=list.map(function(u){
      return '<div class="pf-r" data-id="'+u.id+'">'
        + '<span class="pf-r-ava av">'+avHtml(u.av, u.name)+'</span>'
        + '<span class="pf-r-n">'+pfEsc(u.name)+'</span>'
        + '<button type="button" class="pf-r-b">Қосу</button></div>';
    }).join('');
    box.querySelectorAll('.pf-r-b').forEach(function(b){
      b.addEventListener('click', async function(){
        const row=b.closest('.pf-r'); if(!row) return;
        b.disabled=true; b.textContent='…';
        try{
          const rr=await api('/api/friends/invite', { id:Number(row.dataset.id) });
          b.textContent=(rr && rr.ok) ? 'Жіберілді' : 'Қате';
          if(rr && rr.ok){ b.classList.add('sent'); try{ if(typeof rdHaptic==='function') rdHaptic('light'); }catch(e){} }
        }catch(e){ b.textContent='Қате'; }
      });
    });
  }catch(e){ box.innerHTML='<div class="pf-res-e">Желі қатесі</div>'; }
}
(function(){
  function init(){
    pfBuild();
    const tab=document.querySelector('.tab[data-screen="profile"]');
    if(tab) tab.addEventListener('click', function(){ setTimeout(pfLoad, 60); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* ================= Аватар: тек сурет ================= */
const AV = { map:{}, mine:null, at:0, img:null, box:260, base:1, s:1, x:0, y:0, ptr:{}, pinch:0 };
function avHtml(av, name){
  if(av && av.t==='p' && av.s) return '<img class="av-i" src="'+String(av.s).replace(/"/g,'&quot;')+'" alt="">';
  return '<span class="av-t">'+pfEsc(pfIni(name))+'</span>';
}
async function avLoadAll(force){
  if(!force && AV.at && (Date.now()-AV.at)<180000) return AV.map;
  try{
    const r=await api('/api/avatars', {});
    if(r && r.ok && r.map){ AV.map=r.map; AV.at=Date.now(); }
  }catch(e){}
  return AV.map;
}
function avPaintMine(){
  const box=document.getElementById('pfAva');
  if(!box) return;
  const nm=(document.getElementById('profileName')||{}).textContent||'';
  box.classList.add('av');
  box.innerHTML=avHtml(AV.mine, nm);
}
function avToast(t){ try{ if(typeof rdToast==='function') rdToast(t); }catch(e){} }
function avShow(id, on){ const e=document.getElementById(id); if(e) e.classList.toggle('hidden', !on); }
async function avSave(type, extra){
  try{
    const r=await api('/api/avatar/save', Object.assign({ type:type }, extra||{}));
    if(r && r.ok){
      AV.mine=r.avatar||null; AV.at=0;
      avPaintMine();
      avShow('avMenu',false); avShow('avCrop',false);
      try{ if(typeof rdHaptic==='function') rdHaptic('light'); }catch(e){}
      avToast('Аватар жаңарды');
    } else { avToast('Сақталмады'); }
  }catch(e){ avToast('Желі қатесі'); }
}
function avPickPhoto(){
  const inp=document.getElementById('avFile');
  if(inp){ inp.value=''; inp.click(); }
}
function avOnFile(e){
  const f=e.target && e.target.files && e.target.files[0];
  if(!f) return;
  const rd=new FileReader();
  rd.onload=function(){
    const img=new Image();
    img.onload=function(){ avOpenCrop(img); };
    img.onerror=function(){ avToast('Сурет оқылмады'); };
    img.src=rd.result;
  };
  rd.onerror=function(){ avToast('Файл оқылмады'); };
  rd.readAsDataURL(f);
}
function avOpenCrop(img){
  AV.img=img;
  AV.base=AV.box/Math.min(img.naturalWidth, img.naturalHeight);
  AV.s=1; AV.x=0; AV.y=0;
  avShow('avMenu', false);
  avShow('avCrop', true);
  const holder=document.getElementById('avCropImg');
  if(holder){
    holder.innerHTML='';
    img.className='av-crop-img';
    holder.appendChild(img);
  }
  const z=document.getElementById('avZoom');
  if(z) z.value='1';
  avCropPaint();
}
function avClamp(){
  const w=AV.img.naturalWidth*AV.base*AV.s, h=AV.img.naturalHeight*AV.base*AV.s;
  const mx=Math.max(0,(w-AV.box)/2), my=Math.max(0,(h-AV.box)/2);
  AV.x=Math.max(-mx, Math.min(mx, AV.x));
  AV.y=Math.max(-my, Math.min(my, AV.y));
}
function avCropPaint(){
  if(!AV.img) return;
  avClamp();
  const w=AV.img.naturalWidth*AV.base*AV.s, h=AV.img.naturalHeight*AV.base*AV.s;
  AV.img.style.width=w+'px';
  AV.img.style.height=h+'px';
  AV.img.style.marginLeft=(-w/2)+'px';
  AV.img.style.marginTop=(-h/2)+'px';
  AV.img.style.transform='translate('+AV.x+'px,'+AV.y+'px)';
}
function avCropSave(){
  if(!AV.img) return;
  const S=256, k=AV.base*AV.s;
  const side=AV.box/k;
  const sx=AV.img.naturalWidth/2 - (AV.box/2 + AV.x)/k;
  const sy=AV.img.naturalHeight/2 - (AV.box/2 + AV.y)/k;
  const cv=document.createElement('canvas'); cv.width=S; cv.height=S;
  const ctx=cv.getContext('2d');
  ctx.drawImage(AV.img, sx, sy, side, side, 0, 0, S, S);
  avSave('photo', { src: cv.toDataURL('image/jpeg', 0.85) });
}
function avCropBind(){
  const box=document.getElementById('avCropBox');
  if(!box || box.dataset.bound==='1') return;
  box.dataset.bound='1';
  const dist=function(){
    const k=Object.keys(AV.ptr);
    if(k.length<2) return 0;
    const a=AV.ptr[k[0]], b=AV.ptr[k[1]];
    return Math.hypot(a.x-b.x, a.y-b.y);
  };
  box.addEventListener('pointerdown', function(e){
    box.setPointerCapture(e.pointerId);
    AV.ptr[e.pointerId]={x:e.clientX, y:e.clientY};
    AV.pinch=dist();
  });
  box.addEventListener('pointermove', function(e){
    if(!AV.ptr[e.pointerId]) return;
    const prev=AV.ptr[e.pointerId];
    const n=Object.keys(AV.ptr).length;
    AV.ptr[e.pointerId]={x:e.clientX, y:e.clientY};
    if(n>=2){
      const d=dist();
      if(AV.pinch>0 && d>0){
        AV.s=Math.max(1, Math.min(3, AV.s*(d/AV.pinch)));
        const z=document.getElementById('avZoom'); if(z) z.value=String(AV.s);
      }
      AV.pinch=d;
    } else {
      AV.x+=e.clientX-prev.x;
      AV.y+=e.clientY-prev.y;
    }
    avCropPaint();
  });
  const up=function(e){ delete AV.ptr[e.pointerId]; AV.pinch=0; };
  box.addEventListener('pointerup', up);
  box.addEventListener('pointercancel', up);
  box.addEventListener('wheel', function(e){
    e.preventDefault();
    AV.s=Math.max(1, Math.min(3, AV.s*(e.deltaY<0?1.08:0.93)));
    const z=document.getElementById('avZoom'); if(z) z.value=String(AV.s);
    avCropPaint();
  }, {passive:false});
}
function avMount(){
  const sec=document.getElementById('screen-profile');
  const ava=document.getElementById('pfAva');
  if(!sec || !ava || document.getElementById('avMenu')) return;
  ava.classList.add('av','av-tap');
  ava.addEventListener('click', function(){ avShow('avMenu', true); });
  const wrap=document.createElement('div');
  wrap.innerHTML=[
    '<input type="file" id="avFile" accept="image/'+'*" style="display:none">',
    '<div class="fin-modal hidden" id="avMenu">',
    '  <div class="fin-sheet av-menu">',
    '    <div class="fin-sheet-top"><div class="fin-sheet-title">Профиль суреті</div>',
    '      <button type="button" class="fin-x" id="avMenuX">'+pfIcon('i-x')+'</button></div>',
    '    <button type="button" class="av-b" id="avBphoto"><span class="ic ph">'+pfIcon('i-user')+'</span>',
    '      <span class="tx"><b>Суретті таңдау</b><i>Телефондағы галереядан</i></span></button>',
    '    <button type="button" class="av-b del" id="avBdel"><span class="tx"><b>Суретті өшіру</b></span></button>',
    '  </div>',
    '</div>',
    '<div class="fin-modal hidden" id="avCrop">',
    '  <div class="fin-sheet av-cropper">',
    '    <div class="fin-sheet-top"><div class="fin-sheet-title">Суретті реттеу</div>',
    '      <button type="button" class="fin-x" id="avCropX">'+pfIcon('i-x')+'</button></div>',
    '    <div class="av-crop-box" id="avCropBox"><div class="av-crop-in" id="avCropImg"></div><div class="av-crop-mask"></div></div>',
    '    <input type="range" class="av-zoom" id="avZoom" min="1" max="3" step="0.01" value="1">',
    '    <div class="av-hint">Саусақпен жылжыт, екі саусақпен үлкейт</div>',
    '    <div class="av-acts">',
    '      <button type="button" class="av-rnd" id="avCropOther">Басқа сурет</button>',
    '      <button type="button" class="av-ok" id="avCropOk">Сақтау</button>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('\n');
  while(wrap.firstChild) sec.appendChild(wrap.firstChild);
  const on=function(id, fn){ const e=document.getElementById(id); if(e) e.addEventListener('click', fn); };
  on('avMenuX', function(){ avShow('avMenu', false); });
  on('avCropX', function(){ avShow('avCrop', false); });
  on('avBphoto', avPickPhoto);
  on('avBdel', function(){ avSave('none', {}); });
  on('avCropOther', avPickPhoto);
  on('avCropOk', avCropSave);
  const fi=document.getElementById('avFile');
  if(fi) fi.addEventListener('change', avOnFile);
  const z=document.getElementById('avZoom');
  if(z) z.addEventListener('input', function(){ AV.s=Number(z.value)||1; avCropPaint(); });
  ['avMenu','avCrop'].forEach(function(id){
    const el=document.getElementById(id);
    if(el) el.addEventListener('click', function(e){ if(e.target===el) el.classList.add('hidden'); });
  });
  avCropBind();
}
(function(){
  function boot(){
    avMount();
    (async function(){
      try{
        const me=await api('/api/me', {});
        if(me && me.user && me.user.avatar) AV.mine=me.user.avatar;
      }catch(e){}
      avPaintMine();
      avLoadAll();
    })();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);
})();

/* ================= Профиль: атын өзгерту ================= */
function pnVal(id){ const e=document.getElementById(id); return e ? String(e.value||'').trim() : ''; }
function pnOpen(){
  const m=document.getElementById('pnModal'); if(!m) return;
  m.classList.remove('hidden');
  (async function(){
    try{
      const me=await api('/api/me', {});
      const u=(me && me.user) || {};
      const set=function(id,v){ const e=document.getElementById(id); if(e) e.value=v||''; };
      set('pnFirst', u.firstName);
      set('pnLast', u.lastName);
      set('pnPatr', u.patronymic);
    }catch(e){}
  })();
}
function pnClose(){ const m=document.getElementById('pnModal'); if(m) m.classList.add('hidden'); }
async function pnSave(){
  const first=pnVal('pnFirst'), last=pnVal('pnLast'), patr=pnVal('pnPatr');
  const err=document.getElementById('pnErr');
  if(!first || !last){
    if(err){ err.textContent='Аты мен жөнін толтыр'; err.classList.remove('hidden'); }
    return;
  }
  if(err) err.classList.add('hidden');
  const btn=document.getElementById('pnOk');
  if(btn){ btn.disabled=true; btn.textContent='Сақталуда…'; }
  try{
    const r=await api('/api/profile/save', { firstName:first, lastName:last, patronymic:patr });
    if(r && r.ok){
      const nm=document.getElementById('profileName');
      if(nm) nm.textContent=(first+' '+last).trim();
      if(typeof avPaintMine==='function') avPaintMine();
      pnClose();
      try{ if(typeof rdHaptic==='function') rdHaptic('light'); }catch(e){}
      try{ if(typeof rdToast==='function') rdToast('Профиль жаңарды'); }catch(e){}
    } else if(err){
      err.textContent='Сақталмады';
      err.classList.remove('hidden');
    }
  }catch(e){
    if(err){ err.textContent='Желі қатесі'; err.classList.remove('hidden'); }
  }
  finally{ if(btn){ btn.disabled=false; btn.textContent='Сақтау'; } }
}
function pnMount(){
  const hero=document.getElementById('pfHero');
  const sec=document.getElementById('screen-profile');
  if(!hero || !sec || document.getElementById('pnEdit')) return;
  const b=document.createElement('button');
  b.type='button'; b.className='pn-edit'; b.id='pnEdit';
  b.innerHTML=pfIcon('i-note')+'<span>Атын өзгерту</span>';
  hero.appendChild(b);
  b.addEventListener('click', pnOpen);
  const wrap=document.createElement('div');
  wrap.innerHTML=[
    '<div class="fin-modal hidden" id="pnModal">',
    '  <div class="fin-sheet pn-sheet">',
    '    <div class="fin-sheet-top"><div class="fin-sheet-title">Профиль</div>',
    '      <button type="button" class="fin-x" id="pnX">'+pfIcon('i-x')+'</button></div>',
    '    <label class="pn-l">Аты</label>',
    '    <input class="input" id="pnFirst" placeholder="Аты" autocomplete="given-name">',
    '    <label class="pn-l">Жөні</label>',
    '    <input class="input" id="pnLast" placeholder="Тегі" autocomplete="family-name">',
    '    <label class="pn-l">Әкесінің аты</label>',
    '    <input class="input" id="pnPatr" placeholder="Міндетті емес">',
    '    <div class="pn-err hidden" id="pnErr"></div>',
    '    <button type="button" class="av-ok pn-ok" id="pnOk">Сақтау</button>',
    '  </div>',
    '</div>'
  ].join('\n');
  while(wrap.firstChild) sec.appendChild(wrap.firstChild);
  const on=function(id, fn){ const e=document.getElementById(id); if(e) e.addEventListener('click', fn); };
  on('pnX', pnClose);
  on('pnOk', pnSave);
  const m=document.getElementById('pnModal');
  if(m) m.addEventListener('click', function(e){ if(e.target===m) pnClose(); });
}
(function(){
  function boot(){ pnMount(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 30);
})();
