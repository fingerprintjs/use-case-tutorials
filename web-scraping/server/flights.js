import { db } from "./db.js";
import { config } from "dotenv";
import {
  FingerprintJsServerApiClient,
  Region,
} from "@fingerprintjs/fingerprintjs-pro-server-api";

config();

// Change region to match your workspace region
// (e.g., "EU" for Europe, "AP" for Asia, "Global" for Global (default))
const fpServerApiClient = new FingerprintJsServerApiClient({
  apiKey: process.env.FP_SECRET_API_KEY,
  region: Region.Global,
});

export async function fetchFlights({ from, to, departDate, requestId }) {
  if (!from || !to || !departDate || !requestId) {
    console.error("Missing required fields.");
    return { success: false, message: "Missing required fields." };
  }

  const event = await fpServerApiClient.getEvent(requestId);

  // Check for bot activity
  const botDetected = event.products?.botd?.data?.bot?.result !== "notDetected";

  if (botDetected) {
    console.error("Bot detected.");
    return { flights: [] };
  }

  // Check for a high suspect score
  const suspectScore = event.products?.suspectScore?.data?.result || 0;

  if (suspectScore > 20) {
    console.error(`High Suspect Score detected: ${suspectScore}`);
    return { flights: [] };
  }

  // Otherwise, fetch flights
  let flights = db
    .prepare(
      `SELECT * FROM flights WHERE origin_airport = ? AND destination_airport = ?`
    )
    .all(from, to);

  flights = formatDemoFlights(flights, departDate);

  console.log(`Found ${flights.length} flights`);

  return { flights };
}

// --- Demo helpers ---
// Update demo flight times to real input date
function formatDemoFlights(flights, departDate) {
  for (const flight of flights) {
    const arrivesNextDay =
      flight.departure_time.split("T")[0] !== flight.arrival_time.split("T")[0];

    let nextDay = new Date(departDate);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay = nextDay.toISOString().split("T")[0];

    const departureTime =
      departDate + "T" + flight.departure_time.split("T")[1];

    const arrivalTime =
      (arrivesNextDay ? nextDay : departDate) +
      "T" +
      flight.arrival_time.split("T")[1];

    flight.departure_time = departureTime;
    flight.arrival_time = arrivalTime;
  }
  return flights;
}
