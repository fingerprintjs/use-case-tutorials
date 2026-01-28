import puppeteer from "puppeteer";

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto("http://localhost:3000");

  // Fill in payment details
  await page.type("#cardNumber", "4242424242424242");
  await page.type("#cardExp", "12/25");
  await page.type("#cardCvv", "123");

  // Click the place order button
  await page.click("#placeOrderBtn");

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
