import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import type { LocalEventEntry } from "@kamr/shared";
import { getLocalEvents } from "../../lib/storage";
import { getProfile, profileInitials, type UserProfile } from "../../lib/profile";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { fonts, type } from "../../lib/theme/typography";
import { AppHeader } from "../../components/ui/AppHeader";
import { ProfileAvatar } from "../../components/ui/ProfileAvatar";
import { PrimaryButton } from "../../components/ui/Buttons";
import { IcoChevronRight } from "../../components/ui/Icons";

export default function ProfileScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<LocalEventEntry[]>([]);
  const [initials, setInitials] = useState("?");

  const load = useCallback(async () => {
    const [p, e] = await Promise.all([getProfile(), getLocalEvents()]);
    setProfile(p);
    setEvents(e);
    setInitials(p ? profileInitials(p.name) : "?");
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const hosting = events.filter((ev) => ev.role === "admin").length;
  const attending = events.filter((ev) => ev.role === "participant").length;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <AppHeader
        title="profile"
        initials={initials}
        photoUri={profile?.photoUri}
        hasProfile={!!profile}
        activeTab="profile"
      />

      {!profile ? (
        <View style={{ flex: 1, paddingHorizontal: 24, alignItems: "center", justifyContent: "center", gap: 16 }}>
          <ProfileAvatar size={72} hasProfile={false} />
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 26, color: c.text, marginBottom: 6 }}>
              no profile yet
            </Text>
            <Text style={[type.bodySmall, { color: c.textSec, textAlign: "center", lineHeight: 20 }]}>
              Create a profile so guests know who invited them to your events.
            </Text>
          </View>
          <PrimaryButton
            label="Create profile"
            onPress={() => router.push("/profile-setup")}
            style={{ width: "auto", paddingHorizontal: 32 }}
          />
        </View>
      ) : (
        <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ paddingBottom: 32 }}>
          <View style={{ paddingHorizontal: 24, alignItems: "center", paddingBottom: 24 }}>
            <ProfileAvatar
              initials={profileInitials(profile.name)}
              photoUri={profile.photoUri}
              size={76}
              style={{ marginBottom: 14 }}
            />
            <Text style={{ fontFamily: fonts.display, fontSize: 28, color: c.text, marginBottom: 2 }}>
              {profile.name}
            </Text>
            <Text style={[type.bodySmall, { color: c.textTer }]}>@{profile.handle}</Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 32, marginTop: 20 }}>
              <View style={{ alignItems: "center", minWidth: 48 }}>
                <Text style={[type.stat, { color: c.text, marginBottom: 4, textAlign: "center" }]}>
                  {hosting}
                </Text>
                <Text style={[type.sectionLabel, { fontSize: 9, color: c.textTer }]}>hosting</Text>
              </View>
              <View style={{ width: 1, height: 36, backgroundColor: c.border }} />
              <View style={{ alignItems: "center", minWidth: 48 }}>
                <Text style={[type.stat, { color: c.text, marginBottom: 4, textAlign: "center" }]}>
                  {attending}
                </Text>
                <Text style={[type.sectionLabel, { fontSize: 9, color: c.textTer }]}>attending</Text>
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 24 }}>
            <Pressable
              onPress={() => router.push("/profile-setup")}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 15,
                borderBottomWidth: 1,
                borderBottomColor: c.border,
              }}
            >
              <Text style={[type.body, { color: c.text }]}>Edit profile</Text>
              <IcoChevronRight color={c.textTer} />
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
