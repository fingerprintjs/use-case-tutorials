// Initialize the Fingerprint client agent
// Change region to match your workspace region
// (e.g., "eu" for Europe, "ap" for Asia, "us" for Global (default))
const fpPromise = import(
  `https://fpjscdn.net/v4/${window.FP_PUBLIC_API_KEY}`
).then((FingerprintJS) => FingerprintJS.start({ region: "us" }));

// Elements
const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const departDateInput = document.getElementById("departDate");
const passengersSelect = document.getElementById("passengers");
const searchBtn = document.getElementById("searchBtn");
const tmplEmpty = document.getElementById("emptyStateTmpl");
const tmplFlight = document.getElementById("flightCardTmpl");
const resultBox = document.getElementById("resultBox");

// Data/Constants
const CITIES = [
  { city: "Atlanta (ATL)", code: "ATL" },
  { city: "Boston (BOS)", code: "BOS" },
  { city: "Chicago (ORD)", code: "ORD" },
  { city: "Dallas (DFW)", code: "DFW" },
  { city: "Denver (DEN)", code: "DEN" },
  { city: "Dubai (DXB)", code: "DXB" },
  { city: "London (LHR)", code: "LHR" },
  { city: "Los Angeles (LAX)", code: "LAX" },
  { city: "Miami (MIA)", code: "MIA" },
  { city: "New York (JFK)", code: "JFK" },
  { city: "Paris (CDG)", code: "CDG" },
  { city: "San Francisco (SFO)", code: "SFO" },
  { city: "Seattle (SEA)", code: "SEA" },
  { city: "Tokyo (HND)", code: "HND" },
  { city: "Toronto (YYZ)", code: "YYZ" },
];
const AIRLINES = [
  { name: "SkyJet Airways", icon: "🚀" },
  { name: "Pacific Skies", icon: "🌊" },
  { name: "CloudWave Airlines", icon: "☁️" },
  { name: "AeroVista", icon: "🌅" },
];

// Formatter for money
function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format for time
function formatTime(time) {
  return new Date(time).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

// Format for dates
function formatDate(date) {
  return new Date(date).toLocaleDateString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Format for durations
function formatDuration(durationMinutes) {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return `${hours}h ${minutes}m`;
}

// Populate defaultinput values
function populateInputs() {
  fromSelect.innerHTML = CITIES.map(
    (city) => `<option value="${city.code}">${city.city}</option>`
  ).join("");
  fromSelect.value = "SEA";
  toSelect.innerHTML = CITIES.map(
    (city) => `<option value="${city.code}">${city.city}</option>`
  ).join("");
  toSelect.value = "JFK";
  departDateInput.value = new Date().toISOString().split("T")[0];
}

// Display flight results
function displayFlights(flights) {
  resultBox.innerHTML = "";

  if (flights.length === 0) {
    const el = tmplEmpty.content.cloneNode(true);
    resultBox.appendChild(el);
    return;
  }

  for (const flight of flights) {
    const passengers = passengersSelect.value;
    const arrivesNextDay =
      flight.departure_time.split("T")[0] !== flight.arrival_time.split("T")[0];

    const el = tmplFlight.content.cloneNode(true);
    el.querySelector("[data-origin-code]").textContent = flight.origin_airport;
    el.querySelector("[data-origin-city]").textContent = flight.origin_city;
    el.querySelector("[data-dep-time]").textContent = formatTime(
      flight.departure_time
    );
    el.querySelector("[data-dep-date]").textContent = formatDate(
      flight.departure_time
    );

    el.querySelector("[data-duration]").textContent = formatDuration(
      flight.duration_minutes
    );

    el.querySelector("[data-dest-code]").textContent =
      flight.destination_airport;
    el.querySelector("[data-dest-city]").textContent = flight.destination_city;
    el.querySelector("[data-arr-time]").textContent = `${formatTime(
      flight.arrival_time
    )}${arrivesNextDay ? " ⁺¹" : ""}`;
    el.querySelector("[data-arr-date]").textContent = formatDate(
      flight.arrival_time
    );
    el.querySelector("[data-next-day]").textContent = arrivesNextDay
      ? "Flight arrives next day"
      : "";

    el.querySelector("[data-airline-icon]").textContent =
      AIRLINES.find((airline) => airline.name === flight.airline)?.icon || "✈️";
    el.querySelector("[data-airline]").textContent = flight.airline;
    el.querySelector("[data-price]").textContent = formatMoney(
      flight.price_usd
    );
    el.querySelector("[data-total-price]").textContent = formatMoney(
      flight.price_usd * passengers
    );
    el.querySelector("[data-passengers]").textContent = passengers;

    resultBox.appendChild(el);
  }
}

// Search for flights
searchBtn.addEventListener("click", async () => {
  const from = fromSelect.value;
  const to = toSelect.value;
  const departDate = departDateInput.value;
  const passengers = passengersSelect.value;

  const fp = await fpPromise;
  const { event_id: eventId } = await fp.get();

  try {
    const res = await fetch("/api/fetch-flights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, departDate, passengers, eventId }),
    });

    const data = await res.json();

    displayFlights(data.flights || []);
  } catch (err) {
    console.error("Flights fetch request failed:", err);
    displayFlights([]);
  }
});

populateInputs();
