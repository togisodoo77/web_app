// ============================================================
// js/filter.js
// URL параметр уншиж, Property массиваас шүүлт хийх логик.
// index.html?category=уул → зөвхөн уулын байрууд харагдана
// ============================================================

const DEFAULT_CATEGORY = "all"

function normalizeCategory(cat) {
  if (!cat || typeof cat !== "string") {
    return DEFAULT_CATEGORY
  }
  return cat.trim().toLowerCase()
}

/**
 * URL-с ?category=... параметр уншина.
 * Байхгүй бол "all" буцаана.
 * @returns {string}
 */
export function getCategoryFromURL() {
  const params = new URLSearchParams(window.location.search)
  return params.get("category") || "all"
}

/**
 * Property массиваас category-ын дагуу шүүнэ.
 * Браузер дотор хийгдэх шүүлт — сүлжээ ашиглахгүй.
 * @param {Property[]} properties - бүх байрнуудын массив
 * @param {string} category - "гол" | "уул" | "vip" | "хөдөө" | "all"
 * @returns {Property[]}
 */
export function filterProperties(properties, category) {
  return properties.filter((p) => p.matchesFilter(normalizeCategory(category)))
}

export function updateURLCategory(category) {
  const next = normalizeCategory(category)
  const url = new URL(window.location.href)

  if (next === DEFAULT_CATEGORY) {
    url.searchParams.delete("category")
  } else {
    url.searchParams.set("category", next)
  }

  window.history.pushState({ category: next }, "", url.toString())
}
