// Initialize the Fingerprint client agent
const fpPromise = import(
  `https://fpjscdn.net/v3/${window.FP_PUBLIC_API_KEY}`
).then(
  // Change region to match your workspace region
  // (e.g., "eu" for Europe, "ap" for Asia, "us" for Global (default))
  (FingerprintJS) => FingerprintJS.load({ region: "us" })
);

// --- DOM refs ---
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const resultBox = document.getElementById("resultBox");
const resultMsg = document.getElementById("resultMessage");
const resultIcon = document.getElementById("resultIcon");
const clearBtn = document.getElementById("clearResult");
const resetLink = document.getElementById("resetDBLink");

// --- Helpers ---
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
loginBtn.addEventListener("click", async () => {
  const email = (emailInput.value || "").trim();
  const password = passwordInput.value || "";

  if (!email || !password) {
    showResult("error", "Please enter your email and password.");
    return;
  }

  const fp = await fpPromise;
  const { requestId } = await fp.get();

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, requestId }),
    });

    const data = await res.json();

    if (!data.success) {
      showResult("error", data.error || "Login failed.");
      return;
    }

    showResult("success", "Logged in successfully.");
  } catch (err) {
    console.error("Login request failed:", err);
    showResult("error", "Something went wrong. Try again.");
  }
});

clearBtn?.addEventListener("click", () => {
  resultBox.classList.add("hidden");
});

resetLink?.addEventListener("click", async () => {
  try {
    await fetch("/api/reset-db");
    showResult("success", "Demo database reset.");
  } catch (err) {
    console.error("Failed to reset DB:", err);
    showResult("error", "Failed to reset demo DB.");
  }
});
