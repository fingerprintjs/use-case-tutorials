import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initDb } from "./db.js";
import { getRentals } from "./rentals.js";

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
app.get("/api/rentals", async (req, reply) => {
  const result = await getRentals();
  return reply.send(result);
});

// Clear all visitor data for the current visitor
app.post("/api/reset", (_req, reply) => {
  return reply.send({ success: true });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen({ port }, (err) => {
  if (err) throw err;
  console.log(`Server running at http://localhost:${port}`);
});
