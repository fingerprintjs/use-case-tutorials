import { db } from "./db.js";
import { config } from "dotenv";
import {
  FingerprintServerApiClient,
  Region,
} from "@fingerprint/node-sdk";

config();

const fpServerApiClient = new FingerprintServerApiClient({
  apiKey: process.env.FP_SECRET_API_KEY,
  region: Region.Global,
});

export async function postPurchase(body) {
  const createdAt = Date.now();

  const { eventId } = body;
  const event = await fpServerApiClient.getEvent(eventId);
  const visitorId = event.identification.visitor_id;

  try {
    db.prepare(
      `INSERT INTO purchases (eventName, ticketQuantity, price, creditCard, deliveryEmail, visitorId, createdAt)
      VALUES (@eventName, @ticketQuantity, @price, @creditCard, @deliveryEmail, @visitorId, @createdAt)`
    ).run({ ...body, visitorId, createdAt });
    return { success: true, message: "Purchase completed successfully." };
  } catch (err) {
    console.error("Failed to save purchase:", err);
    return {
      success: false,
      message: "Failed to save purchase: " + err.message,
    };
  }
}

export function getUserPurchases(email) {
  try {
    const purchases = db
      .prepare(
        "SELECT id, eventName, ticketQuantity, price, creditCard, deliveryEmail, chargeback, createdAt FROM purchases WHERE deliveryEmail = ?"
      )
      .all(email);
    return { success: true, purchases };
  } catch (err) {
    console.error("Failed to get user purchases:", err);
    return {
      success: false,
      message: "Failed to get user purchases: " + err.message,
    };
  }
}

export function getRelatedPurchases(orderId) {
  try {
    const purchase = db
      .prepare("SELECT deliveryEmail, visitorId FROM purchases WHERE id = ?")
      .get(orderId);

    if (!purchase) {
      return {
        success: false,
        message: "No purchase found for the given order ID.",
      };
    }

    const { deliveryEmail, visitorId } = purchase;

    const purchases = db
      .prepare(
        `SELECT id, eventName, ticketQuantity, price, creditCard, deliveryEmail, chargeback, visitorId, createdAt
        FROM purchases
        WHERE deliveryEmail = ? OR visitorId = ?
        ORDER BY createdAt DESC`
      )
      .all(deliveryEmail, visitorId);

    return { success: true, purchases };
  } catch (err) {
    console.error("Failed to get purchases:", err);
    return {
      success: false,
      message: "Failed to get purchases: " + err.message,
    };
  }
}

export function getAllPurchases() {
  try {
    const purchases = db
      .prepare(
        "SELECT id, eventName, ticketQuantity, price, creditCard, deliveryEmail, chargeback, createdAt FROM purchases ORDER BY createdAt DESC"
      )
      .all();
    return { success: true, purchases };
  } catch (err) {
    console.error("Failed to get all purchases:", err);
    return {
      success: false,
      message: "Failed to get all purchases: " + err.message,
    };
  }
}

export function disputePurchase(purchaseId) {
  try {
    db.prepare("UPDATE purchases SET chargeback = 1 WHERE id = ?").run(
      purchaseId
    );
    return { success: true, message: "Chargeback initiated successfully." };
  } catch (err) {
    console.error("Failed to dispute purchase:", err);
    return {
      success: false,
      message: "Failed to dispute purchase: " + err.message,
    };
  }
}

export function getEvents() {
  const events = [
    {
      id: 1,
      name: "Midnight Echo Tour",
      dateVenue: "Fri · May 23 · Horizon Arena",
      location: "Metropolis, NY",
      price: "$89.00",
    },
    {
      id: 2,
      name: "Neon Skyline Festival",
      dateVenue: "Sat · Jun 7 · Riverfront Park",
      location: "Portside, OR",
      price: "$145.00",
    },
    {
      id: 3,
      name: "Aurora Lights Live",
      dateVenue: "Thu · Jul 10 · Skyline Dome",
      location: "Northbridge, IL",
      price: "$79.00",
    },
    {
      id: 4,
      name: "City Lights Jazz Night",
      dateVenue: "Sun · May 18 · Blue Note Hall",
      location: "Harbor City, CA",
      price: "$65.00",
    },
    {
      id: 5,
      name: "Golden Hour Sessions",
      dateVenue: "Fri · Aug 1 · Sunset Pavilion",
      location: "Seaside, FL",
      price: "$110.00",
    },
    {
      id: 6,
      name: "Skyline EDM Bash",
      dateVenue: "Sat · Sep 6 · Pulse Arena",
      location: "Lakeside, TX",
      price: "$130.00",
    },
    {
      id: 7,
      name: "Acoustic Evenings Live",
      dateVenue: "Wed · Jun 11 · Old Town Theater",
      location: "Redwood, WA",
      price: "$55.00",
    },
    {
      id: 8,
      name: "Stadium Rock Night",
      dateVenue: "Sat · Aug 16 · Grandview Stadium",
      location: "Capitol City, DC",
      price: "$155.00",
    },
    {
      id: 9,
      name: "Indie Nights Showcase",
      dateVenue: "Thu · Jul 3 · Warehouse 12",
      location: "Bricktown, MA",
      price: "$72.00",
    },
    {
      id: 10,
      name: "Summer Waves Tour",
      dateVenue: "Sun · Aug 24 · Shoreline Amphitheater",
      location: "Bayview, CA",
      price: "$99.00",
    },
    {
      id: 11,
      name: "Retro Synth Reunion",
      dateVenue: "Fri · Sep 5 · Neon Hall",
      location: "Brighton, MI",
      price: "$88.00",
    },
    {
      id: 12,
      name: "Night Market Sessions",
      dateVenue: "Sat · Oct 4 · Lantern Square",
      location: "Evergreen, CO",
      price: "$60.00",
    },
  ];

  return { success: true, events };
}
