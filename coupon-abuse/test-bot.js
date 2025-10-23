import puppeteer from "puppeteer";

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto("http://localhost:3000");

  // Fill in coupon input
  await page.type("#couponInput", "WELCOME20");

  // Click the apply coupon button
  await page.click("#applyCouponButton");

  // Wait for server response
  await page.waitForSelector("#couponResult:not(.hidden)");

  // Capture any visible result message
  const message = await page.evaluate(() => {
    const el = document.querySelector("#couponMessage");
    return el ? el.textContent.trim() : "No result message found";
  });

  await browser.close();

  console.log("Server response:", message);
})().catch((err) => {
  console.error("Bot test failed:", err);
});
