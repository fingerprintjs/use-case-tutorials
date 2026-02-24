// Initialize the Fingerprint client agent
// Change region to match your workspace region
// (e.g., "eu" for Europe, "ap" for Asia, "us" for Global (default))
const fpPromise = import(
  `https://fpjscdn.net/v4/${window.FP_PUBLIC_API_KEY}`
).then((FingerprintJS) => FingerprintJS.start({ region: "us" }));

// DOM Elements
const listingsContainer = document.getElementById("listings");
const listingTmpl = document.getElementById("listingTmpl");
const adminToggle = document.getElementById("adminToggle");
const listingForm = document.getElementById("listingForm");
const eventNameInput = document.getElementById("eventNameInput");
const dateInput = document.getElementById("dateInput");
const venueInput = document.getElementById("venueInput");
const priceInput = document.getElementById("priceInput");
const countInput = document.getElementById("countInput");
const sectionInput = document.getElementById("sectionInput");
const sellerEmailInput = document.getElementById("sellerEmailInput");
const submitBtn = document.getElementById("submitBtn");
const modal = document.getElementById("resultModal");
const modalMsg = document.getElementById("resultModalMessage");
const modalClose = document.getElementById("resultModalClose");
const resetLink = document.getElementById("resetDBLink");

let adminModeEnabled = false;

// Show result message
function showResult(success, message) {
  modalMsg.textContent = (success ? "✅ " : "⚠️ ") + message;
  modal.classList.remove("hidden");
}

// Get current listings
async function getListings() {
  const res = await fetch("/api/listings");
  const data = await res.json();
  if (!data.success) return showResult(false, data.message);
  const listings = data.listings;

  listingsContainer.innerHTML = "";

  for (const item of listings) {
    const formattedDate = new Date(item.eventDate).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const clone = listingTmpl.content.cloneNode(true);
    const listingEl = clone.querySelector("[data-listing-id]");

    listingEl.dataset.listingId = item.id;

    listingEl.querySelector("[data-event-name]").textContent = item.eventName;
    listingEl.querySelector("[data-event-date]").textContent = formattedDate;
    listingEl.querySelector("[data-ticket-count]").textContent =
      item.ticketCount;
    listingEl.querySelector("[data-ticket-count-display]").textContent =
      item.ticketCount;
    listingEl.querySelector("[data-venue]").textContent = item.venue;
    listingEl.querySelector("[data-seller-email]").textContent =
      item.sellerEmail;
    listingEl.querySelector("[data-price]").textContent = `$${item.price}`;
    listingEl.querySelector("[data-ticket-description]").textContent =
      item.ticketDescription;

    listingsContainer.appendChild(listingEl);
  }
}

// Attach handlers to all current and future listings
function attachAdminHandlers() {
  listingsContainer.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const listingEl = btn.closest("[data-listing-id]");
    if (!listingEl) return;
    const listingId = listingEl.dataset.listingId;

    if (action === "remove") {
      await handleRemoveListing(listingId, listingEl);
    }

    if (action === "ban") {
      await handleBanSeller(listingId);
    }
  });
}

// Remove listing
async function handleRemoveListing(listingId, listingEl) {
  try {
    const res = await fetch(`/api/listings/${listingId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) listingEl.remove();
    showResult(data.success, data.message);
  } catch (err) {
    console.error("Failed to remove listing:", err);
    showResult(false, "Something went wrong.");
  }
}

// Ban seller and remove their listing
async function handleBanSeller(listingId) {
  try {
    const res = await fetch(`/api/ban-seller`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    const data = await res.json();
    showResult(data.success, data.message);
  } catch (err) {
    console.error("Failed to ban seller:", err);
    showResult(false, "Something went wrong.");
  }
}

// Post new listing
submitBtn.addEventListener("click", async () => {
  const eventName = eventNameInput.value.trim();
  const eventDate = dateInput.value.trim();
  const venue = venueInput.value.trim();
  const price = priceInput.value.trim();
  const ticketCount = countInput.value.trim();
  const ticketDescription = sectionInput.value.trim();
  const sellerEmail = sellerEmailInput.value.trim();

  if (
    !eventName ||
    !eventDate ||
    !venue ||
    !price ||
    !ticketCount ||
    !ticketDescription ||
    !sellerEmail
  ) {
    showResult(false, "All fields are required.");
    return;
  }

  const fp = await fpPromise;
  const { event_id: eventId } = await fp.get();

  try {
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventDate,
        venue,
        price,
        ticketCount,
        ticketDescription,
        sellerEmail,
        eventId,
      }),
    });

    const data = await res.json();
    showResult(data.success, data.message);
    if (data.success) getListings();
  } catch (err) {
    console.error("Listing posting failed:", err);
    showResult(false, "Something went wrong.");
  }
});

// Toggle admin mode
adminToggle.addEventListener("click", () => {
  adminModeEnabled = !adminModeEnabled;

  listingForm.classList.toggle("hidden", adminModeEnabled);

  const controls = document.querySelectorAll(".admin-controls");
  for (const el of controls) {
    el.classList.toggle("hidden", !adminModeEnabled);
  }

  adminToggle.classList.toggle("bg-orange-50", adminModeEnabled);
  adminToggle.classList.toggle("border-orange-200", adminModeEnabled);
  adminToggle.classList.toggle("text-orange-600", adminModeEnabled);

  adminToggle.classList.toggle("bg-gray-50", !adminModeEnabled);
  adminToggle.classList.toggle("border-gray-200", !adminModeEnabled);
  adminToggle.classList.toggle("text-gray-600", !adminModeEnabled);

  adminToggle.textContent = adminModeEnabled ? "Exit admin mode" : "Admin mode";
});

// Close result modal
modalClose?.addEventListener("click", () => {
  modal.classList.add("hidden");
});
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.classList.add("hidden");
});

// Reset demo database
resetLink.addEventListener("click", async () => {
  try {
    await fetch("/api/reset-db");
    showResult(true, "Demo database reset. Refresh!");
  } catch (err) {
    console.error("Failed to reset DB:", err);
    showResult(false, "Failed to reset demo DB.");
  }
});

getListings();
attachAdminHandlers();
