import { Text } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../lib/theme/ThemeProvider";
import { type } from "../lib/theme/typography";
import { ScreenHeader } from "../components/ui/Buttons";
import { KeyboardScreen } from "../components/ui/KeyboardScreen";

function ProfileInfoScreen({ title, children }: { title: string; children: React.ReactNode }) {
  const router = useRouter();
  const { c } = useTheme();

  return (
    <KeyboardScreen
      backgroundColor={c.bg}
      header={<ScreenHeader title={title} onBack={() => router.back()} />}
      contentContainerStyle={{ padding: 24 }}
    >
      <Text style={[type.bodySmall, { color: c.textSec, lineHeight: 22 }]}>{children}</Text>
    </KeyboardScreen>
  );
}

export default function NotificationsScreen() {
  return (
    <ProfileInfoScreen title="notifications">
      Notification preferences are coming soon. You'll be able to choose when Kamr alerts you about new uploads,
      event reminders, and more.
    </ProfileInfoScreen>
  );
}
