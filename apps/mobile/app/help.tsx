import { Text } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../lib/theme/ThemeProvider";
import { type } from "../lib/theme/typography";
import { ScreenHeader } from "../components/ui/Buttons";
import { KeyboardScreen } from "../components/ui/KeyboardScreen";

export default function HelpScreen() {
  const router = useRouter();
  const { c } = useTheme();

  return (
    <KeyboardScreen
      backgroundColor={c.bg}
      header={<ScreenHeader title="help" onBack={() => router.back()} />}
      contentContainerStyle={{ padding: 24, gap: 16 }}
    >
      <Text style={[type.bodySmall, { color: c.textSec, lineHeight: 22 }]}>
        <Text style={{ color: c.text, fontWeight: "500" }}>Hosting an event</Text> — Create a Kamr account, then tap
        the + button to start an event and share the invite link or QR code with guests.
      </Text>
      <Text style={[type.bodySmall, { color: c.textSec, lineHeight: 22 }]}>
        <Text style={{ color: c.text, fontWeight: "500" }}>Joining as a guest</Text> — Scan the QR code or open the
        invite link. You can join with just a display name, or sign in to show your @ handle.
      </Text>
      <Text style={[type.bodySmall, { color: c.textSec, lineHeight: 22 }]}>
        <Text style={{ color: c.text, fontWeight: "500" }}>Need more help?</Text> — Reach out at hello@kamr.app
      </Text>
    </KeyboardScreen>
  );
}
