import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api, ApiError } from "../lib/api";
import { register, normalizeHandleInput } from "../lib/auth";
import { useTheme } from "../lib/theme/ThemeProvider";
import { type } from "../lib/theme/typography";
import { KamrLogo } from "../components/ui/KamrLogo";
import { PrimaryButton } from "../components/ui/Buttons";
import { FormField } from "../components/ui/FormField";
import { StyledInput } from "../components/ui/StyledInput";
import { KeyboardFooter, KeyboardScreen } from "../components/ui/KeyboardScreen";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { c } = useTheme();
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const normalized = normalizeHandleInput(handle);
    if (!normalized) {
      setError("Choose a handle");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const availability = await api.checkHandleAvailable(normalized);
      if (!availability.available) {
        setError(availability.error ?? "That handle is already taken — try another");
        return;
      }

      await register({ handle: normalized, password });
      router.replace((redirect as string) ?? "/create");
    } catch (err) {
      if (err instanceof ApiError && err.code === "HANDLE_TAKEN") {
        setError("That handle is already taken — try another");
      } else {
        setError(err instanceof ApiError ? err.message : "Could not create account");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardScreen
      backgroundColor={c.bg}
      contentContainerStyle={{ paddingBottom: 24 }}
      footer={
        <KeyboardFooter>
          <View style={{ gap: 10 }}>
            <PrimaryButton
              label="Create account"
              onPress={handleSave}
              disabled={!handle.trim() || !password || !confirmPassword}
              loading={saving}
            />
            <Pressable onPress={() => router.back()} style={{ alignItems: "center", padding: 8 }}>
              <Text style={[type.bodySmall, { color: c.textTer }]}>cancel</Text>
            </Pressable>
          </View>
        </KeyboardFooter>
      }
    >
      <View style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 24 }}>
        <KamrLogo size={36} />
        <Text style={[type.displayMedium, { color: c.text, marginTop: 20 }]}>create your account</Text>
        <Text style={[type.bodySmall, { color: c.textSec, marginTop: 8, lineHeight: 20 }]}>
          Hosts need a Kamr account for a permanent presence. Guests can join events without one.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24, gap: 20 }}>
        <FormField label="Handle" hint="3–20 characters: letters, numbers, underscores">
          <StyledInput
            value={handle}
            onChangeText={(v) => setHandle(v.replace(/^@/, ""))}
            placeholder="yourname"
            autoFocus
            autoComplete="username"
          />
        </FormField>

        <FormField label="Password">
          <StyledInput
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
            autoComplete="new-password"
          />
        </FormField>

        <FormField label="Confirm password">
          <StyledInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repeat password"
            secureTextEntry
            autoComplete="new-password"
          />
        </FormField>

        {error ? <Text style={[type.bodySmall, { color: c.error }]}>{error}</Text> : null}

        <Pressable onPress={() => router.push("/login")} style={{ alignItems: "center", paddingTop: 4 }}>
          <Text style={[type.bodySmall, { color: c.textTer }]}>
            Already have an account? <Text style={{ color: c.text }}>Sign in</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardScreen>
  );
}
