const DEFAULT_CATEGORY = "all"

function normalizeCategory(category) {
  if (category == null) {
    return DEFAULT_CATEGORY
  }
  const trimmed = String(category).trim()
  return trimmed || DEFAULT_CATEGORY
}

export function getCategoryFromURL(search = window.location.search) {
  const params = new URLSearchParams(search)
  return normalizeCategory(params.get("category"))
}

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
