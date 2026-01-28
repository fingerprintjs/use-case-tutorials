// DOM Elements
const nameInput = document.getElementById("nameInput");
const phoneInput = document.getElementById("phoneInput");
const submitBtn = document.getElementById("submitBtn");
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

// Send SMS verification code
submitBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();

  if (!name || !phone) {
    showResult(false, "Name and phone number are required.");
    return;
  }

  try {
    const res = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
      }),
    });

    const data = await res.json();
    showResult(data.success, data.message);
  } catch (err) {
    console.error("SMS sending failed:", err);
    showResult(false, "Something went wrong.");
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
