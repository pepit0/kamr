import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { type } from "../../lib/theme/typography";
import { KamrLogo } from "./KamrLogo";
import { ProfileAvatar } from "./ProfileAvatar";
import { IcoMoon, IcoScan, IcoSun } from "./Icons";

interface AppHeaderProps {
  title: string;
  initials: string;
  photoUri?: string;
  hasProfile?: boolean;
  activeTab?: "events" | "profile";
}

export function AppHeader({ title, initials, photoUri, hasProfile = true, activeTab }: AppHeaderProps) {
  const router = useRouter();
  const { c, isDark, toggle } = useTheme();

  return (
    <View style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Pressable
          onPress={() => {
            if (activeTab !== "events") {
              router.replace("/(tabs)");
            }
          }}
          hitSlop={8}
        >
          <KamrLogo size={52} />
        </Pressable>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable onPress={toggle} hitSlop={12} style={{ padding: 4 }}>
            {isDark ? <IcoSun size={24} color={c.textTer} /> : <IcoMoon size={24} color={c.textTer} />}
          </Pressable>
          <Pressable onPress={() => router.push("/scan")} hitSlop={12} style={{ padding: 4 }}>
            <IcoScan size={24} color={c.textTer} />
          </Pressable>
          <Pressable
            onPress={() => {
              if (activeTab !== "profile") {
                router.push("/(tabs)/profile");
              }
            }}
            hitSlop={8}
          >
            <ProfileAvatar initials={initials} photoUri={photoUri} hasProfile={hasProfile} />
          </Pressable>
        </View>
      </View>
      <Text style={[type.displayLarge, { color: c.text, marginTop: 16 }]}>{title}</Text>
    </View>
  );
}
