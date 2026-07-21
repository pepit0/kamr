import type { Context, Next } from "hono";
import type { Env, AuthContext, DbEvent } from "../types";
import { extractBearerToken, hashSecret } from "../utils";
import { isEventRetained } from "../retention";

type AppContext = Context<{ Bindings: Env; Variables: { auth: AuthContext; event?: DbEvent } }>;

function retentionError(c: AppContext) {
  return c.json(
    {
      error: "This event has expired and its albums were permanently deleted",
      code: "EVENT_EXPIRED",
    },
    410
  );
}

export function ensureEventRetained(c: AppContext, event: DbEvent) {
  const retentionDays = event.retention_days ?? 30;
  if (!isEventRetained(event.end_at, retentionDays)) {
    return retentionError(c);
  }
  return null;
}
export async function optionalAuth(c: AppContext, next: Next) {
  const token = extractBearerToken(c.req.header("Authorization"));
  if (!token) {
    c.set("auth", { role: "none" });
    await next();
    return;
  }

  const tokenHash = await hashSecret(token);
  const eventId = c.req.param("id") ?? c.req.param("eventId");

  if (eventId) {
    const event = await c.env.DB.prepare(
      "SELECT * FROM events WHERE id = ?"
    )
      .bind(eventId)
      .first<DbEvent>();

    if (event && event.admin_secret_hash === tokenHash) {
      c.set("auth", { role: "admin", eventId: event.id });
      c.set("event", event);
      await next();
      return;
    }

    const participant = await c.env.DB.prepare(
      "SELECT id, event_id FROM participants WHERE event_id = ? AND participant_secret_hash = ?"
    )
      .bind(eventId, tokenHash)
      .first<{ id: string; event_id: string }>();

    if (participant) {
      c.set("auth", {
        role: "participant",
        eventId: participant.event_id,
        participantId: participant.id,
      });
      if (event) c.set("event", event);
      await next();
      return;
    }
  }

  c.set("auth", { role: "none" });
  await next();
}

