// ============================================================
// product_card.js — нүүр хуудсын байрны карт (компонент)
// Favorite state нь store.js-д төвлөрсөн байна.
// ============================================================

import { getFavorite, dispatch, subscribe } from "./store.js"

export function escapeHtml(value) {
  if (value == null) {
    return ""
  }
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function getFavoriteState(id) {
  return getFavorite(id)
}

export function toggleFavorite(id) {
  dispatch("TOGGLE_FAVORITE", id)
  return getFavorite(id)
}

export function applyFavoriteVisuals(btn, icon, countEl, state) {
  countEl.textContent = state.count
  if (state.liked) {
    icon.innerHTML = "&#9829;"
    icon.style.color = "#ff5a5f"
    btn.style.background = "rgba(255,90,95,0.08)"
  } else {
    icon.innerHTML = "&#9825;"
    icon.style.color = ""
    btn.style.background = ""
  }
}

export function syncGridCardFavoriteUI(propertyId, state) {
  const card = document.getElementById(`card-${propertyId}`)
  if (!card) {
    return
  }
  const favBtn = card.querySelector(".fav-btn")
  const favIcon = card.querySelector(".fav-icon")
  const favCount = card.querySelector(".fav-count")
  if (favBtn && favIcon && favCount) {
    applyFavoriteVisuals(favBtn, favIcon, favCount, state)
  }
}

/**
 * @param {import("./Property.js").Property} property
 * @param {(p: import("./Property.js").Property) => void} onCardClick
 */
export function createProductCard(property, onCardClick) {
  const state = getFavorite(property.id)
  const id = escapeHtml(property.id)
  const title = escapeHtml(property.title)
  const loc = escapeHtml(property.loc)
  const price = escapeHtml(property.price)
  const rat = escapeHtml(property.rat)
  const rev = escapeHtml(property.rev)
  const alt = escapeHtml(property.alt)
  const imgSrc = escapeHtml(property.img)

  const div = document.createElement("div")
  div.className = `property-card cat-${property.category}`
  div.id = `card-${property.id}`
  div.setAttribute("tabindex", "0")
  div.setAttribute("role", "button")
  div.setAttribute("aria-label", `${property.title} — дэлгэрэнгүй харах`)
  div.setAttribute("data-id", String(property.id))

  div.innerHTML = `
    <img
      src="${imgSrc}"
      alt="${alt}"
      width="800"
      height="250"
      loading="lazy" />
    <div class="property-info">
      <h3>${title}</h3>
      <p>${loc}</p>
      <p class="price">${price} / шөнө</p>
      <p class="rating">&#9733; ${rat} (${rev} сэтгэгдэл)</p>
      <p class="card-hint">Дэлгэрэнгүй харах &#8594;</p>
      <button type="button" class="fav-btn" aria-label="Хадгалах" data-id="${id}">
        <span class="fav-icon">&#9825;</span>
        <span class="fav-count">${state.count}</span>
      </button>
    </div>`

  const favBtn = div.querySelector(".fav-btn")
  const favIcon = div.querySelector(".fav-icon")
  const favCount = div.querySelector(".fav-count")

  if (state.liked) {
    applyFavoriteVisuals(favBtn, favIcon, favCount, state)
  }

  favBtn.onclick = function (e) {
    e.stopPropagation()
    const next = toggleFavorite(property.id)
    applyFavoriteVisuals(favBtn, favIcon, favCount, next)
  }

  div.onclick = function (e) {
    if (e.target.closest(".fav-btn")) {
      return
    }
    onCardClick(property)
  }

  div.onkeydown = function (e) {
    if (e.key === "Enter" || e.key === " ") {
      if (e.target.closest(".fav-btn")) {
        return
      }
      e.preventDefault()
      onCardClick(property)
    }
  }

  return div
}
