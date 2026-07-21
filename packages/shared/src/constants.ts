export const MAX_EVENT_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_EVENT_DURATION_DAYS = 7;
export const DEFAULT_RETENTION_DAYS = 30;
export const MAX_VIDEO_DURATION_MS = 3 * 60 * 1000;
export const MAX_VIDEO_DURATION_SEC = 180;

export const APP_NAME = "Kamr";
export const APP_DOMAIN = "kamr.app";
export const APP_SCHEME = "kamr";
export const APP_BASE_URL = `https://${APP_DOMAIN}`;
export const STORAGE_PREFIX = "kamr:";

export function joinInviteUrl(inviteCode: string): string {
  return `${APP_BASE_URL}/join/${inviteCode}`;
}

export function adminRecoveryUrl(inviteCode: string, token: string): string {
  return `${APP_BASE_URL}/admin/${inviteCode}?token=${token}`;
}
