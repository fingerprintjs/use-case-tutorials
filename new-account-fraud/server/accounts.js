import { db } from "./db.js";

export async function attemptSignup({ username, password }) {
  if (!username || !password) {
    console.error("Missing one or more inputs.");
    return { success: false, error: "Sign up failed." };
  }

  const user = findAccountByUsername(username);
  if (user) {
    console.error("Account already exists");
    return { success: false, error: "Account already exists." };
  }

  db.prepare(
    `INSERT INTO accounts (username, password, createdAt) VALUES (?, ?, ?)`
  ).run(username, password, Date.now());

  return { success: true };
}

// --- Helpers ---
// Retrieve a user by username
function findAccountByUsername(username) {
  return db
    .prepare(`SELECT username FROM accounts WHERE username = ?`)
    .get(username);
}
