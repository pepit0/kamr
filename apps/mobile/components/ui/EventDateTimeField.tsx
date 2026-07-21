import { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { fonts, type } from "../../lib/theme/typography";
import { IcoCalendar, IcoChevronLeft, IcoChevronRight } from "./Icons";
import { PrimaryButton } from "./Buttons";
import {
  formatEventDateTimeDisplay,
} from "../../lib/event-status";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

interface EventDateTimeFieldProps {
  value: Date;
  onChange: (date: Date) => void;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function buildCalendarDays(viewMonth: Date): (Date | null)[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < firstDay.getDay(); i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

function to12HourParts(date: Date): { hour: number; minute: number; meridiem: "AM" | "PM" } {
  const hours24 = date.getHours();
  const meridiem: "AM" | "PM" = hours24 >= 12 ? "PM" : "AM";
  const hour = hours24 % 12 || 12;
  const minute = Math.round(date.getMinutes() / 5) * 5;
  return { hour, minute: minute === 60 ? 55 : minute, meridiem };
}

function from12HourParts(
  base: Date,
  hour: number,
  minute: number,
  meridiem: "AM" | "PM"
): Date {
  const next = new Date(base);
  let hours24 = hour % 12;
  if (meridiem === "PM") hours24 += 12;
  next.setHours(hours24, minute, 0, 0);
  return next;
}

function TimeChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: selected ? c.inv : c.surface,
        minWidth: 44,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontFamily: fonts.bodyMedium,
          fontSize: 13,
          color: selected ? c.invText : c.textSec,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function EventDateTimeField({ value, onChange }: EventDateTimeFieldProps) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [viewMonth, setViewMonth] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));

  const minDate = useMemo(() => startOfDay(new Date()), [open]);
  const display = formatEventDateTimeDisplay(value);
  const calendarDays = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);
  const timeParts = to12HourParts(draft);

  const openPicker = () => {
    setDraft(value);
    setViewMonth(new Date(value.getFullYear(), value.getMonth(), 1));
    setOpen(true);
  };

  const confirm = () => {
    onChange(draft);
    setOpen(false);
  };

  const shiftMonth = (delta: number) => {
    setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  const selectDay = (day: Date) => {
    const dayStart = startOfDay(day).getTime();
    if (dayStart < minDate.getTime()) return;
    setDraft((current) => {
      const next = new Date(current);
      next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
      return next;
    });
  };

  const updateTime = (hour: number, minute: number, meridiem: "AM" | "PM") => {
    setDraft((current) => from12HourParts(current, hour, minute, meridiem));
  };

  return (
    <>
      <Pressable
        onPress={openPicker}
        style={{
          backgroundColor: c.surface,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: c.card,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IcoCalendar size={18} color={c.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[type.body, { color: c.text, fontFamily: fonts.bodyMedium }]}>
            {display.dateLine}
          </Text>
          <Text style={[type.bodySmall, { color: c.textSec, marginTop: 2 }]}>{display.timeLine}</Text>
        </View>
        <IcoChevronRight color={c.textTer} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: c.overlay }}>
          <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />
          <View
            style={{
              backgroundColor: c.bg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 12,
              paddingHorizontal: 24,
              paddingBottom: Platform.OS === "ios" ? 34 : 24,
              maxHeight: "88%",
            }}
          >
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: c.border,
                alignSelf: "center",
                marginBottom: 20,
              }}
            />

            <Text style={[type.displaySmall, { color: c.text, marginBottom: 4 }]}>
              start date & time
            </Text>
            <Text style={[type.bodySmall, { color: c.textSec, marginBottom: 20 }]}>
              {formatEventDateTimeDisplay(draft).dateLine} · {formatEventDateTimeDisplay(draft).timeLine}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <Pressable onPress={() => shiftMonth(-1)} hitSlop={12} style={{ padding: 4 }}>
                <IcoChevronLeft size={20} color={c.text} />
              </Pressable>
              <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 16, color: c.text }}>
                {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
              </Text>
              <Pressable onPress={() => shiftMonth(1)} hitSlop={12} style={{ padding: 4 }}>
                <IcoChevronRight size={20} color={c.text} />
              </Pressable>
            </View>

            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              {WEEKDAYS.map((day) => (
                <View key={day} style={{ flex: 1, alignItems: "center" }}>
                  <Text style={[type.caption, { color: c.textTer }]}>{day}</Text>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <View key={`empty-${index}`} style={{ width: "14.28%", aspectRatio: 1 }} />;
                }

                const disabled = startOfDay(day).getTime() < minDate.getTime();
                const selected = isSameDay(day, draft);
                const isToday = isSameDay(day, new Date());

                return (
                  <Pressable
                    key={day.toISOString()}
                    onPress={() => selectDay(day)}
                    disabled={disabled}
                    style={{
                      width: "14.28%",
                      aspectRatio: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: selected ? c.inv : "transparent",
                        borderWidth: isToday && !selected ? 1 : 0,
                        borderColor: c.border,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: selected ? fonts.bodyMedium : fonts.body,
                          fontSize: 14,
                          color: disabled ? c.textTer : selected ? c.invText : c.text,
                          opacity: disabled ? 0.35 : 1,
                        }}
                      >
                        {day.getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[type.sectionLabel, { color: c.textTer, marginBottom: 10 }]}>Time</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
            >
              {HOURS.map((hour) => (
                <TimeChip
                  key={`h-${hour}`}
                  label={String(hour)}
                  selected={timeParts.hour === hour}
                  onPress={() => updateTime(hour, timeParts.minute, timeParts.meridiem)}
                />
              ))}
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 8, marginTop: 4 }}
            >
              {MINUTES.map((minute) => (
                <TimeChip
                  key={`m-${minute}`}
                  label={minute.toString().padStart(2, "0")}
                  selected={timeParts.minute === minute}
                  onPress={() => updateTime(timeParts.hour, minute, timeParts.meridiem)}
                />
              ))}
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 4, marginBottom: 20 }}>
              {(["AM", "PM"] as const).map((meridiem) => (
                <TimeChip
                  key={meridiem}
                  label={meridiem}
                  selected={timeParts.meridiem === meridiem}
                  onPress={() => updateTime(timeParts.hour, timeParts.minute, meridiem)}
                />
              ))}
            </View>

            <PrimaryButton label="Done" onPress={confirm} />
          </View>
        </View>
      </Modal>
    </>
  );
}
