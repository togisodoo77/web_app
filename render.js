// ============================================================
// js/render.js
// Property өгөгдлөөс HTML карт үүсгэж DOM-д оруулах логик.
// Харагдах байдал нь өмнөх hardcoded карттай яг ижил байна.
// ============================================================

/**
 * Нэг Property объектоос property-card HTML string үүсгэнэ.
 * @param {Property} p
 * @returns {string} HTML string
 */
function createCardHTML(p) {
  return `
    <div class="property-card cat-${p.category}"
         id="card-${p.id}"
         tabindex="0"
         role="button"
         aria-label="${p.title} — дэлгэрэнгүй харах"
         data-id="${p.id}">
      <img
        src="${p.img}"
        alt="${p.alt}"
        width="800"
        height="250"
        loading="lazy" />
      <div class="property-info">
        <h3>${p.title}</h3>
        <p>${p.loc}</p>
        <p class="price">${p.price} / шөнө</p>
        <p class="rating">&#9733; ${p.rat} (${p.rev} сэтгэгдэл)</p>
        <p class="card-hint">Дэлгэрэнгүй харах &#8594;</p>
      </div>
    </div>`;
}

/**
 * Property массивыг property-grid div-д карт болгон оруулна.
 * Өмнөх карт бүрийг устгаж, шинээр зурна.
 * @param {Property[]} properties - харуулах байрнуудын жагсаалт
 * @param {HTMLElement} gridEl    - #property-grid div
 * @param {HTMLElement} noResultsEl - #no-results div
 */
export function renderProperties(properties, gridEl, noResultsEl) {
  // Өмнөх карт бүрийг устгана (no-results мөр хэвээр үлдэнэ)
  gridEl.querySelectorAll('.property-card').forEach(c => c.remove());

  if (properties.length === 0) {
    noResultsEl.classList.remove('hidden');
    return;
  }

  noResultsEl.classList.add('hidden');

  // Property бүрийг HTML болгож grid-д нэмнэ
  properties.forEach(p => {
    gridEl.insertAdjacentHTML('beforeend', createCardHTML(p));
  });
}

/**
 * Category карт дээрх active төлөвийг шинэчлэнэ.
 * @param {string} activeCategory - идэвхтэй category
 */
export function updateCategoryTabs(activeCategory) {
  document.querySelectorAll('.category-card').forEach(tab => {
    // "filter-гол" → "гол" гэж гаргаж авна
    const cls   = [...tab.classList].find(c => c.startsWith('filter-'));
    const value = cls ? cls.replace('filter-', '') : 'all';

    const isOn = (activeCategory === 'all')
      ? false
      : value === activeCategory;

    tab.classList.toggle('category-active', isOn);
    tab.setAttribute('aria-pressed', isOn ? 'true' : 'false');
  });
}

/**
 * Property modal-д дэлгэрэнгүй мэдээлэл оруулна.
 * @param {Property} p    - сонгосон байр
 * @param {HTMLElement} bodyEl - #prop-body div
 */
export function renderModal(p, bodyEl) {
  const amsHTML = p.ams
    .map(a => `<span class="pm-am">${a}</span>`)
    .join('');

  bodyEl.innerHTML = `
    <img src="${p.img}" alt="${p.alt}"
         class="pm-img" width="1200" height="500" />
    <div class="pm-body">
      <div class="pm-row">
        <div>
          <h2 id="prop-modal-title" class="pm-title">${p.title}</h2>
          <p class="pm-loc">&#128205; ${p.loc}</p>
        </div>
        <div class="pm-rat">
          &#9733; ${p.rat}
          <small>(${p.rev} сэтгэгдэл)</small>
        </div>
      </div>
      <div class="pm-stats">
        <div class="pm-stat">
          <b>${p.guests}</b><small>Хүн</small>
        </div>
        <div class="pm-stat">
          <b>${p.beds}</b><small>Унтлагын өрөө</small>
        </div>
        <div class="pm-stat">
          <b>${p.baths}</b><small>Угаалгын өрөө</small>
        </div>
      </div>
      <p class="pm-desc">${p.desc}</p>
      <p class="pm-ams-title">Тохиромжлол</p>
      <div class="pm-ams">${amsHTML}</div>
      <div class="pm-book">
        <div class="pm-price">
          ${p.price} <small>/ шөнө</small>
        </div>
        <button type="button" class="pm-book-btn"
          onclick="alert('Захиалгын систем удахгүй!')">
          Захиалах
        </button>
      </div>
    </div>`;
}