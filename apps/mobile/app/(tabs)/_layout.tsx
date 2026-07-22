import { useCallback, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Tabs, useFocusEffect, usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNav } from "../../components/ui/BottomNav";
import { IcoPlus } from "../../components/ui/Icons";
import { getAccount } from "../../lib/auth";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { fonts } from "../../lib/theme/typography";

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
  const [hasAccount, setHasAccount] = useState(false);
  const showFab = !pathname.includes("profile");

  const fabBottom = TAB_BAR_CONTENT_HEIGHT + insets.bottom + 16;

  useFocusEffect(
    useCallback(() => {
      getAccount().then((account) => setHasAccount(!!account));
    }, [])
  );

  const handleCreate = () => {
    if (!hasAccount) {
      Alert.alert(
        "Account required",
        "Create a Kamr account before you can host an event.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Create account", onPress: () => router.push("/profile-setup?redirect=/create") },
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

      {showFab ? (
        <View
          style={{
            position: "absolute",
            bottom: fabBottom,
            left: 24,
            right: 24,
            flexDirection: "row",
            justifyContent: "center",
            gap: 12,
            zIndex: 10,
          }}
        >
          <Pressable
            onPress={() => router.push("/join")}
            style={{
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: c.text,
              backgroundColor: "transparent",
            }}
          >
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 15, color: c.text }}>Join event</Text>
          </Pressable>
          <Pressable
            onPress={handleCreate}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 999,
              backgroundColor: c.inv,
            }}
          >
            <IcoPlus size={18} color={c.invText} />
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 15, color: c.invText }}>Create event</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
