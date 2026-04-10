import { fetchProperties } from "./api.js"
import { toggleFavorite } from "./product_card.js"
import { initDarkModeToggle } from "./theme.js"
import { dispatch, getFavorite } from "./store.js"

const detailRoot = document.getElementById("product-detail")
const backBtn = document.getElementById("back-btn")
const template = document.getElementById("detail-template")

function getIdFromURL() {
  const params = new URLSearchParams(window.location.search)
  return params.get("id")
}

function normalizeId(id) {
  return String(id ?? "").trim()
}

function renderDetail(p, bodyEl) {
  const clone = template.cloneNode(true)
  clone.removeAttribute("id")
  clone.classList.remove("hidden")

  clone.querySelector(".pm-img").src = p.img
  clone.querySelector(".pm-img").alt = p.alt
  clone.querySelector(".pm-title").textContent = p.title
  clone.querySelector(".pm-loc").textContent = "\uD83D\uDCCD " + p.loc
  clone.querySelector(".pm-rat-val").textContent = " " + p.rat + " "
  clone.querySelector(".pm-rat-rev").textContent = "(" + p.rev + " сэтгэгдэл)"
  clone.querySelector(".pm-guests").textContent = p.guests
  clone.querySelector(".pm-beds").textContent = p.beds
  clone.querySelector(".pm-baths").textContent = p.baths
  clone.querySelector(".pm-desc").textContent = p.desc
  clone.querySelector(".pm-price-val").textContent = p.price

  const amsEl = clone.querySelector(".pm-ams")
  p.ams.forEach((a) => {
    const span = document.createElement("span")
    span.className = "pm-am"
    span.textContent = a
    amsEl.appendChild(span)
  })

  const state = getFavorite(p.id)
  const favBtn = clone.querySelector(".modal-fav-btn")
  const favIcon = clone.querySelector(".fav-icon")
  const favCount = clone.querySelector(".fav-count")

  function applyFavUI(s) {
    favCount.textContent = s.count
    if (s.liked) {
      favIcon.textContent = "\u2665"
      favBtn.style.color = "#ff5a5f"
    } else {
      favIcon.textContent = "\u2661"
      favBtn.style.color = ""
    }
  }

  applyFavUI(state)

  favBtn.addEventListener("click", function () {
    const next = toggleFavorite(p.id)
    applyFavUI(next)
  })

  clone.querySelector(".pm-book-btn").addEventListener("click", function () {
    alert("Захиалгын систем удахгүй!")
  })

  bodyEl.replaceChildren(clone)
}

async function init() {
  if (!detailRoot) {
    return
  }

  const idFromURL = getIdFromURL()
  if (!idFromURL) {
    detailRoot.innerHTML = '<p class="detail-empty">Барааны ID олдсонгүй.</p>'
    return
  }

  detailRoot.innerHTML = '<p class="detail-loading">Ачааллаж байна...</p>'

  try {
    const properties = await fetchProperties()
    dispatch("SET_PROPERTIES", properties)

    const wantedId = normalizeId(idFromURL)
    const property = properties.find((p) => normalizeId(p.id) === wantedId)

    if (!property) {
      detailRoot.innerHTML =
        '<p class="detail-empty">Тухайн байр олдсонгүй.</p>'
      return
    }

    renderDetail(property, detailRoot)
  } catch (error) {
    detailRoot.innerHTML =
      '<p class="detail-error">Өгөгдөл ачаалахад алдаа гарлаа.</p>'
    console.error(error)
  }
}

if (backBtn) {
  backBtn.onclick = () => {
    if (window.history.length > 1) {
      window.history.back()
      return
    }
    window.location.href = "index.html"
  }
}

initDarkModeToggle()
init()
