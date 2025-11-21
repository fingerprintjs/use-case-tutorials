import Database from "better-sqlite3";
import { join } from "path";

const db = new Database(join(process.cwd(), "db.sqlite"));

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sms_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitorId TEXT,
      phone TEXT NOT NULL,
      code TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      expiresAt INTEGER NOT NULL
    );
  `);
}

export function resetDb() {
  db.exec(`DELETE FROM sms_codes;`);
}

export { db };
