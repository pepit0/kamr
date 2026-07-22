export interface HandleAvailabilityResult {
  available: boolean;
  error?: string;
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
