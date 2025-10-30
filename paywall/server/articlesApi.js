import fs from "fs";

export async function getArticle(id) {
  const articles = JSON.parse(
    fs.readFileSync("./server/data/articles.json", "utf-8")
  );
  const article = articles.find((article) => article.id === Number(id));
  return article;
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
