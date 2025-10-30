import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("http://localhost:3000/article/1", {
    waitUntil: "networkidle0",
  });

  // Wait until either paywall is shown OR article is shown
  await page.waitForFunction(() => {
    const paywall = document.querySelector("#paywall");
    const article = document.querySelector("#article");

    const isVisible = (el) => {
      return (
        el &&
        !el.classList.contains("hidden") &&
        el.style.display !== "none" &&
        !el.hidden
      );
    };

    return isVisible(paywall) || isVisible(article);
  });

  // Extract message based on which one is visible
  const message = await page.evaluate(() => {
    const paywall = document.querySelector("#paywall");
    const article = document.querySelector("#article");

    const isVisible = (el) => {
      return (
        el &&
        !el.classList.contains("hidden") &&
        el.style.display !== "none" &&
        !el.hidden
      );
    };

    if (isVisible(paywall) && !isVisible(article)) {
      return {
        status: "paywalled",
        text: paywall.textContent.trim(),
      };
    }

    if (isVisible(article) && !isVisible(paywall)) {
      return {
        status: "unlocked",
        text: article.textContent.trim(),
      };
    }

    return {
      status: "unexpected",
      text: "",
    };
  });

  await browser.close();

  console.log("Server response:", message);
})().catch((err) => {
  console.error("Bot test failed:", err);
});
