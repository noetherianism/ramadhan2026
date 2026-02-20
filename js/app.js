/**
 * Jadwal Buka Puasa Masjid Jogja — v2.0
 * app.js — Enhanced with favorites, dark mode, filters, map, bottom nav
 */

/* ════════════════════════════════════════════════════════════
   STATE
════════════════════════════════════════════════════════════ */
let DB = null;
let currentIdx = 0;
let direction = 1;
let searchQuery = '';
let isInitialized = false;
let activeFilter = 'all';
let activeTab = 'jadwal';
let favorites = [];

/* ════════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════════ */
const DAY_NAMES  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const DAY_SHORT  = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
const MONTH_FULL = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];

/* ════════════════════════════════════════════════════════════
   FOOD TAXONOMY
════════════════════════════════════════════════════════════ */
const FOOD_TAXONOMY = {
  'daging': ['sapi','rendang','rawon','empal','brongkos','bestik','bistik','steak','sei','tongseng daging','gulai sapi','gulai tunjang','tunjang','coto','sop daging','soto daging','dendeng','gepuk','lapis','krengsengan','kornet','daging giling','beef','meatball','sate maranggi','gulai daging','semur daging','sop buntut','sop lapis','gulai balak'],
  'sapi': ['rendang','rawon','empal','brongkos','bestik','bistik','steak','sei sapi','coto','beef','gulai sapi','gulai tunjang','sate maranggi','sop daging','soto daging','daging giling','meatball','sop lapis','gulai balak'],
  'ayam': ['chicken','opor','geprek','bekakak','betutu','taliwang','woku','pop','lodho','tangkap','kremes','katsu','kecap','serundeng','bacem','ingkung','suwir','garang asem','gudeg','sate lilit','cincane','lengkuas','panggang','goreng kalasan','goreng lunak','rica rica','soto ayam','soto banjar','soto kudus','soto lamongan','gulai ayam','gule ayam','tongseng ayam','pepes ayam','rendang ayam','sate ayam','bumbu hitam','kuah kuning','daun jeruk','teriyaki','honey chicken','grilled chicken','fried chicken','black pepper chicken','crispy chicken'],
  'ikan': ['lele','nila','tongkol','bandeng','patin','gurame','gurami','kakap','bawal','tuna','kembung','teri','cakalang','mujair','gabus','welut','mangut','pecel lele','pindang','pepes ikan','parape','dabu','sarden','sarang bandang'],
  'seafood': ['udang','cumi','kepiting','kerang','rajungan','ikan','lele','nila','gurame','tuna','tongkol','bandeng','patin','kembung','bawal','mangut'],
  'telur': ['telor','dadar','omelette','mata sapi','telur balado','ceplok','telur rebus'],
  'bebek': ['bebek goreng','bebek bumbu hitam','bebek bakar'],
  'tahu': ['tofu','tahu crispy','tahu isi','tahu goreng','tahu bacem','tahu gejrot','tahu gimbal','tahu asin','tahu bakso','tahu cabe garam','tahu sambel'],
  'tempe': ['tempeh','mendoan','tempe goreng','tempe bacem','tempe orek','tempe garit','kering tempe','oseng tempe'],
  'sayur': ['sayuran','capcay','cap cay','tumis','oseng','cah','lodeh','urap','gado-gado','gado gado','lotek','pecel','lalapan','lalap','kangkung','bayam','terong','buncis','kacang panjang','wortel','sawi','pokcoy','bok choy','brokoli','tauge','toge','kol','kobis','jipang','daun pepaya','daun singkong','daun pakis','nangka','sayur asem','sayur bening','baby buncis','salad','selada','kemangi','timun'],
  'nasi': ['nasi goreng','nasi kuning','nasi putih','nasi uduk','nasi liwet','nasi kebuli','nasi mandhi','nasi briyani','nasi biryani','nasi bakar','nasi rames','nasi ulam','nasi tempong','sego','lontong','ketupat','tumpeng','biryani','briyani'],
  'mie': ['mi','bakmi','bihun','kwetiau','kwetiaw','soun','mie goreng','mie ayam','mie kuah','mie aceh','bakmoi','bakmoy'],
  'sate': ['satay','sate ayam','sate madura','sate maranggi','sate lilit','sate bandeng','sate ponorogo','sate sapi'],
  'berkuah': ['kuah','soto','rawon','sop','sup','gulai','gule','opor','kari','kare','tongseng','brongkos','bakso','empal gentong','garang asem','mangut','lodeh','sayur asem','sayur bening','laksa','tekwan','soto banjar','soto kudus','soto lamongan','soto betawi','coto','pindang','kuah kuning','kuah padang'],
  'goreng': ['crispy','krispi','tepung','goreng kalasan','goreng lunak','mendoan','bakwan','risoles','kroket','pastel','perkedel','nugget','katsu','presto'],
  'bakar': ['panggang','grilled','bakar madu','bakar taliwang','bakar asap'],
  'pedas': ['rica','balado','lado','sambal','sambel','cabe','cabai','geprek','tempong','lombok ijo'],
  'jawa': ['gudeg','rawon','brongkos','pecel','lotek','urap','lodeh','bestik','garang asem','mangut','sego','tumpeng','ingkung','krengsengan','bakmi jawa','nasi kuning','bacem','oseng'],
  'padang': ['rendang','gulai','gule','dendeng','sate padang','gulai tunjang','daun singkong','balado'],
  'sunda': ['bekakak','pepes','karedok','empal gentong','nasi timbel','tahu gimbal','lotek sunda'],
  'takjil': ['kolak','es buah','es dawet','koktail','puding','es kuwut','es kelamud','stup','kopyor','cincau','selasih','es lemon','es sirup'],
  'minuman': ['es','air mineral','teh','tea','sirup','lemon','cappuccino','capucino','cocopandan']
};

