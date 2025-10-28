import Database from "better-sqlite3";
import { join } from "path";
import { readFileSync, existsSync } from "fs";

const db = new Database(join(process.cwd(), "db.sqlite"));

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS flights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      flight_number TEXT NOT NULL,
      airline TEXT NOT NULL,
      origin_city TEXT NOT NULL,
      origin_airport TEXT NOT NULL,
      destination_city TEXT NOT NULL,
      destination_airport TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      arrival_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      price_usd REAL NOT NULL
    );
  `);

  seedDefaults();
}

function seedDefaults() {
  const row = db.prepare(`SELECT COUNT(*) AS cnt FROM flights`).get();
  if (row.cnt > 0) return;

  const seedPath = join(process.cwd(), "flights.sql");
  if (!existsSync(seedPath)) {
    throw new Error(`Flight seed file not found at ${seedPath}`);
  }

  const sql = readFileSync(seedPath, "utf8");
  db.exec(sql);
}

export { db };
