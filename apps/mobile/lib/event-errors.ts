import { Alert } from "react-native";
import { ApiError } from "./api";
import { removeLocalEvent } from "./storage";

export function isEventExpiredError(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 410 || err.code === "EVENT_EXPIRED");
}

export async function handleExpiredEvent(
  eventId: string,
  router: { replace: (path: string) => void }
): Promise<void> {
  await removeLocalEvent(eventId);
  Alert.alert(
    "Event expired",
    "This event's albums were permanently deleted after the 30-day retention period.",
    [{ text: "OK", onPress: () => router.replace("/(tabs)") }]
  );
}
