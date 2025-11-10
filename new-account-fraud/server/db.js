import Database from "better-sqlite3";
import { join } from "path";

const db = new Database(join(process.cwd(), "db.sqlite"));

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      visitorId TEXT,
      createdAt INTEGER NOT NULL
    );
  `);
}

export function resetDb() {
  db.exec(`DELETE FROM accounts;`);
}

export { db };
