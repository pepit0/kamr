import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import type { LocalEventEntry, User } from "@kamr/shared";
import { getLocalEvents } from "../../lib/storage";
import { getAccount, handleInitials, logout } from "../../lib/auth";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { fonts, type } from "../../lib/theme/typography";
import { AppHeader } from "../../components/ui/AppHeader";
import { ProfileAvatar } from "../../components/ui/ProfileAvatar";
import { ProfileMenuRow, ProfileStats } from "../../components/ui/ProfileMenu";
import { PrimaryButton } from "../../components/ui/Buttons";
import { IcoMoon, IcoSun } from "../../components/ui/Icons";

export default function ProfileScreen() {
  const router = useRouter();
  const { c, isDark, toggle } = useTheme();
  const [account, setAccount] = useState<User | null>(null);
  const [events, setEvents] = useState<LocalEventEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [user, e] = await Promise.all([getAccount(), getLocalEvents()]);
    setAccount(user);
    setEvents(e);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const handleSignOut = async () => {
    await logout();
    setAccount(null);
    router.replace("/(tabs)");
  };

  const hosting = events.filter((ev) => ev.role === "admin").length;
  const attending = events.filter((ev) => ev.role === "participant").length;
  const initials = account ? handleInitials(account.handle) : "?";

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <AppHeader
        title="profile"
        initials={initials}
        hasProfile={!!account}
        activeTab="profile"
      />

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={[type.body, { color: c.textTer }]}>Loading…</Text>
        </View>
      ) : !account ? (
        <View style={{ flex: 1, paddingHorizontal: 24, alignItems: "center", justifyContent: "center", gap: 16 }}>
          <ProfileAvatar size={72} hasProfile={false} />
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 26, color: c.text, marginBottom: 6 }}>
              no account yet
            </Text>
            <Text style={[type.bodySmall, { color: c.textSec, textAlign: "center", lineHeight: 20, maxWidth: 320 }]}>
              Create a profile to have a permanent presence on Kamr. Guests don't need an account — only hosts do.
            </Text>
          </View>
          <PrimaryButton
            label="Create account"
            onPress={() => router.push("/profile-setup")}
            style={{ width: "auto", paddingHorizontal: 32 }}
          />
          <Pressable onPress={() => router.push("/login")}>
            <Text style={[type.bodySmall, { color: c.textTer }]}>
              Already have an account? <Text style={{ color: c.text }}>Sign in</Text>
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ paddingBottom: 32 }}>
          <View style={{ paddingHorizontal: 24, alignItems: "center", paddingBottom: 8 }}>
            <ProfileAvatar initials={initials} size={76} style={{ marginBottom: 14 }} />
            <Text style={{ fontFamily: fonts.display, fontSize: 28, color: c.text, marginBottom: 2 }}>
              {account.displayName}
            </Text>
            <Text style={[type.bodySmall, { color: c.textTer }]}>@{account.handle}</Text>
            <ProfileStats hosting={hosting} attending={attending} />
          </View>

          <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
            <ProfileMenuRow label="Edit profile" onPress={() => router.push("/edit-profile")} />
            <ProfileMenuRow label="Notifications" onPress={() => router.push("/notifications")} />
            <ProfileMenuRow label="Privacy" onPress={() => router.push("/privacy")} />
            <ProfileMenuRow label="Help" onPress={() => router.push("/help")} />
            <ProfileMenuRow
              label={isDark ? "Light mode" : "Dark mode"}
              onPress={toggle}
              trailing={isDark ? <IcoSun color={c.textTer} /> : <IcoMoon color={c.textTer} />}
            />
            <ProfileMenuRow label="Sign out" onPress={handleSignOut} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}
