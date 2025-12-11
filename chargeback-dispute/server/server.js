import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initDb, resetDb } from "./db.js";
import {
  getEvents,
  postPurchase,
  getPurchases,
  getAllPurchases,
  disputePurchase,
} from "./purchases.js";

config();
initDb();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = Fastify({ logger: { level: "error" } }); // Set to info or debug to see more logs

// Global error handler
app.setErrorHandler((error, _req, reply) => {
  app.log.error(error);
  reply.code(500).send({
    error: `Error: ${error.message} (Shown for tutorial debugging purposes)`,
  });
});

// Serve static files from the "public" folder
await app.register(fastifyStatic, {
  root: join(__dirname, "../public"),
  prefix: "/",
  index: "index.html",
});

// Expose public key to the browser
app.get("/config.js", (_req, reply) => {
  reply
    .type("application/javascript")
    .send(
      `window.FP_PUBLIC_API_KEY = "${process.env.FP_PUBLIC_API_KEY || ""}";`
    );
});

// Redirect /order-history to history.html
app.get("/order-history", (_req, reply) => {
  return reply.redirect("/history.html");
});

// Redirect /admin to admin.html
app.get("/admin", (_req, reply) => {
  return reply.redirect("/admin.html");
});

// Get all events
app.get("/api/events", (_req, reply) => {
  const result = getEvents();
  return reply.send(result);
});

// Post new purchase
app.post("/api/purchases", async (req, reply) => {
  const result = postPurchase(req.body);
  return reply.send(result);
});

// Get purchases for a user
app.get("/api/purchases", (req, reply) => {
  const email = req.query.email || "jamie@example.com";
  const result = getPurchases(email);
  return reply.send(result);
});

// Get all purchases (admin view)
app.get("/api/purchases/all", (req, reply) => {
  const result = getAllPurchases();
  return reply.send(result);
});

// Simulate a chargeback
app.post("/api/purchases/:id/chargeback", (req, reply) => {
  const result = disputePurchase(req.params.id);
  return reply.send(result);
});

// Reset the demo DB
app.get("/api/reset-db", (_req, reply) => {
  resetDb();
  return reply.send({ success: true });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen({ port }, (err) => {
  if (err) throw err;
  console.log(`Server running at http://localhost:${port}`);
});
