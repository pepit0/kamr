export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceActive: string;
  card: string;
  text: string;
  textSec: string;
  textTer: string;
  border: string;
  inv: string;
  invText: string;
  shell: string;
  overlay: string;
  mediaScrim: string;
  error: string;
}

export const CREAM = "#EDE4C8";
export const BROWN = "#1A1209";

function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const LIGHT: ThemeColors = {
  bg: CREAM,
  surface: "#E5D9BC",
  surfaceActive: "#DDD0B0",
  card: "#D4C4A4",
  text: BROWN,
  textSec: "#4D3F2F",
  textTer: "#8A7968",
  border: "#D8CAB0",
  inv: BROWN,
  invText: CREAM,
  shell: "#E0D4B8",
  overlay: withAlpha(BROWN, 0.45),
  mediaScrim: withAlpha(BROWN, 0.55),
  error: "#e05252",
};

export const DARK: ThemeColors = {
  bg: BROWN,
  surface: "#251D12",
  surfaceActive: "#302618",
  card: "#2E2418",
  text: CREAM,
  textSec: "#C9BDAA",
  textTer: "#8A8274",
  border: "#3A2E1E",
  inv: CREAM,
  invText: BROWN,
  shell: "#221A10",
  overlay: withAlpha(BROWN, 0.72),
  mediaScrim: withAlpha(BROWN, 0.65),
  error: "#e05252",
};
