import Database from "better-sqlite3";
import { join } from "path";

const db = new Database(join(process.cwd(), "db.sqlite"));

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      orderNumber INTEGER PRIMARY KEY AUTOINCREMENT,
      visitorId TEXT,
      recipientEmail TEXT NOT NULL,
      amount REAL NOT NULL,
      createdAt INTEGER NOT NULL
    );
  `);
}

export function resetDb() {
  db.exec(`DELETE FROM orders;`);
}

export { db };
