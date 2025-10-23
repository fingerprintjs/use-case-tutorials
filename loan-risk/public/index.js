// Initialize the Fingerprint client agent
// Change region to match your workspace region
// (e.g., "eu" for Europe, "ap" for Asia, "us" for Global (default))
const fpPromise = import(
  `https://fpjscdn.net/v3/${window.FP_PUBLIC_API_KEY}`
).then((FingerprintJS) => FingerprintJS.load({ region: "us" }));

// Elements
const firstNameEl = document.getElementById("firstName");
const lastNameEl = document.getElementById("lastName");
const amountRange = document.getElementById("amount");
const amountValue = document.getElementById("amountValue");
const incomeRange = document.getElementById("income");
const incomeValue = document.getElementById("incomeValue");
const termRange = document.getElementById("term");
const termValue = document.getElementById("termValue");
const monthlyEl = document.getElementById("monthlyInstallment");
const requestBtn = document.getElementById("requestBtn");
const resultBox = document.getElementById("resultBox");
const resultMsg = document.getElementById("resultMessage");
const clearBtn = document.getElementById("clearResult");
const resetLink = document.getElementById("resetDBLink");

// Constants
const MONTHLY_RATE = 0.15;

// Formatter for money
const fmtMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// Sync text with range values
function sync(rangeEl, textEl, isMoney = true) {
  textEl.textContent = isMoney
    ? fmtMoney.format(Number(rangeEl.value))
    : rangeEl.value;

  rangeEl.addEventListener("input", () => {
    textEl.textContent = isMoney
      ? fmtMoney.format(Number(rangeEl.value))
      : rangeEl.value;
    recalc();
  });
}

// Recalculate monthly installment
function recalc() {
  const principal = Number(amountRange.value);
  const months = Math.max(1, Number(termRange.value));
  const totalValue = principal + principal * MONTHLY_RATE;

  const monthlyInstallment = Math.round(totalValue / months);
  monthlyEl.textContent = `${fmtMoney.format(monthlyInstallment)}`;
}

// Show result message
function showResult(success, message) {
  resultMsg.textContent = (success ? "✅ " : "⚠️ ") + message;
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

// Request loan
requestBtn.addEventListener("click", async () => {
  const fp = await fpPromise;
  const { requestId } = await fp.get();

  const data = {
    firstName: firstNameEl.value,
    lastName: lastNameEl.value,
    loanAmount: amountRange.value,
    monthlyIncome: incomeRange.value,
    loanTerms: termRange.value,
    requestId,
  };

  try {
    const res = await fetch("/api/loan-risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!result.success) return showResult(false, result.message);

    showResult(true, result.message);
  } catch (err) {
    console.error("Loan request failed:", err);
    showResult(false, "Something went wrong. Try again.");
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
    showResult(true, "Demo database reset.");
  } catch (err) {
    console.error("Failed to reset DB:", err);
    showResult(false, "Failed to reset demo DB.");
  }
});

// Wire up inputs and sliders
sync(amountRange, amountValue);
sync(incomeRange, incomeValue);
sync(termRange, termValue, false);
recalc();
