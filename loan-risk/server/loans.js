import { db } from "./db.js";
import { config } from "dotenv";
import {
  FingerprintJsServerApiClient,
  Region,
} from "@fingerprintjs/fingerprintjs-pro-server-api";
import crypto from "crypto";
const MONTHLY_RATE = 0.15;

config();

// Change region to match your workspace region
// (e.g., "EU" for Europe, "AP" for Asia, "Global" for Global (default))
const fpServerApiClient = new FingerprintJsServerApiClient({
  apiKey: process.env.FP_SECRET_API_KEY,
  region: Region.Global,
});

export async function requestLoan(data) {
  const {
    firstName,
    lastName,
    loanAmount,
    monthlyIncome,
    loanTerms,
    requestId,
  } = data;

  if (
    (!firstName || !lastName || !loanAmount || !monthlyIncome || !loanTerms,
    !requestId)
  ) {
    console.error("Missing required fields.");
    return { success: false, message: "Missing required fields." };
  }

  const event = await fpServerApiClient.getEvent(requestId);
  const visitorId = event.products.identification.data.visitorId;

  const loanData = {
    firstName,
    lastName,
    monthlyIncome,
    loanAmount,
    loanTerms,
    visitorId,
  };

  // Check for bot activity
  const botDetected = event.products?.botd?.data?.bot?.result !== "notDetected";

  if (botDetected) {
    recordLoanApplication(loanData, "rejected");
    console.error("Bot detected.");
    return { success: false, message: "Loan application denied." };
  }

  // Check for a high suspect score
  const suspectScore = event.products?.suspectScore?.data?.result || 0;

  if (suspectScore > 20) {
    console.error(`High Suspect Score detected: ${suspectScore}`);
    recordLoanApplication(loanData, "rejected");
    return { success: false, message: "Loan application denied." };
  }

  // Check if the visitor details are consistent
  if (!isConsistent({ visitorId, firstName, lastName, monthlyIncome })) {
    recordLoanApplication(loanData, "rejected");
    console.error("Visitor details are not consistent.");
    return { success: false, message: "Loan application denied." };
  }

  // Check if the visitor has made too many applications
  const applicationCount = getApplicationCount(visitorId);
  if (applicationCount >= 3) {
    recordLoanApplication(loanData, "rejected");
    console.error("Too many loan applications.");
    return { success: false, message: "Loan application denied." };
  }

  // Check affordability
  const principal = Number(loanAmount);
  const months = Math.max(1, Number(loanTerms));
  const totalValue = principal + principal * MONTHLY_RATE;
  const monthlyInstallment = Math.round(totalValue / months);
  const dti = monthlyInstallment / monthlyIncome;

  if (dti > 0.4) {
    recordLoanApplication(loanData, "rejected");
    console.error("Debt to income ratio too high.");
    return {
      success: false,
      message: "Sorry your debt to income ratio would be too high.",
    };
  }

  // Record successful loan application if above checks pass
  recordLoanApplication(loanData, "approved");

  return {
    success: true,
    message: "Congratulations, your loan has been approved!",
  };
}

// --- Helpers ---
// Record loan application
function recordLoanApplication(data, status) {
  const {
    firstName,
    lastName,
    loanAmount,
    monthlyIncome,
    loanTerms,
    visitorId,
  } = data;

  db.prepare(
    `INSERT INTO loan_applications (visitorId, firstName, lastName, monthlyIncome, loanAmount, loanTerms, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    visitorId,
    firstName,
    lastName,
    monthlyIncome,
    loanAmount,
    loanTerms,
    status,
    Date.now()
  );
}

// Generate personal hash
function genPersonalHash({ firstName, lastName, monthlyIncome }) {
  const norm = [
    firstName.trim().toLowerCase().replace(/\s+/g, ""),
    lastName.trim().toLowerCase().replace(/\s+/g, ""),
    Number(monthlyIncome),
  ].join("|");
  return crypto.createHash("sha256").update(norm).digest("hex");
}

// Check if the visitor details are consistent
function isConsistent({ visitorId, firstName, lastName, monthlyIncome }) {
  const personalHash = genPersonalHash({
    firstName,
    lastName,
    monthlyIncome,
  });

  const row = db
    .prepare(
      `SELECT firstName, lastName, monthlyIncome FROM loan_applications WHERE visitorId = ?
    ORDER BY createdAt ASC LIMIT 1`
    )
    .get(visitorId);

  if (!row) return true;

  const originalHash = genPersonalHash({
    firstName: row.firstName,
    lastName: row.lastName,
    monthlyIncome: row.monthlyIncome,
  });

  return originalHash == personalHash;
}

// Check how many loan applications have been made by the visitor
function getApplicationCount(visitorId) {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS count FROM loan_applications WHERE visitorId = ?`
    )
    .get(visitorId);
  return row.count;
}
