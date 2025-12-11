// DOM Elements
const chargebacksList = document.getElementById("chargebacksList");
const purchasesList = document.getElementById("purchasesList");
const purchaseTmpl = document.getElementById("purchaseCardTemplate");
const noChargebacks = document.getElementById("noChargebacks");
const noPurchases = document.getElementById("noPurchases");
const historyModal = document.getElementById("historyModal");
const historyModalTitle = document.getElementById("historyModalTitle");
const historyModalClose = document.getElementById("historyModalClose");
const historyTableBody = document.getElementById("historyTableBody");
const exportCsvButton = document.getElementById("exportCsvButton");
const historyRowTmpl = document.getElementById("historyRowTemplate");
const historyStateTmpl = document.getElementById("historyStateTemplate");
const resetLink = document.getElementById("reset");

// Store current purchase history for export
let currentPurchaseHistory = [];

// Format date
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Create purchase card element
function createPurchaseCard(purchase) {
  const clone = purchaseTmpl.content.cloneNode(true);
  const purchaseEl = clone.querySelector("[data-purchase-id]");

  purchaseEl.dataset.purchaseId = purchase.id;
  purchaseEl.querySelector("[data-event-name]").textContent =
    purchase.eventName;
  purchaseEl.querySelector("[data-ticket-quantity]").textContent =
    purchase.ticketQuantity;
  const total = purchase.price * purchase.ticketQuantity;
  purchaseEl.querySelector("[data-price]").textContent = `$${total.toFixed(2)}`;
  purchaseEl.querySelector(
    "[data-purchase-date]"
  ).textContent = `Purchased on ${formatDate(purchase.createdAt)}`;
  purchaseEl.querySelector("[data-buyer-email]").textContent =
    purchase.deliveryEmail;
  purchaseEl.querySelector("[data-credit-card]").textContent =
    purchase.creditCard;

  // Add click handler to view history button
  const viewHistoryBtn = purchaseEl.querySelector(
    "[data-action='view-history']"
  );
  viewHistoryBtn.addEventListener("click", () => openHistoryModal(purchase.id));

  return purchaseEl;
}

// Load all purchases
async function loadPurchases() {
  try {
    const res = await fetch("/api/purchases/all");
    const data = await res.json();
    if (!data.success) {
      console.error("Failed to get purchases:", data.message);
      return;
    }

    const purchases = data.purchases;
    chargebacksList.innerHTML = "";
    purchasesList.innerHTML = "";

    // Separate chargebacks from regular purchases
    const chargebacks = purchases.filter((p) => p.chargeback === 1);
    const regularPurchases = purchases.filter((p) => p.chargeback === 0);

    // Display chargebacks
    if (chargebacks.length === 0) {
      noChargebacks.style.removeProperty("display");
    } else {
      noChargebacks.style.display = "none";
      chargebacks.forEach((purchase) => {
        const card = createPurchaseCard(purchase);
        // Add visual indicator for chargeback
        card.classList.add("border-red-300", "bg-red-50");
        chargebacksList.appendChild(card);
      });
    }

    // Display regular purchases
    if (regularPurchases.length === 0) {
      noPurchases.style.removeProperty("display");
    } else {
      noPurchases.style.display = "none";
      regularPurchases.forEach((purchase) => {
        const card = createPurchaseCard(purchase);
        purchasesList.appendChild(card);
      });
    }
  } catch (err) {
    console.error("Failed to fetch purchases:", err);
  }
}

// Create history table row from template
function createHistoryRow(purchase) {
  const clone = historyRowTmpl.content.cloneNode(true);
  const row = clone.querySelector("tr");
  const total = purchase.price * purchase.ticketQuantity;
  const purchaseDate = formatDate(purchase.createdAt);

  // Set row background for chargebacks
  if (purchase.chargeback === 1) {
    row.classList.add("bg-red-50");
  }

  // Populate row data
  row.querySelector("[data-event-name]").textContent = purchase.eventName;
  row.querySelector("[data-purchase-date]").textContent = purchaseDate;
  row.querySelector("[data-email]").textContent = purchase.deliveryEmail || "";
  row.querySelector("[data-visitor-id]").textContent = purchase.visitorId || "";
  row.querySelector("[data-ticket-quantity]").textContent =
    purchase.ticketQuantity;
  row.querySelector("[data-total]").textContent = `$${total.toFixed(2)}`;
  row.querySelector("[data-credit-card]").textContent = purchase.creditCard;

  // Set status badge
  const statusCell = row.querySelector("[data-status]");
  const statusBadge = document.createElement("span");
  if (purchase.chargeback === 1) {
    statusBadge.className =
      "px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded";
    statusBadge.textContent = "Chargeback";
  } else {
    statusBadge.className =
      "px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded";
    statusBadge.textContent = "Completed";
  }
  statusCell.textContent = "";
  statusCell.appendChild(statusBadge);

  return row;
}

// Show state message in history table
function showHistoryState(message, isError = false) {
  const clone = historyStateTmpl.content.cloneNode(true);
  const cell = clone.querySelector("[data-message]");
  cell.textContent = message;
  if (isError) {
    cell.classList.remove("text-gray-500");
    cell.classList.add("text-red-500");
  }
  historyTableBody.innerHTML = "";
  historyTableBody.appendChild(clone);
}

// Open history modal and load purchases for email
async function openHistoryModal(purchaseId) {
  try {
    historyModalTitle.textContent = `Purchase History linked to order #${
      100000 + purchaseId
    }`;
    showHistoryState("Loading...");
    historyModal.classList.remove("hidden");

    const res = await fetch(`/api/purchases/${purchaseId}/related`);
    const data = await res.json();

    if (!data.success) {
      showHistoryState("Failed to load history.", true);
      return;
    }

    const purchases = data.purchases;
    currentPurchaseHistory = purchases;
    historyTableBody.innerHTML = "";

    if (purchases.length === 0) {
      showHistoryState("No purchases found.");
      return;
    }

    purchases.forEach((purchase) => {
      const row = createHistoryRow(purchase);
      historyTableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to load purchase history:", err);
    showHistoryState("Error loading history.", true);
  }
}

// Close history modal
function closeHistoryModal() {
  historyModal.classList.add("hidden");
}

// Export purchase history to CSV
function exportToCsv() {
  if (currentPurchaseHistory.length === 0) {
    return;
  }

  // CSV headers
  const headers = [
    "Event",
    "Date",
    "Email",
    "Visitor ID",
    "Tickets",
    "Total",
    "Card",
    "Status",
  ];

  // Convert purchases to CSV rows
  const rows = currentPurchaseHistory.map((purchase) => {
    const total = purchase.price * purchase.ticketQuantity;
    const purchaseDate = formatDate(purchase.createdAt);
    const status = purchase.chargeback === 1 ? "Chargeback" : "Completed";

    return [
      purchase.eventName,
      purchaseDate,
      purchase.deliveryEmail || "",
      purchase.visitorId || "",
      purchase.ticketQuantity,
      `$${total.toFixed(2)}`,
      purchase.creditCard,
      status,
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `purchase-history-${Date.now()}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Modal event handlers
historyModalClose.addEventListener("click", closeHistoryModal);
historyModal.addEventListener("click", (e) => {
  if (e.target === historyModal) {
    closeHistoryModal();
  }
});
exportCsvButton.addEventListener("click", exportToCsv);

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

// Load purchases on page load
loadPurchases();
