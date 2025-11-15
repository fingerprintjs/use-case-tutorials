import Database from "better-sqlite3";
import { join } from "path";

const db = new Database(join(process.cwd(), "db.sqlite"));

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS survey_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitorId TEXT,
      firstName TEXT,
      email TEXT,
      q1 TEXT,
      q2 TEXT,
      q3 TEXT,
      q4 TEXT,
      createdAt INTEGER
    );
  `);
}

export function resetDb() {
  db.exec(`DELETE FROM survey_submissions;`);
}

export { db };
