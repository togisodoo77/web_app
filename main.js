// ============================================================
// js/main.js  —  Гол entry point модуль
// Бусад модулиудыг импортлож, хуудсыг динамикаар удирдана.
//
// Ажлын урсгал:
//   1. URL-с ?category параметр уншина
//   2. JSONBin-с fetch() ашиглан өгөгдөл татна
//   3. Property объектуудыг санах ойн хүснэгтэд хадгална
//   4. Браузер дотор шүүлт хийнэ
//   5. DOM-д карт үүсгэнэ
// ============================================================

import { fetchProperties }               from './api.js';
import { getCategoryFromURL,
         filterProperties,
         updateURLCategory }             from './filter.js';
import { renderProperties,
         updateCategoryTabs,
         renderModal }                   from './render.js';

// ── DOM элементүүд ────────────────────────────────────────
const grid        = document.getElementById('property-grid');
const noResults   = document.getElementById('no-results');
const featTitle   = document.getElementById('featured-title');
const clearBtn    = document.getElementById('clear-filter');
const propModal   = document.getElementById('prop-modal');
const propBody    = document.getElementById('prop-body');
const propClose   = document.getElementById('prop-close');
const darkToggle  = document.getElementById('dark-toggle');
const searchForm  = document.getElementById('search-form');

// ── Санах ойн хүснэгт ─────────────────────────────────────
// Нэг л удаа fetch хийж, шүүлтийг дотор нь хийнэ
let allProperties  = [];
let activeCategory = 'all';

// ── Категорийн гарчгууд ───────────────────────────────────
const CAT_LABELS = {
  '\u0433\u043e\u043b':   '\u0413\u043e\u043b\u044b\u043d \u0431\u0430\u0439\u0440\u0443\u0443\u0434',
  '\u0443\u0443\u043b':   '\u0423\u0443\u043b\u044b\u043d \u0431\u0430\u0439\u0440\u0443\u0443\u0434',
  'vip':                   'VIP \u0431\u0430\u0439\u0440\u0443\u0443\u0434',
  '\u0445\u04e9\u0434\u04e9\u04e9': '\u0425\u04e9\u0434\u04e9\u04e9\u0433\u0438\u0439\u043d \u0431\u0430\u0439\u0440\u0443\u0443\u0434'
};

// ── ЭХЛЭЛ ─────────────────────────────────────────────────
async function init() {
  // 1. URL-с category уншина
  //    index.html?category=уул → activeCategory = "уул"
  activeCategory = getCategoryFromURL();

  // 2. Ачааллагдаж байгааг мэдэгдэнэ
  grid.innerHTML = '<p style="text-align:center;padding:2rem;color:#999">'
    + '\u0410\u0447\u0430\u0430\u043b\u043b\u0430\u0436 \u0431\u0430\u0439\u043d\u0430...</p>';

  // 3. JSONBin-с өгөгдөл татна
  try {
    allProperties = await fetchProperties();
  } catch (err) {
    grid.innerHTML = '<p style="text-align:center;padding:2rem;color:red">'
      + '\u04e8\u0433\u04e9\u0434\u04e9\u043b \u0430\u0447\u0430\u0430\u043b\u0430\u0445\u0430\u0434 \u0430\u043b\u0434\u0430\u0430 \u0433\u0430\u0440\u043b\u0430\u0430. '
      + err.message + '</p>';
    console.error(err);
    return;
  }

  // 4. Шүүж харуулна
  applyFilter(activeCategory);

  // 5. Event listener-уудыг холбоно
  bindEvents();
}

// ── ШҮҮЛТ ХИЙЖ ХАРУУЛАХ ───────────────────────────────────
function applyFilter(category) {
  activeCategory = category;

  // Браузер дотор шүүнэ — сүлжээ ашиглахгүй
  const filtered = filterProperties(allProperties, category);

  // Карт DOM-д үүсгэнэ
  renderProperties(filtered, grid, noResults);

  // Category tab active байдал шинэчлэнэ
  updateCategoryTabs(category);

  // Гарчиг шинэчлэнэ
  featTitle.textContent = CAT_LABELS[category] || '\u041e\u043d\u0446\u043b\u043e\u0445 \u0431\u0430\u0439\u0440';

  // "Бүгдийг харах" товч харуулах/нуух
  clearBtn.classList.toggle('hidden', category === 'all');

  // Шинэ карт дээр modal дарах үйлдэл холбоно
  bindCardClicks();
}

