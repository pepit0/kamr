import type { ReactNode } from "react";
import { colors } from "@/lib/theme";

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <polyline
        points="9,18 15,12 9,6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProfileMenuRow({
  label,
  onClick,
  trailing,
}: {
  label: string;
  onClick?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 0",
        border: "none",
        borderBottom: `1px solid ${colors.brownBorder}`,
        background: "none",
        cursor: onClick ? "pointer" : "default",
        color: colors.brown,
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: 14 }}>{label}</span>
      <span style={{ color: colors.brownMuted, display: "flex", alignItems: "center" }}>
        {trailing ?? <ChevronRight />}
      </span>
    </button>
  );
}

export function ProfileStats({
  hosting,
  attending,
}: {
  hosting: number;
  attending: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 32, marginTop: 20 }}>
      <div style={{ textAlign: "center", minWidth: 48 }}>
        <p style={{ fontSize: 26, fontWeight: 300, lineHeight: 1, margin: "0 0 4px" }}>{hosting}</p>
        <p style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.brownMuted, margin: 0 }}>
          hosting
        </p>
      </div>
      <div style={{ width: 1, height: 32, backgroundColor: colors.brownBorder }} />
      <div style={{ textAlign: "center", minWidth: 48 }}>
        <p style={{ fontSize: 26, fontWeight: 300, lineHeight: 1, margin: "0 0 4px" }}>{attending}</p>
        <p style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.brownMuted, margin: 0 }}>
          attending
        </p>
      </div>
    </div>
  );
}
