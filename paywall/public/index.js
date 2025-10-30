// Elements
const freeCountEl = document.getElementById("freeCount");
const paywallModal = document.getElementById("paywall");
const heroArticleEl = document.getElementById("heroArticle");
const articlesContainer = document.getElementById("articlesContainer");
const articleTmpl = document.getElementById("articleTmpl");
const heroArticleTmpl = document.getElementById("heroArticleTmpl");
const articleTagsTmpl = document.getElementById("articleTagsTmpl");
const closePaywallBtn = document.getElementById("closePaywall");
const resetLink = document.getElementById("resetLink");

// Constants
const FREE_ARTICLES_LIMIT = 3;

// Get count of free articles remaining
function getFreeArticlesRemaining() {
  const articlesRead = localStorage.getItem("articlesRead") || "[]";
  const articlesReadArray = JSON.parse(articlesRead);
  return FREE_ARTICLES_LIMIT - articlesReadArray.length;
}

// Update counter of free articles remaining in UI
function updateFreeCount() {
  const articlesRemaining = getFreeArticlesRemaining();
  freeCountEl.textContent = `${articlesRemaining} free articles remaining`;
  if (articlesRemaining == 0) paywallModal.classList.remove("hidden");
}

// Get and display article summaries
async function getArticleSummaries() {
  let articles = [];

  try {
    const response = await fetch("/api/articles");
    articles = await response.json();
  } catch (err) {
    console.error("Failed to get articles:", err);
    return;
  }

  for (const i in articles) {
    const article = articles[i];
    const hero = i == "0";

    let el = hero
      ? heroArticleTmpl.content.cloneNode(true)
      : articleTmpl.content.cloneNode(true);

    el.querySelector("[data-article-link]").href = `/article/${article.id}`;
    el.querySelector("[data-article-image]").src = article.heroImage;
    el.querySelector("[data-article-avatar]").src = article.avatar;
    el.querySelector("[data-article-author]").textContent = article.author;
    el.querySelector("[data-article-date]").textContent = article.date;
    el.querySelector("[data-article-title]").textContent = article.title;
    el.querySelector("[data-article-summary]").textContent = article.summary;
    for (const tag of article.tags) {
      const tagEl = articleTagsTmpl.content.cloneNode(true);
      tagEl.querySelector("[data-article-tag]").textContent = tag;
      el.querySelector("[data-article-tags]").appendChild(tagEl);
    }

    if (hero) {
      heroArticleEl.appendChild(el);
    } else {
      articlesContainer.appendChild(el);
    }
  }
}

// Close paywall modal
closePaywallBtn.addEventListener("click", () => {
  paywallModal.classList.add("hidden");
});

// Reset demo
resetLink.addEventListener("click", async () => {
  localStorage.removeItem("articlesRead");

  try {
    await fetch("/api/reset");
    window.scrollTo(0, 0);
    window.location.reload();
  } catch (err) {
    console.error("Failed to reset:", err);
    alert("Failed to reset demo. See console for details.");
  }
});

updateFreeCount();
getArticleSummaries();
