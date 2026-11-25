import { db } from "./db.js";
import { config } from "dotenv";
import { FingerprintServerApiClient, Region } from "@fingerprint/node-sdk";

config();

const fpServerApiClient = new FingerprintServerApiClient({
  apiKey: process.env.FP_SERVER_API_KEY,
  region: Region.Global,
});

// Free AI credits granted to new accounts at signup
const FREE_SIGNUP_CREDITS = 1000;

export async function attemptSignup({ username, password, event_id }) {
  if (!username || !password || !event_id) {
    console.error("Missing one or more inputs.");
    return { success: false, error: "Signup failed." };
  }

  const user = findAccountByUsername(username);
  if (user) {
    console.error("Account already exists");
    return { success: false, error: "Account already exists." };
  }

  const event = await fpServerApiClient.getEvent(event_id);

  const botDetected = event.bot !== "not_detected";

  if (botDetected) {
    console.error("Bot detected.");
    return { success: false, error: "Signup failed." };
  }

  const suspectScore = event.suspect_score || 0;
  let withholdCredits = false;

  if (suspectScore > 20) {
    console.error(`High Suspect Score detected: ${suspectScore}`);
    withholdCredits = true;
  }

  const visitorId = event.identification.visitor_id;
  const alreadyUsed = hasReceivedFreeCredits(visitorId);

  if (alreadyUsed) {
    console.error("Free credits already used on this device.");
  }

  const creditsApplied = !withholdCredits && !alreadyUsed;

  db.prepare(
    `INSERT INTO accounts (username, password, visitorId, freeCredits, createdAt) VALUES (?, ?, ?, ?, ?)`,
  ).run(
    username,
    password,
    visitorId,
    creditsApplied ? FREE_SIGNUP_CREDITS : 0,
    Date.now(),
  );

  if (!creditsApplied) {
    return {
      success: true,
      creditsApplied: false,
      type: "warning",
      message: alreadyUsed
        ? "Account created. Free credits have already been used on this device. Upgrade to keep going."
        : "Account created. Add a card to unlock your free credits.",
    };
  }

  return {
    success: true,
    creditsApplied: true,
    freeCredits: FREE_SIGNUP_CREDITS,
    type: "success",
    message: "Account created. 1,000 free credits added.",
  };
}

// --- Helpers ---
// Retrieve a user by username
function findAccountByUsername(username) {
  return db
    .prepare(`SELECT username FROM accounts WHERE username = ?`)
    .get(username);
}

// Check if any account on this device has already been granted free credits
function hasReceivedFreeCredits(visitorId) {
  return !!db
    .prepare(
      `SELECT 1 FROM accounts WHERE visitorId = ? AND freeCredits > 0 LIMIT 1`,
    )
    .get(visitorId);
}
