import {
  DEFAULT_RETENTION_DAYS,
  MAX_EVENT_DURATION_DAYS,
  MAX_EVENT_DURATION_MS,
  MAX_VIDEO_DURATION_MS,
} from "@kamr/shared";

export {
  DEFAULT_RETENTION_DAYS,
  MAX_EVENT_DURATION_DAYS,
  MAX_EVENT_DURATION_MS,
  MAX_VIDEO_DURATION_MS,
};

export function computeEventEndAt(startAt: string | Date): string {
  const startMs = new Date(startAt).getTime();
  return new Date(startMs + MAX_EVENT_DURATION_MS).toISOString();
}

export function isEventActive(startAt: string, endAt: string): boolean {
  const now = Date.now();
  return new Date(startAt).getTime() <= now && new Date(endAt).getTime() > now;
}

export function isEventUpcoming(startAt: string): boolean {
  return new Date(startAt).getTime() > Date.now();
}

export function getRetentionExpiresAt(endAt: string, retentionDays = DEFAULT_RETENTION_DAYS): string {
  const expires = new Date(endAt);
  expires.setDate(expires.getDate() + retentionDays);
  return expires.toISOString();
}

export function isEventRetained(endAt: string, retentionDays = DEFAULT_RETENTION_DAYS): boolean {
  return Date.now() <= new Date(getRetentionExpiresAt(endAt, retentionDays)).getTime();
}

export function validateEventStartAt(startAt: string): string | null {
  const startMs = new Date(startAt).getTime();
  if (Number.isNaN(startMs)) {
    return "Invalid start date";
  }
  if (startMs <= Date.now()) {
    return "Event start must be in the future";
  }
  return null;
}

export function mimeToExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
  };
  return map[mimeType] ?? "bin";
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\s.-]/g, "").trim().replace(/\s+/g, "-") || "download";
}
