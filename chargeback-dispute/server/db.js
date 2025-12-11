import Database from "better-sqlite3";
import { join } from "path";

const db = new Database(join(process.cwd(), "db.sqlite"));

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventName TEXT NOT NULL,
      ticketQuantity INTEGER NOT NULL,
      price REAL NOT NULL,
      creditCard TEXT NOT NULL,
      deliveryEmail TEXT NOT NULL,
      visitorId TEXT,
      chargeback INTEGER DEFAULT 0,
      createdAt INTEGER NOT NULL
    );
  `);

  seedDefaults();
}

function seedDefaults() {
  const count = db.prepare("SELECT COUNT(*) as count FROM purchases").get();
  if (count.count > 0) return;

  const insert = db.prepare(`
    INSERT INTO purchases(eventName, ticketQuantity, price, creditCard, deliveryEmail, chargeback, createdAt)
    VALUES (@eventName, @ticketQuantity, @price, @creditCard, @deliveryEmail, @chargeback, @createdAt)
  `);

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const purchases = [
    {
      eventName: "Midnight Echo Tour",
      ticketQuantity: 2,
      price: 89.0,
      creditCard: "card 1 - 8865",
      deliveryEmail: "casey.andrews@example.com",
      chargeback: 0,
      createdAt: now - oneDay * 10,
    },
    {
      eventName: "Neon Skyline Festival",
      ticketQuantity: 1,
      price: 145.0,
      creditCard: "card 2 - 9012",
      deliveryEmail: "sarah.martin@example.com",
      chargeback: 0,
      createdAt: now - oneDay * 8,
    },
    {
      eventName: "Aurora Lights Live",
      ticketQuantity: 3,
      price: 79.0,
      creditCard: "card 1 - 8865",
      deliveryEmail: "casey.andrews@example.com",
      chargeback: 0,
      createdAt: now - oneDay * 7,
    },
    {
      eventName: "City Lights Jazz Night",
      ticketQuantity: 1,
      price: 65.0,
      creditCard: "card 1 - 3456",
      deliveryEmail: "mike.chen@example.com",
      chargeback: 0,
      createdAt: now - oneDay * 6,
    },
    {
      eventName: "Golden Hour Sessions",
      ticketQuantity: 2,
      price: 110.0,
      creditCard: "card 2 - 6789",
      deliveryEmail: "emily.jones@example.com",
      chargeback: 0,
      createdAt: now - oneDay * 5,
    },
    {
      eventName: "Skyline EDM Bash",
      ticketQuantity: 4,
      price: 130.0,
      creditCard: "card 1 - 8865",
      deliveryEmail: "casey.andrews@example.com",
      chargeback: 0,
      createdAt: now - oneDay * 4,
    },
    {
      eventName: "Acoustic Evenings Live",
      ticketQuantity: 1,
      price: 55.0,
      creditCard: "card 2 - 9012",
      deliveryEmail: "sarah.martin@example.com",
      chargeback: 0,
      createdAt: now - oneDay * 3,
    },
    {
      eventName: "Stadium Rock Night",
      ticketQuantity: 2,
      price: 155.0,
      creditCard: "card 1 - 3456",
      deliveryEmail: "mike.chen@example.com",
      chargeback: 0,
      createdAt: now - oneDay * 2,
    },
    {
      eventName: "Indie Nights Showcase",
      ticketQuantity: 1,
      price: 72.0,
      creditCard: "card 2 - 6789",
      deliveryEmail: "emily.jones@example.com",
      chargeback: 0,
      createdAt: now - oneDay * 1,
    },
    {
      eventName: "Summer Waves Tour",
      ticketQuantity: 3,
      price: 99.0,
      creditCard: "card 1 - 8865",
      deliveryEmail: "casey.andrews@example.com",
      chargeback: 0,
      createdAt: now - oneDay * 0.5,
    },
  ];

  const txn = db.transaction(() => purchases.forEach((p) => insert.run(p)));
  txn();
}

export function resetDb() {
  db.exec(`DELETE FROM purchases;`);
  seedDefaults();
}

export { db };
