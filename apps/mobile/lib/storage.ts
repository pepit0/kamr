import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type { LocalEventEntry } from "@kamr/shared";
import { STORAGE_PREFIX } from "@kamr/shared";

const EVENTS_KEY = `${STORAGE_PREFIX}events`;
const ADMIN_SECRET_PREFIX = `${STORAGE_PREFIX}admin:`;
const PARTICIPANT_SECRET_PREFIX = `${STORAGE_PREFIX}participant:`;
const ADMIN_RECOVERY_PREFIX = `${STORAGE_PREFIX}admin-recovery:`;
const SECURE_TIMEOUT_MS = 8000;

async function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out`)), SECURE_TIMEOUT_MS)
    ),
  ]);
}

async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
    return;
  }

  try {
    await withTimeout(SecureStore.setItemAsync(key, value), "Secure storage write");
  } catch {
    await AsyncStorage.setItem(key, value);
  }
}

async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(key);
  }

  try {
    const value = await withTimeout(SecureStore.getItemAsync(key), "Secure storage read");
    if (value) return value;
  } catch {
    // Fall through to AsyncStorage fallback.
  }

  return AsyncStorage.getItem(key);
}

async function secureDelete(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key).catch(() => {});
  await AsyncStorage.removeItem(key).catch(() => {});
}

export async function getLocalEvents(): Promise<LocalEventEntry[]> {
  const raw = await AsyncStorage.getItem(EVENTS_KEY);
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
  await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export async function removeLocalEvent(eventId: string): Promise<void> {
  const events = await getLocalEvents();
  await AsyncStorage.setItem(
    EVENTS_KEY,
    JSON.stringify(events.filter((e) => e.eventId !== eventId))
  );
  await secureDelete(`${ADMIN_SECRET_PREFIX}${eventId}`);
  await secureDelete(`${PARTICIPANT_SECRET_PREFIX}${eventId}`);
  await secureDelete(`${ADMIN_RECOVERY_PREFIX}${eventId}`);
}

export async function saveAdminSecret(eventId: string, secret: string): Promise<void> {
  await secureSet(`${ADMIN_SECRET_PREFIX}${eventId}`, secret);
}

export async function getAdminSecret(eventId: string): Promise<string | null> {
  return secureGet(`${ADMIN_SECRET_PREFIX}${eventId}`);
}

export async function saveParticipantSecret(eventId: string, secret: string): Promise<void> {
  await secureSet(`${PARTICIPANT_SECRET_PREFIX}${eventId}`, secret);
}

export async function getParticipantSecret(eventId: string): Promise<string | null> {
  return secureGet(`${PARTICIPANT_SECRET_PREFIX}${eventId}`);
}

export async function saveAdminRecoveryUrl(eventId: string, url: string): Promise<void> {
  await secureSet(`${ADMIN_RECOVERY_PREFIX}${eventId}`, url);
}

export async function getAdminRecoveryUrl(eventId: string): Promise<string | null> {
  return secureGet(`${ADMIN_RECOVERY_PREFIX}${eventId}`);
}

export async function getEventSecret(
  eventId: string,
  role: "admin" | "participant"
): Promise<string | null> {
  if (role === "admin") {
    return getAdminSecret(eventId);
  }
  return getParticipantSecret(eventId);
}

export async function getAnyEventSecret(eventId: string): Promise<string | null> {
  const admin = await getAdminSecret(eventId);
  if (admin) return admin;
  return getParticipantSecret(eventId);
}

/** Prefer participant secret — required for uploads; admin secret works via API fallback. */
export async function getUploadSecret(eventId: string): Promise<string | null> {
  const participant = await getParticipantSecret(eventId);
  if (participant) return participant;
  return getAdminSecret(eventId);
}
