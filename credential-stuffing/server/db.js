import Database from "better-sqlite3";
import { join } from "path";

const db = new Database(join(process.cwd(), "db.sqlite"));

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      email TEXT PRIMARY KEY,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS failed_logins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitorId TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );
  `);
}

export function seedDefaults() {
  const upsert = db.prepare(`
    INSERT INTO accounts(email, password)
    VALUES (@email, @password)
    ON CONFLICT(email) DO UPDATE SET
      password = excluded.password
  `);

  const rows = [
    { email: "demo@example.com", password: "password123" },
    { email: "admin@example.com", password: "password" },
    { email: "user@example.com", password: "grapejuice" },
  ];

  const txn = db.transaction(() => rows.forEach((r) => upsert.run(r)));
  txn();
}

export function resetDb() {
  db.exec(`DELETE FROM failed_logins;`);
}

export { db };
