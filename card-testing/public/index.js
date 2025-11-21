// Initialize the Fingerprint client agent
// Change region to match your workspace region
// (e.g., "eu" for Europe, "ap" for Asia, "us" for Global (default))
const fpPromise = import(
  `https://fpjscdn.net/v3/${window.FP_PUBLIC_API_KEY}`
).then((FingerprintJS) => FingerprintJS.load({ region: "us" }));

// DOM Elements
const cardNumberEl = document.getElementById("cardNumber");
const cardExpEl = document.getElementById("cardExp");
const cardCvvEl = document.getElementById("cardCvv");
const placeOrderBtn = document.getElementById("placeOrderBtn");
const resultBox = document.getElementById("resultBox");
const resultMsg = document.getElementById("resultMessage");
const clearBtn = document.getElementById("clearResult");
const resetLink = document.getElementById("resetDBLink");

// Show result message
function showResult(success, message) {
  resultMsg.textContent = (success ? "✅ " : "⚠️ ") + message;
  resultBox.classList.remove("hidden");
  resultBox.classList.toggle("bg-red-100", !success);
  resultBox.classList.toggle("bg-green-100", success);
  resultBox.classList.toggle("text-red-800", !success);
  resultBox.classList.toggle("text-green-800", success);
}

// Place order
placeOrderBtn.addEventListener("click", async () => {
  const recipientEmail = "jamiedoe@example.com";
  const amount = 5.0;
  const cardNumber = cardNumberEl.value.trim();
  const cardExp = cardExpEl.value.trim();
  const cardCvv = cardCvvEl.value.trim();

  if (!cardNumber || !cardExp || !cardCvv) {
    showResult(false, "Missing payment details.");
    return;
  }

  const fp = await fpPromise;
  const { requestId } = await fp.get();

  try {
    const res = await fetch("/api/place-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientEmail,
        amount,
        cardNumber,
        cardExp,
        cardCvv,
        requestId,
      }),
    });

    const data = await res.json();
    showResult(data.success, data.message);
  } catch (err) {
    console.error("Order failed:", err);
    showResult(false, "Something went wrong.");
  }
});

// Clear result message
clearBtn?.addEventListener("click", () => {
  resultBox.classList.add("hidden");
});

// Reset database
resetLink?.addEventListener("click", async () => {
  try {
    await fetch("/api/reset-db");
    showResult(true, "Demo database reset.");
  } catch (err) {
    console.error("Failed to reset DB:", err);
    showResult(false, "Failed to reset demo DB.");
  }
});
