import { db } from "./db.js";
import { config } from "dotenv";
import {
  FingerprintJsServerApiClient,
  Region,
} from "@fingerprintjs/fingerprintjs-pro-server-api";

config();

const fpServerApiClient = new FingerprintJsServerApiClient({
  apiKey: process.env.FP_SECRET_API_KEY,
  region: Region.Global,
});

export async function placeOrder(body) {
  const { recipientEmail, amount, cardNumber, cardExp, cardCvv, eventId } =
    body;

  const event = await fpServerApiClient.getEvent(eventId);

  const botDetected = event.products?.botd?.data?.bot?.result !== "notDetected";
  if (botDetected) {
    console.error("Bot detected.");
    return { success: false, message: "Order failed." };
  }

  const suspectScore = event.products?.suspectScore?.data?.result || 0;
  if (suspectScore > 20) {
    console.error(`High Suspect Score detected: ${suspectScore}`);
    return { success: false, message: "Order failed." };
  }

  const visitorId = event.products.identification.data.visitorId;
  if (countRecentOrders(visitorId) >= 5) {
    console.error("Too many orders placed in the last 24 hours.");
    return { success: false, message: "Order failed." };
  }

  const { valid, errors } = validatePaymentFields({
    cardNumber,
    cardExp,
    cardCvv,
  });

  if (!valid) {
    console.error("Invalid payment details.");
    return { success: false, message: errors.join("\n") };
  }

  saveOrder({ recipientEmail, amount, visitorId });

  return { success: true, message: "Order placed successfully." };
}

// --- Helpers ---
// Validate payment fields
function validatePaymentFields({ cardNumber, cardExp, cardCvv }) {
  const num = cardNumber.replace(/\D/g, "");
  const cvvDigits = cardCvv.replace(/\D/g, "");
  const errors = [];

  if (!cardNumber.trim()) errors.push("Card number is required.");
  if (!cardExp.trim()) errors.push("Expiration date is required.");
  if (!cardCvv.trim()) errors.push("CVV is required.");
  if (errors.length > 0) return { valid: false, errors };
  if (num.length !== 16) errors.push("Card number must be 16 digits.");
  if (!/^\d{2}\/\d{2}$/.test(cardExp)) errors.push("Expiration must be MM/YY.");
  if (cvvDigits.length !== 3 && cvvDigits.length !== 4)
    errors.push("CVV must be 3 or 4 digits.");

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Save the order to the database
function saveOrder({ recipientEmail, amount, visitorId }) {
  db.prepare(
    "INSERT INTO orders (recipientEmail, amount, visitorId, createdAt) VALUES (?, ?, ?, ?)"
  ).run(recipientEmail, amount, visitorId, Date.now());
}

// Count visitor's orders placed in the last 24 hours
function countRecentOrders(visitorId) {
  const since = Date.now() - 24 * 60 * 60 * 1000;

  const row = db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM orders
       WHERE visitorId = ? AND createdAt >= ?`
    )
    .get(visitorId, since);

  return row.count;
}
