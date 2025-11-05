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
  let text = `${articlesRemaining} free article(s) remaining`;
  if (articlesRemaining == 0) text = "You have reached your free article limit";
  freeCountEl.textContent = text;
}

// Update articles read in local storage
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

// Get the article content
async function getArticle() {
  const articlesRead = getArticlesRead();
  const articleId = window.location.pathname.split("/").pop();

  if (
    articlesRead.length >= FREE_ARTICLES_LIMIT &&
    !articlesRead.includes(articleId)
  ) {
    responseMessageEl.textContent =
      "You have reached the free article limit. Subscribe to continue reading.";
    responseEl.classList.remove("hidden");
    articleEl.classList.add("hidden");
    return;
  }

  try {
    const response = await fetch(`/api/article/${articleId}`);
    const data = await response.json();

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
  localStorage.removeItem("articlesRead");

  try {
    await fetch("/api/reset");
    window.location.href = "/";
  } catch (err) {
    console.error("Failed to reset:", err);
    alert("Failed to reset demo. See console for details.");
  }
});

updateArticlesRead();
updateFreeCount();
getArticle();
