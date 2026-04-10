// ============================================================
// render.js — Нүүр хуудасны grid + category tabs (view layer)
// ============================================================

import { createProductCard } from "./product_card.js"

export function renderProperties(properties, gridEl, noResultsEl, onCardClick) {
  gridEl.querySelectorAll(".property-card").forEach((c) => c.remove())

  if (properties.length === 0) {
    noResultsEl.classList.remove("hidden")
    return
  }

  noResultsEl.classList.add("hidden")

  properties.forEach((p) => {
    const card = createProductCard(p, onCardClick)
    gridEl.appendChild(card)
  })
}

export function updateCategoryTabs(activeCategory) {
  document.querySelectorAll(".category-card").forEach((tab) => {
    const cls = [...tab.classList].find((c) => c.startsWith("filter-"))
    const value = cls ? cls.replace("filter-", "") : "all"
    const isOn = activeCategory !== "all" && value === activeCategory

    tab.classList.toggle("category-active", isOn)
    tab.setAttribute("aria-pressed", isOn ? "true" : "false")
  })
}
