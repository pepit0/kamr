import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useFonts } from "expo-font";
import {
  Jost_300Light,
  Jost_400Regular,
  Jost_500Medium,
} from "@expo-google-fonts/jost";
import {
  DancingScript_400Regular,
  DancingScript_700Bold,
} from "@expo-google-fonts/dancing-script";
import { ActivityIndicator, View } from "react-native";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DARK, LIGHT, type ThemeColors } from "./colors";

import { STORAGE_PREFIX } from "@kamr/shared";

const THEME_KEY = `${STORAGE_PREFIX}theme-dark`;

interface ThemeContextValue {
  isDark: boolean;
  c: ThemeColors;
  toggle: () => void;
  fontsLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  c: LIGHT,
  toggle: () => {},
  fontsLoaded: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === "dark");

  const [fontsLoaded] = useFonts({
    Jost_300Light,
    Jost_400Regular,
    Jost_500Medium,
    DancingScript_400Regular,
    DancingScript_700Bold,
  });

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((value) => {
      if (value !== null) setIsDark(value === "true");
    });
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, String(next));
      return next;
    });
  };

  const value = useMemo(
    () => ({
      isDark,
      c: isDark ? DARK : LIGHT,
      toggle,
      fontsLoaded,
    }),
    [isDark, fontsLoaded]
  );

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: LIGHT.bg }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
