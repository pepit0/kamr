import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MAX_EVENT_DURATION_DAYS } from "@kamr/shared";
import { api, ApiError } from "@/lib/api";
import {
  saveAdminSecret,
  saveLocalEvent,
  saveAdminRecoveryUrl,
} from "@/lib/storage";
import { getProfile } from "@/lib/profile";
import {
  defaultEventStartDate,
  validateEventStartAtDate,
  formatEventDateTimeDisplay,
} from "@/lib/event-status";
import { ScreenHeader, PrimaryButton } from "@/components/ui/Buttons";
import { FormField, StyledInput } from "@/components/ui/EventCard";
import { colors } from "@/lib/theme";

export function CreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [startAt, setStartAt] = useState(defaultEventStartDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile().then((profile) => {
      if (!profile) navigate("/app/profile-setup", { replace: true });
    });
  }, [navigate]);

  const { dateLine, timeLine } = formatEventDateTimeDisplay(startAt);

  const handleCreate = async () => {
    if (!name.trim()) return;

    const validation = validateEventStartAtDate(startAt);
    if (validation) {
      setError(validation);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.createEvent({ name: name.trim(), startAt: startAt.toISOString() });
      await Promise.all([
        saveAdminSecret(result.event.id, result.adminSecret),
        saveAdminRecoveryUrl(result.event.id, result.adminRecoveryUrl),
      ]);
      await saveLocalEvent({
        eventId: result.event.id,
        role: "admin",
        eventName: result.event.name,
        inviteCode: result.inviteCode,
        startAt: result.event.startAt,
        endAt: result.event.endAt,
      });
      navigate(`/app/event/${result.event.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ScreenHeader title="new event" onBack={() => navigate(-1)} backLabel="cancel" />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <FormField label="Event name">
          <StyledInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Birthday party, wedding, reunion…"
            autoFocus
          />
        </FormField>

        <FormField
          label="Start date & time"
          hint={`Events last up to ${MAX_EVENT_DURATION_DAYS} days from the start time.`}
        >
          <input
            type="datetime-local"
            value={toLocalInputValue(startAt)}
            onChange={(e) => setStartAt(new Date(e.target.value))}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: `1px solid ${colors.brownBorder}`,
              backgroundColor: "rgba(255,255,255,0.35)",
              color: colors.brown,
              fontSize: 15,
            }}
          />
          <p style={{ fontSize: 13, color: colors.brownMuted, margin: "8px 0 0" }}>
            {dateLine} · {timeLine}
          </p>
        </FormField>

        {error && <p style={{ color: colors.error, fontSize: 14 }}>{error}</p>}

        <PrimaryButton
          label="Create event"
          onClick={handleCreate}
          disabled={!name.trim()}
          loading={loading}
          fullWidth
        />
      </div>
    </div>
  );
}

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
