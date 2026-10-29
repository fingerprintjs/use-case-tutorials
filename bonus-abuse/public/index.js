// Initialize the Fingerprint client agent
// Change region to match your workspace region
// (e.g., "eu" for Europe, "ap" for Asia, "us" for Global (default))
const fpPromise = import(
  `https://fpjscdn.net/v4/${window.FP_PUBLIC_API_KEY}`
).then((Fingerprint) => Fingerprint.start({ region: "us" }));

// --- DOM refs ---
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const signupBtn = document.getElementById("signupBtn");
const resultBox = document.getElementById("resultBox");
const resultMsg = document.getElementById("resultMessage");
const clearBtn = document.getElementById("clearResult");
const resetLink = document.getElementById("resetDBLink");

const RESULT_STYLES = {
  success: {
    icon: "✅ ",
    classes: ["bg-emerald-50", "text-emerald-800", "border-emerald-200"],
  },
  warning: {
    icon: "⚠️ ",
    classes: ["bg-amber-50", "text-amber-800", "border-amber-200"],
  },
  error: {
    icon: "⛔ ",
    classes: ["bg-rose-50", "text-rose-800", "border-rose-200"],
  },
};

// --- Helpers ---
// Show result message ("success", "warning", or "error")
function showResult(type, message) {
  const style = RESULT_STYLES[type];
  resultMsg.textContent = style.icon + message;
  resultBox.classList.remove(
    "hidden",
    ...Object.values(RESULT_STYLES).flatMap((s) => s.classes),
  );
  resultBox.classList.add(...style.classes);
}

// --- Events ---
signupBtn.addEventListener("click", async () => {
  const username = (usernameInput.value || "").trim();
  const password = passwordInput.value || "";

  if (!username || !password) {
    showResult("error", "Please enter your username and password.");
    return;
  }

  const fp = await fpPromise;
  const { event_id } = await fp.get();

  try {
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, event_id }),
    });

    const data = await res.json();

    if (!data.success) {
      showResult("error", data.error || "Signup failed.");
      return;
    }

    showResult(data.type, data.message);
  } catch (err) {
    console.error("Sign up request failed:", err);
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
