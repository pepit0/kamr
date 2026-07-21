import type { LocalEventEntry } from "@kamr/shared";
import { STORAGE_PREFIX } from "@kamr/shared";

const EVENTS_KEY = `${STORAGE_PREFIX}events`;
const ADMIN_SECRET_PREFIX = `${STORAGE_PREFIX}admin:`;
const PARTICIPANT_SECRET_PREFIX = `${STORAGE_PREFIX}participant:`;
const ADMIN_RECOVERY_PREFIX = `${STORAGE_PREFIX}admin-recovery:`;

function getItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string): void {
  localStorage.setItem(key, value);
}

function removeItem(key: string): void {
  localStorage.removeItem(key);
}

export async function getLocalEvents(): Promise<LocalEventEntry[]> {
  const raw = getItem(EVENTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LocalEventEntry[];
  } catch {
    return [];
  }
}

export async function saveLocalEvent(entry: LocalEventEntry): Promise<void> {
  const events = await getLocalEvents();
  const index = events.findIndex((e) => e.eventId === entry.eventId);
  if (index >= 0) {
    events[index] = { ...events[index], ...entry };
  } else {
    events.unshift(entry);
  }
  setItem(EVENTS_KEY, JSON.stringify(events));
}

export async function removeLocalEvent(eventId: string): Promise<void> {
  const events = await getLocalEvents();
  setItem(EVENTS_KEY, JSON.stringify(events.filter((e) => e.eventId !== eventId)));
  removeItem(`${ADMIN_SECRET_PREFIX}${eventId}`);
  removeItem(`${PARTICIPANT_SECRET_PREFIX}${eventId}`);
  removeItem(`${ADMIN_RECOVERY_PREFIX}${eventId}`);
}

export async function saveAdminSecret(eventId: string, secret: string): Promise<void> {
  setItem(`${ADMIN_SECRET_PREFIX}${eventId}`, secret);
}

export async function getAdminSecret(eventId: string): Promise<string | null> {
  return getItem(`${ADMIN_SECRET_PREFIX}${eventId}`);
}

export async function saveParticipantSecret(eventId: string, secret: string): Promise<void> {
  setItem(`${PARTICIPANT_SECRET_PREFIX}${eventId}`, secret);
}

export async function getParticipantSecret(eventId: string): Promise<string | null> {
  return getItem(`${PARTICIPANT_SECRET_PREFIX}${eventId}`);
}

export async function saveAdminRecoveryUrl(eventId: string, url: string): Promise<void> {
  setItem(`${ADMIN_RECOVERY_PREFIX}${eventId}`, url);
}

export async function getAdminRecoveryUrl(eventId: string): Promise<string | null> {
  return getItem(`${ADMIN_RECOVERY_PREFIX}${eventId}`);
}

export async function getAnyEventSecret(eventId: string): Promise<string | null> {
  const admin = await getAdminSecret(eventId);
  if (admin) return admin;
  return getParticipantSecret(eventId);
}
