import { Text } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../lib/theme/ThemeProvider";
import { type } from "../lib/theme/typography";
import { ScreenHeader } from "../components/ui/Buttons";
import { KeyboardScreen } from "../components/ui/KeyboardScreen";

export default function PrivacyScreen() {
  const router = useRouter();
  const { c } = useTheme();

  return (
    <KeyboardScreen
      backgroundColor={c.bg}
      header={<ScreenHeader title="privacy" onBack={() => router.back()} />}
      contentContainerStyle={{ padding: 24, gap: 16 }}
    >
      <Text style={[type.bodySmall, { color: c.textSec, lineHeight: 22 }]}>
        Kamr is built for ephemeral events. Guest profiles exist only for the event you're in and are removed when
        the event is deleted. Permanent accounts keep your @ handle across events.
      </Text>
      <Text style={[type.bodySmall, { color: c.textSec, lineHeight: 22 }]}>
        Event photos are retained for 30 days after an event ends, then deleted. Only people with the invite link can
        access an event's albums.
      </Text>
    </KeyboardScreen>
  );
}
