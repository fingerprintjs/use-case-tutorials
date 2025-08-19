import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initDb, seedDefaultCoupons, resetDb } from "./db.js";
import { validateCoupon } from "./coupons.js";

config();
initDb();
seedDefaultCoupons();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = Fastify();

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

// Validate the coupon code
app.post("/api/validate-coupon", async (request, reply) => {
  const { coupon } = request.body || {};
  const code = (coupon || "").toUpperCase().trim();

  const result = validateCoupon(code);
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
