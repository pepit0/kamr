import type { ReactNode } from "react";
import { colors } from "@/lib/theme";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.cream,
        color: colors.brown,
        paddingTop: 64,
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px 48px" }}>
        {children}
      </div>
    </div>
  );
}
