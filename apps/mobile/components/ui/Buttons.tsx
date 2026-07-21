import { Pressable, Text, View, type ViewStyle } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { fonts, type } from "../../lib/theme/typography";
import { IcoPlus } from "./Icons";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({ label, onPress, disabled, loading, style }: PrimaryButtonProps) {
  const { c } = useTheme();
  const enabled = !disabled && !loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      style={[
        {
          width: "100%",
          paddingVertical: 16,
          borderRadius: 18,
          backgroundColor: enabled ? c.inv : c.surface,
          alignItems: "center",
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: fonts.bodyMedium,
          fontSize: 14,
          color: enabled ? c.invText : c.textTer,
        }}
      >
        {loading ? "Please wait..." : label}
      </Text>
    </Pressable>
  );
}

export function BackButton({ label = "back", onPress }: { label?: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 14 }}>
      <Text style={{ fontFamily: fonts.body, fontSize: 13, color: c.textTer }}>← {label}</Text>
    </Pressable>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  backLabel,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
}) {
  const { c } = useTheme();
  return (
    <View style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: c.border }}>
      {onBack ? <BackButton label={backLabel} onPress={onBack} /> : null}
      <Text style={[type.displayMedium, { color: c.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[type.bodySmall, { color: c.textSec, marginTop: 4 }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function Fab({
  onPress,
  bottom = 24,
  right = 20,
}: {
  onPress: () => void;
  bottom?: number;
  right?: number;
}) {
  const { c, isDark } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        position: "absolute",
        bottom,
        right,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: c.inv,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: c.text,
        shadowOpacity: isDark ? 0.08 : 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
        zIndex: 10,
      }}
    >
      <IcoPlus size={26} color={c.invText} />
    </Pressable>
  );
}
