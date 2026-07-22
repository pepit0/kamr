import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, Platform, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api, ApiError } from "../../lib/api";
import { getAccount, login, resolveLoginError, validateHandleForAccount } from "../../lib/auth";
import { saveLocalEvent, saveParticipantSecret } from "../../lib/storage";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { type } from "../../lib/theme/typography";
import { ScreenHeader, PrimaryButton } from "../../components/ui/Buttons";
import { FormField } from "../../components/ui/FormField";
import { StyledInput } from "../../components/ui/StyledInput";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { KeyboardFooter, KeyboardScreen } from "../../components/ui/KeyboardScreen";
import type { User } from "@kamr/shared";

type JoinMode = "guest" | "account";

export default function JoinScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { c } = useTheme();
  const inviteCode = (code ?? "").toUpperCase();

  const [mode, setMode] = useState<JoinMode>("guest");
  const [displayName, setDisplayName] = useState("");
  const [loginHandle, setLoginHandle] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [account, setAccount] = useState<User | null>(null);
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

    Promise.all([api.getEventByCode(inviteCode), getAccount()])
      .then(([eventResult, user]) => {
        setEventName(eventResult.event.name);
        setAccount(user);
        if (user) {
          setMode("account");
          setDisplayName(user.displayName);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Event not found");
        setLoading(false);
      });
  }, [inviteCode]);

  const completeJoin = async (name: string) => {
    const result = await api.joinEvent(inviteCode, { displayName: name });
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
  };

  const handleJoin = async () => {
    setJoining(true);
    setError(null);

    try {
      if (mode === "account" && account) {
        await completeJoin(displayName.trim() || account.displayName);
        return;
      }

      if (mode === "account" && !account) {
        if (!loginHandle.trim() || !loginPassword) {
          setError("Enter your handle and password to join with your account");
          return;
        }
        const { normalized, error: handleError } = validateHandleForAccount(loginHandle);
        if (handleError) {
          setError(handleError);
          return;
        }
        const user = await login({ handle: normalized, password: loginPassword });
        setAccount(user);
        await completeJoin(displayName.trim() || user.displayName);
        return;
      }

      if (!displayName.trim()) {
        setError("Display name is required");
        return;
      }

      await completeJoin(displayName.trim());
    } catch (err) {
      let message: string;
      if (mode === "account" && !account && loginHandle.trim()) {
        message = await resolveLoginError(loginHandle, err);
      } else {
        message = err instanceof ApiError ? err.message : "Failed to join event";
      }
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

  if (error && !eventName) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, padding: 24 }}>
        <ScreenHeader title="join event" onBack={() => router.back()} />
        <Text style={[type.bodySmall, { color: c.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <KeyboardScreen
      backgroundColor={c.bg}
      header={
        <ScreenHeader
          title="join event"
          subtitle={eventName ?? undefined}
          onBack={() => router.back()}
          backLabel="cancel"
        />
      }
      contentContainerStyle={{ padding: 24, gap: 20 }}
      footer={
        <KeyboardFooter>
          <PrimaryButton
            label="Join event"
            onPress={handleJoin}
            disabled={mode === "guest" ? !displayName.trim() : false}
            loading={joining}
          />
        </KeyboardFooter>
      }
    >
      <View style={{ flexDirection: "row", gap: 8 }}>
        <ModeButton active={mode === "guest"} onPress={() => setMode("guest")} label="Join as guest" />
        <ModeButton active={mode === "account"} onPress={() => setMode("account")} label="Use Kamr account" />
      </View>

      {mode === "guest" ? (
        <>
          <Text style={[type.bodySmall, { color: c.textTer, lineHeight: 20 }]}>
            Guest profiles are only for this event and are removed when the event is deleted.
          </Text>
          <FormField label="Display name for this event">
            <StyledInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="How others will see you"
              display
              autoFocus
            />
          </FormField>
        </>
      ) : account ? (
        <>
          <View
            style={{
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: c.border,
            }}
          >
            <Text style={[type.body, { color: c.text, fontWeight: "500" }]}>@{account.handle}</Text>
            <Text style={[type.bodySmall, { color: c.textTer, marginTop: 4 }]}>
              Signed in — your handle will appear in this event
            </Text>
          </View>
          <FormField label="Display name for this event" hint="Optional — defaults to your handle">
            <StyledInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={account.displayName}
            />
          </FormField>
        </>
      ) : (
        <>
          <Text style={[type.bodySmall, { color: c.textTer, lineHeight: 20 }]}>
            Sign in to join with your @ handle, or create an account.
          </Text>
          <Pressable onPress={() => router.push("/profile-setup")}>
            <Text style={[type.bodySmall, { color: c.text }]}>Create an account</Text>
          </Pressable>
          <FormField label="Handle">
            <StyledInput
              value={loginHandle}
              onChangeText={(v) => setLoginHandle(v.replace(/^@/, ""))}
              placeholder="yourname"
              autoComplete="username"
            />
          </FormField>
          <FormField label="Password">
            <PasswordInput
              value={loginPassword}
              onChangeText={setLoginPassword}
              autoComplete="current-password"
            />
          </FormField>
          <FormField label="Display name for this event" hint="Optional — defaults to your handle">
            <StyledInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="How others will see you"
            />
          </FormField>
        </>
      )}

      {error && eventName ? <Text style={[type.bodySmall, { color: c.error }]}>{error}</Text> : null}
    </KeyboardScreen>
  );
}

function ModeButton({
  active,
  onPress,
  label,
}: {
  active: boolean;
  onPress: () => void;
  label: string;
}) {
  const { c } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? c.text : c.border,
        backgroundColor: active ? c.text : "transparent",
        alignItems: "center",
      }}
    >
      <Text style={[type.caption, { color: active ? c.bg : c.text }]}>{label}</Text>
    </Pressable>
  );
}
