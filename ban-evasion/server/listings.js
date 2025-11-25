import { db } from "./db.js";

export function postListing(body) {
  const { sellerEmail } = body;
  if (isSellerBanned(sellerEmail)) {
    console.error("Seller is banned:", sellerEmail);
    return { success: false, message: "You are banned from posting listings." };
  }

  const saveResult = saveListing(body);
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

export function banSeller(sellerEmail) {
  const bannedAt = Date.now();
  try {
    db.prepare(
      "INSERT INTO banned_visitors (email, bannedAt) VALUES (?, ?)"
    ).run(sellerEmail, bannedAt);
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
      "INSERT INTO listings (eventName, eventDate, ticketCount, venue, sellerEmail, price, ticketDescription, createdAt) VALUES (@eventName, @eventDate, @ticketCount, @venue, @sellerEmail, @price, @ticketDescription, @createdAt)"
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

function isSellerBanned(email) {
  const bannedAt = db
    .prepare("SELECT bannedAt FROM banned_visitors WHERE email = ?")
    .get(email);
  return bannedAt ? true : false;
}
