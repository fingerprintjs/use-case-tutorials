import { db } from "./db.js";
import { config } from "dotenv";
import {
  FingerprintJsServerApiClient,
  Region,
} from "@fingerprintjs/fingerprintjs-pro-server-api";

config();

const fpServerApiClient = new FingerprintJsServerApiClient({
  apiKey: process.env.FP_SECRET_API_KEY,
  region: Region.Global,
});

export async function postListing(body) {
  const { eventId } = body;

  const event = await fpServerApiClient.getEvent(eventId);
  const visitorId = event.products.identification.data.visitorId;

  const suspectScore = event.products?.suspectScore?.data?.result || 0;
  if (suspectScore > 20) {
    console.error(`High Suspect Score detected: ${suspectScore}`);
    return { success: false, message: "Listing posting failed." };
  }

  if (isSellerBanned(visitorId)) {
    console.error("Seller is banned.");
    return { success: false, message: "You are banned from posting listings." };
  }

  const saveResult = saveListing({ ...body, visitorId });
  return saveResult;
}

export function removeListing(id) {
  try {
    db.prepare("DELETE FROM listings WHERE id = ?").run(id);
    return { success: true, message: "Listing removed successfully." };
  } catch (err) {
    console.error("Failed to remove listing:", err);
    return {
      success: false,
      message: "Failed to remove listing: " + err.message,
    };
  }
}

export function banSeller(listingId) {
  const bannedAt = Date.now();
  try {
    const listing = db
      .prepare("SELECT visitorId FROM listings WHERE id = ?")
      .get(listingId);
    if (!listing) {
      console.error("Listing not found.");
      return { success: false, message: "Listing not found." };
    }

    const visitorId = listing.visitorId;

    db.prepare(
      "INSERT INTO banned_visitors (visitorId, bannedAt) VALUES (?, ?)"
    ).run(visitorId, bannedAt);
    return { success: true, message: "Seller banned successfully." };
  } catch (err) {
    console.error("Failed to ban seller:", err);
    return { success: false, message: "Failed to ban seller: " + err.message };
  }
}

export function getListings() {
  let listings = [];
  try {
    listings = db
      .prepare(
        "SELECT id, eventName, eventDate, ticketCount, venue, sellerEmail, price, ticketDescription FROM listings"
      )
      .all();
    return { success: true, listings };
  } catch (err) {
    console.error("Failed to get listings:", err);
    return {
      success: false,
      message: "Failed to get listings: " + err.message,
    };
  }
}

// --- Helpers ---
// Save listing to database
function saveListing(listing) {
  const createdAt = Date.now();
  try {
    db.prepare(
      "INSERT INTO listings (eventName, eventDate, ticketCount, venue, sellerEmail, price, ticketDescription, visitorId, createdAt) VALUES (@eventName, @eventDate, @ticketCount, @venue, @sellerEmail, @price, @ticketDescription, @visitorId, @createdAt)"
    ).run({ ...listing, createdAt });
    return { success: true, message: "Listing saved successfully." };
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      console.error("Listing already exists:", err);
      return {
        success: false,
        message:
          "Listing already exists. Please use a different event name, date, or seller email.",
      };
    }
    console.error("Failed to save listing:", err);
    return {
      success: false,
      message: "Failed to save listing: " + err.message,
    };
  }
}

// Check if seller is banned
function isSellerBanned(visitorId) {
  const bannedAt = db
    .prepare("SELECT bannedAt FROM banned_visitors WHERE visitorId = ?")
    .get(visitorId);
  return bannedAt ? true : false;
}
