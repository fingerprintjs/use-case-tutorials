// --- Config ---
const BASE_PRICE = 59.99;
const TAX_RATE = 0.1;

// --- DOM refs ---
const priceBaseEl = document.getElementById("priceBase");
const subtotalEl = document.getElementById("subtotal");
const taxesEl = document.getElementById("taxes");
const totalEl = document.getElementById("total");
const discountRowEl = document.getElementById("discountRow");
const discountAmountEl = document.getElementById("discountAmount");
const activateBtn = document.getElementById("activateRegionalBtn");
const resultBox = document.getElementById("resultBox");
const resultMsg = document.getElementById("resultMessage");
const clearResultBtn = document.getElementById("clearResult");

// --- Helpers ---
// Format money
const money = (n) => `$${n.toFixed(2)}`;

// Render totals
function renderTotals(discountPct = 0) {
  const hasDiscount = discountPct > 0;

  const discountAmt = BASE_PRICE * (discountPct / 100);
  const subtotal = BASE_PRICE - discountAmt;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  priceBaseEl.textContent = money(BASE_PRICE);
  discountAmountEl.textContent = hasDiscount ? `-${money(discountAmt)}` : "";
  subtotalEl.textContent = money(subtotal);
  taxesEl.textContent = money(tax);
  totalEl.textContent = money(total);

  discountRowEl.classList.toggle("hidden", !hasDiscount);
}

// Show result message
function showResult(data) {
  const { success, discountPct, countryName, flagEmoji, message } = data;

  const discountMessage = `We see you are in ${flagEmoji} ${countryName} and have applied a regional discount of ${discountPct}%!`;
  const noDiscountMessage = "No regional discount available for your location.";

  const resultMessage = success
    ? discountPct > 0
      ? discountMessage
      : noDiscountMessage
    : message;

  renderTotals(discountPct);

  resultMsg.textContent = (success ? "✅ " : "⚠️ ") + resultMessage;
  resultBox.classList.remove(
    "hidden",
    "bg-red-100",
    "text-red-800",
    "bg-green-100",
    "text-green-800"
  );
  resultBox.classList.add(
    success ? "bg-green-100" : "bg-red-100",
    success ? "text-green-800" : "text-red-800"
  );
}

// Get IP address for local demo
async function getIp() {
  try {
    const res = await fetch("https://ipwho.is/");
    const data = await res.json();

    return data.ip || null;
  } catch (err) {
    console.error("Failed to get IP:", err);
    return null;
  }
}

// --- Events ---
// Activate regional pricing
activateBtn.addEventListener("click", async () => {
  const ip = await getIp();

  try {
    const res = await fetch("/api/region-discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip }),
    });

    const data = await res.json();

    showResult(data);
  } catch (err) {
    console.error("Failed to activate regional pricing:", err);
    showResult({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
});

// Clear result message
clearResultBtn?.addEventListener("click", () => {
  resultBox.classList.add("hidden");
});

// Initialize totals (no discount)
renderTotals(0);
