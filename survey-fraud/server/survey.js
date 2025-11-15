import { db } from "./db.js";

export async function submitSurvey(body) {
  const { email } = body;

  if (checkForDuplicateSubmission(email)) {
    return { success: false, message: "Duplicate survey submission." };
  }

  const saveResult = saveSurveySubmission(body);
  if (!saveResult.success) return saveResult;

  return { success: true, message: "Survey submitted successfully." };
}

// --- Helper functions ---

// Check for duplicate submission
function checkForDuplicateSubmission(email) {
  const submission = db
    .prepare(`SELECT * FROM survey_submissions WHERE email = ?`)
    .get(email);
  return submission ? true : false;
}

// Save survey submission
function saveSurveySubmission(data) {
  const { firstName, email, q1, q2, q3, q4 } = data;

  try {
    db.prepare(
      `
      INSERT INTO survey_submissions (firstName, email, q1, q2, q3, q4, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run(firstName, email, q1, q2, q3, q4, Date.now());
    return { success: true };
  } catch (error) {
    console.error("Failed to save survey submission.", error);
    return { success: false, message: "Failed to save survey submission." };
  }
}
