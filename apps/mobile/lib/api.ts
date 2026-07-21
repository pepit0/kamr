import type {
  AuthResponse,
  CreateEventRequest,
  CreateEventResponse,
  EventDetailResponse,
  JoinEventRequest,
  JoinEventResponse,
  LoginRequest,
  RegisterRequest,
  UpdateUserRequest,
  Album,
  Photo,
  Participant,
  Event,
  User,
} from "@kamr/shared";
import { USER_SESSION_KEY } from "@kamr/shared";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8787";

export function getApiUrl(): string {
  return API_URL.replace(/\/$/, "");
}

export function photoContentUrl(photoPath: string): string {
  const base = getApiUrl();
  const path = photoPath.startsWith("/") ? photoPath : `/${photoPath}`;
  return `${base}${path}`;
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const REQUEST_TIMEOUT_MS = 20000;

async function request<T>(
  path: string,
  options: RequestInit = {},
  secret?: string,
  withUserAuth = false
): Promise<T> {
  const headers = new Headers(options.headers);
  if (secret) {
    headers.set("Authorization", `Bearer ${secret}`);
  } else if (withUserAuth) {
    const token = await AsyncStorage.getItem(USER_SESSION_KEY);
    if (token) headers.set("Authorization", `User ${token}`);
  }
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiUrl()}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ApiError(data.error ?? "Request failed", response.status, data.code);
    }
    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError(
        "Request timed out. Make sure the API is running and EXPO_PUBLIC_API_URL is correct.",
        0
      );
    }
    if (err instanceof TypeError) {
      throw new ApiError(
        `Cannot reach the server at ${getApiUrl()}. Check that the API is running and your phone is on the same network.`,
        0
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  createEvent(body: CreateEventRequest) {
    return request<CreateEventResponse>("/events", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getEventByCode(inviteCode: string) {
    return request<{ event: Event }>(`/events/by-code/${inviteCode}`);
  },

  joinEvent(inviteCode: string, body: JoinEventRequest) {
    return request<JoinEventResponse>(
      `/events/by-code/${inviteCode}/join`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      undefined,
      true
    );
  },

  recoverAdmin(inviteCode: string, token: string) {
    return request<{ event: Event; adminSecret: string }>(
      `/events/by-code/${inviteCode}/admin-recover`,
      {
        method: "POST",
        body: JSON.stringify({ token }),
      }
    );
  },

  getEvent(eventId: string, secret: string) {
    return request<EventDetailResponse>(`/events/${eventId}`, {}, secret);
  },

  updateEvent(
    eventId: string,
    secret: string,
    body: { name?: string; startAt?: string }
  ) {
    return request<{ event: Event }>(
      `/events/${eventId}`,
      { method: "PATCH", body: JSON.stringify(body) },
      secret
    );
  },

  getParticipants(eventId: string, secret: string) {
    return request<{ participants: Participant[] }>(
      `/events/${eventId}/participants`,
      {},
      secret
    );
  },

  createAlbum(eventId: string, secret: string, name: string) {
    return request<{ album: Album }>(
      `/events/${eventId}/albums`,
      { method: "POST", body: JSON.stringify({ name }) },
      secret
    );
  },

  renameAlbum(albumId: string, secret: string, name: string) {
    return request<{ album: Album }>(
      `/albums/${albumId}`,
      { method: "PATCH", body: JSON.stringify({ name }) },
      secret
    );
  },

  deleteAlbum(albumId: string, secret: string) {
    return request<{ success: boolean }>(
      `/albums/${albumId}`,
      { method: "DELETE" },
      secret
    );
  },

  getPhotos(albumId: string, secret: string) {
    return request<{ photos: Photo[] }>(`/albums/${albumId}/photos`, {}, secret);
  },

  async uploadMedia(
    albumId: string,
    secret: string,
    uri: string,
    mimeType: string,
    options?: { durationMs?: number; filename?: string }
  ) {
    const formData = new FormData();
    const isVideo = mimeType.startsWith("video/");
    formData.append("photo", {
      uri,
      name: options?.filename ?? (isVideo ? "video.mp4" : "photo.jpg"),
      type: mimeType,
    } as unknown as Blob);

    if (isVideo && options?.durationMs) {
      formData.append("durationMs", String(Math.round(options.durationMs)));
    }

    return request<{ photo: Photo }>(
      `/albums/${albumId}/photos`,
      { method: "POST", body: formData },
      secret
    );
  },

  /** @deprecated use uploadMedia */
  async uploadPhoto(albumId: string, secret: string, uri: string, mimeType: string) {
    return this.uploadMedia(albumId, secret, uri, mimeType);
  },

  updateParticipant(participantId: string, secret: string, displayName: string) {
    return request<{ participant: Participant }>(
      `/participants/${participantId}`,
      { method: "PATCH", body: JSON.stringify({ displayName }) },
      secret
    );
  },

  checkHandleAvailable(handle: string) {
    return request<{ available: boolean; handle?: string; error?: string }>(
      `/auth/handles/${encodeURIComponent(handle)}/available`
    );
  },

  register(body: RegisterRequest) {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  login(body: LoginRequest) {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getMe() {
    return request<{ user: User }>("/auth/me", {}, undefined, true);
  },

  updateMe(body: UpdateUserRequest) {
    return request<{ user: User }>(
      "/auth/me",
      { method: "PATCH", body: JSON.stringify(body) },
      undefined,
      true
    );
  },

  logout() {
    return request<{ success: boolean }>(
      "/auth/logout",
      { method: "POST" },
      undefined,
      true
    );
  },
};
