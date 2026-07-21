import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { type } from "../../lib/theme/typography";
import { IcoNavEvents, IcoNavProfile } from "./Icons";

interface BottomNavProps {
  active: "events" | "profile";
  onEvents: () => void;
  onProfile: () => void;
}

export function BottomNav({ active, onEvents, onProfile }: BottomNavProps) {
  const { c } = useTheme();
  const items = [
    { id: "events" as const, label: "Events", icon: IcoNavEvents, onPress: onEvents },
    { id: "profile" as const, label: "Profile", icon: IcoNavProfile, onPress: onProfile },
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: c.border,
        backgroundColor: c.bg,
      }}
    >
      {items.map((item) => {
        const isActive = active === item.id;
        const color = isActive ? c.text : c.textTer;
        const Icon = item.icon;
        return (
          <Pressable
            key={item.id}
            onPress={item.onPress}
            style={{
              flex: 1,
              alignItems: "center",
              gap: 3,
              paddingTop: 10,
              paddingBottom: 8,
            }}
          >
            <Icon size={21} color={color} />
            <Text style={[type.sectionLabel, { fontSize: 9, color }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