const SYNONYMS = {
  'gule':'gulai','mi':'mie','telor':'telur','krupuk':'kerupuk','sambel':'sambal',
  'cabe':'cabai','toge':'tauge','kobis':'kol','pokcoy':'bok choy','sop':'sup',
  'chicken':'ayam','beef':'daging','fish':'ikan','grilled':'bakar','fried':'goreng',
  'rice':'nasi','steak':'bistik'
};

/* ════════════════════════════════════════════════════════════
   SEARCH ENGINE
════════════════════════════════════════════════════════════ */
function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase().replace(/[()&,.:;!?'\"\/\\]/g, ' ').replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(text) {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  return [...new Set(normalized.split(' ').filter(t => t.length > 0))];
}

function expandToken(token) {
  if (FOOD_TAXONOMY[token]) return [token, ...FOOD_TAXONOMY[token]];
  const canonical = SYNONYMS[token];
  if (canonical && FOOD_TAXONOMY[canonical]) return [token, canonical, ...FOOD_TAXONOMY[canonical]];
  return canonical ? [token, canonical] : [token];
}

const SCORE_LITERAL = 100;
const SCORE_SYNONYM = 70;
const SCORE_TAXONOMY = 40;
const SCORE_MOSQUE_NAME = 15;

function scoreToken(token, menuNormalized, mosqueNorm) {
  if (menuNormalized.includes(token)) return { score: SCORE_LITERAL, via: null };
  const syn = SYNONYMS[token];
  if (syn && menuNormalized.includes(syn)) return { score: SCORE_SYNONYM, via: null };
  const expanded = FOOD_TAXONOMY[token] || (syn && FOOD_TAXONOMY[syn]) || null;
  if (expanded) {
    for (const child of expanded) {
      if (menuNormalized.includes(child)) return { score: SCORE_TAXONOMY, via: token };
    }
  }
  if (mosqueNorm.includes(token) || (syn && mosqueNorm.includes(syn))) return { score: SCORE_MOSQUE_NAME, via: null };
  return { score: 0, via: null };
}

function scoreItem(queryTokens, menuText, mosqueName, mosqueSingkat) {
  const menuNorm = normalizeText(menuText);
  const mosqueNorm = normalizeText(mosqueName + ' ' + mosqueSingkat);
  let totalScore = 0, matchedVia = null;
  for (const token of queryTokens) {
    const result = scoreToken(token, menuNorm, mosqueNorm);
    if (result.score === 0) return { totalScore: 0, matchedVia: null };
    totalScore += result.score;
    if (result.via) matchedVia = result.via;
  }
  return { totalScore, matchedVia };
}

/* ════════════════════════════════════════════════════════════
   FAVORITES (localStorage)
════════════════════════════════════════════════════════════ */
function loadFavorites() {
  try {
    const stored = localStorage.getItem('jadwal-favorites');
    favorites = stored ? JSON.parse(stored) : [];
  } catch { favorites = []; }
}

function saveFavorites() {
  try { localStorage.setItem('jadwal-favorites', JSON.stringify(favorites)); } catch {}
  updateFavBadge();
}

function isFavorite(mosqueId) {
  return favorites.includes(mosqueId);
}

function toggleFavorite(mosqueId) {
  const idx = favorites.indexOf(mosqueId);
  if (idx >= 0) {
    favorites.splice(idx, 1);
    showToast('Dihapus dari favorit');
  } else {
    favorites.push(mosqueId);
    showToast('Ditambahkan ke favorit ⭐');
  }
  saveFavorites();
  // Re-render to update UI
  if (activeTab === 'favorit') renderFavoritesTab();
  else renderContent(false);
}

function updateFavBadge() {
  const badge = document.getElementById('favBadge');
  if (!badge) return;
  if (favorites.length > 0) {
    badge.textContent = favorites.length;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

/* ════════════════════════════════════════════════════════════
   DARK MODE
════════════════════════════════════════════════════════════ */
function loadDarkMode() {
  try {
    const stored = localStorage.getItem('jadwal-dark-mode');
    if (stored === 'true') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.getElementById('themeColor')?.setAttribute('content', '#0F1A17');
    }
  } catch {}
}

function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    document.getElementById('themeColor')?.setAttribute('content', '#0C3328');
    localStorage.setItem('jadwal-dark-mode', 'false');
    showToast('Mode terang aktif ☀️');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('themeColor')?.setAttribute('content', '#0F1A17');
    localStorage.setItem('jadwal-dark-mode', 'true');
    showToast('Mode gelap aktif 🌙');
  }
}

