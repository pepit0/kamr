import {
  DEFAULT_RETENTION_DAYS,
  MAX_EVENT_DURATION_DAYS,
  MAX_EVENT_DURATION_MS,
  MAX_VIDEO_DURATION_SEC,
} from "@kamr/shared";

export function computeEventEndAt(startAt: Date | string): Date {
  return new Date(new Date(startAt).getTime() + MAX_EVENT_DURATION_MS);
}

export function isEventActive(startAt: string, endAt: string): boolean {
  const now = Date.now();
  return new Date(startAt).getTime() <= now && new Date(endAt).getTime() > now;
}

export function isEventUpcoming(startAt: string): boolean {
  return new Date(startAt).getTime() > Date.now();
}

export function isEventEnded(endAt: string): boolean {
  return new Date(endAt).getTime() <= Date.now();
}

export function getRetentionExpiresAt(
  endAt: string,
  retentionDays = DEFAULT_RETENTION_DAYS
): string {
  const expires = new Date(endAt);
  expires.setDate(expires.getDate() + retentionDays);
  return expires.toISOString();
}

export function isEventRetained(
  endAt: string,
  retentionDays = DEFAULT_RETENTION_DAYS
): boolean {
  return Date.now() <= new Date(getRetentionExpiresAt(endAt, retentionDays)).getTime();
}

export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function formatEventDateRange(startAt: string, endAt: string): string {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const sameYear = start.getFullYear() === end.getFullYear();
  const startStr = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const endStr = end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

export function formatRetentionDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function defaultEventStartDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(12, 0, 0, 0);
  return date;
}

export function formatEventDateTimeDisplay(date: Date): { dateLine: string; timeLine: string } {
  return {
    dateLine: date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    timeLine: date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export function validateEventStartAtDate(startAt: Date): string | null {
  const startMs = startAt.getTime();
  if (Number.isNaN(startMs)) {
    return "Invalid start date";
  }
  if (startMs <= Date.now()) {
    return "Event start must be in the future";
  }
  return null;
}

export function parseJoinCodeFromUrl(url: string): string | null {
  const trimmed = url.trim();
  const pathMatch = trimmed.match(/\/join\/([A-Z0-9]+)/i);
  if (pathMatch) return pathMatch[1].toUpperCase();
  const schemeMatch = trimmed.match(/(?:kamr|pahl):\/\/join\/([A-Z0-9]+)/i);
  if (schemeMatch) return schemeMatch[1].toUpperCase();
  if (/^[A-Z0-9]{6,12}$/i.test(trimmed)) return trimmed.toUpperCase();
  return null;
}

export function parseAdminRecoveryFromUrl(url: string): { code: string; token: string } | null {
  const match = url.match(/\/admin\/([A-Z0-9]+)\?token=([a-f0-9]+)/i);
  if (!match) return null;
  return { code: match[1].toUpperCase(), token: match[2] };
}

export { MAX_VIDEO_DURATION_SEC, MAX_EVENT_DURATION_DAYS };
