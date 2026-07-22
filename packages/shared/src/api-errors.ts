type ErrorBody = { error?: string; code?: string };

export function apiErrorFromResponse(
  status: number,
  body: unknown,
  rawText = ""
): { message: string; code?: string } {
  if (body && typeof body === "object" && typeof (body as ErrorBody).error === "string") {
    const parsed = body as ErrorBody;
    return { message: parsed.error!, code: parsed.code };
  }

  const trimmed = rawText.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as ErrorBody;
      if (typeof parsed.error === "string") {
        return { message: parsed.error, code: parsed.code };
      }
    } catch {
      // fall through
    }
  }

  if (status === 400) return { message: "Invalid request. Check your input and try again." };
  if (status === 404) return { message: "Server endpoint not found. Try refreshing the page." };
  if (status === 409) return { message: "That conflicts with an existing record." };
  if (status === 500) return { message: "Server error. Please try again in a moment." };
  if (status === 502 || status === 503) {
    return { message: "Server temporarily unavailable. Try again shortly." };
  }

  return {
    message: trimmed.slice(0, 160) || `Request failed (${status})`,
  };
}

export function parseApiJson<T>(text: string): T {
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}
