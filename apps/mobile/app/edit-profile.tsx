import { useEffect, useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { api, ApiError } from "../lib/api";
import { getAccount } from "../lib/auth";
import { useTheme } from "../lib/theme/ThemeProvider";
import { type } from "../lib/theme/typography";
import { ScreenHeader, PrimaryButton } from "../components/ui/Buttons";
import { FormField } from "../components/ui/FormField";
import { StyledInput } from "../components/ui/StyledInput";
import { KeyboardFooter, KeyboardScreen } from "../components/ui/KeyboardScreen";

export default function EditProfileScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAccount().then((account) => {
      if (!account) {
        router.replace("/profile-setup");
        return;
      }
      setDisplayName(account.displayName);
      setHandle(account.handle);
      setLoading(false);
    });
  }, [router]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await api.updateMe({ displayName: displayName.trim() });
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <KeyboardScreen
      backgroundColor={c.bg}
      header={<ScreenHeader title="edit profile" onBack={() => router.back()} backLabel="cancel" />}
      contentContainerStyle={{ padding: 24, gap: 20 }}
      footer={
        <KeyboardFooter>
          <PrimaryButton
            label="Save changes"
            onPress={handleSave}
            disabled={!displayName.trim()}
            loading={saving}
          />
        </KeyboardFooter>
      }
    >
      <FormField label="Display name">
        <StyledInput value={displayName} onChangeText={setDisplayName} placeholder="Your name" autoFocus />
      </FormField>

      <FormField label="Handle">
        <StyledInput value={`@${handle}`} editable={false} />
        <Text style={[type.caption, { color: c.textTer, marginTop: 6 }]}>Your handle cannot be changed.</Text>
      </FormField>

      {error ? <Text style={[type.bodySmall, { color: c.error }]}>{error}</Text> : null}
    </KeyboardScreen>
  );
}