/* ════════════════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════════════════ */
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ════════════════════════════════════════════════════════════
   DATA LOADER
════════════════════════════════════════════════════════════ */
async function loadData() {
  try {
    const res = await fetch('./data/jadwal.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    DB = await res.json();
    init();
  } catch (err) {
    console.error('Gagal memuat data:', err);
    showError();
  }
}

async function refreshData() {
  try {
    const res = await fetch('./data/jadwal.json');
    if (!res.ok) return;
    const newDB = await res.json();
    if (JSON.stringify(newDB) === JSON.stringify(DB)) return;
    DB = newDB;
    if (currentIdx >= DB.jadwal.length) currentIdx = DB.jadwal.length - 1;
    buildDateStrip();
    renderContent(false);
  } catch {}
}

function showError() {
  document.getElementById('contentArea').innerHTML = `
    <div class="empty-state">
      <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
      </svg>
      <p style="font-size:1rem;font-weight:600;margin-bottom:6px;">Gagal memuat data</p>
      <p style="font-size:0.85rem;">Pastikan file <code>data/jadwal.json</code> tersedia.</p>
    </div>`;
  hideLoading();
}

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */
function isMenuValid(menu) {
  if (!menu || menu === '-' || menu === 'null') return false;
  if (menu.startsWith('(')) return false;
  return true;
}

function formatDateFull(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

function isToday(dateStr) {
  const t = new Date();
  return dateStr === [t.getFullYear(), String(t.getMonth()+1).padStart(2,'0'), String(t.getDate()).padStart(2,'0')].join('-');
}

function todayStr() {
  const t = new Date();
  return [t.getFullYear(), String(t.getMonth()+1).padStart(2,'0'), String(t.getDate()).padStart(2,'0')].join('-');
}

function getMapsUrl(mosque) {
  if (mosque.lat && mosque.lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lng}&travelmode=driving`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mosque.nama + ' Yogyakarta')}`;
}

/* ════════════════════════════════════════════════════════════
   LOADING
════════════════════════════════════════════════════════════ */
function hideLoading() {
  const el = document.getElementById('loadingScreen');
  if (el) {
    el.classList.add('hidden');
    setTimeout(() => el.remove(), 600);
  }
}

/* ════════════════════════════════════════════════════════════
   STARS (header decoration)
════════════════════════════════════════════════════════════ */
function buildStars() {
  const container = document.getElementById('stars');
  if (!container || container.children.length > 0) return;
  for (let i = 0; i < 55; i++) {
    const el = document.createElement('div');
    el.className = 'star';
    el.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${2+Math.random()*5}s;--delay:${Math.random()*6}s;--opacity:${0.3+Math.random()*0.7};`;
    container.appendChild(el);
  }
}

/* ════════════════════════════════════════════════════════════
   DATE STRIP
════════════════════════════════════════════════════════════ */
function buildDateStrip() {
  const strip = document.getElementById('dateStrip');
  strip.innerHTML = '';
  DB.jadwal.forEach((day, i) => {
    const d = new Date(day.tanggal + 'T00:00:00');
    const pill = document.createElement('button');
    pill.className = 'date-pill' + (i === currentIdx ? ' active' : '') + (isToday(day.tanggal) ? ' today-pill' : '');
    pill.setAttribute('aria-label', formatDateFull(day.tanggal));
    pill.innerHTML = `<span class="pill-day">${DAY_SHORT[d.getDay()]}</span><span class="pill-num">${d.getDate()}</span><span class="pill-r">R-${day.ramadan_ke}</span>`;
    pill.addEventListener('click', () => goToDay(i));
    strip.appendChild(pill);
  });
}

function scrollPillIntoView(idx) {
  const pills = document.getElementById('dateStrip').querySelectorAll('.date-pill');
  if (pills[idx]) pills[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

/* ════════════════════════════════════════════════════════════
   FILTER CHIPS
════════════════════════════════════════════════════════════ */
function buildFilterChips() {
  const row = document.getElementById('filterRow');
  if (!row || !DB) return;
  // Remove old kecamatan chips (keep first 2: Semua + Favorit)
  const existing = row.querySelectorAll('.filter-chip[data-filter]:not([data-filter="all"]):not([data-filter="favorites"])');
  existing.forEach(el => el.remove());
  // Get unique kecamatan
  const kecamatans = [...new Set(DB.mosques.map(m => m.kecamatan).filter(Boolean))].sort();
  kecamatans.forEach(kec => {
    const btn = document.createElement('button');
    btn.className = 'filter-chip';
    btn.dataset.filter = kec;
    btn.textContent = kec.split(',')[0]; // Show just "Depok" not "Depok, Sleman"
    btn.onclick = () => setFilter(kec, btn);
    row.appendChild(btn);
  });
}

function setFilter(filter, btn) {
  activeFilter = filter;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderContent(true);
}

function getFilteredMosques() {
  if (!DB) return [];
  if (activeFilter === 'all') return DB.mosques.map((m, i) => i);
  if (activeFilter === 'favorites') return DB.mosques.map((m, i) => i).filter(i => isFavorite(DB.mosques[i].id));
  return DB.mosques.map((m, i) => i).filter(i => DB.mosques[i].kecamatan === activeFilter);
}

/* ════════════════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════════════════ */
function goToDay(idx, dir) {
  if (idx < 0 || idx >= DB.jadwal.length) return;
  direction = (dir !== undefined) ? dir : (idx > currentIdx ? 1 : -1);
  currentIdx = idx;
  buildDateStrip();
  scrollPillIntoView(idx);
  renderContent(true);
}

function changeDay(dir) {
  const newIdx = currentIdx + dir;
  if (newIdx < 0 || newIdx >= DB.jadwal.length) return;
  goToDay(newIdx, dir);
  document.getElementById('contentArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ════════════════════════════════════════════════════════════
   SEARCH UI
════════════════════════════════════════════════════════════ */
function onSearch(e) {
  searchQuery = e.target.value.trim();
  const clearBtn = document.getElementById('searchClear');
  const dayNav = document.getElementById('dayNav');
  clearBtn.classList.toggle('visible', searchQuery.length > 0);
  dayNav.style.display = searchQuery ? 'none' : 'flex';
  renderContent(true);
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  searchQuery = '';
  document.getElementById('searchClear').classList.remove('visible');
  document.getElementById('dayNav').style.display = 'flex';
  renderContent(true);
}

/* ════════════════════════════════════════════════════════════
   CARD EXPAND
════════════════════════════════════════════════════════════ */
function toggleExpand(menuId, btn) {
  const el = document.getElementById(menuId);
  if (!el) return;
  const isClipped = el.classList.contains('clamp');
  el.classList.toggle('clamp', !isClipped);
  btn.textContent = isClipped ? 'Sembunyikan ↑' : 'Lihat lebih →';
}

/* ════════════════════════════════════════════════════════════
   RENDER: Card HTML
════════════════════════════════════════════════════════════ */
function buildCardHTML(mosque, menu, mosqueIdx, cardIdx, delay = 0, animate = true, matchedVia = null) {
  const valid = isMenuValid(menu);
  const isLong = valid && menu.length > 65;
  const menuId = `menu-${mosqueIdx}-${cardIdx}`;
  const animClass = animate ? 'card-animated' : '';
  const animStyle = animate ? `animation-delay:${delay}s` : '';
  const viaBadge = matchedVia ? `<span class="match-via">cocok via "${matchedVia}"</span>` : '';
  const isFav = isFavorite(mosque.id);
  const favClass = isFav ? 'fav-active' : '';
  const mapsUrl = getMapsUrl(mosque);

  return `
    <div class="mosque-card ${animClass}" style="${animStyle}">
      <div class="card-top-row">
        <div class="card-index">${mosqueIdx + 1}</div>
        <button class="card-fav-btn ${favClass}" onclick="toggleFavorite(${mosque.id})" aria-label="${isFav ? 'Hapus dari favorit' : 'Tambah ke favorit'}" title="${isFav ? 'Hapus favorit' : 'Tambah favorit'}">
          <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        </button>
      </div>
      <div class="card-mosque">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 3.87 3.13 7 7 7s7-3.13 7-7c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        ${mosque.nama}
      </div>
      ${mosque.kecamatan ? `<div class="card-kecamatan"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>${mosque.kecamatan}</div>` : ''}
      ${valid
        ? `<div class="card-menu${isLong ? ' clamp' : ''}" id="${menuId}">${menu}</div>
           ${viaBadge}
           ${isLong ? `<button class="card-expand" onclick="toggleExpand('${menuId}', this)">Lihat lebih →</button>` : ''}`
        : `<div class="card-no-menu">${menu || 'Belum ada jadwal'}</div>`}
      <div class="card-actions-bar">
        <a href="${mapsUrl}" target="_blank" rel="noopener" class="card-action-btn" onclick="event.stopPropagation()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Rute
        </a>
      </div>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   RENDER: Day view
════════════════════════════════════════════════════════════ */
function renderDay(animate = true) {
  const day = DB.jadwal[currentIdx];
  const today = isToday(day.tanggal);
  const filtered = getFilteredMosques();

  document.getElementById('prevBtn').disabled = (currentIdx === 0);
  document.getElementById('nextBtn').disabled = (currentIdx === DB.jadwal.length - 1);
  document.getElementById('navLabel').textContent = `Hari ${currentIdx + 1} dari ${DB.jadwal.length}`;

  const availableCount = day.menus.filter(isMenuValid).length;

  let cardsHTML = '';
  let cardDelay = 0;
  filtered.forEach(i => {
    cardsHTML += buildCardHTML(DB.mosques[i], day.menus[i], i, currentIdx, (cardDelay++) * 0.04, animate);
  });

  if (filtered.length === 0 && activeFilter === 'favorites') {
    cardsHTML = `<div class="empty-state" style="grid-column:1/-1">
      <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
      <p>Belum ada masjid favorit.<br>Ketuk ⭐ di kartu masjid untuk menambahkan.</p>
    </div>`;
  } else if (filtered.length === 0) {
    cardsHTML = `<div class="empty-state" style="grid-column:1/-1"><p>Tidak ada masjid di kecamatan ini.</p></div>`;
  }

  const animClass = animate ? (direction >= 0 ? 'slide-right' : 'slide-left') : '';

  document.getElementById('contentArea').innerHTML = `
    <div class="${animClass}">
      <div class="day-header">
        <div class="day-date-big">${formatDateFull(day.tanggal)}</div>
        <div class="day-badges">
          <span class="badge badge-ramadan">Ramadan ke-${day.ramadan_ke}</span>
          ${today ? '<span class="badge badge-today">🌙 Hari Ini</span>' : ''}
        </div>
      </div>
      <div class="cards-grid">${cardsHTML}</div>
      <div class="day-stats">
        <div class="stat-item"><span class="stat-num">${availableCount}</span><span class="stat-label">Menu Tersedia</span></div>
        <div class="stat-item"><span class="stat-num">${DB.mosques.length}</span><span class="stat-label">Masjid</span></div>
        <div class="stat-item"><span class="stat-num">${day.ramadan_ke}</span><span class="stat-label">Ramadan Ke-</span></div>
        <div class="stat-item"><span class="stat-num">${DB.jadwal.length - currentIdx - 1}</span><span class="stat-label">Hari Tersisa</span></div>
      </div>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   RENDER: Search results
════════════════════════════════════════════════════════════ */
function renderSearch(animate = true) {
  const queryTokens = tokenize(searchQuery);
  if (queryTokens.length === 0) { renderDay(animate); return; }

  const filtered = getFilteredMosques();
  const dayResults = new Map();
  let totalResults = 0;

  DB.jadwal.forEach((day, dayIdx) => {
    const dayCards = [];
    filtered.forEach(mosqueIdx => {
      const mosque = DB.mosques[mosqueIdx];
      const menu = day.menus[mosqueIdx] || '';
      const { totalScore, matchedVia } = scoreItem(queryTokens, menu, mosque.nama, mosque.singkatan);
      if (totalScore > 0) {
        dayCards.push({ mosqueIdx, score: totalScore, via: matchedVia, menu });
        totalResults++;
      }
    });
    if (dayCards.length > 0) {
      dayCards.sort((a, b) => b.score - a.score);
      dayResults.set(dayIdx, { day, dayIdx, cards: dayCards, bestScore: dayCards[0]?.score || 0 });
    }
  });

  const sortedDays = [...dayResults.values()].sort((a, b) => {
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    return a.dayIdx - b.dayIdx;
  });

  let html = '', cardDelay = 0;
  for (const { day, dayIdx, cards } of sortedDays) {
    let cardsHTML = '';
    for (const card of cards) {
      cardsHTML += buildCardHTML(DB.mosques[card.mosqueIdx], card.menu, card.mosqueIdx, dayIdx, (cardDelay++) * 0.04, animate, card.via);
    }
    const today = isToday(day.tanggal);
    html += `<div class="result-group ${animate ? 'slide-right' : ''}">
      <div class="result-group-header">
        <span class="result-group-date">${formatDateFull(day.tanggal)}</span>
        <span class="badge badge-ramadan">R-${day.ramadan_ke}</span>
        ${today ? '<span class="badge badge-today">Hari Ini</span>' : ''}
        <button class="jump-btn" onclick="jumpToDay(${dayIdx})">Lihat Hari →</button>
      </div>
      <div class="cards-grid">${cardsHTML}</div>
    </div>`;
  }

  const isExpanded = queryTokens.some(t => FOOD_TAXONOMY[t] || FOOD_TAXONOMY[SYNONYMS[t]]);
  const expandNote = isExpanded ? `<span class="search-expand-note">termasuk menu terkait</span>` : '';
  const note = totalResults > 0
    ? `<div class="search-note">${totalResults} hasil untuk "<strong>${searchQuery}</strong>" ${expandNote}</div>`
    : '';

  document.getElementById('contentArea').innerHTML = note + (html || `
    <div class="empty-state">
      <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <p>Tidak ada menu untuk "<strong>${searchQuery}</strong>"</p>
    </div>`);
}

/* ════════════════════════════════════════════════════════════
   RENDER: Mosque list tab
════════════════════════════════════════════════════════════ */
function renderMosqueTab() {
  const today = todayStr();
  const todayIdx = DB.jadwal.findIndex(d => d.tanggal === today);

  let html = '<div class="mosque-list">';
  DB.mosques.forEach((mosque, i) => {
    const isFav = isFavorite(mosque.id);
    const mapsUrl = getMapsUrl(mosque);
    // Get today's menu
    let todayMenu = null;
    if (todayIdx >= 0) todayMenu = DB.jadwal[todayIdx].menus[i];
    const hasMenu = isMenuValid(todayMenu);

    html += `
      <div class="mosque-detail-card card-animated" style="animation-delay:${i * 0.04}s">
        <div class="md-header">
          <div class="md-name">${mosque.nama}</div>
          <button class="card-fav-btn ${isFav ? 'fav-active' : ''}" onclick="toggleFavorite(${mosque.id})" aria-label="${isFav ? 'Hapus favorit' : 'Tambah favorit'}">
            <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          </button>
        </div>
        <div class="md-info">
          ${mosque.kecamatan ? `<div class="md-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>${mosque.kecamatan}</div>` : ''}
          ${mosque.alamat ? `<div class="md-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>${mosque.alamat}</div>` : ''}
        </div>
        <div class="md-actions">
          <a href="${mapsUrl}" target="_blank" rel="noopener" class="md-action-btn directions">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Petunjuk Arah
          </a>
        </div>
        ${todayIdx >= 0 ? `
          <div class="md-today-menu">
            <div class="md-today-label">🍽️ Menu Hari Ini (R-${DB.jadwal[todayIdx].ramadan_ke})</div>
            ${hasMenu ? `<div class="md-today-text">${todayMenu}</div>` : `<div class="md-today-none">Belum ada menu hari ini</div>`}
          </div>
        ` : ''}
      </div>`;
  });
  html += '</div>';

  document.getElementById('contentArea').innerHTML = html;
}

/* ════════════════════════════════════════════════════════════
   RENDER: Favorites tab
════════════════════════════════════════════════════════════ */
function renderFavoritesTab() {
  if (favorites.length === 0) {
    document.getElementById('contentArea').innerHTML = `
      <div class="fav-empty">
        <svg width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        <p style="font-size:1rem;font-weight:600;margin-bottom:6px;">Belum ada favorit</p>
        <p>Ketuk ⭐ pada kartu masjid untuk menyimpannya di sini.</p>
      </div>`;
    return;
  }

  const day = DB.jadwal[currentIdx];

  let cardsHTML = '';
  let cardDelay = 0;
  favorites.forEach(favId => {
    const i = DB.mosques.findIndex(m => m.id === favId);
    if (i < 0) return;
    cardsHTML += buildCardHTML(DB.mosques[i], day.menus[i], i, currentIdx, (cardDelay++) * 0.04, true);
  });

  document.getElementById('contentArea').innerHTML = `
    <div class="slide-right">
      <div class="day-header">
        <div class="day-date-big">${formatDateFull(day.tanggal)}</div>
        <div class="day-badges">
          <span class="badge badge-ramadan">Ramadan ke-${day.ramadan_ke}</span>
          <span class="badge badge-today">⭐ Masjid Favorit</span>
        </div>
      </div>
      <div class="cards-grid">${cardsHTML}</div>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   RENDER: Dispatcher
════════════════════════════════════════════════════════════ */
function renderContent(animate = true) {
  if (activeTab === 'masjid') { renderMosqueTab(); return; }
  if (activeTab === 'favorit') { renderFavoritesTab(); return; }
  if (searchQuery) { renderSearch(animate); return; }
  renderDay(animate);
}

/* ════════════════════════════════════════════════════════════
   TAB SWITCHING (Bottom Nav)
════════════════════════════════════════════════════════════ */
function switchTab(tab, btn) {
  activeTab = tab;
  document.querySelectorAll('.bnav-item').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const dayNav = document.getElementById('dayNav');
  const filterRow = document.getElementById('filterRow');
  const dateWrap = document.querySelector('.date-nav-wrap');
  const searchBar = document.querySelector('.search-bar');

  if (tab === 'jadwal') {
    dayNav.style.display = searchQuery ? 'none' : 'flex';
    filterRow.style.display = 'flex';
    dateWrap.style.display = '';
    searchBar.style.display = 'flex';
  } else if (tab === 'masjid') {
    dayNav.style.display = 'none';
    filterRow.style.display = 'none';
    dateWrap.style.display = 'none';
    searchBar.style.display = 'none';
  } else if (tab === 'favorit') {
    dayNav.style.display = searchQuery ? 'none' : 'flex';
    filterRow.style.display = 'none';
    dateWrap.style.display = '';
    searchBar.style.display = 'none';
  }

  renderContent(true);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function jumpToDay(idx) {
  clearSearch();
  switchTab('jadwal', document.querySelector('[data-tab="jadwal"]'));
  goToDay(idx);
}

/* ════════════════════════════════════════════════════════════
   PULL TO REFRESH
════════════════════════════════════════════════════════════ */
function setupPullToRefresh() {
  let startY = 0, pulling = false;
  const ptr = document.getElementById('ptr');
  const threshold = 80;

  document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY;
      pulling = true;
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!pulling) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 20 && window.scrollY === 0) {
      ptr.classList.add('pulling');
      if (dy > threshold) {
        ptr.querySelector('.ptr-text').textContent = 'Lepaskan untuk memuat ulang';
      } else {
        ptr.querySelector('.ptr-text').textContent = 'Tarik untuk memuat ulang';
      }
    }
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (!pulling) return;
    const dy = e.changedTouches[0].clientY - startY;
    pulling = false;

    if (dy > threshold && window.scrollY === 0) {
      ptr.classList.remove('pulling');
      ptr.classList.add('refreshing');
      ptr.querySelector('.ptr-text').textContent = 'Memuat ulang…';

      refreshData().then(() => {
        renderContent(false);
        setTimeout(() => {
          ptr.classList.remove('refreshing');
          showToast('Data diperbarui ✓');
        }, 800);
      }).catch(() => {
        setTimeout(() => ptr.classList.remove('refreshing'), 800);
      });
    } else {
      ptr.classList.remove('pulling');
    }
  }, { passive: true });
}

/* ════════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════════ */
function init() {
  if (isInitialized) { renderContent(false); return; }

  buildStars();
  loadFavorites();
  updateFavBadge();

  const today = todayStr();
  const todayIdx = DB.jadwal.findIndex(d => d.tanggal === today);
  currentIdx = todayIdx >= 0 ? todayIdx : 0;
  if (todayIdx < 0) {
    const todayDate = new Date(today);
    const ramadanStart = new Date(DB.jadwal[0].tanggal + 'T00:00:00');
    currentIdx = todayDate < ramadanStart ? 0 : DB.jadwal.length - 1;
  }

  buildDateStrip();
  buildFilterChips();
  setTimeout(() => scrollPillIntoView(currentIdx), 120);
  renderContent(true);
  hideLoading();

  isInitialized = true;
}

/* ════════════════════════════════════════════════════════════
   EVENT LISTENERS
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadDarkMode();

  document.getElementById('searchInput').addEventListener('input', onSearch);

  document.addEventListener('keydown', (e) => {
    if (searchQuery || activeTab !== 'jadwal') return;
    if (document.activeElement.tagName === 'INPUT') return;
    if (e.key === 'ArrowLeft') changeDay(-1);
    if (e.key === 'ArrowRight') changeDay(1);
  });

  // Swipe for day navigation (but not conflict with PTR)
  let touchStartX = 0, touchStartY = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (searchQuery || activeTab !== 'jadwal') return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    // Only swipe if horizontal movement is dominant
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      changeDay(dx < 0 ? 1 : -1);
    }
  }, { passive: true });

  window.addEventListener('scroll', () => {
    document.getElementById('scrollTop').classList.toggle('show', window.scrollY > 320);
  });

  setupPullToRefresh();
  loadData();
});

/* ════════════════════════════════════════════════════════════
   SERVICE WORKER
════════════════════════════════════════════════════════════ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner(newWorker);
          }
        });
      });
    } catch (err) {
      console.warn('[App] SW registration failed:', err);
    }
  });

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'DATA_UPDATED') {
      refreshData();
    }
  });
}

function showUpdateBanner(worker) {
  if (document.getElementById('updateBanner')) return;
  const banner = document.createElement('div');
  banner.id = 'updateBanner';
  banner.setAttribute('role', 'alert');
  banner.style.cssText = `position:fixed;bottom:${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bottom-nav-h'))+8}px;left:12px;right:12px;z-index:9999;background:var(--teal-dark);color:var(--cream);padding:12px 20px;display:flex;align-items:center;justify-content:space-between;font-family:'DM Sans',sans-serif;font-size:0.9rem;box-shadow:0 -2px 12px rgba(0,0,0,0.2);border-radius:12px;`;
  banner.innerHTML = `<span>🌙 Versi baru tersedia!</span><button onclick="applyUpdate()" style="background:var(--gold);color:var(--teal-dark);border:none;padding:6px 16px;border-radius:6px;font-weight:600;cursor:pointer;font-size:0.85rem;">Perbarui</button>`;
  document.body.appendChild(banner);
  window.__pendingWorker = worker;
}

function applyUpdate() {
  if (window.__pendingWorker) window.__pendingWorker.postMessage({ type: 'SKIP_WAITING' });
  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
}
