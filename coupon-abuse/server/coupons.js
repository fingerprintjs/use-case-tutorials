import { db } from "./db.js";
import { config } from "dotenv";
import {
  FingerprintJsServerApiClient,
  Region,
} from "@fingerprintjs/fingerprintjs-pro-server-api";

config();

// Change region to match your workspace region
// (e.g., "EU" for Europe, "AP" for Asia, "Global" for Global (default))
const fpServerApiClient = new FingerprintJsServerApiClient({
  apiKey: process.env.FP_SECRET_API_KEY,
  region: Region.Global,
});

// Validate the coupon code
export async function validateCoupon(code, requestId) {
  if (!code) {
    console.error("Missing coupon code.");
    return { success: false, error: "Coupon validation failed." };
  }

  if (!requestId) {
    console.error("Missing requestId.");
    return { success: false, error: "Coupon validation failed." };
  }

  const coupon = getValidCoupon(code);
  if (!coupon) {
    console.error("Invalid coupon code.");
    return { success: false, error: "Coupon validation failed." };
  }

  const event = await fpServerApiClient.getEvent(requestId);

  const botDetected = event.products?.botd?.data?.bot?.result !== "notDetected";

  if (botDetected) {
    console.error("Bot detected.");
    return { success: false, error: "Coupon validation failed." };
  }

  const suspectScore = event.products?.suspectScore?.data?.result || 0;

  if (suspectScore > 20) {
    console.error(`High Suspect Score detected: ${suspectScore}`);
    return { success: false, error: "Coupon validation failed." };
  }

  const visitorId = event.products.identification.data.visitorId;

  if (hasRedeemed(coupon.code, visitorId)) {
    console.error("Coupon has already been redeemed.");
    return { success: false, error: "Coupon has already been redeemed." };
  }

  recordRedemption(coupon.code, visitorId);

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

// Check if the visitor has already redeemed the coupon code
function hasRedeemed(code, visitorId) {
  return !!db
    .prepare(
      `SELECT 1 FROM redemptions WHERE code = ? AND visitorId = ? LIMIT 1`
    )
    .get(code, visitorId);
}

// Record the visitor redeeming the coupon
function recordRedemption(code, visitorId) {
  db.prepare(
    `INSERT INTO redemptions (code, visitorId, createdAt) VALUES (?, ?, ?)`
  ).run(code, visitorId, Date.now());
}
