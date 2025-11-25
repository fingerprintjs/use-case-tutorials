import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initDb, resetDb } from "./db.js";
import {
  getListings,
  postListing,
  removeListing,
  banSeller,
} from "./listings.js";

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

// Get all listings
app.get("/api/listings", (_req, reply) => {
  const result = getListings();
  return reply.send(result);
});

// Post new listing
app.post("/api/listings", (req, reply) => {
  const result = postListing(req.body);
  return reply.send(result);
});

// Remove listing
app.delete("/api/listings/:id", (req, reply) => {
  const result = removeListing(req.params.id);
  return reply.send(result);
});

// Ban seller
app.post("/api/ban-seller", (req, reply) => {
  const { sellerEmail } = req.body;
  const result = banSeller(sellerEmail);
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
