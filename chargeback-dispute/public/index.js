// Initialize the Fingerprint client agent
// Change region to match your workspace region
// (e.g., "eu" for Europe, "ap" for Asia, "us" for Global (default))
const fpPromise = import(
  `https://fpjscdn.net/v4/${window.FP_PUBLIC_API_KEY}`
).then((FingerprintJS) => FingerprintJS.start({ region: "us" }));

// DOM Elements
const eventsGrid = document.getElementById("eventsGrid");
const eventTmpl = document.getElementById("eventCardTemplate");
const purchaseModal = document.getElementById("purchaseModal");
const modalEventName = document.getElementById("modalEventName");
const modalEventDetails = document.getElementById("modalEventDetails");
const modalClose = document.getElementById("modalClose");
const purchaseButton = document.getElementById("purchaseButton");
const resultBox = document.getElementById("resultBox");
const resultMsg = document.getElementById("resultMessage");
const clearBtn = document.getElementById("clearResult");
const resetLink = document.getElementById("reset");

// Store events data for modal
let eventsData = [];
let currentEvent = null;

// Get events and populate the page
async function getEvents() {
  try {
    const res = await fetch("/api/events");
    const data = await res.json();
    if (!data.success) {
      console.error("Failed to get events:", data.message);
      return;
    }

    eventsData = data.events;
    eventsGrid.innerHTML = "";

    for (const event of eventsData) {
      const clone = eventTmpl.content.cloneNode(true);
      const eventEl = clone.querySelector("[data-event-id]");

      eventEl.dataset.eventId = event.id;
      eventEl.querySelector("[data-event-name]").textContent = event.name;
      eventEl.querySelector("[data-event-date-venue]").textContent =
        event.dateVenue;
      eventEl.querySelector("[data-event-location]").textContent =
        event.location;
      eventEl.querySelector("[data-price]").textContent = event.price;
      const img = eventEl.querySelector("[data-event-image]");
      img.src = `/images/${event.name}.png`;
      img.alt = event.name;

      const buyButton = eventEl.querySelector("[data-action='buy']");
      buyButton.addEventListener("click", () => openPurchaseModal(event));

      eventsGrid.appendChild(eventEl);
    }
  } catch (err) {
    console.error("Failed to fetch events:", err);
  }
}

// Open purchase modal with event data
function openPurchaseModal(event) {
  currentEvent = event;
  modalEventName.textContent = event.name;
  modalEventDetails.innerHTML = `
    <p class="text-sm text-gray-600">${event.dateVenue}</p>
    <p class="text-sm text-gray-500">${event.location}</p>
    <p class="text-sm font-semibold text-gray-900 mt-1">${event.price}</p>
  `;
  purchaseModal.classList.remove("hidden");
}

// Show result message
function showResult(success, message) {
  resultMsg.textContent = (success ? "✅ " : "⚠️ ") + message;
  resultBox.classList.remove("hidden");
  resultBox.classList.toggle("bg-red-100", !success);
  resultBox.classList.toggle("bg-green-100", success);
  resultBox.classList.toggle("text-red-800", !success);
  resultBox.classList.toggle("text-green-800", success);
}

// Close purchase modal
function closePurchaseModal() {
  purchaseModal.classList.add("hidden");
  resultBox.classList.add("hidden");

  // Reset form inputs to defaults
  const ticketQuantity = document.getElementById("ticketQuantity");
  const creditCard = document.getElementById("creditCard");

  if (ticketQuantity) ticketQuantity.value = "1";
  if (creditCard) creditCard.value = "card1";
}

// Modal event handlers
modalClose.addEventListener("click", closePurchaseModal);
purchaseModal.addEventListener("click", (e) => {
  if (e.target === purchaseModal) {
    closePurchaseModal();
  }
});

// Handle purchase button click
purchaseButton.addEventListener("click", async () => {
  if (!currentEvent) {
    console.error("No event selected");
    return;
  }

  const ticketQuantity = document.getElementById("ticketQuantity").value;
  const creditCardSelect = document.getElementById("creditCard").value;
  const deliveryEmail = document.getElementById("deliveryEmail").value.trim();

  if (!ticketQuantity || !creditCardSelect || !deliveryEmail) {
    showResult(false, "Please fill in all fields.");
    return;
  }

  // Format credit card with last 4 digits
  const cardNumber = creditCardSelect === "card1" ? "4242" : "8888";
  const creditCard = `card ${
    creditCardSelect === "card1" ? "1" : "2"
  } - ${cardNumber}`;

  const fp = await fpPromise;
  const { event_id: eventId } = await fp.get();

  try {
    const res = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: currentEvent.name,
        ticketQuantity: parseInt(ticketQuantity),
        price: parseFloat(currentEvent.price.replace("$", "")),
        creditCard,
        deliveryEmail,
        eventId,
      }),
    });

    const data = await res.json();
    if (data.success) {
      showResult(true, "Purchase completed successfully!");
    } else {
      showResult(false, data.message || "Failed to complete purchase.");
    }
  } catch (err) {
    console.error("Purchase failed:", err);
    showResult(false, "Something went wrong. Please try again.");
  }
});

// Clear result message
clearBtn?.addEventListener("click", () => {
  resultBox.classList.add("hidden");
});

// Reset demo database
resetLink.addEventListener("click", async () => {
  try {
    await fetch("/api/reset-db");
    alert("Demo database reset. Refreshing page...");
    window.location.reload();
  } catch (err) {
    console.error("Failed to reset DB:", err);
    alert("Failed to reset demo DB.");
  }
});

// Load events on page load
getEvents();
