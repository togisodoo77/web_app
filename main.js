import { fetchProperties } from "./api.js"
import {
  getCategoryFromURL,
  filterProperties,
  updateURLCategory,
} from "./filter.js"
import { renderProperties, updateCategoryTabs } from "./render.js"
import { initDarkModeToggle } from "./theme.js"
import { getState, dispatch } from "./store.js"

const CAT_LABELS = {
  гол: "Голын байрууд",
  уул: "Уулын байрууд",
  vip: "VIP байрууд",
  хөдөө: "Хөдөөгийн байрууд",
}

function createHomePage() {
  const refs = {
    grid: document.getElementById("property-grid"),
    noResults: document.getElementById("no-results"),
    featTitle: document.getElementById("featured-title"),
    clearBtn: document.getElementById("clear-filter"),
    searchForm: document.getElementById("search-form"),
  }

  function setGridLoading(message) {
    refs.grid.querySelectorAll(".property-card").forEach((c) => c.remove())
    const existing = refs.grid.querySelector(".grid-loading")
    if (existing) {
      existing.textContent = message
      return
    }
    const p = document.createElement("p")
    p.className = "grid-loading"
    p.style.cssText = "text-align:center;padding:2rem;opacity:0.85"
    p.textContent = message
    refs.grid.appendChild(p)
  }

  function clearGridLoading() {
    refs.grid.querySelector(".grid-loading")?.remove()
  }

  function showLoadError(message) {
    clearGridLoading()
    refs.grid.innerHTML = `<p style="text-align:center;padding:2rem;color:red">
        Өгөгдөл ачаалахад алдаа гарлаа: ${message}
      </p>`
  }

  function handleCardClick(property) {
    window.location.href = `product_detail.html?id=${encodeURIComponent(property.id)}`
  }

  function renderByCategory(category) {
    dispatch("SET_CATEGORY", category)

    const { properties } = getState()
    const filtered = filterProperties(properties, category)
    renderProperties(filtered, refs.grid, refs.noResults, handleCardClick)
    updateCategoryTabs(category)

    refs.featTitle.textContent = CAT_LABELS[category] || "Онцлох байр"
    refs.clearBtn.classList.toggle("hidden", category === "all")
  }

  function bindCategoryTabs() {
    document.querySelectorAll(".category-card").forEach((tab) => {
      tab.onclick = () => {
        const cls = [...tab.classList].find((c) => c.startsWith("filter-"))
        const filter = cls ? cls.replace("filter-", "") : "all"
        const current = getState().activeCategory
        const next = current === filter ? "all" : filter
        updateURLCategory(next)
        renderByCategory(next)
      }
      tab.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          tab.click()
        }
      }
    })
  }

  function bindSearchForm() {
    refs.searchForm.onsubmit = (e) => {
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

  function bindEvents() {
    bindCategoryTabs()
    bindSearchForm()

    refs.clearBtn.onclick = () => {
      updateURLCategory("all")
      renderByCategory("all")
    }

    window.addEventListener("popstate", (e) => {
      const cat = e.state?.category || "all"
      renderByCategory(cat)
    })
  }

  async function mount() {
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
      showLoadError(err.message)
      console.error(err)
      return
    }

    clearGridLoading()
    renderByCategory(getState().activeCategory)
    bindEvents()
  }

  return {
    mount,
  }
}

initDarkModeToggle()
createHomePage().mount()
