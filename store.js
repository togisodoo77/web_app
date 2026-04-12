const FAVS_KEY = "amraltrent-favs"

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVS_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (_) {
    /* ignore */
  }
  return {}
}

function saveFavorites(favorites) {
  try {
    localStorage.setItem(FAVS_KEY, JSON.stringify(favorites))
  } catch (_) {
    /* ignore */
  }
}

const state = {
  properties: [],
  activeCategory: "all",
  favorites: loadFavorites(),
  loading: false,
  error: null,
}

const listeners = new Set()

export function getState() {
  return state
}

export function dispatch(action, payload) {
  switch (action) {
    case "SET_PROPERTIES":
      state.properties = payload
      break

    case "SET_CATEGORY":
      state.activeCategory = payload
      break

    case "TOGGLE_FAVORITE": {
      const id = payload
      const fav = state.favorites[id] || { liked: false, count: 0 }
      fav.liked = !fav.liked
      fav.count = fav.liked ? fav.count + 1 : Math.max(0, fav.count - 1)
      state.favorites[id] = fav
      saveFavorites(state.favorites)
      break
    }

    case "SET_LOADING":
      state.loading = payload
      break

    case "SET_ERROR":
      state.error = payload
      break
  }

  listeners.forEach((fn) => fn(state, action))
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getFavorite(id) {
  return state.favorites[id] || { liked: false, count: 0 }
}
