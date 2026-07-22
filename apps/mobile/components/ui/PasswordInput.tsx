import { useState } from "react";
import { Pressable, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { StyledInput } from "./StyledInput";
import type { TextInputProps } from "react-native";

function EyeIcon({ open, color }: { open: boolean; color: string }) {
  if (open) {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
          stroke={color}
          strokeWidth={1.6}
        />
        <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.6} />
      </Svg>
    );
  }
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-6.27"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path
        d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-3.16 4.19"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Line x1={1} y1={1} x2={23} y2={23} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function PasswordInput(props: TextInputProps) {
  const { c } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ position: "relative" }}>
      <StyledInput
        {...props}
        secureTextEntry={!visible}
        style={[{ paddingRight: 48 }, props.style]}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={visible ? "Hide password" : "Show password"}
        style={{
          position: "absolute",
          right: 4,
          top: 0,
          bottom: 0,
          width: 44,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <EyeIcon open={visible} color={c.textTer} />
      </Pressable>
    </View>
  );
}
