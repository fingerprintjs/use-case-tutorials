import { db } from "./db.js";

// Free AI credits granted to new accounts at signup
const FREE_SIGNUP_CREDITS = 1000;

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
    `INSERT INTO accounts (username, password, freeCredits, createdAt) VALUES (?, ?, ?, ?)`,
  ).run(username, password, FREE_SIGNUP_CREDITS, Date.now());

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
