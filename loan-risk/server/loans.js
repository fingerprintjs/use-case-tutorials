import { db } from "./db.js";
const MONTHLY_RATE = 0.15;

export async function requestLoan(data) {
  const { firstName, lastName, loanAmount, monthlyIncome, loanTerms } = data;

  if (!firstName || !lastName || !loanAmount || !monthlyIncome || !loanTerms) {
    console.error("Missing required fields.");
    return { success: false, message: "Missing required fields." };
  }

  const loanData = {
    firstName,
    lastName,
    monthlyIncome,
    loanAmount,
    loanTerms,
  };

  // Check affordability
  const principal = Number(loanAmount);
  const months = Math.max(1, Number(loanTerms));
  const totalValue = principal + principal * MONTHLY_RATE;
  const monthlyInstallment = Math.round(totalValue / months);
  const dti = monthlyInstallment / monthlyIncome;

  if (dti > 0.4) {
    recordLoanApplication(loanData, "rejected");
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
  const { firstName, lastName, loanAmount, monthlyIncome, loanTerms } = data;

  db.prepare(
    `INSERT INTO loan_applications (firstName, lastName, monthlyIncome, loanAmount, loanTerms, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    firstName,
    lastName,
    monthlyIncome,
    loanAmount,
    loanTerms,
    status,
    Date.now()
  );
}
