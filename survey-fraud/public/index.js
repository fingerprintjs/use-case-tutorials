// Elements
const submitBtn = document.getElementById("submitBtn");
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

// Submit survey
submitBtn.addEventListener("click", async () => {
  const firstNameEl = document.getElementById("firstName");
  const emailEl = document.getElementById("email");
  const q1El = document.getElementById("q1");
  const q2Selected = document.querySelector('input[name="q2"]:checked');
  const q3Selected = document.querySelector('input[name="q3"]:checked');
  const q4El = document.getElementById("q4");

  const data = {
    firstName: firstNameEl.value,
    email: emailEl.value,
    q1: q1El.value,
    q2: q2Selected ? q2Selected.value : null,
    q3: q3Selected ? q3Selected.value : null,
    q4: q4El.value,
  };

  if (!data.firstName || !data.email || !data.q1 || !data.q2 || !data.q3) {
    showResult(false, "Please fill out all required fields before submitting.");
    return;
  }

  try {
    const res = await fetch("/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!result.success) {
      showResult(false, result.message);
      return;
    }

    showResult(true, result.message);
  } catch (err) {
    console.error("Survey submission failed:", err);
    showResult(false, "Something went wrong. Try again.");
  }
});

// Clear result message
clearBtn?.addEventListener("click", () => {
  resultBox.classList.add("hidden");
});

// Reset demo
resetLink.addEventListener("click", async () => {
  try {
    await fetch("/api/reset");
    showResult(true, "Demo reset. You can submit the survey again.");
  } catch (err) {
    console.error("Failed to reset demo:", err);
    showResult(false, "Failed to reset demo.");
  }
});
