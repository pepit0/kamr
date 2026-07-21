import type { ReactNode } from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { type } from "../../lib/theme/typography";
import { IcoChevronRight } from "./Icons";

export function ProfileMenuRow({
  label,
  onPress,
  trailing,
}: {
  label: string;
  onPress?: () => void;
  trailing?: ReactNode;
}) {
  const { c } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: c.border,
      }}
    >
      <Text style={[type.body, { color: c.text }]}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {trailing ?? <IcoChevronRight color={c.textTer} />}
      </View>
    </Pressable>
  );
}

export function ProfileStats({ hosting, attending }: { hosting: number; attending: number }) {
  const { c } = useTheme();

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 32, marginTop: 20 }}>
      <View style={{ alignItems: "center", minWidth: 48 }}>
        <Text style={[type.stat, { color: c.text, marginBottom: 4, textAlign: "center" }]}>{hosting}</Text>
        <Text style={[type.sectionLabel, { fontSize: 9, color: c.textTer }]}>hosting</Text>
      </View>
      <View style={{ width: 1, height: 32, backgroundColor: c.border }} />
      <View style={{ alignItems: "center", minWidth: 48 }}>
        <Text style={[type.stat, { color: c.text, marginBottom: 4, textAlign: "center" }]}>{attending}</Text>
        <Text style={[type.sectionLabel, { fontSize: 9, color: c.textTer }]}>attending</Text>
      </View>
    </View>
  );
}
