import type { Env, AuthContext } from "./types";
import { generateId, generateSecret, hashSecret, nowIso } from "./utils";

/**
 * Uploads must be attributed to a participant row. Guests use their participant
 * secret; hosts may use an admin secret — in that case we find or create the
 * host participant for the event.
 */
export async function resolveUploadParticipantId(
  env: Env,
  eventId: string,
  auth: AuthContext,
  hostDisplayName = "Host"
): Promise<string | null> {
  if (auth.participantId) {
    return auth.participantId;
  }

  if (auth.role !== "admin") {
    return null;
  }

  const existing = await env.DB.prepare(
    "SELECT id FROM participants WHERE event_id = ? ORDER BY created_at ASC LIMIT 1"
  )
    .bind(eventId)
    .first<{ id: string }>();

  if (existing) {
    return existing.id;
  }

  const participantId = generateId();
  const participantSecret = generateSecret();
  const participantSecretHash = await hashSecret(participantSecret);
  const timestamp = nowIso();

  await env.DB.prepare(
    `INSERT INTO participants (id, event_id, display_name, participant_secret_hash, user_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, NULL, ?, ?)`
  )
    .bind(participantId, eventId, hostDisplayName, participantSecretHash, timestamp, timestamp)
    .run();

  return participantId;
}
