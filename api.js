// ============================================================
// api.js
// ============================================================

import { Property } from "./Property.js"

const BIN_ID  = "69b553a6aa77b81da9e3b886"
const API_KEY = "$2a$10$JfbWhp19jhTPOB5ZpkShLeUksa7J2IlXw2Q0seUEKNo5qnwARe.JW"
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`  

export async function fetchProperties() {
  const response = await fetch(BIN_URL, {
    headers: {
      "X-Master-Key": API_KEY,
      "X-Bin-Meta": "false",
    },
  })

  if (!response.ok) {
    throw new Error(`Өгөгдөл татахад алдаа: ${response.status}`)
  }

  const data = await response.json()
  console.log("Татсан өгөгдөл:", data)

  // Шинэ бүтэц: { properties: [...], bookings: [...] }
  // Хуучин бүтэц: [ ... ] массив — хоёуланд нь ажиллана
  const list = Array.isArray(data)
    ? data
    : (data.properties || data.record?.properties || data.record)

  return list.map((item) => new Property(item))
}

// Захиалга татах функц — booking.js ашиглана
export async function fetchBookings() {
  const response = await fetch(BIN_URL, {
    headers: {
      "X-Master-Key": API_KEY,
      "X-Bin-Meta": "false",
    },
  })

  if (!response.ok) {
    throw new Error(`Өгөгдөл татахад алдаа: ${response.status}`)
  }

  const data = await response.json()

  const list = Array.isArray(data)
    ? data
    : (data.bookings || data.record?.bookings || [])

  return list
}