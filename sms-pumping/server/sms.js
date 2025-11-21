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

export async function sendSMS({ name, phone, requestId }) {
  if (!name || !phone) {
    return { success: false, message: "Name and phone number are required." };
  }

  const event = await fpServerApiClient.getEvent(requestId);

  const botDetected = event.products?.botd?.data?.bot?.result !== "notDetected";
  if (botDetected) {
    console.error("Bot detected.");
    return { success: false, message: "SMS verification failed." };
  }

  const suspectScore = event.products?.suspectScore?.data?.result || 0;
  if (suspectScore > 20) {
    console.error(`High Suspect Score detected: ${suspectScore}`);
    return { success: false, message: "SMS verification failed." };
  }

  const visitorId = event.products.identification.data.visitorId;

  if (countRecentSMSRequests(visitorId) >= 5) {
    console.error("Too many SMS verification codes sent in the last 24 hours.");
    return { success: false, message: "SMS verification failed." };
  }

  sendVerificationCode(phone, visitorId);

  return {
    success: true,
    message: "A verification code has been sent to your phone.",
  };
}

// --- Helpers ---
// Generate, save, and send a random 6-digit verification code
function sendVerificationCode(phone, visitorId) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const createdAt = Date.now();
  const expiresAt = createdAt + 1000 * 60 * 10; // 10 minutes

  // No SMS integration in the tutorial. Just pretend. ;)
  console.log(`Pretending to send SMS to ${phone}`);

  db.prepare(
    "INSERT INTO sms_codes (visitorId, phone, code, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?)"
  ).run(visitorId, phone, code, createdAt, expiresAt);
}

// Count visitor's SMS code requests sent in the last 24 hours
function countRecentSMSRequests(visitorId) {
  const since = Date.now() - 24 * 60 * 60 * 1000;

  const row = db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM sms_codes
       WHERE visitorId = ? AND createdAt >= ?`
    )
    .get(visitorId, since);

  return row.count;
}
