import { fetchProperties } from './api.js';
import { renderModal } from './render.js';
import { initDarkModeToggle } from './theme.js';

const detailRoot = document.getElementById('product-detail');
const backBtn = document.getElementById('back-btn');

function getIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function normalizeId(id) {
  return String(id ?? '').trim();
}

async function init() {
  if (!detailRoot) {
    return;
  }

  const idFromURL = getIdFromURL();
  if (!idFromURL) {
    detailRoot.innerHTML = '<p class="detail-empty">Барааны ID олдсонгүй.</p>';
    return;
  }

  detailRoot.innerHTML = '<p class="detail-loading">Ачааллаж байна...</p>';

  try {
    const properties = await fetchProperties();
    const wantedId = normalizeId(idFromURL);
    const property = properties.find(p => normalizeId(p.id) === wantedId);

    if (!property) {
      detailRoot.innerHTML = '<p class="detail-empty">Тухайн байр олдсонгүй.</p>';
      return;
    }

    renderModal(property, detailRoot);
  } catch (error) {
    detailRoot.innerHTML = '<p class="detail-error">Өгөгдөл ачаалахад алдаа гарлаа.</p>';
    console.error(error);
  }
}

if (backBtn) {
  backBtn.onclick = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = 'index.html';
  };
}

initDarkModeToggle();
init();
