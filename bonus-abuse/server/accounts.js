import { db } from "./db.js";
import { config } from "dotenv";
import { FingerprintServerApiClient, Region } from "@fingerprint/node-sdk";

config();

const fpServerApiClient = new FingerprintServerApiClient({
  apiKey: process.env.FP_SERVER_API_KEY,
  region: Region.Global,
});

// Welcome bonus granted to new accounts, in trading credits
const WELCOME_BONUS_CREDITS = 100;

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
  let withholdBonus = false;

  if (suspectScore > 20) {
    console.error(`High Suspect Score detected: ${suspectScore}`);
    withholdBonus = true;
  }

  const visitorId = event.identification.visitor_id;
  const alreadyClaimed = hasReceivedBonus(visitorId);

  if (alreadyClaimed) {
    console.error("Welcome bonus already claimed on this device.");
  }

  const bonusApplied = !withholdBonus && !alreadyClaimed;

  db.prepare(
    `INSERT INTO accounts (username, password, visitorId, bonusGranted, createdAt) VALUES (?, ?, ?, ?, ?)`,
  ).run(username, password, visitorId, bonusApplied ? 1 : 0, Date.now());

  if (!bonusApplied) {
    return {
      success: true,
      bonusApplied: false,
      type: "warning",
      message: alreadyClaimed
        ? "Account created. The welcome bonus has already been claimed on this device."
        : "Account created. The welcome bonus could not be applied to this account.",
    };
  }

  return {
    success: true,
    bonusApplied: true,
    bonusCredits: WELCOME_BONUS_CREDITS,
    type: "success",
    message: "Account created. Welcome bonus applied.",
  };
}

// --- Helpers ---
// Retrieve a user by username
function findAccountByUsername(username) {
  return db
    .prepare(`SELECT username FROM accounts WHERE username = ?`)
    .get(username);
}

// Check if any account on this device has already received the welcome bonus
function hasReceivedBonus(visitorId) {
  return !!db
    .prepare(
      `SELECT 1 FROM accounts WHERE visitorId = ? AND bonusGranted = 1 LIMIT 1`,
    )
    .get(visitorId);
}
