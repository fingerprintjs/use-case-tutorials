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

export async function attemptLogin({ email, password, requestId }) {
  if (!email || !password) {
    console.error("Missing email or password.");
    return { success: false, error: "Login failed." };
  }

  if (!requestId) {
    console.error("Missing requestId.");
    return { success: false, error: "Login failed." };
  }

  const event = await fpServerApiClient.getEvent(requestId);
  const visitorId = event.products.identification.data.visitorId;

  const botDetected = event.products?.botd?.data?.bot?.result !== "notDetected";
  if (botDetected) {
    logFailedAttempt(visitorId);
    console.error("Bot detected.");
    return { success: false, error: "Bot detected. Login failed." };
  }

  const suspectScore = event.products?.suspectScore?.data?.result || 0;
  if (suspectScore > 20) {
    logFailedAttempt(visitorId);
    console.error(`High Suspect Score detected: ${suspectScore}`);
    return { success: false, error: "Login failed." };
  }

  if (getRecentFailedAttempts(visitorId) >= 3) {
    logFailedAttempt(visitorId);
    console.error("Too many failed login attempts.");
    return { success: false, error: "Too many failed login attempts." };
  }

  const user = findAccountByEmail(email);
  if (!user || user.password !== password) {
    logFailedAttempt(visitorId);
    console.error("Invalid credentials");
    return { success: false, error: "Login failed." };
  }

  return { success: true };
}

// --- Helpers ---

// Retrieve a user by email
function findAccountByEmail(email) {
  return db
    .prepare(`SELECT email, password FROM accounts WHERE email = ?`)
    .get(email);
}

// Log a failed login attempt
function logFailedAttempt(visitorId) {
  db.prepare(
    `INSERT INTO failed_logins (visitorId, createdAt) VALUES (?, ?)`
  ).run(visitorId, Date.now());
}

// Get the number of recent failed login attempts
function getRecentFailedAttempts(visitorId) {
  const since = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
  const row = db
    .prepare(
      `SELECT COUNT(*) as count 
       FROM failed_logins 
       WHERE visitorId = ? AND createdAt >= ?`
    )
    .get(visitorId, since);
  return row.count;
}
