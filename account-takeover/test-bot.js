import puppeteer from "puppeteer";

(async () => {
  let browser;
  try {
    // Launch the browser and open a new blank page
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto("http://localhost:3000");

    // Fill in login form
    await page.type("input[type=email]", "demo@example.com");
    await page.type("input[type=password]", "password123");

    // Click the login button
    await page.click("#loginBtn");

    // Wait for server response
    await page.waitForSelector("#resultBox:not(.hidden)");

    // Capture any visible result message
    const message = await page.evaluate(() => {
      const el = document.querySelector("#resultMessage");
      return el ? el.textContent.trim() : "No result message found";
    });

    console.log("Server response:", message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})().catch((err) => {
  console.error("Bot test failed:", err);
});
