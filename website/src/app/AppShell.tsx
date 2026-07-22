import type { ReactNode } from "react";
import { colors } from "@/lib/theme";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        backgroundColor: colors.cream,
        color: colors.brown,
        paddingTop: 64,
      }}
    >
      <div
        style={{
          maxWidth: 720,
          width: "100%",
          margin: "0 auto",
          padding: "24px 16px 48px",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </div>
  );
}
