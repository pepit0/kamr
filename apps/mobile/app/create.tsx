import { useState, useCallback } from "react";
import { Platform, Alert, Text } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { api, ApiError } from "../lib/api";
import {
  saveAdminSecret,
  saveLocalEvent,
  saveAdminRecoveryUrl,
} from "../lib/storage";
import { getAccount } from "../lib/auth";
import { useTheme } from "../lib/theme/ThemeProvider";
import { type } from "../lib/theme/typography";
import { ScreenHeader, PrimaryButton } from "../components/ui/Buttons";
import { FormField } from "../components/ui/FormField";
import { StyledInput } from "../components/ui/StyledInput";
import { KeyboardFooter, KeyboardScreen } from "../components/ui/KeyboardScreen";
import { EventDateTimeField } from "../components/ui/EventDateTimeField";
import {
  MAX_EVENT_DURATION_DAYS,
  defaultEventStartDate,
  validateEventStartAtDate,
} from "../lib/event-status";

export default function CreateEventScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const [name, setName] = useState("");
  const [startAt, setStartAt] = useState(defaultEventStartDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreate = name.trim().length > 0;

  useFocusEffect(
    useCallback(() => {
      getAccount().then((account) => {
        if (!account) {
          router.replace("/profile-setup?redirect=/create");
        }
      });
    }, [router])
  );

  const handleCreate = async () => {
    if (!canCreate) return;

    const validation = validateEventStartAtDate(startAt);
    if (validation) {
      setError(validation);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.createEvent({ name: name.trim(), startAt: startAt.toISOString() });
      await Promise.all([
        saveAdminSecret(result.event.id, result.adminSecret),
        saveAdminRecoveryUrl(result.event.id, result.adminRecoveryUrl),
      ]);
      await saveLocalEvent({
        eventId: result.event.id,
        role: "admin",
        eventName: result.event.name,
        inviteCode: result.inviteCode,
        startAt: result.event.startAt,
        endAt: result.event.endAt,
      });
      router.replace(`/event/${result.event.id}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to create event";
      setError(message);
      if (Platform.OS !== "web") {
        Alert.alert("Error", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardScreen
      backgroundColor={c.bg}
      header={<ScreenHeader title="new event" onBack={() => router.back()} backLabel="cancel" />}
      contentContainerStyle={{ padding: 24, gap: 20 }}
      footer={
        <KeyboardFooter>
          <PrimaryButton
            label="Create event"
            onPress={handleCreate}
            disabled={!canCreate}
            loading={loading}
          />
        </KeyboardFooter>
      }
    >
      <FormField label="Event name">
        <StyledInput
          value={name}
          onChangeText={setName}
          placeholder="give it a name..."
          display
          autoFocus
        />
      </FormField>

      <FormField label="Start date & time">
        <EventDateTimeField value={startAt} onChange={setStartAt} />
        <Text style={[type.bodySmall, { color: c.textTer, lineHeight: 20, marginTop: 8 }]}>
          Your event runs for {MAX_EVENT_DURATION_DAYS} days from the start date. After it ends,
          albums stay available to view and download for 30 days.
        </Text>
      </FormField>

      {error ? <Text style={[type.bodySmall, { color: c.error }]}>{error}</Text> : null}
    </KeyboardScreen>
  );
}
