const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

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

// ---------- Старт ----------
async function init() {
  fillDates();
  try {
    const me = await api('/api/me', {});
    if (me.ok && me.registered) {
      show(me.user && me.user.status === 'approved' ? 'home' : 'pending');
    } else {
      show('register');
    }
  } catch {
    show('register');
  }
}
init();
