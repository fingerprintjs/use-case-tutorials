import { db } from "./db.js";

export async function attemptLogin({ email, password }) {
  if (!email || !password) {
    console.error("Missing email or password.");
    return { success: false, error: "Login failed." };
  }

  const user = findAccountByEmail(email);
  if (!user || user.password !== password) {
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
