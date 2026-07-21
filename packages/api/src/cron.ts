import type { Env } from "./types";
import { DEFAULT_RETENTION_DAYS } from "./retention";

interface ExpiredEventRow {
  id: string;
}

export async function cleanupExpiredEvents(env: Env): Promise<number> {
  const result = await env.DB.prepare(
    `SELECT id FROM events
     WHERE datetime(end_at, '+' || COALESCE(retention_days, ${DEFAULT_RETENTION_DAYS}) || ' days') < datetime('now')`
  ).all<ExpiredEventRow>();

  const expired = result.results ?? [];
  let deleted = 0;

  for (const event of expired) {
    await deleteEventMedia(env, event.id);
    await env.DB.prepare("DELETE FROM events WHERE id = ?").bind(event.id).run();
    deleted++;
  }

  return deleted;
}

async function deleteEventMedia(env: Env, eventId: string): Promise<void> {
  const photos = await env.DB.prepare(
    `SELECT p.r2_key, p.thumbnail_r2_key FROM photos p
     JOIN albums a ON a.id = p.album_id
     WHERE a.event_id = ?`
  )
    .bind(eventId)
    .all<{ r2_key: string; thumbnail_r2_key: string | null }>();

  for (const photo of photos.results ?? []) {
    await env.PHOTOS.delete(photo.r2_key);
    if (photo.thumbnail_r2_key) {
      await env.PHOTOS.delete(photo.thumbnail_r2_key);
    }
  }
}

export async function deletePhotoMedia(
  env: Env,
  r2Key: string,
  thumbnailR2Key?: string | null
): Promise<void> {
  await env.PHOTOS.delete(r2Key);
  if (thumbnailR2Key) {
    await env.PHOTOS.delete(thumbnailR2Key);
  }
}
