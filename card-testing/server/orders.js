import { db } from "./db.js";

export async function placeOrder(body) {
  const { recipientEmail, amount, cardNumber, cardExp, cardCvv } = body;

  const { valid, errors } = validatePaymentFields({
    cardNumber,
    cardExp,
    cardCvv,
  });

  if (!valid) {
    console.error("Invalid payment details.");
    return { success: false, message: errors.join("\n") };
  }

  saveOrder({ recipientEmail, amount });

  return { success: true, message: "Order placed successfully." };
}

// --- Helpers ---
// Validate payment fields
function validatePaymentFields({ cardNumber, cardExp, cardCvv }) {
  const num = cardNumber.replace(/\D/g, "");
  const cvvDigits = cardCvv.replace(/\D/g, "");
  const errors = [];

  if (!cardNumber.trim()) errors.push("Card number is required.");
  if (!cardExp.trim()) errors.push("Expiration date is required.");
  if (!cardCvv.trim()) errors.push("CVV is required.");
  if (errors.length > 0) return { valid: false, errors };
  if (num.length !== 16) errors.push("Card number must be 16 digits.");
  if (!/^\d{2}\/\d{2}$/.test(cardExp)) errors.push("Expiration must be MM/YY.");
  if (cvvDigits.length !== 3 && cvvDigits.length !== 4)
    errors.push("CVV must be 3 or 4 digits.");

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Save the order to the database
function saveOrder({ recipientEmail, amount }) {
  db.prepare(
    "INSERT INTO orders (recipientEmail, amount, createdAt) VALUES (?, ?, ?)"
  ).run(recipientEmail, amount, Date.now());
}
