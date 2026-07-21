import { useCallback, useState } from "react";
import { Alert, View } from "react-native";
import { Tabs, useFocusEffect, usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNav } from "../../components/ui/BottomNav";
import { Fab } from "../../components/ui/Buttons";
import { getProfile } from "../../lib/profile";
import { useTheme } from "../../lib/theme/ThemeProvider";

const TAB_BAR_CONTENT_HEIGHT = 54;

function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const active = pathname.includes("profile") ? "profile" : "events";

  return (
    <View style={{ backgroundColor: c.bg, paddingBottom: insets.bottom }}>
      <BottomNav
        active={active}
        onEvents={() => router.replace("/(tabs)")}
        onProfile={() => router.replace("/(tabs)/profile")}
      />
    </View>
  );
}

export default function TabLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const [hasProfile, setHasProfile] = useState(false);
  const showFab = !pathname.includes("profile");

  const fabBottom = TAB_BAR_CONTENT_HEIGHT + insets.bottom + 16;

  useFocusEffect(
    useCallback(() => {
      getProfile().then((profile) => setHasProfile(!!profile));
    }, [])
  );

  const handleCreate = () => {
    if (!hasProfile) {
      Alert.alert(
        "Profile required",
        "Create a profile before you can host an event.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Create profile", onPress: () => router.push("/profile-setup") },
        ]
      );
      return;
    }
    router.push("/create");
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Tabs
        tabBar={() => <CustomTabBar />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
          sceneStyle: { backgroundColor: c.bg },
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Events" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>

      {showFab ? <Fab onPress={handleCreate} bottom={fabBottom} right={24} /> : null}
    </View>
  );
}
