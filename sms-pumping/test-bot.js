import puppeteer from "puppeteer";

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto("http://localhost:3000");

  // Fill in name and phone
  await page.type("#nameInput", "Jamie");
  await page.type("#phoneInput", "+1234567890");

  // Click the submit button
  await page.click("#submitBtn");

  // Wait for server response
  await page.waitForSelector("#resultBox:not(.hidden)");

  // Capture any visible result message
  const message = await page.evaluate(() => {
    const el = document.querySelector("#resultMessage");
    return el ? el.textContent.trim() : "No result message found";
  });

  await browser.close();

  console.log("Server response:", message);
})().catch((err) => {
  console.error("Bot test failed:", err);
});
