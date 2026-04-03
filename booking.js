// ============================================================
// booking.js
// ============================================================

import { fetchBookings } from './api.js'

const STATUS_CONFIG = {
  upcoming: {
    label: '&#8594; Ирэх',
    badgeClass: 'badge-upcoming',
    statusLabel: '&#8226; Баталгаажсан',
    labelClass: 'upcoming-label'
  },
  active: {
    label: '&#10003; Идэвхтэй',
    badgeClass: 'badge-active',
    statusLabel: '&#8226; Одоо байгаа',
    labelClass: 'active-label'
  },
  done: {
    label: '&#10003; Дууссан',
    badgeClass: 'badge-done',
    statusLabel: '&#8226; Амжилттай дууссан',
    labelClass: 'done-label'
  }
}

function createBookingCard(b) {
  const cfg = STATUS_CONFIG[b.status] 

  const actionBtns = {
    upcoming: `
      <button type="button" class="baction-btn baction-view">&#128065; Дэлгэрэнгүй</button>
      <button type="button" class="baction-btn baction-cancel">&#10005; Цуцлах</button>`,
    active: `
      <button type="button" class="baction-btn baction-view">&#128065; Дэлгэрэнгүй</button>
      <button type="button" class="baction-btn baction-review">&#9733; Үнэлгээ өгөх</button>`,
    done: `
      <button type="button" class="baction-btn baction-view">&#128065; Дэлгэрэнгүй</button>
      <button type="button" class="baction-btn baction-review">&#9733; Үнэлгээ өгөх</button>
      <button type="button" class="baction-btn baction-rebook">&#8635; Дахин захиалах</button>`
  }

  return `
    <div class="booking-card bstatus-${b.status}">
      <div class="booking-img-wrap">
        <img src="${b.img}" alt="${b.title}" width="600" height="200" />
        <span class="booking-badge ${cfg.badgeClass}">${cfg.label}</span>
      </div>
      <div class="booking-info">
        <div class="booking-header">
          <div>
            <h3 class="booking-title">${b.title}</h3>
            <p class="booking-location">&#128205; ${b.location}</p>
          </div>
          <div class="booking-price-block">
            <p class="booking-price">${b.price}&#8366;</p>
            <p class="booking-price-unit">/ шөнө</p>
          </div>
        </div>
        <div class="booking-meta">
          <div class="booking-meta-item">
            <span class="meta-lbl">&#128197; Ирэх огноо</span>
            <span class="meta-val">${b.checkin}</span>
          </div>
          <span class="meta-arrow" aria-hidden="true">&#8594;</span>
          <div class="booking-meta-item">
            <span class="meta-lbl">&#128197; Явах огноо</span>
            <span class="meta-val">${b.checkout}</span>
          </div>
          <div class="booking-meta-item">
            <span class="meta-lbl">&#128101; Хүн</span>
            <span class="meta-val">${b.guests} хүн</span>
          </div>
          <div class="booking-meta-item">
            <span class="meta-lbl">&#128176; Нийт дүн</span>
            <span class="meta-val meta-total">${b.total}&#8366;</span>
          </div>
        </div>
        <div class="booking-footer-row">
          <span class="booking-id">&#35;${b.id}</span>
          <span class="bstatus-label ${cfg.labelClass}">${cfg.statusLabel}</span>
        </div>
        <div class="booking-actions">
          ${actionBtns[b.status] || actionBtns.done}
        </div>
      </div>
    </div>`
}

function filterAndRender(bookings, tabId) {
  const list  = document.getElementById('booking-list')
  const empty = document.getElementById('booking-empty')
  const tabs  = ['btab-all', 'btab-upcoming', 'btab-active', 'btab-done']
  const statusMap = {
    'btab-upcoming': 'upcoming',
    'btab-active':   'active',
    'btab-done':     'done'
  }

  const filtered = tabId === 'btab-all'
    ? bookings
    : bookings.filter(b => b.status === statusMap[tabId])

  list.querySelectorAll('.booking-card').forEach(c => c.remove())

  if (filtered.length === 0) {
    empty.classList.remove('hidden')
  } else {
    empty.classList.add('hidden')
    filtered.forEach(b => list.insertAdjacentHTML('beforeend', createBookingCard(b)))
  }

  tabs.forEach(t => {
    const btn = document.getElementById(t)
    btn.className = t === tabId ? 'btab btab-on' : 'btab'
    btn.setAttribute('aria-selected', t === tabId ? 'true' : 'false')
  })

  bindButtons()
}

function bindButtons() {
  document.querySelectorAll('.baction-cancel').forEach(btn => {
    btn.onclick = () => {
      if (confirm('Захиалгыг цуцлах уу?')) alert('Захиалга цуцлагдлаа.')
    }
  })
  document.querySelectorAll('.baction-review').forEach(btn => {
    btn.onclick = () => alert('Үнэлгээний систем удахгүй!')
  })
  document.querySelectorAll('.baction-rebook').forEach(btn => {
    btn.onclick = () => { window.location.href = 'index.html' }
  })
  document.querySelectorAll('.baction-view').forEach(btn => {
    btn.onclick = () => alert('Дэлгэрэнгүй хуудас удахгүй!')
  })
}

async function init() {
  const list = document.getElementById('booking-list')
  const tabs = ['btab-all', 'btab-upcoming', 'btab-active', 'btab-done']
 

  let bookings = []
  try {
    bookings = await fetchBookings()
    console.log(bookings)
  } catch (err) {
    list.innerHTML = `<p style="text-align:center;color:red">Өгөгдөл ачааллахад алдаа: ${err.message}</p>`
    return
  }

  // Tab тоо шинэчлэнэ
  document.getElementById('btab-all').textContent =
    `Бүгд (${bookings.length})`
  document.getElementById('btab-upcoming').textContent =
    `→ Ирэх (${bookings.filter(b => b.status === 'upcoming').length})`
  document.getElementById('btab-active').textContent =
    `✓ Идэвхтэй (${bookings.filter(b => b.status === 'active').length})`
  document.getElementById('btab-done').textContent =
    `✓ Дууссан (${bookings.filter(b => b.status === 'done').length})`

  filterAndRender(bookings, 'btab-all')

  tabs.forEach(t => {
    document.getElementById(t).onclick = () => filterAndRender(bookings, t)
  })

  // Dark mode
  document.getElementById('dark-toggle').onclick = function () {
    document.body.classList.toggle('dark-mode')
    this.textContent = document.body.classList.contains('dark-mode') ? '\u2600' : '\u263E'
  }
}

init()