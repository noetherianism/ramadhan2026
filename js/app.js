/**
 * Jadwal Buka Puasa Masjid Jogja
 * app.js — Main application logic
 *
 * Alur:
 *  1. loadData()     → fetch JSON → init()
 *  2. init()         → set currentIdx ke hari ini → render
 *  3. renderDay()    → tampilkan kartu untuk hari yang dipilih
 *  4. goToDay(idx)   → ganti hari + animasi
 */

/* ────────────────────────────────────────
   STATE
──────────────────────────────────────── */
let DB = null;           // full JSON data
let currentIdx = 0;      // index jadwal[] yang sedang ditampilkan
let direction = 1;       // 1 = maju, -1 = mundur (untuk animasi)
let searchQuery = '';    // query pencarian aktif

/* ────────────────────────────────────────
   CONSTANTS / LOOKUPS
──────────────────────────────────────── */
const DAY_NAMES  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const DAY_SHORT  = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
const MONTH_FULL = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];

/* ────────────────────────────────────────
   DATA LOADER
──────────────────────────────────────── */
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

function showError() {
  document.getElementById('contentArea').innerHTML = `
    <div class="empty-state">
      <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
      </svg>
      <p style="font-size:1rem;font-weight:600;margin-bottom:6px;">Gagal memuat data</p>
      <p style="font-size:0.85rem;">Pastikan file <code>data/jadwal.json</code> tersedia dan server berjalan.</p>
    </div>
  `;
  hideLoading();
}

/* ────────────────────────────────────────
   HELPERS
──────────────────────────────────────── */
/**
 * Cek apakah string menu valid (ada dan bukan placeholder)
 */
function isMenuValid(menu) {
  if (!menu || menu === '-' || menu === 'null') return false;
  if (menu.startsWith('(')) return false;
  return true;
}

/**
 * Format tanggal: "Kamis, 19 Februari 2026"
 */
