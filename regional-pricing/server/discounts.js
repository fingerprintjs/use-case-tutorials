import fs from "fs";
import { config } from "dotenv";
import { FingerprintServerApiClient, Region } from "@fingerprint/node-sdk";

config();

const fpServerApiClient = new FingerprintServerApiClient({
  apiKey: process.env.FP_SECRET_API_KEY,
  region: Region.Global,
});

// Get the regional discount
export async function getRegionDiscount(eventId) {
  const event = await fpServerApiClient.getEvent(eventId);
  const ipInfoV4Location = event.ip_info.v4.geolocation;
  const countryCode = ipInfoV4Location.country_code;
  const countryName = ipInfoV4Location.country_name;

  const vpnDetected = event.vpn;
  if (vpnDetected) {
    console.error("VPN detected.");
    return {
      success: false,
      message:
        "VPN detected. Please turn off your VPN and use your normal connection before activating regional pricing.",
    };
  }

  const botDetected = event.bot !== "not_detected";
  if (botDetected) {
    console.error("Bot detected.");
    return {
      success: false,
      message: "No discount available for your location.",
    };
  }

  const suspectScore = event.suspect_score || 0;
  if (suspectScore > 20) {
    console.error(`High Suspect Score detected: ${suspectScore}`);
    return {
      success: false,
      message: "No discount available for your location.",
    };
  }

  if (!countryCode || !countryName) {
    console.error("Unable to determine region.");
    return {
      success: false,
      message: "Unable to determine your region.",
    };
  }

  const discountPct = getDiscountPct(countryCode);

  return {
    success: true,
    discountPct,
    countryName,
    flagEmoji: countryCodeToEmoji(countryCode),
  };
}

// --- Helpers ---
// Convert country code to emoji
function countryCodeToEmoji(code = "") {
  if (!code) return "🌎";

  const emoji = code
    .trim()
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)));

  return emoji;
}

// Get the regional discount percentage
function getDiscountPct(countryCode) {
  if (!countryCode) return 0;

  try {
    const regionalDiscounts = JSON.parse(
      fs.readFileSync("./server/data/regional_discounts.json", "utf-8")
    );

    return regionalDiscounts[countryCode] || 0;
  } catch (err) {
    console.error("Failed to get regional discount percentage:", err);
    return 0;
  }
}
