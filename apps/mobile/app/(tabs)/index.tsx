import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import type { LocalEventEntry } from "@kamr/shared";
import { getLocalEvents, removeLocalEvent } from "../../lib/storage";
import { getAccount, handleInitials } from "../../lib/auth";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { type } from "../../lib/theme/typography";
import { AppHeader } from "../../components/ui/AppHeader";
import { EventCard } from "../../components/ui/EventCard";
import { SectionLabel } from "../../components/ui/FormField";

export default function HomeScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const [events, setEvents] = useState<LocalEventEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initials, setInitials] = useState("?");
  const [hasAccount, setHasAccount] = useState(false);

  const loadEvents = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const [list, account] = await Promise.all([getLocalEvents(), getAccount()]);
      setEvents(list);
      setInitials(account ? handleInitials(account.handle) : "?");
      setHasAccount(!!account);
    } finally {
      if (showRefresh) setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents(false);
      return () => setRefreshing(false);
    }, [loadEvents])
  );

  const hosted = events.filter((e) => e.role === "admin");
  const attending = events.filter((e) => e.role === "participant");

  const handleRemove = (event: LocalEventEntry) => {
    Alert.alert(
      "Remove event",
      `Remove "${event.eventName ?? "Event"}" from this device? You can rejoin with the invite link.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await removeLocalEvent(event.eventId);
            await loadEvents(false);
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <AppHeader title="your events" initials={initials} hasProfile={hasAccount} activeTab="events" />

      <ScrollView
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 88 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadEvents(true)}
            tintColor={c.text}
            colors={[c.text]}
            progressBackgroundColor={c.surface}
          />
        }
      >
        {hosted.length > 0 ? (
          <View style={{ marginBottom: 24 }}>
            <SectionLabel>Hosting</SectionLabel>
            <View style={{ gap: 10 }}>
              {hosted.map((e) => (
                <EventCard
                  key={e.eventId}
                  entry={e}
                  onPress={() => router.push(`/event/${e.eventId}`)}
                  onLongPress={() => handleRemove(e)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {attending.length > 0 ? (
          <View style={{ marginBottom: 24 }}>
            <SectionLabel>Attending</SectionLabel>
            <View style={{ gap: 10 }}>
              {attending.map((e) => (
                <EventCard
                  key={e.eventId}
                  entry={e}
                  onPress={() => router.push(`/event/${e.eventId}`)}
                  onLongPress={() => handleRemove(e)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {events.length === 0 ? (
          <Text style={[type.body, { color: c.textTer, textAlign: "center", marginTop: 48 }]}>
            No events yet. Create one or scan a QR code to join.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
