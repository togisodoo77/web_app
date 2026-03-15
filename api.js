// ============================================================
// js/api.js
// Серверээс (JSONBin.io) өгөгдөл татах логик.
// fetchProperties() — Property объектын массив буцаана.
// ============================================================

import { Property } from './Property.js';

// ── JSONBin тохиргоо
const BIN_ID  = '69b553a6aa77b81da9e3b886';       
const API_KEY = '$2a$10$JfbWhp19jhTPOB5ZpkShLeUksa7J2IlXw2Q0seUEKNo5qnwARe.JW';      

const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;
// ─────────────────────────────────────────────────────────

/**
 * JSONBin-с байрнуудын өгөгдөл татаж Property объект болгоно.
 * @returns {Promise<Property[]>}
 */
export async function fetchProperties() {
  const response = await fetch(BIN_URL, {
    headers: {
      'X-Master-Key': API_KEY,
      'X-Bin-Meta':   'false'   // зөвхөн record өгөгдөл авна
    }
  });

  if (!response.ok) {
    throw new Error(`Өгөгдөл татахад алдаа: ${response.status}`);
  }

  // X-Bin-Meta: false үед шууд массив ирнэ
  const data = await response.json();

  // data нь массив байх ёстой — аюулгүй шалгалт
  const list = Array.isArray(data) ? data : data.record;

  // JSON объект бүрийг Property классын объект болгоно
  return list.map(item => new Property(item));
}