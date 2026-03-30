import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initDb, seedDefaults, resetDb } from "./db.js";
import { attemptLogin } from "./accounts.js";

config();
initDb();
seedDefaults();

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

// Attempt to login
app.post("/api/login", async (req, reply) => {
  const { email, password, eventId } = req.body || {};
  const result = await attemptLogin({ email, password, eventId });
  return reply.send(result);
});

// Reset the demo DB
app.get("/api/reset-db", async (_req, reply) => {
  resetDb();
  return reply.send({ success: true });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen({ port }, (err) => {
  if (err) throw err;
  console.log(`Server running at http://localhost:${port}`);
});
