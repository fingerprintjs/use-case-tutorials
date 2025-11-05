import fs from "fs";

export async function getArticle(articleId) {
  const articles = JSON.parse(
    fs.readFileSync("./server/data/articles.json", "utf-8")
  );

  const article = articles.find((a) => a.id === Number(articleId));
  if (!article) {
    console.error("Article not found");
    return {
      success: false,
      message: "Article not found",
      articlesRemaining,
    };
  }

  return { success: true, article };
}

// Get article summaries
export async function getArticleSummaries() {
  const articles = JSON.parse(
    fs.readFileSync("./server/data/articles.json", "utf-8")
  );

  const summaries = articles.map((article) => ({
    id: article.id,
    title: article.title,
    heroImage: article.heroImage,
    avatar: article.avatar,
    author: article.author,
    date: article.date,
    summary: article.summary,
    tags: article.tags,
  }));

  return summaries;
}
