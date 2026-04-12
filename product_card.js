import { getFavorite, dispatch } from "./store.js"

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

export class ProductCardComponent {
  constructor(property, onCardClick) {
    this.property = property
    this.onCardClick = onCardClick
    this.root = null
    this.favBtn = null
    this.favIcon = null
    this.favCount = null
  }

  getFavoriteState() {
    return getFavorite(this.property.id)
  }

  buildTemplate() {
    const state = this.getFavoriteState()
    const id = escapeHtml(this.property.id)
    const title = escapeHtml(this.property.title)
    const loc = escapeHtml(this.property.loc)
    const price = escapeHtml(this.property.price)
    const rat = escapeHtml(this.property.rat)
    const rev = escapeHtml(this.property.rev)
    const alt = escapeHtml(this.property.alt)
    const imgSrc = escapeHtml(this.property.img)

    const div = document.createElement("div")
    div.className = `property-card cat-${this.property.category}`
    div.id = `card-${this.property.id}`
    div.setAttribute("tabindex", "0")
    div.setAttribute("role", "button")
    div.setAttribute("aria-label", `${this.property.title} — дэлгэрэнгүй харах`)
    div.setAttribute("data-id", String(this.property.id))

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

    return div
  }

  cacheElements() {
    this.favBtn = this.root.querySelector(".fav-btn")
    this.favIcon = this.root.querySelector(".fav-icon")
    this.favCount = this.root.querySelector(".fav-count")
  }

  syncFavoriteUI() {
    applyFavoriteVisuals(
      this.favBtn,
      this.favIcon,
      this.favCount,
      this.getFavoriteState(),
    )
  }

  bindEvents() {
    this.favBtn.onclick = (e) => {
      e.stopPropagation()
      const next = toggleFavorite(this.property.id)
      applyFavoriteVisuals(this.favBtn, this.favIcon, this.favCount, next)
    }

    this.root.onclick = (e) => {
      if (e.target.closest(".fav-btn")) {
        return
      }
      this.onCardClick(this.property)
    }

    this.root.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (e.target.closest(".fav-btn")) {
          return
        }
        e.preventDefault()
        this.onCardClick(this.property)
      }
    }
  }

  mount() {
    this.root = this.buildTemplate()
    this.cacheElements()
    this.syncFavoriteUI()
    this.bindEvents()
    return this.root
  }
}

export function createProductCard(property, onCardClick) {
  const component = new ProductCardComponent(property, onCardClick)
  return component.mount()
}
