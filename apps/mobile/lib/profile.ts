import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { STORAGE_PREFIX } from "@kamr/shared";

export interface UserProfile {
  name: string;
  handle: string;
  photoUri?: string;
}

const PROFILE_KEY = `${STORAGE_PREFIX}profile`;
const PROFILE_PHOTO_FILENAME = "profile-photo.jpg";

function profilePhotoPath(): string {
  return `${FileSystem.documentDirectory ?? ""}${PROFILE_PHOTO_FILENAME}`;
}

export async function getProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    const profile = JSON.parse(raw) as UserProfile;
    if (profile.photoUri) {
      const info = await FileSystem.getInfoAsync(profile.photoUri);
      if (!info.exists) {
        return { ...profile, photoUri: undefined };
      }
    }
    return profile;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_KEY);
  await FileSystem.deleteAsync(profilePhotoPath(), { idempotent: true }).catch(() => {});
}

export async function persistProfilePhoto(sourceUri: string): Promise<string> {
  const destination = profilePhotoPath();
  await FileSystem.copyAsync({ from: sourceUri, to: destination });
  return destination;
}

export function profileInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
