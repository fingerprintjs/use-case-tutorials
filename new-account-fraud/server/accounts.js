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

export async function attemptSignup({ username, password, requestId }) {
  if (!username || !password || !requestId) {
    console.error("Missing one or more inputs.");
    return { success: false, error: "Sign up failed." };
  }

  const user = findAccountByUsername(username);
  if (user) {
    console.error("Account already exists");
    return { success: false, error: "Signup failed." };
  }

  const event = await fpServerApiClient.getEvent(requestId);

  const botDetected = event.products?.botd?.data?.bot?.result !== "notDetected";

  if (botDetected) {
    console.error("Bot detected.");
    return { success: false, error: "Signup failed." };
  }

  const suspectScore = event.products?.suspectScore?.data?.result || 0;

  if (suspectScore > 20) {
    console.error(`High Suspect Score detected: ${suspectScore}`);
    return { success: false, error: "Signup failed." };
  }

  const visitorId = event.products.identification.data.visitorId;
  const account = findAccountByVisitorId(visitorId);
  if (account) {
    console.error("Account already exists for this device.");
    return { success: false, error: "Signup failed." };
  }

  db.prepare(
    `INSERT INTO accounts (username, password, visitorId, createdAt) VALUES (?, ?, ?, ?)`
  ).run(username, password, visitorId, Date.now());

  return { success: true };
}

// --- Helpers ---
// Retrieve a user by username
function findAccountByUsername(username) {
  return db
    .prepare(`SELECT username FROM accounts WHERE username = ?`)
    .get(username);
}

// Check if the device has already created an account
function findAccountByVisitorId(visitorId) {
  const row = db
    .prepare(`SELECT username FROM accounts WHERE visitorId = ? LIMIT 1`)
    .get(visitorId);
  return row;
}
