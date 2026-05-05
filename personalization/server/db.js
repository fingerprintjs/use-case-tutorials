import Database from "better-sqlite3";
import { join } from "path";

const db = new Database(join(process.cwd(), "db.sqlite"));

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS visitor_preferences (
      visitorId       TEXT    PRIMARY KEY,
      filters         TEXT    NOT NULL DEFAULT '{}',
      recentlyViewed  TEXT    NOT NULL DEFAULT '[]',
      updatedAt       INTEGER NOT NULL DEFAULT 0
    );
  `);
}

export function resetDb() {
  db.exec(`DELETE FROM visitor_preferences;`);
}

export { db };
