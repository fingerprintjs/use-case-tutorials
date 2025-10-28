import { db } from "./db.js";

export async function fetchFlights({ from, to, departDate }) {
  let flights = db
    .prepare(
      `SELECT * FROM flights WHERE origin_airport = ? AND destination_airport = ?`
    )
    .all(from, to);

  flights = formatDemoFlights(flights, departDate);

  console.log(`Found ${flights.length} flights`);

  return { success: true, flights };
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
