// ============================================================
// api.js — JSONBin-аас өгөгдөл татах
// ============================================================

import { Property } from "./Property.js"

const BIN_ID = "69b553a6aa77b81da9e3b886"
const API_KEY = "$2a$10$JfbWhp19jhTPOB5ZpkShLeUksa7J2IlXw2Q0seUEKNo5qnwARe.JW"
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`

/**
 * JSONBin v3: { record: ... }, шууд массив, эсвэл { properties } гэх мэт
 */
function unwrapPayload(data) {
  if (data == null) {
    return null
  }
  if (Array.isArray(data)) {
    return data
  }
  if (typeof data === "object" && "record" in data) {
    return data.record
  }
  return data
}

function extractPropertiesList(data) {
  const inner = unwrapPayload(data)

  if (Array.isArray(inner)) {
    return inner
  }
  if (inner && typeof inner === "object") {
    if (Array.isArray(inner.properties)) {
      return inner.properties
    }
  }
  return []
}

function extractBookingsList(data) {
  const inner = unwrapPayload(data)

  if (Array.isArray(inner)) {
    return inner
  }
  if (inner && typeof inner === "object" && Array.isArray(inner.bookings)) {
    return inner.bookings
  }
  return []
}

async function fetchBinJson() {
  const response = await fetch(BIN_URL, {
    headers: {
      "X-Master-Key": API_KEY,
      "X-Bin-Meta": "false",
    },
  })

  if (!response.ok) {
    throw new Error(`Өгөгдөл татахад алдаа: ${response.status}`)
  }

  return response.json()
}

export async function fetchProperties() {
  const data = await fetchBinJson()
  const list = extractPropertiesList(data)

  if (!Array.isArray(list)) {
    return []
  }

  return list
    .filter((item) => item && typeof item === "object")
    .map((item) => new Property(item))
}

export async function fetchBookings() {
  const data = await fetchBinJson()
  const list = extractBookingsList(data)

  if (!Array.isArray(list)) {
    return []
  }

  return list
}
