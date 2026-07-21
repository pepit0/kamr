import { Pressable, Text, View } from "react-native";
import type { LocalEventEntry } from "@kamr/shared";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { fonts, type } from "../../lib/theme/typography";
import {
  formatEventDate,
  formatEventDateRange,
  isEventActive,
  isEventUpcoming,
} from "../../lib/event-status";
import { Pill } from "./FormField";

interface EventCardProps {
  entry: LocalEventEntry;
  guestCount?: number;
  onPress: () => void;
  onLongPress?: () => void;
}

export function EventCard({ entry, guestCount = 0, onPress, onLongPress }: EventCardProps) {
  const { c } = useTheme();
  const isHost = entry.role === "admin";
  const startAt = entry.startAt;
  const endAt = entry.endAt;
  const active =
    startAt && endAt ? isEventActive(startAt, endAt) : endAt ? new Date(endAt).getTime() > Date.now() : true;
  const upcoming = startAt ? isEventUpcoming(startAt) : false;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? c.surfaceActive : c.card,
        borderRadius: 20,
        padding: 16,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 22,
              lineHeight: 26,
              color: c.text,
              marginBottom: 4,
            }}
            numberOfLines={2}
          >
            {entry.eventName ?? "Untitled Event"}
          </Text>
          {startAt && endAt ? (
            <Text style={[type.bodySmall, { color: c.textSec, marginBottom: 2 }]}>
              {formatEventDateRange(startAt, endAt)}
            </Text>
          ) : endAt ? (
            <Text style={[type.bodySmall, { color: c.textSec, marginBottom: 2 }]}>
              {formatEventDate(endAt)}
            </Text>
          ) : null}
          {entry.displayName && !isHost ? (
            <Text style={[type.bodySmall, { color: c.textTer }]} numberOfLines={1}>
              going as {entry.displayName}
            </Text>
          ) : null}
        </View>
        {guestCount > 0 ? (
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[type.stat, { color: c.text }]}>{guestCount}</Text>
            <Text style={[type.caption, { color: c.textTer, fontSize: 10 }]}>guests</Text>
          </View>
        ) : null}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
        {isHost ? <Pill label="Host" inverted /> : null}
        {active ? <Pill label="Active" inverted /> : upcoming ? <Pill label="Upcoming" /> : endAt ? <Pill label="Ended" /> : null}
        {entry.inviteCode ? (
          <Text style={[type.caption, { color: c.textTer, marginLeft: "auto" }]}>
            {entry.inviteCode}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
