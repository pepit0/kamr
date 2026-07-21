import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useTheme } from "../../lib/theme/ThemeProvider";

export function KamrLogo({ size = 48 }: { size?: number }) {
  const { c } = useTheme();
  const col = c.text;
  const sw = 2.6;

  return (
    <Svg width={size} height={size} viewBox="-52 -8 146 106" fill="none">
      <Path
        d="M -50 92 C -48 70, -28 56, -16 64 C -4 72, -2 52, 4 56"
        stroke={col}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Rect
        x={4}
        y={20}
        width={58}
        height={38}
        rx={6}
        stroke={col}
        strokeWidth={sw}
        fill="none"
      />
      <Rect
        x={20}
        y={13}
        width={18}
        height={9}
        rx={4}
        stroke={col}
        strokeWidth={sw}
        fill="none"
      />
      <Circle cx={33} cy={39} r={11} stroke={col} strokeWidth={sw} fill="none" />
      <Circle cx={33} cy={39} r={4.5} fill={col} />
      <Circle cx={30.5} cy={36.5} r={1.8} fill={c.bg} />
      <Path
        d="M 60 20 C 70 6, 90 -6, 88 14 C 86 34, 66 32, 70 18 C 74 4, 90 8, 94 -4"
        stroke={col}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
