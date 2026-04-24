import fs from "fs";
import { db } from "./db.js";
import { config } from "dotenv";
import { FingerprintServerApiClient, Region } from "@fingerprint/node-sdk";

config();

const fpServerApiClient = new FingerprintServerApiClient({
  apiKey: process.env.FP_SECRET_API_KEY,
  region: Region.Global,
});

export async function getRentals(eventId) {
  const event = await fpServerApiClient.getEvent(eventId);
  const visitorId = event.identification.visitor_id;
  const { latitude, longitude } =
    event.ip_info.v4.geolocation || event.ip_info.v6.geolocation || {};

  const rentals = JSON.parse(
    fs.readFileSync("./server/data/rentals.json", "utf-8")
  );

  let hotRentals = rentals.slice(0, 3);

  if (latitude && longitude) {
    rentals.sort((a, b) => {
      const da = (a.lat - latitude) ** 2 + (a.lng - longitude) ** 2;
      const db = (b.lat - latitude) ** 2 + (b.lng - longitude) ** 2;
      return da - db;
    });
  }

  const savedFilters = getFiltersFor(visitorId);

  const viewedIds = getRecentlyViewedFor(visitorId) ?? [];
  if (viewedIds.length > 0) {
    hotRentals = viewedIds
      .map((id) => rentals.find((r) => r.id === id))
      .filter(Boolean)
      .slice(0, 3);
  }

  return { success: true, rentals, hotRentals, savedFilters };
}

export function saveFilters(visitorId, filters) {
  if (!visitorId || !filters) {
    return { success: false, error: "Request failed." };
  }
  saveFiltersFor(visitorId, filters);
  return { success: true };
}

export function addRecentlyViewed(visitorId, rentalId) {
  if (!visitorId || !rentalId) {
    return { success: false, error: "Request failed." };
  }
  const current = getRecentlyViewedFor(visitorId) ?? [];
  const updated = [rentalId, ...current.filter((id) => id !== rentalId)].slice(
    0,
    10
  );
  db.prepare(
    `
    INSERT INTO visitor_preferences (visitorId, recentlyViewed, updatedAt)
    VALUES (?, ?, ?)
    ON CONFLICT(visitorId) DO UPDATE SET recentlyViewed = excluded.recentlyViewed, updatedAt = excluded.updatedAt
  `
  ).run(visitorId, JSON.stringify(updated), Date.now());
  return { success: true };
}

// --- Helper functions ---
function getFiltersFor(visitorId) {
  const row = db
    .prepare(`SELECT filters FROM visitor_preferences WHERE visitorId = ?`)
    .get(visitorId);
  return row ? JSON.parse(row.filters) : null;
}

function saveFiltersFor(visitorId, filters) {
  db.prepare(
    `
    INSERT INTO visitor_preferences (visitorId, filters, updatedAt)
    VALUES (?, ?, ?)
    ON CONFLICT(visitorId) DO UPDATE SET filters = excluded.filters, updatedAt = excluded.updatedAt
  `
  ).run(visitorId, JSON.stringify(filters), Date.now());
}

function getRecentlyViewedFor(visitorId) {
  const row = db
    .prepare(
      `SELECT recentlyViewed FROM visitor_preferences WHERE visitorId = ?`
    )
    .get(visitorId);
  return row ? JSON.parse(row.recentlyViewed) : null;
}
