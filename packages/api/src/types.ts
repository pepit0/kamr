export interface Env {
  DB: D1Database;
  PHOTOS: R2Bucket;
  APP_BASE_URL: string;
}

export interface DbEvent {
  id: string;
  name: string;
  start_at: string | null;
  end_at: string;
  invite_code: string;
  admin_secret_hash: string;
  created_at: string;
  retention_days: number;
}

export interface DbAlbum {
  id: string;
  event_id: string;
  name: string;
  created_at: string;
}

export interface DbParticipant {
  id: string;
  event_id: string;
  display_name: string;
  participant_secret_hash: string;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbUser {
  id: string;
  handle: string;
  display_name: string;
  password_hash: string;
  password_salt: string;
  created_at: string;
}

export interface DbPhoto {
  id: string;
  album_id: string;
  participant_id: string;
  r2_key: string;
  mime_type: string;
  created_at: string;
  media_type: string;
  duration_ms: number | null;
  thumbnail_r2_key: string | null;
  file_size_bytes: number | null;
  original_filename: string | null;
}

export type AuthRole = "admin" | "participant" | "none";

export interface AuthContext {
  role: AuthRole;
  eventId?: string;
  participantId?: string;
}
