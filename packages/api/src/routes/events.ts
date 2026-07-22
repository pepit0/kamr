import { Hono } from "hono";

import type { Env, AuthContext, DbEvent, DbAlbum, DbParticipant, DbUser } from "../types";

import {

  generateId,

  generateInviteCode,

  generateSecret,

  hashSecret,

  nowIso,

  toEvent,

  toAlbum,

  toParticipant,

  toPhoto,

} from "../utils";

import { optionalAuth, requireAdmin, requireEventAccess } from "../middleware/auth";
import { optionalUser } from "../middleware/userAuth";

import { validateEventStartAt, computeEventEndAt, sanitizeFilename } from "../retention";

import { buildMediaZip, zipResponse } from "../zip";

import { DEFAULT_RETENTION_DAYS, APP_BASE_URL } from "@kamr/shared";



type Variables = { auth: AuthContext; event?: DbEvent; user?: DbUser };

const EVENT_COLUMNS =
  "id, name, start_at, end_at, invite_code, created_at, retention_days";



const events = new Hono<{ Bindings: Env; Variables: Variables }>();

events.use("*", optionalUser);



events.post("/", async (c) => {

  const body = await c.req.json<{ name?: string; startAt?: string }>();

  if (!body.name?.trim()) {

    return c.json({ error: "Event name is required" }, 400);

  }

  if (!body.startAt) {

    return c.json({ error: "Event start date is required" }, 400);

  }



  const createdAt = nowIso();

  const startValidation = validateEventStartAt(body.startAt);

  if (startValidation) {

    return c.json({ error: startValidation }, 400);

  }



  const startDate = new Date(body.startAt);

  const endDate = new Date(computeEventEndAt(startDate));



  const id = generateId();

  const adminSecret = generateSecret();

  const adminSecretHash = await hashSecret(adminSecret);

  let inviteCode = generateInviteCode();



  for (let attempt = 0; attempt < 5; attempt++) {

    try {

      await c.env.DB.prepare(

        `INSERT INTO events (id, name, start_at, end_at, invite_code, admin_secret_hash, created_at, retention_days)

         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

      )

        .bind(

          id,

          body.name.trim(),

          startDate.toISOString(),

          endDate.toISOString(),

          inviteCode,

          adminSecretHash,

          createdAt,

          DEFAULT_RETENTION_DAYS

        )

        .run();

      break;

    } catch (err) {

      inviteCode = generateInviteCode();

      if (attempt === 4) {

        const message = err instanceof Error ? err.message : "Failed to create event";

        return c.json({ error: message }, 500);

      }

    }

  }



  const event = {

    id,

    name: body.name.trim(),

    start_at: startDate.toISOString(),

    end_at: endDate.toISOString(),

    invite_code: inviteCode,

    created_at: createdAt,

    retention_days: DEFAULT_RETENTION_DAYS,

  };



  const baseUrl = c.env.APP_BASE_URL || APP_BASE_URL;

  const inviteUrl = `${baseUrl}/join/${inviteCode}`;

  const adminRecoveryUrl = `${baseUrl}/admin/${inviteCode}?token=${adminSecret}`;



  return c.json({

    event: toEvent(event),

    adminSecret,

    inviteCode,

    inviteUrl,

    adminRecoveryUrl,

  });

});



events.get("/by-code/:inviteCode", async (c) => {

  const inviteCode = c.req.param("inviteCode").toUpperCase();

  const event = await c.env.DB.prepare(

    `SELECT ${EVENT_COLUMNS} FROM events WHERE invite_code = ?`

  )

    .bind(inviteCode)

    .first<DbEvent>();



  if (!event) {

    return c.json({ error: "Event not found" }, 404);

  }



  return c.json({ event: toEvent(event) });

});



events.post("/by-code/:inviteCode/join", async (c) => {

  const inviteCode = c.req.param("inviteCode").toUpperCase();

  const body = await c.req.json<{ displayName?: string }>();

  const user = c.get("user") as DbUser | undefined;

  const displayName = body.displayName?.trim() || user?.display_name;



  if (!displayName) {

    return c.json({ error: "Display name is required" }, 400);

  }



  const event = await c.env.DB.prepare(

    `SELECT ${EVENT_COLUMNS} FROM events WHERE invite_code = ?`

  )

    .bind(inviteCode)

    .first<DbEvent>();



  if (!event) {

    return c.json({ error: "Event not found" }, 404);

  }



  const participantId = generateId();

  const participantSecret = generateSecret();

  const participantSecretHash = await hashSecret(participantSecret);

  const timestamp = nowIso();



  await c.env.DB.prepare(

    `INSERT INTO participants (id, event_id, display_name, participant_secret_hash, user_id, created_at, updated_at)

     VALUES (?, ?, ?, ?, ?, ?, ?)`

  )

    .bind(

      participantId,

      event.id,

      displayName,

      participantSecretHash,

      user?.id ?? null,

      timestamp,

      timestamp

    )

    .run();



  const participant = {

    id: participantId,

    event_id: event.id,

    display_name: displayName,

    user_id: user?.id ?? null,

    user_handle: user?.handle ?? null,

    created_at: timestamp,

    updated_at: timestamp,

  };



  return c.json({

    participant: toParticipant(participant),

    participantSecret,

    event: toEvent(event),

  });

});



events.post("/by-code/:inviteCode/admin-recover", async (c) => {

  const inviteCode = c.req.param("inviteCode").toUpperCase();

  const body = await c.req.json<{ token?: string }>();



  if (!body.token) {

    return c.json({ error: "Admin token is required" }, 400);

  }



  const event = await c.env.DB.prepare("SELECT * FROM events WHERE invite_code = ?")

    .bind(inviteCode)

    .first<DbEvent>();



  if (!event) {

    return c.json({ error: "Event not found" }, 404);

  }



  const tokenHash = await hashSecret(body.token);

  if (event.admin_secret_hash !== tokenHash) {

    return c.json({ error: "Invalid admin token" }, 403);

  }



  return c.json({

    event: toEvent(event),

    adminSecret: body.token,

  });

});



events.get("/:id", requireEventAccess, async (c) => {

  const eventId = c.req.param("id");

  const auth = c.get("auth");



  const event = await c.env.DB.prepare(

    `SELECT ${EVENT_COLUMNS} FROM events WHERE id = ?`

  )

    .bind(eventId)

    .first<DbEvent>();



  if (!event) {

    return c.json({ error: "Event not found" }, 404);

  }



  const albumsResult = await c.env.DB.prepare(

    "SELECT * FROM albums WHERE event_id = ? ORDER BY created_at ASC"

  )

    .bind(eventId)

    .all<DbAlbum>();



  let participant: DbParticipant | null = null;

  if (auth.role === "participant" && auth.participantId) {

    participant = await c.env.DB.prepare("SELECT * FROM participants WHERE id = ?")

      .bind(auth.participantId)

      .first<DbParticipant>();

  }



  return c.json({

    event: toEvent(event),

    albums: (albumsResult.results ?? []).map(toAlbum),

    role: auth.role,

    participant: participant ? toParticipant(participant) : undefined,

  });

});



events.get("/:id/download", requireEventAccess, async (c) => {

  const eventId = c.req.param("id");



  const event = await c.env.DB.prepare("SELECT * FROM events WHERE id = ?")

    .bind(eventId)

    .first<DbEvent>();



  if (!event) {

    return c.json({ error: "Event not found" }, 404);

  }



  const result = await c.env.DB.prepare(

    `SELECT p.id, p.r2_key, p.mime_type, p.original_filename, a.name as album_name,

            pt.display_name as participant_display_name

     FROM photos p

     JOIN albums a ON a.id = p.album_id

     JOIN participants pt ON pt.id = p.participant_id

     WHERE a.event_id = ?

     ORDER BY a.created_at ASC, p.created_at ASC`

  )

    .bind(eventId)

    .all<{

      id: string;

      r2_key: string;

      mime_type: string;

      original_filename: string | null;

      album_name: string;

      participant_display_name: string;

    }>();



  const zip = await buildMediaZip(

    c.env,

    (result.results ?? []).map((row) => ({

      id: row.id,

      albumName: row.album_name,

      mimeType: row.mime_type,

      r2Key: row.r2_key,

      originalFilename: row.original_filename,

      participantDisplayName: row.participant_display_name,

    })),

    sanitizeFilename(event.name)

  );



  if (!zip) {

    return c.json({ error: "No media to download" }, 404);

  }



  return zipResponse(zip, sanitizeFilename(event.name));

});



events.patch("/:id", requireAdmin, async (c) => {

  const eventId = c.req.param("id");

  const body = await c.req.json<{ name?: string; startAt?: string }>();



  const event = await c.env.DB.prepare("SELECT * FROM events WHERE id = ?")

    .bind(eventId)

    .first<DbEvent>();



  if (!event) {

    return c.json({ error: "Event not found" }, 404);

  }



  const name = body.name?.trim() ?? event.name;

  let startAt = event.start_at ?? event.created_at;

  let endAt = event.end_at;



  if (body.startAt) {

    const startValidation = validateEventStartAt(body.startAt);

    if (startValidation) {

      return c.json({ error: startValidation }, 400);

    }

    startAt = new Date(body.startAt).toISOString();

    endAt = computeEventEndAt(startAt);

  }



  await c.env.DB.prepare("UPDATE events SET name = ?, start_at = ?, end_at = ? WHERE id = ?")

    .bind(name, startAt, endAt, eventId)

    .run();



  return c.json({

    event: toEvent({

      ...event,

      name,

      start_at: startAt,

      end_at: endAt,

    }),

  });

});



events.get("/:id/participants", requireAdmin, async (c) => {

  const eventId = c.req.param("id");

  const result = await c.env.DB.prepare(

    `SELECT p.*, u.handle AS user_handle
     FROM participants p
     LEFT JOIN users u ON u.id = p.user_id
     WHERE p.event_id = ? ORDER BY p.created_at ASC`

  )

    .bind(eventId)

    .all<DbParticipant>();



  return c.json({

    participants: (result.results ?? []).map(toParticipant),

  });

});



events.post("/:id/albums", requireAdmin, async (c) => {

  const eventId = c.req.param("id");

  if (!eventId) {

    return c.json({ error: "Event id is required" }, 400);

  }

  const body = await c.req.json<{ name?: string }>();



  if (!body.name?.trim()) {

    return c.json({ error: "Album name is required" }, 400);

  }



  const albumId = generateId();

  const createdAt = nowIso();



  await c.env.DB.prepare(

    "INSERT INTO albums (id, event_id, name, created_at) VALUES (?, ?, ?, ?)"

  )

    .bind(albumId, eventId, body.name.trim(), createdAt)

    .run();



  return c.json({

    album: toAlbum({

      id: albumId,

      event_id: eventId,

      name: body.name.trim(),

      created_at: createdAt,

    }),

  });

});



export default events;

