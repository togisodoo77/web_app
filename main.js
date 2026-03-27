import { fetchProperties } from "./api.js"
import {
  getCategoryFromURL,
  filterProperties,
  updateURLCategory,
} from "./filter.js"
import { renderProperties, updateCategoryTabs } from "./render.js"
import { initDarkModeToggle } from "./theme.js"

const CAT_LABELS = { гол: "Гол", уул: "Уул", vip: "VIP", хөдөө: "Хөдөө" }
const DETAIL_PAGE = "product_cart.html"
const $ = (id) => document.getElementById(id)

const els = {
  grid: $("property-grid"),
  noResults: $("no-results"),
  featTitle: $("featured-title"),
  clearBtn: $("clear-filter"),
  searchForm: $("search-form"),
}

let allProperties = []
let activeCategory = "all"

function gridMessage(text, isError) {
  const color = isError ? "red" : "#999"
  els.grid.innerHTML = `<p style="text-align:center;padding:2rem;color:${color}">${text}</p>`
}

function categoryKeyFromTab(tab) {
  const cls = [...tab.classList].find((c) => c.startsWith("filter-"))
  return cls ? cls.slice(7) : "all"
}

function wirePropertyCards() {
  document.querySelectorAll(".property-card").forEach((card) => {
    card.onclick = () => {
      const id = card.getAttribute("data-id")
      if (id) {
        location.href = `${DETAIL_PAGE}?id=${encodeURIComponent(id)}`
      }
    }
    card.onkeypress = (e) => e.key === "Enter" && card.click()
  })
}

function applyFilter(category) {
  activeCategory = category
  renderProperties(
    filterProperties(allProperties, category),
    els.grid,
    els.noResults,
  )
  updateCategoryTabs(category)
  els.featTitle.textContent = CAT_LABELS[category] || "Онцлох байр"
  els.clearBtn.classList.toggle("hidden", category === "all")
  wirePropertyCards()
}

function bindEvents() {
  document.querySelectorAll(".category-card").forEach((tab) => {
    tab.onclick = () => {
      const key = categoryKeyFromTab(tab)
      const next = activeCategory === key ? "all" : key
      updateURLCategory(next)
      applyFilter(next)
    }
    tab.onkeypress = (e) => (e.key === "Enter" || e.key === " ") && tab.click()
  })

  els.clearBtn.onclick = () => {
    updateURLCategory("all")
    applyFilter("all")
  }

  window.addEventListener("popstate", () => applyFilter(getCategoryFromURL()))

  els.searchForm.onsubmit = (e) => {
    e.preventDefault()
    const dest = $("s-dest").value.trim()
    const checkIn = $("s-checkin").value.trim()
    const guests = $("s-guests").value
    if (!dest) return alert("Байршил оруулна уу.")
    if (!checkIn) return alert("Ирэх огноо оруулна уу.")
    if (!guests) return alert("Хүний тоо сонгоно уу.")
    alert(`Хайж байна: ${dest} | ${checkIn} | ${guests} хүн`)
  }
}

async function init() {
  activeCategory = getCategoryFromURL()
  initDarkModeToggle()
  try {
    allProperties = await fetchProperties()
  } catch (err) {
    gridMessage(`Өгөгдөл ачаалахад алдаа гарлаа. ${err.message}`, true)
    console.error(err)
    return
  }
  applyFilter(activeCategory)
  bindEvents()
}

init()
