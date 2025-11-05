// Initialize the Fingerprint client agent
// Change region to match your workspace region
// (e.g., "eu" for Europe, "ap" for Asia, "us" for Global (default))
const fpPromise = import(
  `https://fpjscdn.net/v3/${window.FP_PUBLIC_API_KEY}`
).then((FingerprintJS) => FingerprintJS.load({ region: "us" }));

// Elements
const freeCountEl = document.getElementById("freeCount");
const responseEl = document.getElementById("response");
const responseMessageEl = document.getElementById("responseMessage");
const articleEl = document.getElementById("article");
const heroImageEl = document.getElementById("heroImage");
const titleEl = document.getElementById("title");
const avatarEl = document.getElementById("avatar");
const authorEl = document.getElementById("author");
const dateEl = document.getElementById("date");
const contentEl = document.getElementById("content");
const resetLink = document.getElementById("resetLink");

// Get the article content
async function getArticle() {
  const articleId = window.location.pathname.split("/").pop();

  try {
    const fp = await fpPromise;
    const { requestId } = await fp.get();

    const response = await fetch(`/api/article/${articleId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });
    const data = await response.json();

    const articlesRemaining = data.articlesRemaining;
    let text = `${articlesRemaining} free article(s) remaining`;
    if (articlesRemaining == 0)
      text = "You have reached your free article limit";
    freeCountEl.textContent = text;

    if (!data.success) {
      console.error(data.message);
      responseMessageEl.textContent = data.message;
      responseEl.classList.remove("hidden");
      articleEl.classList.add("hidden");
      return;
    }

    const article = data.article;

    articleEl.classList.remove("hidden");
    heroImageEl.src = article.heroImage;
    titleEl.textContent = article.title;
    document.title = article.title;
    avatarEl.src = article.avatar;
    authorEl.textContent = article.author;
    dateEl.textContent = article.date;
    contentEl.innerHTML = "";
    for (const content of article.content) {
      const paragraphEl = document.createElement("p");
      paragraphEl.classList.add("mb-4");
      paragraphEl.textContent = content;
      contentEl.appendChild(paragraphEl);
    }
  } catch (err) {
    console.error("Failed to get article:", err);
    responseMessageEl.textContent =
      "Failed to get article. See console for details.";
    responseEl.classList.remove("hidden");
    articleEl.classList.add("hidden");
  }
}

// Reset demo
resetLink.addEventListener("click", async () => {
  try {
    await fetch("/api/reset");
    window.location.href = "/";
  } catch (err) {
    console.error("Failed to reset:", err);
    alert("Failed to reset demo. See console for details.");
  }
});

getArticle();
