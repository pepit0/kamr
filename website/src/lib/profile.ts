import { STORAGE_PREFIX } from "@kamr/shared";

export interface UserProfile {
  name: string;
  handle: string;
  photoUri?: string;
}

const PROFILE_KEY = `${STORAGE_PREFIX}profile`;

export async function getProfile(): Promise<UserProfile | null> {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function clearProfile(): Promise<void> {
  localStorage.removeItem(PROFILE_KEY);
}

export async function persistProfilePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read photo"));
    reader.readAsDataURL(file);
  });
}

export function profileInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