// ── EVENT LISTENERS ────────────────────────────────────────
function bindEvents() {

  // — Category карт дарах —
  document.querySelectorAll('.category-card').forEach(tab => {
    tab.onclick = () => {
      const cls    = [...tab.classList].find(c => c.startsWith('filter-'));
      const filter = cls ? cls.replace('filter-', '') : 'all';

      // Дахин дарвал шүүлт цуцлана
      const next = (activeCategory === filter) ? 'all' : filter;

      updateURLCategory(next);   // URL шинэчлэнэ (хуудас reload болохгүй)
      applyFilter(next);
    };

    tab.onkeypress = e => {
      if (e.key === 'Enter' || e.key === ' ') { tab.click(); }
    };
  });

  // — "Бүгдийг харах" товч —
  clearBtn.onclick = () => {
    updateURLCategory('all');
    applyFilter('all');
  };

  // — Browser back/forward товч —
  // URL өөрчлөгдөхөд дахин шүүнэ
  window.addEventListener('popstate', e => {
    const cat = (e.state && e.state.category) ? e.state.category : 'all';
    applyFilter(cat);
  });

  // — Modal хаах —
  propClose.onclick = closeModal;
  propModal.onclick = e => { if (e.target === propModal) { closeModal(); } };
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); }
  });

  // — Хайлт —
  searchForm.onsubmit = e => {
    e.preventDefault();
    const dest = document.getElementById('s-dest').value.trim();
    const ci   = document.getElementById('s-checkin').value.trim();
    const g    = document.getElementById('s-guests').value;
    if (!dest) { alert('\u0411\u0430\u0439\u0440\u0448\u0438\u043b \u043e\u0440\u0443\u0443\u043b\u043d\u0430 \u0443\u0443.'); return; }
    if (!ci)   { alert('\u0418\u0440\u044d\u0445 \u043e\u0433\u043d\u043e\u043e\u0433 \u043e\u0440\u0443\u0443\u043b\u043d\u0430 \u0443\u0443.'); return; }
    if (!g)    { alert('\u0425\u04af\u043d\u0438\u0439 \u0442\u043e\u043e\u0433 \u0441\u043e\u043d\u0433\u043e\u043d\u043e \u0443\u0443.'); return; }
    alert(`\u0425\u0430\u0439\u0436 \u0431\u0430\u0439\u043d\u0430: ${dest} | ${ci} | ${g} \u0445\u04af\u043d`);
  };

  // — Dark mode —
  darkToggle.onclick = () => {
    document.body.classList.toggle('dark-mode');
    darkToggle.textContent = document.body.classList.contains('dark-mode')
      ? '\u2600' : '\u263e';
  };
}

// ── КАРТ ДАРАХ (render хийсний дараа дахин холбоно) ────────
// renderProperties() шинэ DOM элемент үүсгэдэг тул
// event listener-ийг render болгон дахин холбох шаардлагатай
function bindCardClicks() {
  document.querySelectorAll('.property-card').forEach(card => {
    card.onclick = () => {
      const id = card.getAttribute('data-id');
      const property = allProperties.find(p => p.id === id);
      if (!property) { return; }
      renderModal(property, propBody);
      openModal();
    };
    card.onkeypress = e => {
      if (e.key === 'Enter') { card.click(); }
    };
  });
}

// ── MODAL НЭЭХ / ХААХ ─────────────────────────────────────
function openModal() {
  propModal.style.display = 'flex';
  propModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  propModal.style.display = 'none';
  propModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// ── АЖИЛЛУУЛНА ────────────────────────────────────────────
init();