export function getCategoryFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('category') || 'all';
}

export function filterProperties(properties, category) {
  return properties.filter(p => p.matchesFilter(category));
}

export function updateURLCategory(category) {
  const url = new URL(window.location.href);

  if (category && category !== 'all') {
    url.searchParams.set('category', category);
  } else {
    url.searchParams.delete('category');
  }

  // Хуудас дахин ачааллагдахгүй, зөвхөн URL өөрчлөгдөнө
  window.history.pushState({ category }, '', url.toString());
}