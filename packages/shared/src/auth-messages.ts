export interface HandleAvailabilityResult {
  available: boolean;
  error?: string;
}

const HANDLE_PATTERN = /^[a-z0-9_]{3,20}$/;

export function normalizeHandleInput(handle: string): string {
  return handle.trim().toLowerCase().replace(/^@/, "");
}

export function validateHandleForAccount(handle: string): { normalized: string; error?: string } {
  const normalized = normalizeHandleInput(handle);
  if (!HANDLE_PATTERN.test(normalized)) {
    return {
      normalized,
      error: "Handle must be 3–20 characters: lowercase letters, numbers, and underscores only",
    };
  }
  return { normalized };
}

/** User-facing copy when POST /auth/login returns INVALID_CREDENTIALS. */
export function loginFailureMessage(availability: HandleAvailabilityResult): string {
  if (availability.error) {
    return availability.error;
  }
  if (availability.available) {
    return "No account with that handle on kamr.app. Create one first — accounts from local testing don't carry over.";
  }
  return "Incorrect password. Check what you typed and try again.";
}
