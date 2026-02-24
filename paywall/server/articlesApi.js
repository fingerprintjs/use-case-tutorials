import fs from "fs";
import { db } from "./db.js";
import { config } from "dotenv";
import {
  FingerprintJsServerApiClient,
  Region,
} from "@fingerprintjs/fingerprintjs-pro-server-api";

config();

const fpServerApiClient = new FingerprintJsServerApiClient({
  apiKey: process.env.FP_SECRET_API_KEY,
  region: Region.Global,
});

export async function getArticle(articleId, eventId) {
  const FREE_ARTICLES_LIMIT = 3;

  const event = await fpServerApiClient.getEvent(eventId);
  const visitorId = event.products?.identification?.data?.visitorId || "";

  const articlesRead = getArticlesRead(visitorId);
  const articlesRemaining = Math.max(
    0,
    FREE_ARTICLES_LIMIT - articlesRead.length
  );

  // Simple article retrieval for demo
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

  // Check for bot activity
  const botDetected = event.products?.botd?.data?.bot?.result !== "notDetected";
  if (botDetected) {
    console.error("Bot detected.");
    return {
      success: false,
      message: "Article not found.",
      articlesRemaining,
    };
  }

  // Check for a high suspect score
  const suspectScore = event.products?.suspectScore?.data?.result || 0;
  if (suspectScore > 20) {
    console.error(`High Suspect Score detected: ${suspectScore}`);
    return {
      success: false,
      message: "Article not found.",
      articlesRemaining,
    };
  }

  // Paywall check
  if (articlesRemaining <= 0 && !articlesRead.includes(articleId)) {
    console.error("No more free articles.");
    return {
      success: false,
      message:
        "You have reached the free article limit. Subscribe to continue reading.",
      articlesRemaining,
    };
  }

  // Record read and return updated remaining count
  recordArticleRead(visitorId, articleId);
  const articlesReadNow = getArticlesRead(visitorId);
  const remaining = Math.max(
    0,
    FREE_ARTICLES_LIMIT - articlesReadNow.length
  );
  return {
    success: true,
    article,
    articlesRemaining: remaining,
  };
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

// --- Helper functions ---
// Record an article view (only if it hasn't been read before)
function recordArticleRead(visitorId, articleId) {
  const exists = db
    .prepare(
      `SELECT 1 FROM articles_read WHERE visitorId = ? AND articleId = ? LIMIT 1`
    )
    .get(visitorId, articleId);

  if (!exists) {
    db.prepare(
      `INSERT INTO articles_read (visitorId, articleId, createdAt) VALUES (?, ?, ?)`
    ).run(visitorId, articleId, Date.now());
  }
}

// Get all unique articles read by a visitor
function getArticlesRead(visitorId) {
  const rows = db
    .prepare(
      `SELECT DISTINCT articleId 
       FROM articles_read 
       WHERE visitorId = ? 
       ORDER BY createdAt ASC`
    )
    .all(visitorId);
  return rows.map((r) => r.articleId);
}
