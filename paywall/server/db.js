import Database from "better-sqlite3";
import { join } from "path";

const db = new Database(join(process.cwd(), "db.sqlite"));

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles_read (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitorId TEXT NOT NULL,
      articleId TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );
  `);
}

export function resetDb() {
  db.exec(`DELETE FROM articles_read;`);
}

export { db };
