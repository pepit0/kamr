import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Photo } from "@kamr/shared";
import { MAX_VIDEO_DURATION_SEC } from "@kamr/shared";
import { api, ApiError } from "@/lib/api";
import { getAnyEventSecret, getUploadSecret } from "@/lib/storage";
import { isEventActive } from "@/lib/event-status";
import { ScreenHeader, PrimaryButton } from "@/components/ui/Buttons";
import { AuthImage, AuthVideo } from "@/components/ui/AuthImage";
import { colors } from "@/lib/theme";

export function AlbumPage() {
  const { id, albumId } = useParams<{ id: string; albumId: string }>();
  const navigate = useNavigate();
  const eventId = id!;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [viewSecret, setViewSecret] = useState<string | null>(null);
  const [uploadSecret, setUploadSecret] = useState<string | null>(null);
  const [eventStartAt, setEventStartAt] = useState<string | null>(null);
  const [eventEndAt, setEventEndAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const eventSecret = await getAnyEventSecret(eventId);
      const uploadKey = await getUploadSecret(eventId);
      if (!eventSecret) {
        navigate("/app", { replace: true });
        return;
      }
      setViewSecret(eventSecret);
      setUploadSecret(uploadKey ?? eventSecret);

      const eventDetail = await api.getEvent(eventId, eventSecret);
      setEventStartAt(eventDetail.event.startAt);
      setEventEndAt(eventDetail.event.endAt);

      const result = await api.getPhotos(albumId!, eventSecret);
      setPhotos(result.photos);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load photos");
    } finally {
      setLoading(false);
    }
  }, [eventId, albumId, navigate]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const canUpload =
    eventStartAt && eventEndAt && uploadSecret
      ? isEventActive(eventStartAt, eventEndAt)
      : false;

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length || !uploadSecret) return;

    if (!canUpload) {
      setError(
        eventStartAt && new Date(eventStartAt).getTime() > Date.now()
          ? "This event has not started yet."
          : "This event has ended. Uploads are disabled."
      );
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        let durationMs: number | undefined;
        if (file.type.startsWith("video/")) {
          durationMs = await getVideoDuration(file);
          if (durationMs > MAX_VIDEO_DURATION_SEC * 1000) {
            throw new Error(`Videos must be ${MAX_VIDEO_DURATION_SEC / 60} minutes or less`);
          }
        }
        await api.uploadMedia(albumId!, uploadSecret, file, { durationMs });
      }
      await loadPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <ScreenHeader title="album" onBack={() => navigate(`/app/event/${eventId}`)} />

      {canUpload ? (
        <div style={{ marginBottom: 20 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => handleUpload(e.target.files)}
          />
          <PrimaryButton
            label={uploading ? "Uploading…" : "Add photos & videos"}
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
            fullWidth
          />
        </div>
      ) : eventStartAt && eventEndAt ? (
        <p style={{ color: colors.brownMuted, fontSize: 14, marginBottom: 20 }}>
          {new Date(eventStartAt).getTime() > Date.now()
            ? "Event has not started yet — uploads open when it begins."
            : "Event ended — viewing only."}
        </p>
      ) : null}

      {error && <p style={{ color: colors.error, marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <p style={{ color: colors.brownMuted }}>Loading…</p>
      ) : photos.length === 0 ? (
        <p style={{ color: colors.brownMuted, textAlign: "center", marginTop: 32 }}>
          No photos yet. Be the first to add one!
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 8,
          }}
        >
          {photos.map((photo) => (
            <MediaTile key={photo.id} photo={photo} secret={viewSecret!} />
          ))}
        </div>
      )}
    </div>
  );
}

function MediaTile({ photo, secret }: { photo: Photo; secret: string }) {
  const path = photo.thumbnailUrl ?? photo.url;

  return (
    <div
      style={{
        aspectRatio: "1",
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: colors.brownLight,
      }}
    >
      {photo.mediaType === "video" ? (
        <AuthVideo path={photo.url} secret={secret} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <AuthImage
          path={path}
          secret={secret}
          alt={photo.participantDisplayName ?? "Photo"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
    </div>
  );
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration * 1000);
    };
    video.onerror = () => reject(new Error("Could not read video"));
    video.src = URL.createObjectURL(file);
  });
}
