import { fetchProperties } from "./api.js"
import {
  getCategoryFromURL,
  filterProperties,
  updateURLCategory,
} from "./filter.js"
import { renderProperties, updateCategoryTabs, renderModal } from "./render.js"

const grid = document.getElementById("property-grid")
const noResults = document.getElementById("no-results")
const featTitle = document.getElementById("featured-title")
const clearBtn = document.getElementById("clear-filter")
const propModal = document.getElementById("prop-modal")
const propBody = document.getElementById("prop-body")
const propClose = document.getElementById("prop-close")
const darkToggle = document.getElementById("dark-toggle")
const searchForm = document.getElementById("search-form")

let allProperties = []
let activeCategory = "all"

const CAT_LABELS = {
  гол: "Голын байрууд",
  уул: "Уулын байрууд",
  vip: "VIP байрууд",
  хөдөө: "Хөдөөгийн байрууд",
}

async function init() {
  activeCategory = getCategoryFromURL()

  try {
    allProperties = await fetchProperties()
  } catch (err) {
    grid.innerHTML = `<p style="text-align:center;padding:2rem;color:red">
        Өгөгдөл ачаалахад алдаа гарлаа: ${err.message}
      </p>`
    console.error(err)
    return
  }

  applyFilter(activeCategory)
  bindEvents()
}

// ── ШҮҮЛТ ─────────────────────────────────────────────────
function applyFilter(category) {
  activeCategory = category

  const filtered = filterProperties(allProperties, category)

  // PropertyCard компонент ашиглан зурна
  // onCardClick функцийг аргументаар дамжуулна
  renderProperties(filtered, grid, noResults, handleCardClick)

  updateCategoryTabs(category)

  featTitle.textContent = CAT_LABELS[category] || "Онцлох байр"

  clearBtn.classList.toggle("hidden", category === "all")
}

// ── КАРТ ДАРАХАД ──────────────────────────────────────────
// PropertyCard компонентоос дуудагдах callback функц
function handleCardClick(property) {
  renderModal(property, propBody)
  openModal()
}

// ── EVENT LISTENERS ───────────────────────────────────────
function bindEvents() {
  // Category карт
  document.querySelectorAll(".category-card").forEach((tab) => {
    tab.onclick = () => {
      const cls = [...tab.classList].find((c) => c.startsWith("filter-"))
      const filter = cls ? cls.replace("filter-", "") : "all"
      const next = activeCategory === filter ? "all" : filter
      updateURLCategory(next)
      applyFilter(next)
    }
    tab.onkeypress = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        tab.click()
      }
    }
  })

  // Бүгдийг харах
  clearBtn.onclick = () => {
    updateURLCategory("all")
    applyFilter("all")
  }

  // Browser back/forward
  window.addEventListener("popstate", (e) => {
    const cat = e.state?.category || "all"
    applyFilter(cat)
  })

  // Modal хаах
  propClose.onclick = closeModal
  propModal.onclick = (e) => {
    if (e.target === propModal) {
      closeModal()
    }
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal()
    }
  })

  // Хайлт
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

  // Dark mode
  darkToggle.onclick = () => {
    document.body.classList.toggle("dark-mode")
    darkToggle.textContent = document.body.classList.contains("dark-mode")
      ? "\u2600"
      : "\u263e"
  }
}

function openModal() {
  propModal.style.display = "flex"
  propModal.setAttribute("aria-hidden", "false")
  document.body.style.overflow = "hidden"
}

function closeModal() {
  propModal.style.display = "none"
  propModal.setAttribute("aria-hidden", "true")
  document.body.style.overflow = ""
}

// ── АЖИЛЛУУЛНА ────────────────────────────────────────────
init()
