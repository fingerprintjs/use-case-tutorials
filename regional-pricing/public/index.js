// Initialize the Fingerprint client agent
// Change region to match your workspace region
// (e.g., "eu" for Europe, "ap" for Asia, "us" for Global (default))
const fpPromise = import(
  `https://fpjscdn.net/v3/${window.FP_PUBLIC_API_KEY}`
).then((FingerprintJS) => FingerprintJS.load({ region: "us" }));

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

// --- Events ---
// Activate regional pricing
activateBtn.addEventListener("click", async () => {
  const fp = await fpPromise;
  const { requestId } = await fp.get();

  try {
    const res = await fetch("/api/region-discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
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
