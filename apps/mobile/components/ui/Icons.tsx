import Svg, { Circle, Line, Path, Polyline, Rect } from "react-native-svg";
import { useTheme } from "../../lib/theme/ThemeProvider";

type IconProps = { size?: number; color?: string };

function useIconColor(color?: string) {
  const { c } = useTheme();
  return color ?? c.text;
}

export function IcoChevronLeft({ size = 18, color }: IconProps) {
  const stroke = useIconColor(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="15,18 9,12 15,6" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IcoChevronRight({ size = 14, color }: IconProps) {
  const stroke = useIconColor(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="9,18 15,12 9,6" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IcoPlus({ size = 22, color }: IconProps) {
  const stroke = useIconColor(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={12} y1={5} x2={12} y2={19} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      <Line x1={5} y1={12} x2={19} y2={12} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function IcoCalendar({ size = 15, color }: IconProps) {
  const stroke = useIconColor(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={18} rx={2} stroke={stroke} strokeWidth={1.5} />
      <Line x1={16} y1={2} x2={16} y2={6} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={8} y1={2} x2={8} y2={6} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={3} y1={10} x2={21} y2={10} stroke={stroke} strokeWidth={1.5} />
    </Svg>
  );
}

export function IcoPin({ size = 15, color }: IconProps) {
  const stroke = useIconColor(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" stroke={stroke} strokeWidth={1.5} />
      <Circle cx={12} cy={10} r={3} stroke={stroke} strokeWidth={1.5} />
    </Svg>
  );
}

export function IcoPersonSilhouette({ size = 20, color }: IconProps) {
  const fill = useIconColor(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={9} r={3.5} fill={fill} />
      <Path d="M6 21c0-3.31 2.69-6 6-6s6 2.69 6 6" fill={fill} />
    </Svg>
  );
}

export function IcoPerson({ size = 15, color }: IconProps) {
  const stroke = useIconColor(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx={12} cy={7} r={4} stroke={stroke} strokeWidth={1.5} />
    </Svg>
  );
}

export function IcoGroup({ size = 15, color }: IconProps) {
  const stroke = useIconColor(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={stroke} strokeWidth={1.5} />
      <Circle cx={9} cy={7} r={4} stroke={stroke} strokeWidth={1.5} />
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke={stroke} strokeWidth={1.5} />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={stroke} strokeWidth={1.5} />
    </Svg>
  );
}

export function IcoSun({ size = 18, color }: IconProps) {
  const stroke = useIconColor(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={5} stroke={stroke} strokeWidth={1.6} />
      <Line x1={12} y1={1} x2={12} y2={3} stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1={12} y1={21} x2={12} y2={23} stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1={4.22} y1={4.22} x2={5.64} y2={5.64} stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1={18.36} y1={18.36} x2={19.78} y2={19.78} stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1={1} y1={12} x2={3} y2={12} stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1={21} y1={12} x2={23} y2={12} stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1={4.22} y1={19.78} x2={5.64} y2={18.36} stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1={18.36} y1={5.64} x2={19.78} y2={4.22} stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function IcoMoon({ size = 18, color }: IconProps) {
  const stroke = useIconColor(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function IcoScan({ size = 20, color }: IconProps) {
  const stroke = useIconColor(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 7V5a2 2 0 0 1 2-2h2" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M17 3h2a2 2 0 0 1 2 2v2" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M21 17v2a2 2 0 0 1-2 2h-2" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M7 21H5a2 2 0 0 1-2-2v-2" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
      <Rect x={7} y={7} width={10} height={10} rx={1} stroke={stroke} strokeWidth={1.6} />
    </Svg>
  );
}

export function IcoShare({ size = 20, color }: IconProps) {
  const stroke = useIconColor(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
      <Polyline points="16,6 12,2 8,6" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={12} y1={2} x2={12} y2={15} stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function IcoEdit({ size = 14, color }: IconProps) {
  const stroke = useIconColor(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={stroke} strokeWidth={1.6} />
      <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={stroke} strokeWidth={1.6} />
    </Svg>
  );
}

export function IcoNavEvents({ size = 21, color }: IconProps) {
  const stroke = useIconColor(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={18} rx={2} stroke={stroke} strokeWidth={1.5} />
      <Line x1={16} y1={2} x2={16} y2={6} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={8} y1={2} x2={8} y2={6} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={3} y1={10} x2={21} y2={10} stroke={stroke} strokeWidth={1.5} />
    </Svg>
  );
}

export function IcoNavProfile({ size = 21, color }: IconProps) {
  const stroke = useIconColor(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={stroke} strokeWidth={1.5} />
      <Circle cx={12} cy={7} r={4} stroke={stroke} strokeWidth={1.5} />
    </Svg>
  );
}

export function IcoPhotos({ size = 15, color }: IconProps) {
  const stroke = useIconColor(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={2} stroke={stroke} strokeWidth={1.5} />
      <Circle cx={8.5} cy={8.5} r={1.5} fill={stroke} />
      <Path d="M21 15l-5-5L5 21" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}
