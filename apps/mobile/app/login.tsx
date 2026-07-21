import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ApiError } from "../lib/api";
import { login, normalizeHandleInput } from "../lib/auth";
import { useTheme } from "../lib/theme/ThemeProvider";
import { type } from "../lib/theme/typography";
import { ScreenHeader, PrimaryButton } from "../components/ui/Buttons";
import { FormField } from "../components/ui/FormField";
import { StyledInput } from "../components/ui/StyledInput";
import { KeyboardFooter, KeyboardScreen } from "../components/ui/KeyboardScreen";

export default function LoginScreen() {
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { c } = useTheme();
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await login({ handle: normalizeHandleInput(handle), password });
      router.replace((redirect as string) ?? "/(tabs)");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardScreen
      backgroundColor={c.bg}
      header={<ScreenHeader title="sign in" onBack={() => router.back()} backLabel="cancel" />}
      contentContainerStyle={{ padding: 24, gap: 20 }}
      footer={
        <KeyboardFooter>
          <PrimaryButton
            label="Sign in"
            onPress={handleSubmit}
            disabled={!handle.trim() || !password}
            loading={loading}
          />
        </KeyboardFooter>
      }
    >
      <FormField label="Handle">
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
          secureTextEntry
          autoComplete="current-password"
        />
      </FormField>

      {error ? <Text style={[type.bodySmall, { color: c.error }]}>{error}</Text> : null}

      <Pressable onPress={() => router.push("/profile-setup")} style={{ alignItems: "center", paddingTop: 8 }}>
        <Text style={[type.bodySmall, { color: c.textTer }]}>
          Need an account? <Text style={{ color: c.text }}>Create one</Text>
        </Text>
      </Pressable>
    </KeyboardScreen>
  );
}
