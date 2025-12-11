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

// Store current purchase history for export
let currentPurchaseHistory = [];
let currentHistoryEmail = "";

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
  viewHistoryBtn.addEventListener("click", () =>
    openHistoryModal(purchase.deliveryEmail)
  );

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

// Open history modal and load purchases for email
async function openHistoryModal(email) {
  try {
    historyModalTitle.textContent = `Purchase History - ${email}`;
    historyTableBody.innerHTML =
      '<tr><td colspan="6" class="px-4 py-4 text-center text-gray-500">Loading...</td></tr>';

    historyModal.classList.remove("hidden");

    const res = await fetch(
      `/api/purchases?email=${encodeURIComponent(email)}`
    );
    const data = await res.json();

    if (!data.success) {
      historyTableBody.innerHTML =
        '<tr><td colspan="6" class="px-4 py-4 text-center text-red-500">Failed to load history.</td></tr>';
      return;
    }

    const purchases = data.purchases;
    currentPurchaseHistory = purchases;
    currentHistoryEmail = email;
    historyTableBody.innerHTML = "";

    if (purchases.length === 0) {
      historyTableBody.innerHTML =
        '<tr><td colspan="6" class="px-4 py-4 text-center text-gray-500">No purchases found.</td></tr>';
      return;
    }

    purchases.forEach((purchase) => {
      const row = document.createElement("tr");
      const total = purchase.price * purchase.ticketQuantity;
      const purchaseDate = formatDate(purchase.createdAt);
      const chargebackStatus =
        purchase.chargeback === 1
          ? '<span class="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded">Chargeback</span>'
          : '<span class="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded">Completed</span>';

      row.className = purchase.chargeback === 1 ? "bg-red-50" : "";
      row.innerHTML = `
        <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${
          purchase.eventName
        }</td>
        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${purchaseDate}</td>
        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${
          purchase.ticketQuantity
        }</td>
        <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">$${total.toFixed(
          2
        )}</td>
        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${
          purchase.creditCard
        }</td>
        <td class="px-4 py-3 whitespace-nowrap text-sm">${chargebackStatus}</td>
      `;
      historyTableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to load purchase history:", err);
    historyTableBody.innerHTML =
      '<tr><td colspan="6" class="px-4 py-4 text-center text-red-500">Error loading history.</td></tr>';
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
    "Tickets",
    "Total",
    "Card",
    "Email",
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
      purchase.ticketQuantity,
      `$${total.toFixed(2)}`,
      purchase.creditCard,
      purchase.deliveryEmail,
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
  link.setAttribute(
    "download",
    `purchase-history-${currentHistoryEmail.replace(
      "@",
      "-at-"
    )}-${Date.now()}.csv`
  );
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

// Load purchases on page load
loadPurchases();
