import { db } from "./db.js";
import { config } from "dotenv";
import {
  FingerprintServerApiClient,
  Region,
} from "@fingerprint/node-sdk";

config();

const fpServerApiClient = new FingerprintServerApiClient({
  apiKey: process.env.FP_SECRET_API_KEY,
  region: Region.Global,
});

export async function attemptSignup({ username, password, eventId }) {
  if (!username || !password || !eventId) {
    console.error("Missing one or more inputs.");
    return { success: false, error: "Sign up failed." };
  }

  const user = findAccountByUsername(username);
  if (user) {
    console.error("Account already exists");
    return { success: false, error: "Signup failed." };
  }

  const event = await fpServerApiClient.getEvent(eventId);

  const botDetected = event.bot !== "not_detected";

  if (botDetected) {
    console.error("Bot detected.");
    return { success: false, error: "Signup failed." };
  }

  const suspectScore = event.suspect_score || 0;

  if (suspectScore > 20) {
    console.error(`High Suspect Score detected: ${suspectScore}`);
    return { success: false, error: "Signup failed." };
  }

  const visitorId = event.identification.visitor_id;
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
