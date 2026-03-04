import { db } from "./db.js";
import { config } from "dotenv";
import {
  FingerprintServerApiClient,
  Region,
} from "@fingerprint/node-sdk";

config();

// Change region to match your workspace region
// (e.g., "EU" for Europe, "AP" for Asia, "Global" for Global (default))
const fpServerApiClient = new FingerprintServerApiClient({
  apiKey: process.env.FP_SECRET_API_KEY,
  region: Region.Global,
});

export async function attemptLogin({ email, password, eventId }) {
  if (!email || !password) {
    console.error("Missing email or password.");
    return { success: false, error: "Login failed." };
  }

  const user = findAccountByEmail(email);
  if (!user || user.password !== password) {
    console.error("Invalid credentials");
    return { success: false, error: "Login failed." };
  }

  const event = await fpServerApiClient.getEvent(eventId);

  const botDetected = event.bot !== "not_detected";

  if (botDetected) {
    console.error("Bot detected.");
    return { success: false, error: "Login failed." };
  }

  const suspectScore = event.suspect_score || 0;

  if (suspectScore > 20) {
    console.error(`High Suspect Score detected: ${suspectScore}`);
    return { success: false, error: "Login failed." };
  }

  const visitorId = event.identification.visitor_id;

  const last = getLastDeviceFor(email);
  if (last && last.visitorId !== visitorId) {
    console.error("Access from new device detected.");
    return {
      success: false,
      error:
        "You can only access this account from one device. (Reset the demo to simulate logging out on the other device.)",
    };
  }
  if (!last) saveDeviceFor(email, visitorId);

  return { success: true };
}

// --- Helpers ---
// Retrieve a user by email
function findAccountByEmail(email) {
  return db
    .prepare(`SELECT email, password FROM accounts WHERE email = ?`)
    .get(email);
}

// Get the last seen device for the user
function getLastDeviceFor(email) {
  return db
    .prepare(`SELECT visitorId FROM account_devices WHERE email = ?`)
    .get(email);
}

// Record the visitor's device on logging in
function saveDeviceFor(email, visitorId) {
  db.prepare(
    `INSERT OR IGNORE INTO account_devices (email, visitorId, createdAt)
     VALUES (?, ?, ?)`
  ).run(email, visitorId, Date.now());
}
