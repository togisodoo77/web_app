// ============================================================
// js/render.js
// UI компонентууд — PropertyCard, renderModal, renderProperties
// ============================================================

// ── FAVORITE STATE ─────────────────────────────────────────
// Хаях/хадгалах тоог санах ойд хадгална
const favoriteState = {};

// ── PropertyCard КОМПОНЕНТ ─────────────────────────────────
/**
 * Нэг байрны карт DOM элемент үүсгэнэ.
 * Өгөгдөл аргументаар авна — өөрөө fetch хийхгүй.
 * Favorite товч дарахад тоо нэмэгдэнэ/хасагдана.
 *
 * @param {Property} property  - байрны өгөгдөл
 * @param {Function} onClick   - карт дарахад дуудах функц (modal нээх)
 * @returns {HTMLElement}
 */
export function PropertyCard(property, onClick) {
  // Favorite state эхлүүлнэ
  if (!favoriteState[property.id]) {
    favoriteState[property.id] = { liked: false, count: 0 };
  }

  const div = document.createElement('div');
  div.className = `property-card cat-${property.category}`;
  div.id        = `card-${property.id}`;
  div.setAttribute('tabindex', '0');
  div.setAttribute('role', 'button');
  div.setAttribute('aria-label', `${property.title} — дэлгэрэнгүй харах`);
  div.setAttribute('data-id', property.id);

  div.innerHTML = `
    <img
      src="${property.img}"
      alt="${property.alt}"
      width="800"
      height="250"
      loading="lazy" />
    <div class="property-info">
      <h3>${property.title}</h3>
      <p>${property.loc}</p>
      <p class="price">${property.price} / шөнө</p>
      <p class="rating">&#9733; ${property.rat} (${property.rev} сэтгэгдэл)</p>
      <p class="card-hint">Дэлгэрэнгүй харах &#8594;</p>
      <button class="fav-btn" aria-label="Хадгалах" data-id="${property.id}">
        <span class="fav-icon">&#9825;</span>
        <span class="fav-count">${favoriteState[property.id].count}</span>
      </button>
    </div>`;

  // ── Favorite товч ─────────────────────────────────────────
  const favBtn   = div.querySelector('.fav-btn');
  const favIcon  = div.querySelector('.fav-icon');
  const favCount = div.querySelector('.fav-count');

  favBtn.onclick = function(e) {
    // Карт дарагдахаас тусгаарлана
    e.stopPropagation();

    const state = favoriteState[property.id];

    if (state.liked) {
      // Хасах
      state.liked = false;
      state.count -= 1;
      favIcon.innerHTML  = '&#9825;';   // хоосон зүрх
      favIcon.style.color = '';
      favBtn.style.background = '';
    } else {
      // Нэмэх
      state.liked = true;
      state.count += 1;
      favIcon.innerHTML  = '&#9829;';   // дүүрэн зүрх
      favIcon.style.color = '#ff5a5f';
      favBtn.style.background = 'rgba(255,90,95,0.08)';
    }

    favCount.textContent = state.count;
  };

  // ── Карт дарахад modal нээнэ ───────────────────────────────
  div.onclick = function(e) {
    // Favorite товч дарвал modal нээхгүй
    if (e.target.closest('.fav-btn')) { return; }
    onClick(property);
  };

  div.onkeypress = function(e) {
    if (e.key === 'Enter') { onClick(property); }
  };

  return div;
}

// ── renderProperties ───────────────────────────────────────
/**
 * Property массивыг grid-д PropertyCard компонент болгон оруулна.
 * Өмнөх карт бүрийг устгаж, шинээр зурна.
 *
 * @param {Property[]} properties
 * @param {HTMLElement} gridEl
 * @param {HTMLElement} noResultsEl
 * @param {Function}    onCardClick
 */
export function renderProperties(properties, gridEl, noResultsEl, onCardClick) {
  // Өмнөх карт бүрийг устгана
  gridEl.querySelectorAll('.property-card').forEach(c => c.remove());

  if (properties.length === 0) {
    noResultsEl.classList.remove('hidden');
    return;
  }

  noResultsEl.classList.add('hidden');

  // PropertyCard компонент бүрийг үүсгэж grid-д нэмнэ
  properties.forEach(p => {
    const card = PropertyCard(p, onCardClick);
    gridEl.appendChild(card);
  });
}

// ── updateCategoryTabs ─────────────────────────────────────
/**
 * Category tab-уудын active төлөв шинэчлэнэ.
 *
 * @param {string} activeCategory
 */
export function updateCategoryTabs(activeCategory) {
  document.querySelectorAll('.category-card').forEach(tab => {
    const cls   = [...tab.classList].find(c => c.startsWith('filter-'));
    const value = cls ? cls.replace('filter-', '') : 'all';
    const isOn  = activeCategory !== 'all' && value === activeCategory;

    tab.classList.toggle('category-active', isOn);
    tab.setAttribute('aria-pressed', isOn ? 'true' : 'false');
  });
}

// ── renderModal ────────────────────────────────────────────
/**
 * Property modal-д дэлгэрэнгүй мэдээлэл оруулна.
 *
 * @param {Property}    p
 * @param {HTMLElement} bodyEl
 */
export function renderModal(p, bodyEl) {
  const amsHTML = p.ams
    .map(a => `<span class="pm-am">${a}</span>`)
    .join('');

  const state     = favoriteState[p.id] || { liked: false, count: 0 };
  const heartIcon = state.liked ? '&#9829;' : '&#9825;';
  const heartClr  = state.liked ? '#ff5a5f' : '';

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
        <div class="pm-book-actions">
          <button type="button" class="fav-btn modal-fav-btn"
            data-id="${p.id}"
            style="color:${heartClr}">
            <span class="fav-icon">${heartIcon}</span>
            <span class="fav-count">${state.count}</span>
          </button>
          <button type="button" class="pm-book-btn"
            onclick="alert('Захиалгын систем удахгүй!')">
            Захиалах
          </button>
        </div>
      </div>
    </div>`;

  // Modal дотрох favorite товч
  const modalFav   = bodyEl.querySelector('.modal-fav-btn');
  const modalIcon  = modalFav.querySelector('.fav-icon');
  const modalCount = modalFav.querySelector('.fav-count');

  modalFav.onclick = function() {
    const s = favoriteState[p.id] || { liked: false, count: 0 };
    favoriteState[p.id] = s;

    if (s.liked) {
      s.liked        = false;
      s.count       -= 1;
      modalIcon.innerHTML    = '&#9825;';
      modalFav.style.color   = '';
    } else {
      s.liked        = true;
      s.count       += 1;
      modalIcon.innerHTML    = '&#9829;';
      modalFav.style.color   = '#ff5a5f';
    }

    modalCount.textContent = s.count;

    // Grid дээрх карт дахь тоог шинэчлэнэ
    const cardFavCount = document.querySelector(
      `.property-card[data-id="${p.id}"] .fav-count`
    );
    const cardFavIcon = document.querySelector(
      `.property-card[data-id="${p.id}"] .fav-icon`
    );
    if (cardFavCount) { cardFavCount.textContent = s.count; }
    if (cardFavIcon)  {
      cardFavIcon.innerHTML = s.liked ? '&#9829;' : '&#9825;';
      cardFavIcon.style.color = s.liked ? '#ff5a5f' : '';
    }
  };
}