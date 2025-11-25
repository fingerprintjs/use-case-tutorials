import Database from "better-sqlite3";
import { join } from "path";

const db = new Database(join(process.cwd(), "db.sqlite"));

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventName TEXT NOT NULL,
      eventDate TEXT NOT NULL,
      ticketCount INTEGER NOT NULL,
      venue TEXT NOT NULL,
      sellerEmail TEXT NOT NULL,
      price REAL NOT NULL,
      ticketDescription TEXT NOT NULL,
      visitorId TEXT,
      createdAt INTEGER NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_listings_unique ON listings (eventName, eventDate, sellerEmail);

    CREATE TABLE IF NOT EXISTS banned_visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      visitorId TEXT,
      bannedAt INTEGER NOT NULL
    );
  `);

  seedDefaults();
}

function seedDefaults() {
  const upsert = db.prepare(`
    INSERT INTO listings(eventName, eventDate, ticketCount, venue, sellerEmail, price, ticketDescription, createdAt)
    VALUES (@eventName, @eventDate, @ticketCount, @venue, @sellerEmail, @price, @ticketDescription, @createdAt)
    ON CONFLICT(eventName, eventDate, sellerEmail) DO NOTHING;
  `);

  const rows = [
    {
      eventName: "Midnight Echo Tour",
      eventDate: "2025-05-24",
      ticketCount: 2,
      venue: "Horizon Arena",
      sellerEmail: "alex.tickets@example.com",
      price: 120,
      ticketDescription: "General Admission",
      createdAt: Date.now(),
    },
    {
      eventName: "Neon Skyline Festival",
      eventDate: "2025-06-02",
      ticketCount: 1,
      venue: "Riverfront Park",
      sellerEmail: "taylor.resell@example.com",
      price: 185,
      ticketDescription: "Section 112",
      createdAt: Date.now(),
    },
    {
      eventName: "Aurora Lights Live",
      eventDate: "2025-07-12",
      ticketCount: 1,
      venue: "Skyline Dome",
      sellerEmail: "jamie.sells@example.com",
      price: 95,
      ticketDescription: "Section 218",
      createdAt: Date.now(),
    },
  ];

  const txn = db.transaction(() => rows.forEach((r) => upsert.run(r)));
  txn();
}

export function resetDb() {
  db.exec(`DELETE FROM listings;`);
  db.exec(`DELETE FROM banned_visitors;`);
  seedDefaults();
}

export { db };
