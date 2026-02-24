import fs from "fs";
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

// Get the regional discount
export async function getRegionDiscount(eventId) {
  const event = await fpServerApiClient.getEvent(eventId);
  const ipLocation = event.products.identification.data.ipLocation;
  const countryCode = ipLocation.country.code;
  const countryName = ipLocation.country.name;

  const vpnDetected = event.products.vpn.data.result;
  if (vpnDetected) {
    console.error("VPN detected.");
    return {
      success: false,
      message:
        "VPN detected. Please turn off your VPN and use your normal connection before activating regional pricing.",
    };
  }

  const botDetected = event.products?.botd?.data?.bot?.result !== "notDetected";

  if (botDetected) {
    console.error("Bot detected.");
    return {
      success: false,
      message: "No discount available for your location.",
    };
  }

  const suspectScore = event.products?.suspectScore?.data?.result || 0;

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

// Fetch the country code and name from the IP address
async function fetchGeo(ip) {
  try {
    const geoRes = await fetch(`https://ipwho.is/${ip}`);
    const geo = await geoRes.json();

    if (!geo.success) return { countryCode: null, countryName: null };

    return {
      countryCode: geo.country_code.toUpperCase(),
      countryName: geo.country,
    };
  } catch (err) {
    console.error("Failed to fetch IP info:", err);
    return { countryCode: null, countryName: null };
  }
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
