import puppeteer from "puppeteer";

const ATTEMPTS = 10;

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (let i = 1; i <= ATTEMPTS; i++) {
    // Load a fresh sign-up page for each attempt
    await page.goto("http://localhost:3000");

    // Unique username so each attempt is a new account
    const username = `demo-${Date.now()}-${i}`;
    await page.type("#usernameInput", username);
    await page.type("#passwordInput", "password123");

    // Click the sign up button
    await page.click("#signupBtn");

    // Wait for server response
    await page.waitForSelector("#resultBox:not(.hidden)");

    // Capture any visible result message
    const message = await page.evaluate(() => {
      const el = document.querySelector("#resultMessage");
      return el ? el.textContent.trim() : "No result message found";
    });

    console.log(`Attempt ${i} (${username}):`, message);
  }

  await browser.close();
})().catch((err) => {
  console.error("Bot test failed:", err);
});
