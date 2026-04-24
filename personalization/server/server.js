import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initDb, resetDb } from "./db.js";
import { getRentals, saveFilters, addRecentlyViewed } from "./rentals.js";

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

// Return all rental listings
app.post("/api/rentals", async (req, reply) => {
  const { eventId } = req.body;
  const result = await getRentals(eventId);
  return reply.send(result);
});

// Save visitor filter preferences
app.post("/api/preferences", (req, reply) => {
  const { visitorId, filters } = req.body;
  return reply.send(saveFilters(visitorId, filters));
});

// Save a recently viewed rental
app.post("/api/viewed", (req, reply) => {
  const { visitorId, rentalId } = req.body;
  return reply.send(addRecentlyViewed(visitorId, rentalId));
});

// Reset the demo
app.get("/api/reset", async (_req, reply) => {
  resetDb();
  return reply.send({ success: true });
});

// Start the server
const port = process.env.PORT || 3005;
app.listen({ port }, (err) => {
  if (err) throw err;
  console.log(`Server running at http://localhost:${port}`);
});
