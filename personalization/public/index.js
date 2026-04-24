// Initialize the Fingerprint client agent
// Change region to match your workspace region
// (e.g., "eu" for Europe, "ap" for Asia, "us" for Global (default))
const fpPromise = import(
  `https://fpjscdn.net/v4/${window.FP_PUBLIC_API_KEY}`
).then((Fingerprint) => Fingerprint.start({ region: "us" }));

// --- State ---
let visitorId = null;
let allRentals = [];
let hotRentals = [];
const activeTypes = new Set();
const activeAmenities = new Set();
let minGuests = null;
let minBedrooms = null;
let maxPrice = 1000;
let searchQuery = "";
let debounceTimer = null;
let saveTimer = null;

const MAX_PRICE_CEILING = 1000;

const TYPE_ICONS = {
  "Entire home": "🏠",
  Apartment: "🏢",
  "Private room": "🛏️",
  Cabin: "🪵",
  Villa: "🏡",
  "Beach house": "🏖️",
};

// --- Rental card ---
function createCard(rental) {
  const clone = document.getElementById("rentalCard").content.cloneNode(true);

  clone.querySelector('[data-field="image"]').src = `/images/${rental.id}.jpeg`;
  clone.querySelector('[data-field="image"]').alt = rental.name;
  clone.querySelector('[data-field="type"]').textContent = `${
    TYPE_ICONS[rental.type] ?? "🏠"
  } ${rental.type}`;
  clone.querySelector(
    '[data-field="location"]'
  ).textContent = `${rental.city}, ${rental.country}`;
  clone.querySelector('[data-field="name"]').textContent = rental.name;
  clone.querySelector('[data-field="price"]').textContent = `$${Math.round(
    rental.pricePerNight
  )}`;
  clone.querySelector(
    '[data-field="rating"]'
  ).textContent = `★ ${rental.rating.toFixed(1)}`;
  clone.querySelector(
    '[data-field="reviews"]'
  ).textContent = `(${rental.reviewCount})`;
  clone.querySelector('[data-field="meta"]').textContent = `${
    rental.guests
  } guests · ${rental.bedrooms} bed${rental.bedrooms !== 1 ? "s" : ""}`;

  const amenitiesEl = clone.querySelector('[data-field="amenities"]');
  rental.amenities.slice(0, 3).forEach((name) => {
    const tag = document.createElement("span");
    tag.className =
      "text-xs px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500";
    tag.textContent = name;
    amenitiesEl.appendChild(tag);
  });
  const extra = rental.amenities.length - 3;
  if (extra > 0) {
    const tag = document.createElement("span");
    tag.className =
      "text-xs px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400";
    tag.textContent = `+${extra}`;
    amenitiesEl.appendChild(tag);
  }

  const card = clone.querySelector("article");
  card.addEventListener("click", () => openModal(rental));
  return card;
}

// --- Modal ---
function openModal(rental) {
  document.getElementById("modalImage").src = `/images/${rental.id}.jpeg`;
  document.getElementById("modalType").textContent = `${
    TYPE_ICONS[rental.type] ?? "🏠"
  } ${rental.type}`;
  document.getElementById("modalName").textContent = rental.name;
  document.getElementById(
    "modalLocation"
  ).textContent = `${rental.city}, ${rental.country}`;
  document.getElementById("modalPrice").textContent = `$${Math.round(
    rental.pricePerNight
  )}`;
  document.getElementById(
    "modalRating"
  ).textContent = `★ ${rental.rating.toFixed(1)}`;
  document.getElementById(
    "modalReviews"
  ).textContent = `(${rental.reviewCount})`;
  document.getElementById("modalMeta").textContent = `${
    rental.guests
  } guests · ${rental.bedrooms} bed${rental.bedrooms !== 1 ? "s" : ""}`;
  document.getElementById("modalDescription").textContent = rental.description;

  const amenitiesEl = document.getElementById("modalAmenities");
  amenitiesEl.innerHTML = "";
  rental.amenities.forEach((name) => {
    const tag = document.createElement("span");
    tag.className = "text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-600";
    tag.textContent = name;
    amenitiesEl.appendChild(tag);
  });

  document.getElementById("rentalModal").classList.remove("hidden");
  saveViewed(rental.id);
}

function closeModal() {
  document.getElementById("rentalModal").classList.add("hidden");
}

