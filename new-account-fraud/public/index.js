// --- DOM refs ---
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const signupBtn = document.getElementById("signupBtn");
const resultBox = document.getElementById("resultBox");
const resultMsg = document.getElementById("resultMessage");
const resultIcon = document.getElementById("resultIcon");
const clearBtn = document.getElementById("clearResult");
const resetLink = document.getElementById("resetDBLink");

// --- Helpers ---
// Show result message
function showResult(success, message) {
  resultMsg.textContent = (success ? "✅ " : "⚠️ ") + message;
  resultBox.classList.remove("hidden");
  resultBox.classList.toggle("bg-red-100", !success);
  resultBox.classList.toggle("bg-green-100", success);
  resultBox.classList.toggle("text-red-800", !success);
  resultBox.classList.toggle("text-green-800", success);
}

// --- Events ---
signupBtn.addEventListener("click", async () => {
  const username = (usernameInput.value || "").trim();
  const password = passwordInput.value || "";

  if (!username || !password) {
    showResult(false, "Please enter your username and password.");
    return;
  }

  try {
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!data.success) {
      showResult(false, data.error || "Sign up failed.");
      return;
    }

    showResult(true, "Signed up successfully.");
  } catch (err) {
    console.error("Sign up request failed:", err);
    showResult(false, "Something went wrong. Try again.");
  }
});

clearBtn?.addEventListener("click", () => {
  resultBox.classList.add("hidden");
});

resetLink?.addEventListener("click", async () => {
  try {
    await fetch("/api/reset-db");
    showResult(true, "Demo database reset.");
  } catch (err) {
    console.error("Failed to reset DB:", err);
    showResult(false, "Failed to reset demo DB.");
  }
});
