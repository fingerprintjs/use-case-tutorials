// DOM Elements
const ordersList = document.getElementById("ordersList");
const orderTmpl = document.getElementById("orderCardTemplate");
const resultBox = document.getElementById("resultBox");
const resultMsg = document.getElementById("resultMessage");
const clearBtn = document.getElementById("clearResult");
const resetLink = document.getElementById("reset");

// Show result message
function showResult(success, message) {
  resultMsg.textContent = (success ? "✅ " : "⚠️ ") + message;
  resultBox.classList.remove("hidden");
  resultBox.classList.toggle("bg-red-100", !success);
  resultBox.classList.toggle("bg-green-100", success);
  resultBox.classList.toggle("text-red-800", !success);
  resultBox.classList.toggle("text-green-800", success);
}

// Load orders on page load
async function loadOrders() {
  try {
    const res = await fetch("/api/purchases?email=jamie@example.com");
    const data = await res.json();
    console.log(data);
    if (!data.success) {
      console.error("Failed to get orders:", data.message);
      return;
    }

    const orders = data.purchases;
    ordersList.innerHTML = "";

    if (orders.length === 0) {
      ordersList.innerHTML =
        '<p class="text-gray-500 text-center py-8">No orders found.</p>';
      return;
    }

    for (const order of orders) {
      const clone = orderTmpl.content.cloneNode(true);
      const orderEl = clone.querySelector("[data-purchase-id]");

      orderEl.dataset.purchaseId = order.id;
      orderEl.querySelector("[data-event-name]").textContent = order.eventName;
      orderEl.querySelector("[data-ticket-quantity]").textContent =
        order.ticketQuantity;
      const total = order.price * order.ticketQuantity;
      orderEl.querySelector("[data-price]").textContent = `$${total.toFixed(
        2
      )}`;

      // Format date
      const date = new Date(order.createdAt);
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      orderEl.querySelector(
        "[data-purchase-date]"
      ).textContent = `Purchased on ${formattedDate}`;

      // Show chargeback status if already disputed
      if (order.chargeback === 1) {
        orderEl
          .querySelector("[data-chargeback-status]")
          .style.removeProperty("display");
        const chargebackBtn = orderEl.querySelector(
          "[data-action='chargeback']"
        );
        chargebackBtn.disabled = true;
        chargebackBtn.textContent = "Chargeback initiated";
        chargebackBtn.classList.remove(
          "border-orange-300",
          "text-orange-600",
          "hover:bg-orange-50"
        );
        chargebackBtn.classList.add(
          "bg-gray-400",
          "cursor-not-allowed",
          "border-gray-400",
          "text-gray-600"
        );
      }

      // Add chargeback handler
      const chargebackBtn = orderEl.querySelector("[data-action='chargeback']");
      chargebackBtn.addEventListener("click", () =>
        handleChargeback(order.id, orderEl)
      );

      ordersList.appendChild(orderEl);
    }
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    showResult(false, "Failed to load orders.");
  }
}

// Handle chargeback
async function handleChargeback(purchaseId, orderEl) {
  try {
    const res = await fetch(`/api/purchases/${purchaseId}/chargeback`, {
      method: "POST",
    });

    const data = await res.json();
    if (data.success) {
      showResult(true, "Chargeback initiated successfully.");
      // Update UI
      orderEl
        .querySelector("[data-chargeback-status]")
        .style.removeProperty("display");
      const chargebackBtn = orderEl.querySelector("[data-action='chargeback']");
      chargebackBtn.disabled = true;
      chargebackBtn.textContent = "Chargeback initiated";
      chargebackBtn.classList.remove(
        "border-orange-300",
        "text-orange-600",
        "hover:bg-orange-50"
      );
      chargebackBtn.classList.add(
        "bg-gray-400",
        "cursor-not-allowed",
        "border-gray-400",
        "text-gray-600"
      );
    } else {
      showResult(false, data.message || "Failed to initiate chargeback.");
    }
  } catch (err) {
    console.error("Chargeback failed:", err);
    showResult(false, "Something went wrong. Please try again.");
  }
}

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

// Load orders on page load
loadOrders();
