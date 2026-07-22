import { Hono } from "hono";

import type { Env, AuthContext, DbAlbum, DbPhoto } from "../types";

import { generateId, nowIso, toAlbum, toPhoto } from "../utils";

import { requireAlbumAdmin, authAlbumAccess } from "../middleware/auth";

import { isEventActive, MAX_VIDEO_DURATION_MS, sanitizeFilename } from "../retention";

import { deletePhotoMedia } from "../cron";

import { buildMediaZip, zipResponse } from "../zip";

import { resolveUploadParticipantId } from "../upload-auth";



type Variables = { auth: AuthContext; event?: { start_at: string | null; end_at: string; created_at: string } };



const albums = new Hono<{ Bindings: Env; Variables: Variables }>();



albums.patch("/:id", requireAlbumAdmin, async (c) => {

  const albumId = c.req.param("id");

  const body = await c.req.json<{ name?: string }>();



  if (!body.name?.trim()) {

    return c.json({ error: "Album name is required" }, 400);

  }



  const album = await c.env.DB.prepare("SELECT * FROM albums WHERE id = ?")

    .bind(albumId)

    .first<DbAlbum>();



  if (!album) {

    return c.json({ error: "Album not found" }, 404);

  }



  await c.env.DB.prepare("UPDATE albums SET name = ? WHERE id = ?")

    .bind(body.name.trim(), albumId)

    .run();



  return c.json({

    album: toAlbum({ ...album, name: body.name.trim() }),

  });

});



albums.delete("/:id", requireAlbumAdmin, async (c) => {

  const albumId = c.req.param("id");



  const album = await c.env.DB.prepare("SELECT * FROM albums WHERE id = ?")

    .bind(albumId)

    .first<DbAlbum>();



  if (!album) {

    return c.json({ error: "Album not found" }, 404);

  }



  const photos = await c.env.DB.prepare(

    "SELECT r2_key, thumbnail_r2_key FROM photos WHERE album_id = ?"

  )

    .bind(albumId)

    .all<{ r2_key: string; thumbnail_r2_key: string | null }>();



  for (const photo of photos.results ?? []) {

    await deletePhotoMedia(c.env, photo.r2_key, photo.thumbnail_r2_key);

  }



  await c.env.DB.prepare("DELETE FROM photos WHERE album_id = ?").bind(albumId).run();

  await c.env.DB.prepare("DELETE FROM albums WHERE id = ?").bind(albumId).run();



  return c.json({ success: true });

});



albums.get("/:id/photos", authAlbumAccess, async (c) => {

  const albumId = c.req.param("id");



  const result = await c.env.DB.prepare(

    `SELECT p.*, pt.display_name as participant_display_name

     FROM photos p

     JOIN participants pt ON pt.id = p.participant_id

     WHERE p.album_id = ?

     ORDER BY p.created_at DESC`

  )

    .bind(albumId)

    .all<DbPhoto & { participant_display_name: string }>();



  const photos = (result.results ?? []).map(toPhoto);



  return c.json({ photos });

});



albums.get("/:id/download", authAlbumAccess, async (c) => {

  const albumId = c.req.param("id");



  const album = await c.env.DB.prepare("SELECT * FROM albums WHERE id = ?")

    .bind(albumId)

    .first<DbAlbum>();



  if (!album) {

    return c.json({ error: "Album not found" }, 404);

  }



  const result = await c.env.DB.prepare(

    `SELECT p.id, p.r2_key, p.mime_type, p.original_filename, pt.display_name as participant_display_name

     FROM photos p

     JOIN participants pt ON pt.id = p.participant_id

     WHERE p.album_id = ?

     ORDER BY p.created_at ASC`

  )

    .bind(albumId)

    .all<{

      id: string;

      r2_key: string;

      mime_type: string;

      original_filename: string | null;

      participant_display_name: string;

    }>();



  const zip = await buildMediaZip(

    c.env,

    (result.results ?? []).map((row) => ({

      id: row.id,

      albumName: album.name,

      mimeType: row.mime_type,

      r2Key: row.r2_key,

      originalFilename: row.original_filename,

      participantDisplayName: row.participant_display_name,

    })),

    sanitizeFilename(album.name)

  );



  if (!zip) {

    return c.json({ error: "No media to download" }, 404);

  }



  return zipResponse(zip, sanitizeFilename(album.name));

});



