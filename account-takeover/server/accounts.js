import { db } from "./db.js";
import { config } from "dotenv";
import { FingerprintServerApiClient, Region } from "@fingerprint/node-sdk";

config();

const fpServerApiClient = new FingerprintServerApiClient({
  apiKey: process.env.FP_SECRET_API_KEY,
  region: Region.Global,
});

export async function attemptLogin({ email, password, eventId }) {
  if (!email || !password) {
    console.error("Missing email or password.");
    return { success: false, error: "Login failed." };
  }

  if (!eventId) {
    console.error("Missing eventId.");
    return { success: false, error: "Login failed." };
  }

  const event = await fpServerApiClient.getEvent(eventId);
  const visitorId = event.identification.visitor_id;

  if (getRecentFailedAttempts(visitorId) >= 3) {
    logFailedAttempt(visitorId, email);
    console.error("Too many failed login attempts.");
    return {
      success: false,
      error: "Too many failed login attempts. Try again later.",
    };
  }

  const user = findAccountByEmail(email);
  if (!user || user.password !== password) {
    logFailedAttempt(visitorId, email);
    console.error("Invalid credentials");
    return { success: false, error: "Login failed." };
  }

  const accountHasSuccessfulLogins = hasAnySuccessfulLogin(email);
  const visitorHasLoggedInBefore = hasSuccessfulLoginForVisitor(
    email,
    visitorId
  );

  if (accountHasSuccessfulLogins && !visitorHasLoggedInBefore) {
    logFailedAttempt(visitorId, email);
    console.error("Unrecognized device.");
    return {
      success: false,
      error: "Login failed.",
    };
  }

  const botDetected = event.bot !== "not_detected";
  if (botDetected) {
    logFailedAttempt(visitorId, email);
    console.error("Bot detected.");
    return { success: false, error: "Login failed." };
  }

  const suspectScore = event.suspect_score || 0;
  if (suspectScore > 20) {
    logFailedAttempt(visitorId, email);
    console.error(`High Suspect Score detected: ${suspectScore}`);
    return { success: false, error: "Login failed." };
  }

  logSuccessfulAttempt(visitorId, email);
  return { success: true };
}

// --- Helpers ---
// Retrieve a user by email
function findAccountByEmail(email) {
  return db
    .prepare(`SELECT email, password FROM accounts WHERE email = ?`)
    .get(email);
}

// Record a failed login attempt
function logFailedAttempt(visitorId, email) {
  db.prepare(
    `INSERT INTO login_attempts (visitorId, email, success, createdAt) VALUES (?, ?, 0, ?)`
  ).run(visitorId, email, Date.now());
}

// Get the number of recent failed login attempts
function getRecentFailedAttempts(visitorId) {
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const row = db
    .prepare(
      `SELECT COUNT(*) as count
       FROM login_attempts
       WHERE visitorId = ? AND success = 0 AND createdAt >= ?`
    )
    .get(visitorId, since);
  return row.count;
}

// Record a successful login attempt
function hasAnySuccessfulLogin(email) {
  return !!db
    .prepare(
      `SELECT 1 FROM login_attempts WHERE email = ? AND success = 1 LIMIT 1`
    )
    .get(email);
}

// Check if a visitor has successfully logged in for an email
function hasSuccessfulLoginForVisitor(email, visitorId) {
  return !!db
    .prepare(
      `SELECT 1 FROM login_attempts WHERE email = ? AND visitorId = ? AND success = 1 LIMIT 1`
    )
    .get(email, visitorId);
}

// Record a successful login attempt
function logSuccessfulAttempt(visitorId, email) {
  db.prepare(
    `INSERT INTO login_attempts (visitorId, email, success, createdAt) VALUES (?, ?, 1, ?)`
  ).run(visitorId, email, Date.now());
}
