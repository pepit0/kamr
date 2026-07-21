import { Stack } from "expo-router";
import { useTheme } from "../../../lib/theme/ThemeProvider";

export default function EventLayout() {
  const { c } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.bg },
      }}
    />
  );
}
