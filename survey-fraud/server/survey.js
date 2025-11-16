import { db } from "./db.js";
import { config } from "dotenv";
import {
  FingerprintJsServerApiClient,
  Region,
} from "@fingerprintjs/fingerprintjs-pro-server-api";

config();

const fpServerApiClient = new FingerprintJsServerApiClient({
  apiKey: process.env.FP_SECRET_API_KEY,
  region: Region.Global,
});

export async function submitSurvey(body) {
  const { email, requestId } = body;

  const event = await fpServerApiClient.getEvent(requestId);

  const botDetected = event.products?.botd?.data?.bot?.result !== "notDetected";
  if (botDetected) {
    console.error("Bot detected.");
    return { success: false, message: "Survey submission failed." };
  }

  const suspectScore = event.products?.suspectScore?.data?.result || 0;
  if (suspectScore > 20) {
    console.error(`High Suspect Score detected: ${suspectScore}`);
    return { success: false, message: "Survey submission failed." };
  }

  const visitorId = event.products.identification.data.visitorId;
  if (checkForDuplicateSubmission(email, visitorId)) {
    console.error("Duplicate survey submission detected.");
    return { success: false, message: "Duplicate survey submission." };
  }

  const saveResult = saveSurveySubmission({ ...body, visitorId });
  if (!saveResult.success) return saveResult;

  return { success: true, message: "Survey submitted successfully." };
}

// --- Helper functions ---

// Check for duplicate submission
function checkForDuplicateSubmission(email, visitorId) {
  const submission = db
    .prepare(
      `SELECT * FROM survey_submissions 
       WHERE email = ? OR visitorId = ?`
    )
    .get(email, visitorId);

  return submission ? true : false;
}

// Save survey submission
function saveSurveySubmission(data) {
  const { firstName, email, q1, q2, q3, q4, visitorId } = data;

  try {
    db.prepare(
      `
      INSERT INTO survey_submissions (visitorId, firstName, email, q1, q2, q3, q4, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(visitorId, firstName, email, q1, q2, q3, q4, Date.now());
    return { success: true };
  } catch (error) {
    console.error("Failed to save survey submission.", error);
    return { success: false, message: "Failed to save survey submission." };
  }
}
