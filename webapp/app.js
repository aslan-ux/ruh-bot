const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ---------- Тема (авто по Telegram/системе + ручной выбор) ----------
const THEME_KEY = 'spirit-theme';
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
  if (screen === 'home') loadBook();
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
    RD.theme=localStorage.getItem('spirit-rd-theme')||'day';
    RD.font=+(localStorage.getItem('spirit-rd-font')||100);
    RD.anim=localStorage.getItem('spirit-rd-anim')||'slide';
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
    window.addEventListener('resize', ()=>{ if(RD.fmt==='epub'){ rdLayout(); rdGoPage(RD.pg, false); } });
  }
  const page=document.getElementById('rdPage');
  page.addEventListener('mouseup', ()=>setTimeout(rdOnSelect,10));
  page.addEventListener('touchend', ()=>setTimeout(rdOnSelect,120));
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
  const W=Math.max(240, view.clientWidth), pad=20;
  const col=Math.max(180, W-pad*2), gap=pad*2;
  page.style.width=W+'px';
  page.style.columnWidth=col+'px'; page.style.webkitColumnWidth=col+'px';
  page.style.columnGap=gap+'px'; page.style.webkitColumnGap=gap+'px';
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
  if(!top) top=46;            // ескі Telegram нұсқалары үшін
  rd.style.setProperty('--rd-top-inset', (top+8)+'px');
  rd.style.setProperty('--rd-bot-inset', (bot+4)+'px');
}
// Панельдер шыққанда мәтін аймағы солардың биіктігіне тарылады
function rdChromeSpace(){
  const rd=document.getElementById('reader'); if(!rd) return;
  const top=document.querySelector('.rd-top'), bot=document.querySelector('.rd-bottom');
  const imm=rd.classList.contains('immersive');
  const th = (!imm && top) ? Math.round(top.getBoundingClientRect().height) : 0;
  const bh = (!imm && bot) ? Math.round(bot.getBoundingClientRect().height) : 0;
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
  clearTimeout(RD.immT);
  RD.immT=setTimeout(()=>{
    if(RD.fmt!=='epub') return;
    const frac = RD.pages ? RD.pg/RD.pages : 0;
    rdLayout();
    rdGoPage(Math.min(RD.pages-1, Math.round(frac*RD.pages)), false);
  }, 380);
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
  if(i!==prev) rdHaptic('light');
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
  try{ window.getSelection().removeAllRanges(); }catch{}
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
function rdSelHide(){ rdClearTemp(); document.getElementById('rdSel').classList.add('hidden'); RD.sel=null; }
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
  else if(RD.ch < RD.total-1){ rdHaptic('medium'); rdRenderChapter(RD.ch+1, 0); }
  else rdGoPage(RD.pg);
}
function rdPrev(){
  if(RD.fmt==='pdf') return rdRenderPdf(RD.page-1);
  if(RD.pg > 0) rdGoPage(RD.pg-1, true, 'prev');
  else if(RD.ch > 0){ rdHaptic('medium'); rdRenderChapter(RD.ch-1, 'last'); }
  else rdGoPage(RD.pg);
}
const RD_CHROME = { day:'rgba(255,255,255,.88)', sepia:'rgba(244,236,216,.90)', night:'rgba(21,21,28,.86)' };
function rdApplyTheme(){
  const v=document.getElementById('rdView'); const t=RD_THEMES[RD.theme]||RD_THEMES.day;
  v.style.background=t.bg; v.style.color=t.fg;
  const rd=document.getElementById('reader');
  if(rd){
    rd.style.setProperty('--rd-chrome-bg', RD_CHROME[RD.theme]||RD_CHROME.day);
    rd.style.setProperty('--rd-chrome-fg', t.fg);
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
document.getElementById('rdFontMinus')?.addEventListener('click', ()=>{ RD.font=Math.max(70,RD.font-10); try{localStorage.setItem('spirit-rd-font',RD.font);}catch{} rdApplyFont(); if(RD.fmt==='pdf') rdRenderPdf(RD.page); });
document.getElementById('rdFontPlus')?.addEventListener('click', ()=>{ RD.font=Math.min(180,RD.font+10); try{localStorage.setItem('spirit-rd-font',RD.font);}catch{} rdApplyFont(); if(RD.fmt==='pdf') rdRenderPdf(RD.page); });
document.querySelectorAll('.rd-th').forEach(b=>b.addEventListener('click', ()=>{ RD.theme=b.dataset.th; try{localStorage.setItem('spirit-rd-theme',RD.theme);}catch{} rdApplyTheme(); }));
document.querySelectorAll('.rd-an').forEach(b=>b.addEventListener('click', ()=>{
  RD.anim=b.dataset.an; try{localStorage.setItem('spirit-rd-anim',RD.anim);}catch{}
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
const QD = { stepsMap: {}, today: '', leaderboard: { day: [], week: [], month: [] }, friendsBoard: { day: [], week: [], month: [] }, period: 'day', scope: 'spirit', selMonth: null };
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
