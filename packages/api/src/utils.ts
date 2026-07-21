import { MAX_EVENT_DURATION_DAYS } from "@kamr/shared";
import {
  getRetentionExpiresAt,
  isEventActive,
  isEventRetained,
} from "./retention";

export function generateId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export { isEventActive };

export async function hashSecret(secret: string): Promise<string> {
  const data = new TextEncoder().encode(secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const INVITE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCode(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => INVITE_CHARS[b % INVITE_CHARS.length])
    .join("");
}

export function toEvent(row: {
  id: string;
  name: string;
  start_at?: string | null;
  end_at: string;
  invite_code: string;
  created_at: string;
  retention_days?: number | null;
}) {
  const retentionDays = row.retention_days ?? 30;
  const startAt = row.start_at ?? row.created_at;
  const retentionExpiresAt = getRetentionExpiresAt(row.end_at, retentionDays);
  return {
    id: row.id,
    name: row.name,
    startAt,
    endAt: row.end_at,
    inviteCode: row.invite_code,
    createdAt: row.created_at,
    isActive: isEventActive(startAt, row.end_at),
    retentionDays,
    retentionExpiresAt,
    isRetained: isEventRetained(row.end_at, retentionDays),
    maxDurationDays: MAX_EVENT_DURATION_DAYS,
  };
}

export function toAlbum(row: {
  id: string;
  event_id: string;
  name: string;
  created_at: string;
}) {
  return {
    id: row.id,
    eventId: row.event_id,
    name: row.name,
    createdAt: row.created_at,
  };
}

export function toParticipant(row: {
  id: string;
  event_id: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}) {
  return {
    id: row.id,
    eventId: row.event_id,
    displayName: row.display_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toPhoto(row: DbPhotoRow) {
  return {
    id: row.id,
    albumId: row.album_id,
    participantId: row.participant_id,
    mimeType: row.mime_type,
    mediaType: (row.media_type ?? "photo") as "photo" | "video",
    url: `/photos/${row.id}/content`,
    thumbnailUrl: row.thumbnail_r2_key ? `/photos/${row.id}/thumbnail` : undefined,
    durationMs: row.duration_ms ?? undefined,
    fileSizeBytes: row.file_size_bytes ?? undefined,
    createdAt: row.created_at,
    participantDisplayName: row.participant_display_name,
  };
}

export type DbPhotoRow = {
  id: string;
  album_id: string;
  participant_id: string;
  r2_key: string;
  mime_type: string;
  created_at: string;
  media_type?: string | null;
  duration_ms?: number | null;
  thumbnail_r2_key?: string | null;
  file_size_bytes?: number | null;
  original_filename?: string | null;
  participant_display_name?: string;
};

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim() || null;
}

export function parseJoinCodeFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const pathMatch = parsed.pathname.match(/\/join\/([A-Z0-9]+)/i);
    if (pathMatch) return pathMatch[1].toUpperCase();
    const schemeMatch = url.match(/(?:kamr|pahl):\/\/join\/([A-Z0-9]+)/i);
    if (schemeMatch) return schemeMatch[1].toUpperCase();
    return null;
  } catch {
    const schemeMatch = url.match(/(?:kamr|pahl):\/\/join\/([A-Z0-9]+)/i);
    return schemeMatch ? schemeMatch[1].toUpperCase() : null;
  }
}
