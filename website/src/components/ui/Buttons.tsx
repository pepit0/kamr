import { colors } from "@/lib/theme";

interface PrimaryButtonProps {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  variant?: "filled" | "outline";
  fullWidth?: boolean;
}

export function PrimaryButton({
  label,
  onClick,
  type = "button",
  disabled,
  loading,
  variant = "filled",
  fullWidth,
}: PrimaryButtonProps) {
  const isFilled = variant === "filled";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: fullWidth ? "100%" : undefined,
        padding: "14px 24px",
        borderRadius: 999,
        border: isFilled ? "none" : `1.5px solid ${colors.brown}`,
        backgroundColor: isFilled ? colors.brown : "transparent",
        color: isFilled ? colors.cream : colors.brown,
        fontSize: 15,
        fontWeight: 500,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.5 : 1,
      }}
    >
      {loading ? "Please wait…" : label}
    </button>
  );
}

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  backLabel?: string;
}

export function ScreenHeader({ title, onBack, backLabel = "Back" }: ScreenHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "16px 0",
        borderBottom: `1px solid ${colors.brownBorder}`,
        marginBottom: 24,
      }}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: colors.brownMuted,
            cursor: "pointer",
            fontSize: 14,
            padding: 0,
          }}
        >
          {backLabel}
        </button>
      )}
      <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0, flex: 1 }}>{title}</h1>
    </div>
  );
}
