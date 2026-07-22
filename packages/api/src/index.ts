import { Hono } from "hono";
import type { Env, AuthContext } from "./types";
import events from "./routes/events";
import albums from "./routes/albums";
import participants from "./routes/participants";
import photos from "./routes/photos";
import auth from "./routes/auth";
import { cleanupExpiredEvents } from "./cron";

type Variables = { auth: AuthContext };

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use("*", async (c, next) => {
  if (c.req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  await next();
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
});

app.get("/health", (c) => c.json({ status: "ok" }));

app.notFound((c) => c.json({ error: "Not found", code: "NOT_FOUND" }, 404));

app.onError((err, c) => {
  console.error(err);
  const message = err instanceof Error ? err.message : "Internal server error";
  return c.json({ error: message, code: "INTERNAL_ERROR" }, 500);
});

app.route("/auth", auth);
app.route("/events", events);
app.route("/albums", albums);
app.route("/participants", participants);
app.route("/photos", photos);

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env) {
    await cleanupExpiredEvents(env);
  },
};
