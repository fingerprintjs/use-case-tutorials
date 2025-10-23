import Database from "better-sqlite3";
import { join } from "path";

const db = new Database(join(process.cwd(), "db.sqlite"));

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS loan_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitorId TEXT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      monthlyIncome INTEGER NOT NULL,
      loanAmount INTEGER NOT NULL,
      loanTerms INTEGER NOT NULL,
      personalHash TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );
  `);
}

export function resetDb() {
  db.exec(`DELETE FROM loan_applications;`);
}

export { db };