albums.post("/:id/photos", authAlbumAccess, async (c) => {
  const albumId = c.req.param("id");
  if (!albumId) {
    return c.json({ error: "Album not found" }, 404);
  }

  const auth = c.get("auth");

  const event = c.get("event");



  if (!event) {

    return c.json({ error: "Event not found" }, 404);

  }



  const startAt = event.start_at ?? event.created_at;

  if (!isEventActive(startAt, event.end_at)) {
    if (new Date(startAt).getTime() > Date.now()) {
      return c.json({ error: "Event has not started yet" }, 403);
    }
    return c.json({ error: "Event ended" }, 403);
  }



  if (auth.role === "none") {

    return c.json({ error: "Unauthorized" }, 401);

  }



  const participantId = await resolveUploadParticipantId(c.env, event.id, auth);

  if (!participantId) {

    return c.json({ error: "Only participants can upload media" }, 403);

  }



  const formData = await c.req.formData();

  const file = formData.get("photo");

  const durationRaw = formData.get("durationMs");

  const thumbnail = formData.get("thumbnail");



  if (!file || typeof file === "string") {

    return c.json({ error: "Media file is required" }, 400);

  }



  const uploadFile = file as File;

  const isImage = uploadFile.type.startsWith("image/");

  const isVideo = uploadFile.type.startsWith("video/");



  if (!isImage && !isVideo) {

    return c.json({ error: "Only image and video files are allowed" }, 400);

  }



  let durationMs: number | null = null;

  if (isVideo) {

    durationMs = durationRaw ? Number(durationRaw) : null;

    if (!durationMs || Number.isNaN(durationMs) || durationMs <= 0) {

      return c.json({ error: "Video duration is required" }, 400);

    }

    if (durationMs > MAX_VIDEO_DURATION_MS) {

      return c.json({ error: "Videos must be 3 minutes or shorter" }, 400);

    }

  }



  const mediaId = generateId();

  const r2Key = `media/${albumId}/${mediaId}`;

  const createdAt = nowIso();

  const mediaType = isVideo ? "video" : "photo";



  await c.env.PHOTOS.put(r2Key, uploadFile.stream(), {

    httpMetadata: { contentType: uploadFile.type },

  });



  let thumbnailR2Key: string | null = null;

  if (isVideo && thumbnail && typeof thumbnail !== "string") {

    const thumbFile = thumbnail as File;

    if (thumbFile.type.startsWith("image/")) {

      thumbnailR2Key = `media/${albumId}/${mediaId}-thumb`;

      await c.env.PHOTOS.put(thumbnailR2Key, thumbFile.stream(), {

        httpMetadata: { contentType: thumbFile.type },

      });

    }

  }



  await c.env.DB.prepare(

    `INSERT INTO photos (

      id, album_id, participant_id, r2_key, mime_type, created_at,

      media_type, duration_ms, thumbnail_r2_key, file_size_bytes, original_filename

    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

  )

    .bind(

      mediaId,

      albumId,

      participantId,

      r2Key,

      uploadFile.type,

      createdAt,

      mediaType,

      durationMs,

      thumbnailR2Key,

      uploadFile.size || null,

      uploadFile.name || null

    )

    .run();



  const participant = await c.env.DB.prepare(

    "SELECT display_name FROM participants WHERE id = ?"

  )

    .bind(participantId)

    .first<{ display_name: string }>();



  return c.json({

    photo: toPhoto({

      id: mediaId,

      album_id: albumId,

      participant_id: participantId,

      r2_key: r2Key,

      mime_type: uploadFile.type,

      created_at: createdAt,

      media_type: mediaType,

      duration_ms: durationMs,

      thumbnail_r2_key: thumbnailR2Key,

      file_size_bytes: uploadFile.size || null,

      original_filename: uploadFile.name || null,

      participant_display_name: participant?.display_name,

    }),

  });

});



export default albums;

