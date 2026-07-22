/** Format a Date for `<input type="datetime-local">` in local time. */
export function toLocalDateTimeInputValue(date: Date): string {
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Parse `<input type="datetime-local">` value as local time (avoids UTC shifts in Safari). */
export function parseLocalDateTimeInput(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Accept "YYYY-MM-DDTHH:mm", "YYYY-MM-DD HH:mm", optional seconds, optional AM/PM variants.
  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})(?::(\d{2}))?/
  );
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hours = Number(match[4]);
  const minutes = Number(match[5]);
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);

  return Number.isNaN(date.getTime()) ? null : date;
}

/** Parse an ISO timestamp from the API into a local Date for display/editing. */
export function parseEventStartAt(iso: string): Date {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}
