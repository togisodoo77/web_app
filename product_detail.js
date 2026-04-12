import { fetchProperties } from "./api.js"
import { toggleFavorite } from "./product_card.js"
import { initDarkModeToggle } from "./theme.js"
import { dispatch, getFavorite } from "./store.js"

function getIdFromURL() {
  const params = new URLSearchParams(window.location.search)
  return params.get("id")
}

function normalizeId(id) {
  return String(id ?? "").trim()
}

class ProductDetailComponent {
  constructor() {
    this.refs = {
      root: document.getElementById("product-detail"),
      backBtn: document.getElementById("back-btn"),
      template: document.getElementById("detail-template"),
    }
    this.property = null
    this.detailRoot = null
    this.favBtn = null
    this.favIcon = null
    this.favCount = null
  }

  setMessage(className, text) {
    this.refs.root.innerHTML = `<p class="${className}">${text}</p>`
  }

  getFavoriteState() {
    return getFavorite(this.property.id)
  }

  buildDetailTemplate() {
    const clone = this.refs.template.cloneNode(true)
    clone.removeAttribute("id")
    clone.classList.remove("hidden")
    clone.querySelector(".pm-img").src = this.property.img
    clone.querySelector(".pm-img").alt = this.property.alt
    clone.querySelector(".pm-title").textContent = this.property.title
    clone.querySelector(".pm-loc").textContent = "\uD83D\uDCCD " + this.property.loc
    clone.querySelector(".pm-rat-val").textContent = " " + this.property.rat + " "
    clone.querySelector(".pm-rat-rev").textContent =
      "(" + this.property.rev + " сэтгэгдэл)"
    clone.querySelector(".pm-guests").textContent = this.property.guests
    clone.querySelector(".pm-beds").textContent = this.property.beds
    clone.querySelector(".pm-baths").textContent = this.property.baths
    clone.querySelector(".pm-desc").textContent = this.property.desc
    clone.querySelector(".pm-price-val").textContent = this.property.price

    const amsEl = clone.querySelector(".pm-ams")
    this.property.ams.forEach((a) => {
      const span = document.createElement("span")
      span.className = "pm-am"
      span.textContent = a
      amsEl.appendChild(span)
    })

    return clone
  }

  cacheElements() {
    this.favBtn = this.detailRoot.querySelector(".modal-fav-btn")
    this.favIcon = this.detailRoot.querySelector(".fav-icon")
    this.favCount = this.detailRoot.querySelector(".fav-count")
  }

  applyFavoriteUI(state) {
    this.favCount.textContent = state.count
    if (state.liked) {
      this.favIcon.textContent = "\u2665"
      this.favBtn.style.color = "#ff5a5f"
      return
    }
    this.favIcon.textContent = "\u2661"
    this.favBtn.style.color = ""
  }

  syncFavoriteUI() {
    this.applyFavoriteUI(this.getFavoriteState())
  }

  bindDetailEvents() {
    this.favBtn.onclick = () => {
      const next = toggleFavorite(this.property.id)
      this.applyFavoriteUI(next)
    }

    this.detailRoot.querySelector(".pm-book-btn").onclick = () => {
      alert("Захиалгын систем удахгүй!")
    }
  }

  bindBackButton() {
    if (!this.refs.backBtn) {
      return
    }

    this.refs.backBtn.onclick = () => {
      if (window.history.length > 1) {
        window.history.back()
        return
      }
      window.location.href = "index.html"
    }
  }

  renderDetail(property) {
    this.property = property
    this.detailRoot = this.buildDetailTemplate()
    this.cacheElements()
    this.syncFavoriteUI()
    this.bindDetailEvents()
    this.refs.root.replaceChildren(this.detailRoot)
  }

  async mount() {
    if (!this.refs.root) {
      return
    }

    const idFromURL = getIdFromURL()
    if (!idFromURL) {
      this.setMessage("detail-empty", "Барааны ID олдсонгүй.")
      return
    }

    this.setMessage("detail-loading", "Ачааллаж байна...")

    try {
      const properties = await fetchProperties()
      dispatch("SET_PROPERTIES", properties)

      const wantedId = normalizeId(idFromURL)
      const property = properties.find((p) => normalizeId(p.id) === wantedId)

      if (!property) {
        this.setMessage("detail-empty", "Тухайн байр олдсонгүй.")
        return
      }

      this.renderDetail(property)
    } catch (error) {
      this.setMessage("detail-error", "Өгөгдөл ачаалахад алдаа гарлаа.")
      console.error(error)
    }
  }
}

initDarkModeToggle()
const detailPage = new ProductDetailComponent()
detailPage.bindBackButton()
detailPage.mount()
