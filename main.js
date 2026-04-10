import { fetchProperties } from "./api.js"
import {
  getCategoryFromURL,
  filterProperties,
  updateURLCategory,
} from "./filter.js"
import { renderProperties, updateCategoryTabs } from "./render.js"
import { initDarkModeToggle } from "./theme.js"
import { getState, dispatch } from "./store.js"

const grid = document.getElementById("property-grid")
const noResults = document.getElementById("no-results")
const featTitle = document.getElementById("featured-title")
const clearBtn = document.getElementById("clear-filter")
const searchForm = document.getElementById("search-form")

const CAT_LABELS = {
  гол: "Голын байрууд",
  уул: "Уулын байрууд",
  vip: "VIP байрууд",
  хөдөө: "Хөдөөгийн байрууд",
}

function setGridLoading(message) {
  grid.querySelectorAll(".property-card").forEach((c) => c.remove())
  const existing = grid.querySelector(".grid-loading")
  if (existing) {
    existing.textContent = message
    return
  }
  const p = document.createElement("p")
  p.className = "grid-loading"
  p.style.cssText = "text-align:center;padding:2rem;opacity:0.85"
  p.textContent = message
  grid.appendChild(p)
}

function clearGridLoading() {
  grid.querySelector(".grid-loading")?.remove()
}

async function init() {
  const initialCategory = getCategoryFromURL()
  dispatch("SET_CATEGORY", initialCategory)
  dispatch("SET_LOADING", true)
  setGridLoading("Ачааллаж байна…")

  try {
    const properties = await fetchProperties()
    dispatch("SET_PROPERTIES", properties)
    dispatch("SET_LOADING", false)
  } catch (err) {
    dispatch("SET_LOADING", false)
    dispatch("SET_ERROR", err.message)
    clearGridLoading()
    grid.innerHTML = `<p style="text-align:center;padding:2rem;color:red">
        Өгөгдөл ачаалахад алдаа гарлаа: ${err.message}
      </p>`
    console.error(err)
    return
  }

  clearGridLoading()
  applyFilter(getState().activeCategory)
  bindEvents()
}

// ── ШҮҮЛТ ─────────────────────────────────────────────────
function applyFilter(category) {
  dispatch("SET_CATEGORY", category)

  const { properties } = getState()
  const filtered = filterProperties(properties, category)
  renderProperties(filtered, grid, noResults, handleCardClick)
  updateCategoryTabs(category)

  featTitle.textContent = CAT_LABELS[category] || "Онцлох байр"
  clearBtn.classList.toggle("hidden", category === "all")
}

// ── КАРТ ДАРАХАД → ДЭЛГЭРЭНГҮЙ ХУУДАС РУУ ШИЛЖИНЭ ──────
function handleCardClick(property) {
  window.location.href = `product_detail.html?id=${encodeURIComponent(property.id)}`
}

// ── EVENT LISTENERS ───────────────────────────────────────
function bindEvents() {
  document.querySelectorAll(".category-card").forEach((tab) => {
    tab.onclick = () => {
      const cls = [...tab.classList].find((c) => c.startsWith("filter-"))
      const filter = cls ? cls.replace("filter-", "") : "all"
      const current = getState().activeCategory
      const next = current === filter ? "all" : filter
      updateURLCategory(next)
      applyFilter(next)
    }
    tab.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        tab.click()
      }
    }
  })

  clearBtn.onclick = () => {
    updateURLCategory("all")
    applyFilter("all")
  }

  window.addEventListener("popstate", (e) => {
    const cat = e.state?.category || "all"
    applyFilter(cat)
  })

  searchForm.onsubmit = (e) => {
    e.preventDefault()
    const dest = document.getElementById("s-dest").value.trim()
    const ci = document.getElementById("s-checkin").value.trim()
    const g = document.getElementById("s-guests").value
    if (!dest) {
      alert("Байршил оруулна уу.")
      return
    }
    if (!ci) {
      alert("Ирэх огноог оруулна уу.")
      return
    }
    if (!g) {
      alert("Хүний тоог сонгоно уу.")
      return
    }
    alert(`Хайж байна: ${dest} | ${ci} | ${g} хүн`)
  }
}

// ── АЖИЛЛУУЛНА ────────────────────────────────────────────
initDarkModeToggle()
init()
