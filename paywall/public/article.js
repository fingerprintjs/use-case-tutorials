// Elements
const freeCountEl = document.getElementById("freeCount");
const paywallEl = document.getElementById("paywall");
const articleEl = document.getElementById("article");
const heroImageEl = document.getElementById("heroImage");
const titleEl = document.getElementById("title");
const avatarEl = document.getElementById("avatar");
const authorEl = document.getElementById("author");
const dateEl = document.getElementById("date");
const contentEl = document.getElementById("content");
const resetLink = document.getElementById("resetDBLink");

// Constants
const FREE_ARTICLES_LIMIT = 3;

// Get articles read
function getArticlesRead() {
  const articlesRead = localStorage.getItem("articlesRead") || "[]";
  const articlesReadArray = JSON.parse(articlesRead);
  return articlesReadArray;
}

// Update count of free articles remaining in UI
function updateFreeCount() {
  const articlesRead = getArticlesRead();
  const articlesRemaining = FREE_ARTICLES_LIMIT - articlesRead.length;
  let text = `${articlesRemaining} free articles remaining`;
  if (articlesRemaining == 0) text = "You have reached your free article limit";
  freeCountEl.textContent = text;
}

// Get the article content
async function getArticle() {
  const articlesRead = getArticlesRead();
  const articleId = window.location.pathname.split("/").pop();

  if (
    articlesRead.length >= FREE_ARTICLES_LIMIT &&
    !articlesRead.includes(articleId)
  ) {
    paywallEl.classList.remove("hidden");
    articleEl.classList.add("hidden");
    return;
  }

  const response = await fetch(`/api/article/${articleId}`);
  const article = await response.json();

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
}

function updateArticlesRead() {
  const articleId = window.location.pathname.split("/").pop();
  const articlesRead = localStorage.getItem("articlesRead") || "[]";
  const articlesReadArray = JSON.parse(articlesRead);
  if (articlesReadArray.length >= FREE_ARTICLES_LIMIT) return;

  const newArticlesReadArray = Array.from(
    new Set([...articlesReadArray, articleId])
  );
  localStorage.setItem("articlesRead", JSON.stringify(newArticlesReadArray));
}

updateArticlesRead();
updateFreeCount();
getArticle();
