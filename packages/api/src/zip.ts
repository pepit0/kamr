import { zipSync, type Zippable } from "fflate";
import type { Env } from "./types";
import { mimeToExtension, sanitizeFilename } from "./retention";

export interface ZipMediaItem {
  id: string;
  albumName: string;
  mimeType: string;
  r2Key: string;
  originalFilename?: string | null;
  participantDisplayName?: string;
}

export async function buildMediaZip(
  env: Env,
  items: ZipMediaItem[],
  archiveName: string
): Promise<Uint8Array | null> {
  if (items.length === 0) {
    return null;
  }

  const files: Zippable = {};

  for (const item of items) {
    const object = await env.PHOTOS.get(item.r2Key);
    if (!object) continue;

    const data = new Uint8Array(await object.arrayBuffer());
    const ext = mimeToExtension(item.mimeType);
    const baseName = item.originalFilename
      ? sanitizeFilename(item.originalFilename.replace(/\.[^.]+$/, ""))
      : item.id;
    const folder = sanitizeFilename(item.albumName);
    const uploader = item.participantDisplayName
      ? sanitizeFilename(item.participantDisplayName)
      : "guest";
    files[`${folder}/${uploader}-${baseName}.${ext}`] = data;
  }

  if (Object.keys(files).length === 0) {
    return null;
  }

  return zipSync(files, { level: 0 });
}

export function zipResponse(body: Uint8Array, filename: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${sanitizeFilename(filename)}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
