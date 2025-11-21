export async function sendSMS(body) {
  const { name, phone } = body;

  if (!name || !phone) {
    return { success: false, message: "Name and phone number are required." };
  }

  sendVerificationCode(phone);

  return {
    success: true,
    message: "A verification code has been sent to your phone.",
  };
}

// --- Helpers ---
// Generate and save a random 6-digit verification code
function sendVerificationCode(phone) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const createdAt = Date.now();
  const expiresAt = createdAt + 1000 * 60 * 10; // 10 minutes

  // No SMS integration in the tutorial. Just pretend. ;)
  console.log(`Pretending to send SMS to ${phone}`);

  db.prepare(
    "INSERT INTO sms_codes (phone, code, createdAt, expiresAt) VALUES (?, ?, ?, ?)"
  ).run(phone, code, createdAt, expiresAt);
}
