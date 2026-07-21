import { type ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";

interface KeyboardScreenProps {
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  keyboardVerticalOffset?: number;
}

export function KeyboardScreen({
  children,
  footer,
  header,
  contentContainerStyle,
  backgroundColor,
  keyboardVerticalOffset = Platform.OS === "ios" ? 8 : 0,
}: KeyboardScreenProps) {
  const { c } = useTheme();
  const bg = backgroundColor ?? c.bg;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {header}
      <ScrollView
        style={{ flex: 1, backgroundColor: bg }}
        contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        {children}
      </ScrollView>
      {footer}
    </KeyboardAvoidingView>
  );
}

export function KeyboardFooter({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 36,
        borderTopWidth: 1,
        borderTopColor: c.border,
        backgroundColor: c.bg,
      }}
    >
      {children}
    </View>
  );
}
