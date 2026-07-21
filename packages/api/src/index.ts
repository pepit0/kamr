import { Hono } from "hono";
import type { Env, AuthContext } from "./types";
import events from "./routes/events";
import albums from "./routes/albums";
import participants from "./routes/participants";
import photos from "./routes/photos";
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
