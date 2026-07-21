import type { LocalEventEntry } from "@kamr/shared";
import { colors } from "@/lib/theme";
import { formatEventDateRange, isEventActive, isEventEnded, isEventUpcoming } from "@/lib/event-status";

interface EventCardProps {
  entry: LocalEventEntry;
  onClick: () => void;
  onRemove?: () => void;
}

function statusLabel(entry: LocalEventEntry): string {
  if (!entry.startAt || !entry.endAt) return entry.role === "admin" ? "Hosting" : "Attending";
  if (isEventActive(entry.startAt, entry.endAt)) return "Live";
  if (isEventUpcoming(entry.startAt)) return "Upcoming";
  if (isEventEnded(entry.endAt)) return "Ended";
  return entry.role === "admin" ? "Hosting" : "Attending";
}

export function EventCard({ entry, onClick, onRemove }: EventCardProps) {
  const status = statusLabel(entry);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{
        padding: "16px 20px",
        borderRadius: 16,
        border: `1px solid ${colors.brownBorder}`,
        backgroundColor: "rgba(255,255,255,0.25)",
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>
          {entry.eventName ?? "Event"}
        </div>
        {entry.startAt && entry.endAt && (
          <div style={{ fontSize: 13, color: colors.brownMuted }}>
            {formatEventDateRange(entry.startAt, entry.endAt)}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: "4px 10px",
            borderRadius: 999,
            backgroundColor: colors.brownLight,
            color: colors.brownMuted,
          }}
        >
          {status}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{
              background: "none",
              border: "none",
              color: colors.brownMuted,
              cursor: "pointer",
              fontSize: 18,
              padding: 4,
            }}
            aria-label="Remove event"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: colors.brownMuted,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

export function FormField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: colors.brownMuted }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 12, color: colors.brownMuted, margin: 0 }}>{hint}</p>}
    </div>
  );
}

export function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "14px 16px",
        borderRadius: 12,
        border: `1px solid ${colors.brownBorder}`,
        backgroundColor: "rgba(255,255,255,0.35)",
        color: colors.brown,
        fontSize: 15,
        outline: "none",
        ...props.style,
      }}
    />
  );
}

export function Pill({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        padding: "4px 10px",
        borderRadius: 999,
        backgroundColor: active ? colors.brown : colors.brownLight,
        color: active ? colors.cream : colors.brownMuted,
      }}
    >
      {children}
    </span>
  );
}
