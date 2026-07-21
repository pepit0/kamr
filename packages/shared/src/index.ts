export * from "./constants";

export type MediaType = "photo" | "video";

export interface Event {
  id: string;
  name: string;
  startAt: string;
  endAt: string;
  inviteCode: string;
  createdAt: string;
  isActive: boolean;
  retentionDays: number;
  retentionExpiresAt: string;
  isRetained: boolean;
  maxDurationDays: number;
}

export interface Album {
  id: string;
  eventId: string;
  name: string;
  createdAt: string;
}

export interface Participant {
  id: string;
  eventId: string;
  displayName: string;
  handle?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  albumId: string;
  participantId: string;
  mimeType: string;
  mediaType: MediaType;
  url: string;
  thumbnailUrl?: string;
  durationMs?: number;
  fileSizeBytes?: number;
  createdAt: string;
  participantDisplayName?: string;
}

export interface LocalEventEntry {
  eventId: string;
  role: "admin" | "participant";
  displayName?: string;
  eventName?: string;
  inviteCode?: string;
  endAt?: string;
  startAt?: string;
}

export interface CreateEventRequest {
  name: string;
  startAt: string;
}

export interface CreateEventResponse {
  event: Event;
  adminSecret: string;
  inviteCode: string;
  inviteUrl: string;
  adminRecoveryUrl: string;
}

export interface JoinEventRequest {
  displayName: string;
}

export interface JoinEventResponse {
  participant: Participant;
  participantSecret: string;
  event: Event;
}

export interface EventDetailResponse {
  event: Event;
  albums: Album[];
  role: "admin" | "participant" | "none";
  participant?: Participant;
}

export interface UploadMediaRequest {
  durationMs?: number;
}

export interface User {
  id: string;
  handle: string;
  displayName: string;
  createdAt: string;
}

export interface RegisterRequest {
  handle: string;
  password: string;
}

export interface LoginRequest {
  handle: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  userToken: string;
}

export interface UpdateUserRequest {
  displayName?: string;
}
