import { type ReactNode } from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { type } from "../../lib/theme/typography";

export function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  const { c } = useTheme();
  return (
    <View>
      <Text style={[type.sectionLabel, { color: c.textTer, marginBottom: 8 }]}>{label}</Text>
      {children}
      {hint ? (
        <Text style={[type.caption, { color: c.textTer, marginTop: 6 }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function Pill({ label, inverted = false }: { label: string; inverted?: boolean }) {
  const { c } = useTheme();
  return (
    <View
      style={{
        backgroundColor: inverted ? c.inv : c.surface,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={[
          type.sectionLabel,
          {
            fontSize: 9,
            letterSpacing: 1.2,
            color: inverted ? c.invText : c.textSec,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
      <View style={{ marginTop: 2 }}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[type.sectionLabel, { color: c.textTer, marginBottom: 2 }]}>{label}</Text>
        <Text style={[type.body, { color: c.text }]}>{value}</Text>
      </View>
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  const { c } = useTheme();
  return (
    <Text style={[type.sectionLabel, { color: c.textTer, marginBottom: 10 }]}>{children}</Text>
  );
}
