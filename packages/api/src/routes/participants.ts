import { Hono } from "hono";
import type { Env, AuthContext, DbParticipant } from "../types";
import { nowIso, toParticipant } from "../utils";
import { authParticipantUpdate } from "../middleware/auth";

type Variables = { auth: AuthContext };

const participants = new Hono<{ Bindings: Env; Variables: Variables }>();

participants.patch("/:id", authParticipantUpdate, async (c) => {
  const participantId = c.req.param("id");
  const body = await c.req.json<{ displayName?: string }>();

  if (!body.displayName?.trim()) {
    return c.json({ error: "Display name is required" }, 400);
  }

  const participant = await c.env.DB.prepare("SELECT * FROM participants WHERE id = ?")
    .bind(participantId)
    .first<DbParticipant>();

  if (!participant) {
    return c.json({ error: "Participant not found" }, 404);
  }

  const updatedAt = nowIso();
  await c.env.DB.prepare(
    "UPDATE participants SET display_name = ?, updated_at = ? WHERE id = ?"
  )
    .bind(body.displayName.trim(), updatedAt, participantId)
    .run();

  return c.json({
    participant: toParticipant({
      ...participant,
      display_name: body.displayName.trim(),
      updated_at: updatedAt,
    }),
  });
});

export default participants;
