import { db } from "./db.js";

// Validate the coupon code
export async function validateCoupon(code) {
  if (!code) {
    return { success: false, error: "Coupon is required." };
  }

  const coupon = getValidCoupon(code);
  if (!coupon) {
    return { success: false, error: "Invalid coupon." };
  }

  return { success: true, ...coupon };
}

// --- Helpers ---
function getValidCoupon(code) {
  const row = db
    .prepare(
      `
      SELECT code, discountPct
      FROM coupons
      WHERE code = ? COLLATE NOCASE
    `
    )
    .get(code);

  return row
    ? { code: row.code.toUpperCase(), discountPct: row.discountPct }
    : null;
}
