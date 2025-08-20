import { db } from "./db.js";

// Validate the coupon code
export async function validateCoupon(code) {
  if (!code) {
    console.error("Missing coupon code.");
    return { success: false, error: "Coupon validation failed." };
  }

  const coupon = getValidCoupon(code);
  if (!coupon) {
    console.error("Invalid coupon code.");
    return { success: false, error: "Coupon validation failed." };
  }

  return { success: true, ...coupon };
}

// --- Helpers ---
// Retrieve a valid coupon from the database
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
