import fs from "fs";

// Get the regional discount
export async function getRegionDiscount(ip) {
  const { countryCode, countryName } = await fetchGeo(ip);

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
    const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
    
    if (geoRes.status === 429) {
      console.error("Too many requests. Please try again later.");
      return { countryCode: null, countryName: null }
    }
    
    const geo = await geoRes.json();

    if (geo.status !== "success") return { countryCode: null, countryName: null };

    return {
      countryCode: geo.countryCode.toUpperCase(),
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
