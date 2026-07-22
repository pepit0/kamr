import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer, VideoView } from "expo-video";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { MAX_VIDEO_DURATION_SEC } from "@kamr/shared";
import type { Photo } from "@kamr/shared";
import { api, ApiError, photoContentUrl } from "../../../../lib/api";
import { getAnyEventSecret, getUploadSecret } from "../../../../lib/storage";
import { isEventActive } from "../../../../lib/event-status";
import { downloadAlbumZip, downloadMedia } from "../../../../lib/download";
import { handleExpiredEvent, isEventExpiredError } from "../../../../lib/event-errors";
import { useTheme } from "../../../../lib/theme/ThemeProvider";
import { fonts, type } from "../../../../lib/theme/typography";
import { BackButton, PrimaryButton } from "../../../../components/ui/Buttons";

const COLUMN_COUNT = 3;
const GAP = 4;
const SCREEN_WIDTH = Dimensions.get("window").width;
const IMAGE_SIZE = (SCREEN_WIDTH - 48 - GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

function VideoModal({
  uri,
  headers,
  onClose,
}: {
  uri: string;
  headers?: Record<string, string>;
  onClose: () => void;
}) {
  const { c } = useTheme();
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.play();
  });

  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center" }}>
        <VideoView
          player={player}
          style={{ width: "100%", height: 320 }}
          nativeControls
          contentFit="contain"
        />
        <Pressable onPress={onClose} style={{ alignItems: "center", padding: 24 }}>
          <Text style={{ color: c.invText, fontFamily: fonts.bodyMedium }}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