// --- Filtering ---
function getFiltered() {
  return allRentals.filter((r) => {
    if (activeTypes.size > 0 && !activeTypes.has(r.type)) return false;
    if (minGuests !== null && r.guests < minGuests) return false;
    if (minBedrooms !== null && r.bedrooms < minBedrooms) return false;
    if (maxPrice < MAX_PRICE_CEILING && r.pricePerNight > maxPrice)
      return false;
    if (activeAmenities.size > 0) {
      for (const a of activeAmenities) {
        if (!r.amenities.includes(a)) return false;
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const hay =
        `${r.name} ${r.city} ${r.country} ${r.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// --- Render ---
function renderHotRentals() {
  const grid = document.getElementById("hotRentalsGrid");
  hotRentals.forEach((r) => grid.appendChild(createCard(r)));
}

function render() {
  const rentals = getFiltered();
  document.getElementById("rentalCount").textContent = `${
    rentals.length
  } result${rentals.length !== 1 ? "s" : ""}`;

  const listEl = document.getElementById("rentalsList");
  const emptyEl = document.getElementById("emptyState");
  listEl.innerHTML = "";

  if (rentals.length === 0) {
    emptyEl.classList.remove("hidden");
    listEl.classList.add("hidden");
  } else {
    emptyEl.classList.add("hidden");
    listEl.classList.remove("hidden");
    rentals.forEach((r) => listEl.appendChild(createCard(r)));
  }
}

// --- Filter pills ---
document.querySelectorAll(".filter-pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    const { filter, value } = btn.dataset;
    const val =
      filter === "guests" || filter === "bedrooms" ? Number(value) : value;

    if (filter === "type") {
      activeTypes.has(val) ? activeTypes.delete(val) : activeTypes.add(val);
      btn.toggleAttribute("data-active", activeTypes.has(val));
    } else if (filter === "amenity") {
      activeAmenities.has(val)
        ? activeAmenities.delete(val)
        : activeAmenities.add(val);
      btn.toggleAttribute("data-active", activeAmenities.has(val));
    } else if (filter === "guests") {
      minGuests = minGuests === val ? null : val;
      document
        .querySelectorAll('[data-filter="guests"]')
        .forEach((b) =>
          b.toggleAttribute(
            "data-active",
            Number(b.dataset.value) === minGuests
          )
        );
    } else if (filter === "bedrooms") {
      minBedrooms = minBedrooms === val ? null : val;
      document
        .querySelectorAll('[data-filter="bedrooms"]')
        .forEach((b) =>
          b.toggleAttribute(
            "data-active",
            Number(b.dataset.value) === minBedrooms
          )
        );
    }

    render();
    debouncedSave();
  });
});

// --- Price slider ---
document.getElementById("priceSlider").addEventListener("input", (e) => {
  maxPrice = Number(e.target.value);
  document.getElementById("priceLabel").textContent =
    maxPrice >= MAX_PRICE_CEILING ? "Any price" : `$${maxPrice}/night`;
  render();
  debouncedSave();
});

// --- Search ---
document.getElementById("searchInput").addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchQuery = e.target.value.trim();
    render();
  }, 300);
});

// --- Preferences ---
function applyFilters(saved) {
  saved.activeTypes?.forEach((t) => activeTypes.add(t));
  saved.activeAmenities?.forEach((a) => activeAmenities.add(a));
  minGuests = saved.minGuests ?? null;
  minBedrooms = saved.minBedrooms ?? null;
  maxPrice = saved.maxPrice ?? MAX_PRICE_CEILING;

  document.querySelectorAll(".filter-pill").forEach((btn) => {
    const { filter, value } = btn.dataset;
    let isActive = false;
    switch (filter) {
      case "type":
        isActive = activeTypes.has(value);
        break;
      case "amenity":
        isActive = activeAmenities.has(value);
        break;
      case "guests":
        isActive = Number(value) === minGuests;
        break;
      case "bedrooms":
        isActive = Number(value) === minBedrooms;
        break;
    }
    btn.toggleAttribute("data-active", isActive);
  });

  document.getElementById("priceSlider").value = maxPrice;
  document.getElementById("priceLabel").textContent =
    maxPrice >= MAX_PRICE_CEILING ? "Any price" : `$${maxPrice}/night`;
}

function debouncedSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveFilters, 1000);
}

async function saveFilters() {
  await fetch("/api/preferences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visitorId,
      filters: {
        activeTypes: [...activeTypes],
        activeAmenities: [...activeAmenities],
        minGuests,
        minBedrooms,
        maxPrice,
      },
    }),
  });
}

async function saveViewed(rentalId) {
  await fetch("/api/viewed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId, rentalId }),
  });
}

// --- Reset demo ---
document.getElementById("resetBtn").addEventListener("click", async () => {
  await fetch("/api/reset");
  window.location.reload();
});

// --- Initialize ---
async function init() {
  const fp = await fpPromise;
  const result = await fp.get();
  visitorId = result.visitor_id;

  try {
    const response = await fetch("/api/rentals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: result.event_id }),
    });
    const data = await response.json();

    allRentals = data.rentals ?? [];
    hotRentals = data.hotRentals ?? [];
    if (data.savedFilters) applyFilters(data.savedFilters);

    document.getElementById("loadingState").classList.add("hidden");
    renderHotRentals();
    render();
  } catch (err) {
    console.error("Failed to load rentals:", err);
    document.getElementById("loadingState").innerHTML =
      '<p class="col-span-3 text-center text-slate-400 py-10 text-sm">Failed to load rentals. Is the server running?</p>';
  }
}

init();
