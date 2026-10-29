import { db } from "./db.js";

// Welcome bonus granted to new accounts, in trading credits
const WELCOME_BONUS_CREDITS = 100;

export async function attemptSignup({ username, password }) {
  if (!username || !password) {
    console.error("Missing one or more inputs.");
    return { success: false, error: "Signup failed." };
  }

  const user = findAccountByUsername(username);
  if (user) {
    console.error("Account already exists");
    return { success: false, error: "Account already exists." };
  }

  db.prepare(
    `INSERT INTO accounts (username, password, bonusGranted, createdAt) VALUES (?, ?, 1, ?)`,
  ).run(username, password, Date.now());

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
