// Initialize the Fingerprint client agent
const fpPromise = import(
  `https://fpjscdn.net/v3/${window.FP_PUBLIC_API_KEY}`
).then(
  // Change region to match your workspace region
  // (e.g., "eu" for Europe, "ap" for Asia, "us" for Global (default))
  (FingerprintJS) => FingerprintJS.load({ region: "us" })
);

// --- Config ---
const TAX_RATE = 0.12;
const CART_SUBTOTAL = 356.02 + 102.59; // matches static demo items in index.html

// --- DOM refs ---
const subtotalEl = document.getElementById("subtotalValue");
const discountRowEl = document.getElementById("discountRow");
const discountPercentEl = document.getElementById("discountPercent");
const discountValueEl = document.getElementById("discountValue");
const taxEl = document.getElementById("taxValue");
const totalEl = document.getElementById("totalValue");

const couponInput = document.getElementById("couponInput");
const applyBtn = document.getElementById("applyCouponButton");
const resultBox = document.getElementById("couponResult");
const resultMsg = document.getElementById("couponMessage");
const resultIcon = document.getElementById("couponIcon");
const clearBtn = document.getElementById("clearCouponResult");
const resetLink = document.getElementById("resetDBLink");

// --- Helpers ---
const money = (n) => `$${n.toFixed(2)}`;

function renderTotals(discountPct = 0) {
  const discountAmt = CART_SUBTOTAL * (discountPct / 100);
  const finalSub = CART_SUBTOTAL - discountAmt;
  const tax = finalSub * TAX_RATE;
  const total = finalSub + tax;

  subtotalEl.textContent = money(CART_SUBTOTAL);
  taxEl.textContent = money(tax);
  totalEl.textContent = money(total);

  if (discountPct > 0) {
    discountPercentEl.textContent = String(discountPct);
    discountValueEl.textContent = money(discountAmt);
    discountRowEl.classList.remove("hidden");
  } else {
    discountRowEl.classList.add("hidden");
  }
}

function showResult(type, message) {
  resultMsg.textContent = message;
  resultBox.classList.remove(
    "hidden",
    "bg-red-100",
    "text-red-800",
    "bg-green-100",
    "text-green-800"
  );
  resultIcon.innerHTML = "";

  if (type === "success") {
    resultBox.classList.add("bg-green-100", "text-green-800");
    resultIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />`;
  } else {
    resultBox.classList.add("bg-red-100", "text-red-800");
    resultIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`;
  }
}

// --- Events ---
applyBtn.addEventListener("click", async () => {
  const code = (couponInput.value || "").trim().toUpperCase();
  if (!code) {
    showResult("error", "Please enter a coupon code.");
    renderTotals(0);
    return;
  }

  const fp = await fpPromise;
  const { requestId } = await fp.get();

  try {
    const res = await fetch("/api/validate-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coupon: code, requestId }),
    });
    const data = await res.json();

    if (!data.success) {
      showResult("error", data.error || "Invalid coupon.");
      renderTotals(0);
      return;
    }

    renderTotals(Number(data.discountPct || 0));
    showResult("success", "Coupon applied successfully!");
  } catch (e) {
    showResult("error", "Something went wrong. Try again.");
    renderTotals(0);
  }
});

clearBtn?.addEventListener("click", () => {
  resultBox.classList.add("hidden");
});

resetLink?.addEventListener("click", async () => {
  try {
    await fetch("/api/reset-db");

    couponInput.value = "";
    resultBox.classList.add("hidden");
    renderTotals(0);
  } catch (err) {
    console.error("Failed to reset DB.", err);
  }
});

// Initial totals (no discount)
renderTotals(0);