export default function AlbumScreen() {
  const { id, albumId } = useLocalSearchParams<{ id: string; albumId: string }>();
  const router = useRouter();
  const eventId = id as string;
  const { c } = useTheme();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [viewSecret, setViewSecret] = useState<string | null>(null);
  const [uploadSecret, setUploadSecret] = useState<string | null>(null);
  const [eventStartAt, setEventStartAt] = useState<string | null>(null);
  const [eventEndAt, setEventEndAt] = useState<string | null>(null);
  const [albumName, setAlbumName] = useState("album");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeVideo, setActiveVideo] = useState<{ uri: string; headers?: Record<string, string> } | null>(null);

  const loadPhotos = useCallback(async () => {
    setRefreshing(true);
    try {
      const eventSecret = await getAnyEventSecret(eventId);
      const uploadKey = await getUploadSecret(eventId);
      if (!eventSecret) {
        Alert.alert("Access lost", "Rejoin the event to view this album.");
        return;
      }

      setViewSecret(eventSecret);
      setUploadSecret(uploadKey ?? eventSecret);

      const eventDetail = await api.getEvent(eventId, eventSecret);
      setEventStartAt(eventDetail.event.startAt);
      setEventEndAt(eventDetail.event.endAt);
      const album = eventDetail.albums.find((a) => a.id === albumId);
      if (album) setAlbumName(album.name);

      const result = await api.getPhotos(albumId as string, eventSecret);
      setPhotos(result.photos);
    } catch (err) {
      if (isEventExpiredError(err)) {
        await handleExpiredEvent(eventId, router);
        return;
      }
      Alert.alert("Error", err instanceof ApiError ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [albumId, eventId]);

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [loadPhotos])
  );

  const authHeaders = viewSecret ? { Authorization: `Bearer ${viewSecret}` } : undefined;

  const getMediaUri = (photo: Photo, thumbnail = false) => {
    const path = thumbnail && photo.thumbnailUrl ? photo.thumbnailUrl : photo.url;
    if (path.startsWith("http")) return path;
    return photoContentUrl(path);
  };

  const handleUpload = async () => {
    if (!uploadSecret || !eventStartAt || !eventEndAt) return;

    if (!isEventActive(eventStartAt, eventEndAt)) {
      Alert.alert(
        "Not available",
        new Date(eventStartAt).getTime() > Date.now()
          ? "This event has not started yet."
          : "This event has ended. Uploads are disabled."
      );
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Media library access is needed to upload.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      videoMaxDuration: MAX_VIDEO_DURATION_SEC,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const isVideo = asset.type === "video";
    const mimeType = asset.mimeType ?? (isVideo ? "video/mp4" : "image/jpeg");

    if (isVideo && asset.duration && asset.duration > MAX_VIDEO_DURATION_SEC) {
      Alert.alert("Video too long", "Videos must be 3 minutes or shorter.");
      return;
    }

    setUploading(true);

    try {
      await api.uploadMedia(albumId as string, uploadSecret, asset.uri, mimeType, {
        durationMs: isVideo ? (asset.duration ?? 0) * 1000 : undefined,
        filename: isVideo ? "video.mp4" : "photo.jpg",
      });
      await loadPhotos();
    } catch (err) {
      Alert.alert("Error", err instanceof ApiError ? err.message : "Failed to upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadAlbum = async () => {
    if (!viewSecret) return;
    setDownloading(true);
    try {
      await downloadAlbumZip(albumId as string, viewSecret, albumName);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadItem = async (item: Photo) => {
    if (!viewSecret) return;
    const ext = item.mimeType.includes("video") ? "mp4" : "jpg";
    try {
      await downloadMedia(item.id, viewSecret, `${item.mediaType}-${item.id}.${ext}`);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Download failed");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const canUpload =
    eventStartAt && eventEndAt && uploadSecret
      ? isEventActive(eventStartAt, eventEndAt)
      : false;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {activeVideo ? (
        <VideoModal
          uri={activeVideo.uri}
          headers={activeVideo.headers}
          onClose={() => setActiveVideo(null)}
        />
      ) : null}

      <View
        style={{
          paddingTop: 56,
          paddingHorizontal: 24,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: c.border,
        }}
      >
        <BackButton label="back" onPress={() => router.back()} />
        <Text style={{ fontFamily: fonts.display, fontSize: 32, color: c.text }}>{albumName}</Text>
      </View>

      <View style={{ padding: 24, paddingBottom: 0, gap: 10 }}>
        {canUpload ? (
          <PrimaryButton
            label={uploading ? "Uploading..." : "Add photo or video"}
            onPress={handleUpload}
            disabled={uploading}
          />
        ) : eventStartAt && eventEndAt && !isEventActive(eventStartAt, eventEndAt) ? (
          <Text style={[type.bodySmall, { color: c.textSec }]}>
            {new Date(eventStartAt).getTime() > Date.now()
              ? "Event has not started yet"
              : "Event ended — viewing and downloads only"}
          </Text>
        ) : null}

        {photos.length > 0 ? (
          <PrimaryButton
            label={downloading ? "Preparing..." : "Download album"}
            onPress={handleDownloadAlbum}
            disabled={downloading}
            style={{ backgroundColor: c.surface }}
          />
        ) : null}
      </View>

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{ padding: 24, paddingTop: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadPhotos}
            tintColor={c.text}
            colors={[c.text]}
            progressBackgroundColor={c.surface}
          />
        }
        columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
        ListEmptyComponent={
          <Text style={[type.body, { color: c.textTer, textAlign: "center", marginTop: 32 }]}>
            No photos or videos yet.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={{ width: IMAGE_SIZE }}
            onPress={() => {
              if (item.mediaType === "video") {
                setActiveVideo({ uri: getMediaUri(item), headers: authHeaders });
              }
            }}
            onLongPress={() => handleDownloadItem(item)}
          >
            <View style={{ position: "relative" }}>
              <Image
                source={{
                  uri:
                    item.mediaType === "video" && item.thumbnailUrl
                      ? getMediaUri(item, true)
                      : getMediaUri(item),
                  headers: authHeaders,
                }}
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                  borderRadius: 8,
                  backgroundColor: c.surface,
                }}
                resizeMode="cover"
              />
              {item.mediaType === "video" ? (
                <View
                  style={{
                    position: "absolute",
                    inset: 0,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: c.mediaScrim,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: c.text, fontSize: 12, marginLeft: 2 }}>▶</Text>
                  </View>
                </View>
              ) : null}
            </View>
            {item.participantDisplayName ? (
              <Text
                numberOfLines={1}
                style={[type.caption, { color: c.textTer, marginTop: 2, fontSize: 10 }]}
              >
                {item.participantDisplayName}
              </Text>
            ) : null}
          </Pressable>
        )}
      />
    </View>
  );
}
