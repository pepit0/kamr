import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { APP_DOMAIN } from "@kamr/shared";
import { api, ApiError } from "../../lib/api";
import { parseAdminRecoveryFromUrl, parseJoinCodeFromUrl } from "../../lib/event-status";
import { saveAdminRecoveryUrl, saveAdminSecret, saveLocalEvent } from "../../lib/storage";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { type } from "../../lib/theme/typography";
import { ScreenHeader, PrimaryButton } from "../../components/ui/Buttons";
import { FormField } from "../../components/ui/FormField";
import { StyledInput } from "../../components/ui/StyledInput";
import { IcoScan } from "../../components/ui/Icons";
import { KeyboardScreen } from "../../components/ui/KeyboardScreen";

export default function JoinManualScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);

  const navigateToJoin = (code: string) => {
    router.push(`/join/${code}`);
  };

  const handleContinue = () => {
    const code = parseJoinCodeFromUrl(input);
    if (!code) {
      setError("Enter a valid invite link or code");
      return;
    }
    navigateToJoin(code);
  };

  const handleAdminRecovery = async () => {
    const parsed = parseAdminRecoveryFromUrl(input.trim());
    if (!parsed) {
      setError("Paste a valid admin recovery link");
      return;
    }

    setRecovering(true);
    setError(null);

    try {
      const result = await api.recoverAdmin(parsed.code, parsed.token);
      await saveAdminSecret(result.event.id, result.adminSecret);
      await saveAdminRecoveryUrl(result.event.id, input.trim());
      await saveLocalEvent({
        eventId: result.event.id,
        role: "admin",
        eventName: result.event.name,
        inviteCode: result.event.inviteCode,
        startAt: result.event.startAt,
        endAt: result.event.endAt,
      });
      router.replace(`/event/${result.event.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid admin recovery link");
    } finally {
      setRecovering(false);
    }
  };

  return (
    <KeyboardScreen
      header={
        <ScreenHeader title="join event" onBack={() => router.back()} backLabel="cancel" />
      }
      contentContainerStyle={{ padding: 24, gap: 20 }}
      footer={
        <View style={{ padding: 24, gap: 12 }}>
          <PrimaryButton
            label="Continue"
            onPress={handleContinue}
            disabled={!input.trim() || recovering}
            loading={recovering}
          />
          <Pressable
            onPress={handleAdminRecovery}
            disabled={!input.trim() || recovering}
            style={{ alignItems: "center", padding: 8, opacity: input.trim() && !recovering ? 1 : 0.5 }}
          >
            <Text style={[type.bodySmall, { color: c.textTer }]}>Recover admin access</Text>
          </Pressable>
        </View>
      }
    >
      <FormField label="Invite link or code" hint="Paste the link from your host or enter the invite code.">
        <View style={{ flexDirection: "row", gap: 8, alignItems: "stretch" }}>
          <View style={{ flex: 1 }}>
            <StyledInput
              value={input}
              onChangeText={(value) => {
                setInput(value);
                setError(null);
              }}
              placeholder={`${APP_DOMAIN}/join/ABC123 or ABC123`}
              autoCapitalize="none"
              autoFocus
            />
          </View>
          <Pressable
            onPress={() => router.push("/scan")}
            accessibilityLabel="Scan QR code"
            style={{
              width: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.surface,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IcoScan size={22} color={c.text} />
          </Pressable>
        </View>
      </FormField>

      {error ? <Text style={[type.bodySmall, { color: c.error }]}>{error}</Text> : null}
    </KeyboardScreen>
  );
}
