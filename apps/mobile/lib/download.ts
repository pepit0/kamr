import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { getApiUrl } from "./api";

export async function downloadAndShare(
  path: string,
  secret: string,
  filename: string,
  download = true
): Promise<void> {
  const url = `${getApiUrl()}${path}${download ? "?download=1" : ""}`;
  const target = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}${filename}`;

  const result = await FileSystem.downloadAsync(url, target, {
    headers: { Authorization: `Bearer ${secret}` },
  });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device");
  }

  await Sharing.shareAsync(result.uri);
}

export async function downloadEventZip(eventId: string, secret: string, eventName: string) {
  await downloadAndShare(
    `/events/${eventId}/download`,
    secret,
    `${sanitizeFilename(eventName)}.zip`
  );
}

export async function downloadAlbumZip(albumId: string, secret: string, albumName: string) {
  await downloadAndShare(
    `/albums/${albumId}/download`,
    secret,
    `${sanitizeFilename(albumName)}.zip`
  );
}

export async function downloadMedia(
  photoId: string,
  secret: string,
  filename: string
) {
  await downloadAndShare(`/photos/${photoId}/content`, secret, filename);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\s.-]/g, "").trim().replace(/\s+/g, "-") || "download";
}