function formatDateFull(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Cek apakah tanggal = hari ini
 */
function isToday(dateStr) {
  const t = new Date();
  const today = [
    t.getFullYear(),
    String(t.getMonth() + 1).padStart(2, '0'),
    String(t.getDate()).padStart(2, '0')
  ].join('-');
  return dateStr === today;
}

/**
 * Dapatkan string tanggal hari ini "YYYY-MM-DD"
 */
function todayStr() {
  const t = new Date();
  return [
    t.getFullYear(),
    String(t.getMonth() + 1).padStart(2, '0'),
    String(t.getDate()).padStart(2, '0')
  ].join('-');
}

/* ────────────────────────────────────────
   LOADING SCREEN
──────────────────────────────────────── */
function hideLoading() {
  const el = document.getElementById('loadingScreen');
  if (el) {
    el.classList.add('hidden');
    setTimeout(() => el.remove(), 600);
  }
}

/* ────────────────────────────────────────
   STARS (dekorasi header)
──────────────────────────────────────── */
function buildStars() {
  const container = document.getElementById('stars');
  if (!container) return;
  for (let i = 0; i < 55; i++) {
    const el = document.createElement('div');
    el.className = 'star';
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --d: ${2 + Math.random() * 5}s;
      --delay: ${Math.random() * 6}s;
      --opacity: ${0.3 + Math.random() * 0.7};
    `;
    container.appendChild(el);
  }
}

/* ────────────────────────────────────────
   DATE STRIP
──────────────────────────────────────── */
function buildDateStrip() {
  const strip = document.getElementById('dateStrip');
  strip.innerHTML = '';

  DB.jadwal.forEach((day, i) => {
    const d = new Date(day.tanggal + 'T00:00:00');
    const pill = document.createElement('button');
    pill.className = 'date-pill'
      + (i === currentIdx ? ' active' : '')
      + (isToday(day.tanggal) ? ' today-pill' : '');
    pill.setAttribute('aria-label', formatDateFull(day.tanggal));
    pill.innerHTML = `
      <span class="pill-day">${DAY_SHORT[d.getDay()]}</span>
      <span class="pill-num">${d.getDate()}</span>
      <span class="pill-r">R-${day.ramadan_ke}</span>
    `;
    pill.addEventListener('click', () => goToDay(i));
    strip.appendChild(pill);
  });
}

function scrollPillIntoView(idx) {
  const strip = document.getElementById('dateStrip');
  const pills = strip.querySelectorAll('.date-pill');
  if (pills[idx]) {
    pills[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

/* ────────────────────────────────────────
   NAVIGATION
──────────────────────────────────────── */
function goToDay(idx, dir) {
  if (idx < 0 || idx >= DB.jadwal.length) return;
  direction = (dir !== undefined) ? dir : (idx > currentIdx ? 1 : -1);
  currentIdx = idx;
  buildDateStrip();
  scrollPillIntoView(idx);
  renderContent();
}

function changeDay(dir) {
  const newIdx = currentIdx + dir;
  if (newIdx < 0 || newIdx >= DB.jadwal.length) return;
  goToDay(newIdx, dir);
  // Scroll ke atas konten (bukan halaman)
  document.getElementById('contentArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ────────────────────────────────────────
   SEARCH
──────────────────────────────────────── */
function onSearch(e) {
  searchQuery = e.target.value.toLowerCase().trim();
  const clearBtn = document.getElementById('searchClear');
  const dayNav   = document.getElementById('dayNav');
  clearBtn.classList.toggle('visible', searchQuery.length > 0);
  dayNav.style.display = searchQuery ? 'none' : 'flex';
  renderContent();
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  searchQuery = '';
  document.getElementById('searchClear').classList.remove('visible');
  document.getElementById('dayNav').style.display = 'flex';
  renderContent();
}

/* ────────────────────────────────────────
   CARD EXPAND
──────────────────────────────────────── */
function toggleExpand(menuId, btn) {
  const el = document.getElementById(menuId);
  if (!el) return;
  const isClipped = el.classList.contains('clamp');
  el.classList.toggle('clamp', !isClipped);
  btn.textContent = isClipped ? 'Sembunyikan ↑' : 'Lihat lebih →';
}

/* ────────────────────────────────────────
   RENDER: single card HTML
──────────────────────────────────────── */
function buildCardHTML(mosque, menu, mosqueIdx, cardIdx, delay = 0) {
  const valid   = isMenuValid(menu);
  const isLong  = valid && menu.length > 65;
  const menuId  = `menu-${mosqueIdx}-${cardIdx}`;

  return `
    <div class="mosque-card card-animated" style="animation-delay:${delay}s">
      <div class="card-index">${mosqueIdx + 1}</div>
      <div class="card-mosque">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 3.87 3.13 7 7 7s7-3.13 7-7c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        ${mosque.nama}
      </div>
      ${valid
        ? `<div class="card-menu${isLong ? ' clamp' : ''}" id="${menuId}">${menu}</div>
           ${isLong ? `<button class="card-expand" onclick="toggleExpand('${menuId}', this)">Lihat lebih →</button>` : ''}`
        : `<div class="card-no-menu">${menu || 'Belum ada jadwal'}</div>`
      }
    </div>
  `;
}

/* ────────────────────────────────────────
   RENDER: one day view
──────────────────────────────────────── */
function renderDay() {
  const day   = DB.jadwal[currentIdx];
  const today = isToday(day.tanggal);

  // Update prev/next buttons
  document.getElementById('prevBtn').disabled = (currentIdx === 0);
  document.getElementById('nextBtn').disabled = (currentIdx === DB.jadwal.length - 1);
  document.getElementById('navLabel').textContent = `Hari ${currentIdx + 1} dari ${DB.jadwal.length}`;

  // Count available menus
  const availableCount = day.menus.filter(isMenuValid).length;

  // Build cards
  let cardsHTML = '';
  DB.mosques.forEach((mosque, i) => {
    cardsHTML += buildCardHTML(mosque, day.menus[i], i, currentIdx, i * 0.04);
  });

  // Direction-aware animation class
  const animClass = direction >= 0 ? 'slide-right' : 'slide-left';

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
        <div class="stat-item">
          <span class="stat-num">${availableCount}</span>
          <span class="stat-label">Menu Tersedia</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">${DB.mosques.length}</span>
          <span class="stat-label">Masjid</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">${day.ramadan_ke}</span>
          <span class="stat-label">Ramadan Ke-</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">${DB.jadwal.length - currentIdx - 1}</span>
          <span class="stat-label">Hari Tersisa</span>
        </div>
      </div>
    </div>
  `;
}

/* ────────────────────────────────────────
   RENDER: search results across all days
──────────────────────────────────────── */
function renderSearch() {
  let html = '';
  let totalResults = 0;

  DB.jadwal.forEach((day, dayIdx) => {
    let cardsHTML = '';
    let matchCount = 0;

    DB.mosques.forEach((mosque, i) => {
      const menu = day.menus[i] || '';
      const matchesMosque = mosque.nama.toLowerCase().includes(searchQuery)
                         || mosque.singkatan.toLowerCase().includes(searchQuery);
      const matchesMenu   = menu.toLowerCase().includes(searchQuery);
      if (!matchesMosque && !matchesMenu) return;

      matchCount++;
      totalResults++;
      cardsHTML += buildCardHTML(mosque, menu, i, dayIdx, matchCount * 0.05);
    });

    // Also match by date string
    const dateMatch = formatDateFull(day.tanggal).toLowerCase().includes(searchQuery);
    if (matchCount === 0 && !dateMatch) return;

    const today = isToday(day.tanggal);
    html += `
      <div class="result-group slide-right">
        <div class="result-group-header">
          <span class="result-group-date">${formatDateFull(day.tanggal)}</span>
          <span class="badge badge-ramadan">R-${day.ramadan_ke}</span>
          ${today ? '<span class="badge badge-today">Hari Ini</span>' : ''}
          <button class="jump-btn" onclick="jumpToDay(${dayIdx})">Lihat Hari →</button>
        </div>
        <div class="cards-grid">${cardsHTML || '<p style="color:#aaa;font-size:0.85rem;padding:8px 0">Tidak ada menu yang cocok</p>'}</div>
      </div>
    `;
  });

  const note = totalResults > 0
    ? `<div class="search-note">${totalResults} hasil untuk "<strong>${searchQuery}</strong>"</div>`
    : '';

  document.getElementById('contentArea').innerHTML = note + (html || `
    <div class="empty-state">
      <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <p>Tidak ada menu untuk "<strong>${searchQuery}</strong>"</p>
    </div>
  `);
}

/* ────────────────────────────────────────
   RENDER: dispatcher
──────────────────────────────────────── */
function renderContent() {
  if (searchQuery) {
    renderSearch();
  } else {
    renderDay();
  }
}

/* ────────────────────────────────────────
   JUMP from search result → day view
──────────────────────────────────────── */
function jumpToDay(idx) {
  clearSearch();
  goToDay(idx);
}

/* ────────────────────────────────────────
   INIT
──────────────────────────────────────── */
function init() {
  buildStars();

  // Cari index hari ini, fallback ke 0 jika tidak ada
  const today = todayStr();
  const todayIdx = DB.jadwal.findIndex(d => d.tanggal === today);
  currentIdx = todayIdx >= 0 ? todayIdx : 0;

  // Jika hari ini di luar range Ramadan, cari hari paling dekat
  if (todayIdx < 0) {
    const todayDate = new Date(today);
    const ramadanStart = new Date(DB.jadwal[0].tanggal + 'T00:00:00');
    const ramadanEnd   = new Date(DB.jadwal[DB.jadwal.length - 1].tanggal + 'T00:00:00');

    if (todayDate < ramadanStart) {
      currentIdx = 0; // belum Ramadan, tampilkan hari pertama
    } else {
      currentIdx = DB.jadwal.length - 1; // sudah lewat, tampilkan hari terakhir
    }
  }

  buildDateStrip();

  // Scroll pill ke tengah setelah render selesai
  setTimeout(() => scrollPillIntoView(currentIdx), 120);

  renderContent();
  hideLoading();
}

/* ────────────────────────────────────────
   EVENT LISTENERS
──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Search input
  document.getElementById('searchInput')
    .addEventListener('input', onSearch);

  // Keyboard navigation (← →)
  document.addEventListener('keydown', (e) => {
    if (searchQuery) return;
    if (document.activeElement.tagName === 'INPUT') return;
    if (e.key === 'ArrowLeft')  changeDay(-1);
    if (e.key === 'ArrowRight') changeDay(1);
  });

  // Touch swipe
  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (searchQuery) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 65) changeDay(dx < 0 ? 1 : -1);
  }, { passive: true });

  // Scroll to top button
  window.addEventListener('scroll', () => {
    document.getElementById('scrollTop')
      .classList.toggle('show', window.scrollY > 320);
  });

  // Load data
  loadData();
});

/* ────────────────────────────────────────
   SERVICE WORKER + PWA
──────────────────────────────────────── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      console.log('[App] Service Worker registered, scope:', reg.scope);

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
      console.log('[App] Fresh data fetched in background');
      loadData();
    }
  });
}

function showUpdateBanner(worker) {
  if (document.getElementById('updateBanner')) return;
  const banner = document.createElement('div');
  banner.id = 'updateBanner';
  banner.setAttribute('role', 'alert');
  banner.style.cssText = `
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
    background: #1A5C4E; color: #FEFAF2; padding: 12px 20px;
    display: flex; align-items: center; justify-content: space-between;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    box-shadow: 0 -2px 12px rgba(0,0,0,0.2);
  `;
  banner.innerHTML = `
    <span>🌙 Versi baru tersedia!</span>
    <button onclick="applyUpdate()" style="
      background: #E8C96A; color: #0C3328; border: none; padding: 6px 16px;
      border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem;
    ">Perbarui</button>
  `;
  document.body.appendChild(banner);
  window.__pendingWorker = worker;
}

function applyUpdate() {
  if (window.__pendingWorker) {
    window.__pendingWorker.postMessage({ type: 'SKIP_WAITING' });
  }
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}
