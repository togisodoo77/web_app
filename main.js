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
  'гол':   'Гол',
  'уул':   'Уул',
  'vip':   'VIP',
  'хөдөө': 'Хөдөө'
};

// ── ЭХЛЭЛ ─────────────────────────────────────────────────
async function init() {
  // 1. URL-с category уншина
  //    index.html?category=уул → activeCategory = "уул"
  activeCategory = getCategoryFromURL();

  // 2. Ачааллагдаж байгааг мэдэгдэнэ
  grid.innerHTML = '<p style="text-align:center;padding:2rem;color:#999">'
    + 'Ачааллаж байна...</p>';

  // 3. JSONBin-с өгөгдөл татна
  try {
    allProperties = await fetchProperties();
  } catch (err) {
    grid.innerHTML = '<p style="text-align:center;padding:2rem;color:red">'
      + 'Өгөгдөл ачаалахад алдаа гарлаа. '
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
  featTitle.textContent = CAT_LABELS[category] || 'Онцлох байр';

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
    if (!dest) { alert('Байршил оруулна уу.'); return; }
    if (!ci)   { alert('Ирэх огноо оруулна уу.'); return; }
    if (!g)    { alert('Хүний тоо сонгоно уу.'); return; }
    alert(`Хайж байна: ${dest} | ${ci} | ${g} хүн`);
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