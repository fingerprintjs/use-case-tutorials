import Database from "better-sqlite3";
import { join } from "path";

const db = new Database(join(process.cwd(), "db.sqlite"));

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS coupons (
      code TEXT PRIMARY KEY,
      discountPct INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS redemptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      visitorId TEXT,
      createdAt INTEGER NOT NULL
    );
  `);
}

export function seedDefaultCoupons() {
  const upsert = db.prepare(`
    INSERT INTO coupons(code, discountPct)
    VALUES (@code, @discountPct)
    ON CONFLICT(code) DO UPDATE SET
      discountPct=excluded.discountPct
  `);

  const rows = [
    { code: "WELCOME20", discountPct: 20 },
    { code: "SAVE10", discountPct: 10 },
  ];

  const txn = db.transaction(() => rows.forEach((r) => upsert.run(r)));
  txn();
}

export function resetDb() {
  db.exec(`DELETE FROM redemptions;`);
}

export { db };
