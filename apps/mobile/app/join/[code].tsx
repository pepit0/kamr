import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api, ApiError } from "../../lib/api";
import { saveLocalEvent, saveParticipantSecret } from "../../lib/storage";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { type } from "../../lib/theme/typography";
import { ScreenHeader, PrimaryButton } from "../../components/ui/Buttons";
import { FormField } from "../../components/ui/FormField";
import { StyledInput } from "../../components/ui/StyledInput";
import { KeyboardFooter, KeyboardScreen } from "../../components/ui/KeyboardScreen";

export default function JoinScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { c } = useTheme();
  const inviteCode = (code ?? "").toUpperCase();

  const [displayName, setDisplayName] = useState("");
  const [eventName, setEventName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteCode) {
      setError("Invalid invite code");
      setLoading(false);
      return;
    }

    api
      .getEventByCode(inviteCode)
      .then((result) => {
        setEventName(result.event.name);
        setLoading(false);
      })
      .catch(() => {
        setError("Event not found");
        setLoading(false);
      });
  }, [inviteCode]);

  const handleJoin = async () => {
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const result = await api.joinEvent(inviteCode, {
        displayName: displayName.trim(),
      });
      await saveParticipantSecret(result.event.id, result.participantSecret);
      await saveLocalEvent({
        eventId: result.event.id,
        role: "participant",
        displayName: result.participant.displayName,
        eventName: result.event.name,
        inviteCode: result.event.inviteCode,
        startAt: result.event.startAt,
        endAt: result.event.endAt,
      });
      router.replace(`/event/${result.event.id}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to join event";
      if (Platform.OS === "web") {
        setError(message);
      } else {
        Alert.alert("Error", message);
      }
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardScreen
      backgroundColor={c.bg}
      header={
        <ScreenHeader
          title="you're joining"
          subtitle={eventName ?? undefined}
          onBack={() => router.back()}
        />
      }
      contentContainerStyle={{ padding: 24, gap: 20 }}
      footer={
        <KeyboardFooter>
          <PrimaryButton
            label="Join event"
            onPress={handleJoin}
            disabled={!displayName.trim()}
            loading={joining}
          />
        </KeyboardFooter>
      }
    >
      <FormField label="Your display name for this event">
        <StyledInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="how should guests know you?"
          display
          autoFocus
        />
      </FormField>

      <Text style={[type.bodySmall, { color: c.textTer, lineHeight: 20 }]}>
        This name is only used for this event. You can change it anytime from the event page.
      </Text>

      {error ? <Text style={[type.bodySmall, { color: c.error }]}>{error}</Text> : null}
    </KeyboardScreen>
  );
}
