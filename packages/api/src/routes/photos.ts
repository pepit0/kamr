import { Hono } from "hono";
import type { Env, AuthContext } from "../types";
import { authPhotoAccess } from "../middleware/auth";
import { mimeToExtension, sanitizeFilename } from "../retention";

type Variables = { auth: AuthContext };

const photos = new Hono<{ Bindings: Env; Variables: Variables }>();

photos.get("/:id/content", authPhotoAccess, async (c) => {
  const photoId = c.req.param("id");
  const download = c.req.query("download") === "1";

  const photo = await c.env.DB.prepare("SELECT * FROM photos WHERE id = ?")
    .bind(photoId)
    .first<{
      r2_key: string;
      mime_type: string;
      original_filename: string | null;
      media_type: string;
    }>();

  if (!photo) {
    return c.json({ error: "Media not found" }, 404);
  }

  const object = await c.env.PHOTOS.get(photo.r2_key);
  if (!object) {
    return c.json({ error: "Media file missing" }, 404);
  }

  const headers = new Headers();
  headers.set("Content-Type", photo.mime_type);
  if (download) {
    const ext = mimeToExtension(photo.mime_type);
    const base = photo.original_filename
      ? sanitizeFilename(photo.original_filename)
      : `${photo.media_type}-${photoId}.${ext}`;
    headers.set("Content-Disposition", `attachment; filename="${base}"`);
  }
  headers.set("Cache-Control", "private, max-age=3600");

  return new Response(object.body, { headers });
});

photos.get("/:id/thumbnail", authPhotoAccess, async (c) => {
  const photoId = c.req.param("id");

  const photo = await c.env.DB.prepare(
    "SELECT thumbnail_r2_key, mime_type FROM photos WHERE id = ?"
  )
    .bind(photoId)
    .first<{ thumbnail_r2_key: string | null; mime_type: string }>();

  if (!photo?.thumbnail_r2_key) {
    return c.json({ error: "Thumbnail not found" }, 404);
  }

  const object = await c.env.PHOTOS.get(photo.thumbnail_r2_key);
  if (!object) {
    return c.json({ error: "Thumbnail file missing" }, 404);
  }

  const headers = new Headers();
  headers.set("Content-Type", "image/jpeg");
  headers.set("Cache-Control", "private, max-age=3600");

  return new Response(object.body, { headers });
});

export default photos;