export async function requireEventAccess(c: AppContext, next: Next) {
  await optionalAuth(c, async () => {});
  const auth = c.get("auth");
  if (auth.role === "none") {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const event = c.get("event");
  if (event) {
    const blocked = ensureEventRetained(c, event);
    if (blocked) return blocked;
  }
  await next();
}

export async function requireAdmin(c: AppContext, next: Next) {
  await optionalAuth(c, async () => {});
  const auth = c.get("auth");
  if (auth.role !== "admin") {
    return c.json({ error: "Admin access required" }, 403);
  }
  const event = c.get("event");
  if (event) {
    const blocked = ensureEventRetained(c, event);
    if (blocked) return blocked;
  }
  await next();
}

export async function requireParticipant(c: AppContext, next: Next) {
  await optionalAuth(c, async () => {});
  const auth = c.get("auth");
  if (auth.role !== "participant" && auth.role !== "admin") {
    return c.json({ error: "Participant access required" }, 403);
  }
  await next();
}

export async function authAlbumAccess(c: AppContext, next: Next) {
  const token = extractBearerToken(c.req.header("Authorization"));
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const albumId = c.req.param("id") ?? c.req.param("albumId");
  const album = await c.env.DB.prepare(
    "SELECT * FROM albums WHERE id = ?"
  )
    .bind(albumId)
    .first<{ id: string; event_id: string }>();

  if (!album) {
    return c.json({ error: "Album not found" }, 404);
  }

  const event = await c.env.DB.prepare("SELECT * FROM events WHERE id = ?")
    .bind(album.event_id)
    .first<DbEvent>();

  if (!event) {
    return c.json({ error: "Event not found" }, 404);
  }

  const blocked = ensureEventRetained(c, event);
  if (blocked) return blocked;

  const tokenHash = await hashSecret(token);

  if (event.admin_secret_hash === tokenHash) {
    c.set("auth", { role: "admin", eventId: event.id });
    c.set("event", event);
    await next();
    return;
  }

  const participant = await c.env.DB.prepare(
    "SELECT id FROM participants WHERE event_id = ? AND participant_secret_hash = ?"
  )
    .bind(event.id, tokenHash)
    .first<{ id: string }>();

  if (participant) {
    c.set("auth", {
      role: "participant",
      eventId: event.id,
      participantId: participant.id,
    });
    c.set("event", event);
    await next();
    return;
  }

  return c.json({ error: "Unauthorized" }, 401);
}

export async function requireAlbumAdmin(c: AppContext, next: Next) {
  const token = extractBearerToken(c.req.header("Authorization"));
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const albumId = c.req.param("id");
  const album = await c.env.DB.prepare("SELECT * FROM albums WHERE id = ?")
    .bind(albumId)
    .first<{ id: string; event_id: string }>();

  if (!album) {
    return c.json({ error: "Album not found" }, 404);
  }

  const event = await c.env.DB.prepare("SELECT * FROM events WHERE id = ?")
    .bind(album.event_id)
    .first<DbEvent>();

  if (!event) {
    return c.json({ error: "Event not found" }, 404);
  }

  const blocked = ensureEventRetained(c, event);
  if (blocked) return blocked;

  const tokenHash = await hashSecret(token);
  if (event.admin_secret_hash !== tokenHash) {
    return c.json({ error: "Admin access required" }, 403);
  }

  c.set("auth", { role: "admin", eventId: event.id });
  c.set("event", event);
  await next();
}

export async function authPhotoAccess(c: AppContext, next: Next) {
  const token = extractBearerToken(c.req.header("Authorization"));
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const photoId = c.req.param("id");
  const photo = await c.env.DB.prepare(
    `SELECT p.*, a.event_id FROM photos p
     JOIN albums a ON a.id = p.album_id
     WHERE p.id = ?`
  )
    .bind(photoId)
    .first<{ id: string; album_id: string; event_id: string }>();

  if (!photo) {
    return c.json({ error: "Photo not found" }, 404);
  }

  const event = await c.env.DB.prepare("SELECT * FROM events WHERE id = ?")
    .bind(photo.event_id)
    .first<DbEvent>();

  if (!event) {
    return c.json({ error: "Event not found" }, 404);
  }

  const blocked = ensureEventRetained(c, event);
  if (blocked) return blocked;

  const tokenHash = await hashSecret(token);

  if (event.admin_secret_hash === tokenHash) {
    c.set("auth", { role: "admin", eventId: event.id });
    c.set("event", event);
    await next();
    return;
  }

  const participant = await c.env.DB.prepare(
    "SELECT id FROM participants WHERE event_id = ? AND participant_secret_hash = ?"
  )
    .bind(event.id, tokenHash)
    .first<{ id: string }>();

  if (participant) {
    c.set("auth", {
      role: "participant",
      eventId: event.id,
      participantId: participant.id,
    });
    c.set("event", event);
    await next();
    return;
  }

  return c.json({ error: "Unauthorized" }, 401);
}

export async function authParticipantUpdate(c: AppContext, next: Next) {
  const token = extractBearerToken(c.req.header("Authorization"));
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const participantId = c.req.param("id");
  const participant = await c.env.DB.prepare(
    "SELECT * FROM participants WHERE id = ?"
  )
    .bind(participantId)
    .first<{ id: string; event_id: string; participant_secret_hash: string }>();

  if (!participant) {
    return c.json({ error: "Participant not found" }, 404);
  }

  const event = await c.env.DB.prepare("SELECT * FROM events WHERE id = ?")
    .bind(participant.event_id)
    .first<DbEvent>();

  if (!event) {
    return c.json({ error: "Event not found" }, 404);
  }

  const blocked = ensureEventRetained(c, event);
  if (blocked) return blocked;

  const tokenHash = await hashSecret(token);

  if (event.admin_secret_hash === tokenHash) {
    c.set("auth", { role: "admin", eventId: event.id });
    c.set("event", event);
    await next();
    return;
  }

  if (participant.participant_secret_hash === tokenHash) {
    c.set("auth", {
      role: "participant",
      eventId: event.id,
      participantId: participant.id,
    });
    c.set("event", event);
    await next();
    return;
  }

  return c.json({ error: "Unauthorized" }, 401);
}
