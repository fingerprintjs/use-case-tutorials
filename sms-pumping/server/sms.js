export async function sendSMS(body) {
  const { name, phone } = body;

  if (!name || !phone) {
    return { success: false, message: "Name and phone number are required." };
  }

  // No SMS integration in the tutorial. Just pretend. ;)
  console.log(`Pretending to send SMS to ${phone} for ${name}`);

  return {
    success: true,
    message: "A verification code has been sent to your phone.",
  };
}
