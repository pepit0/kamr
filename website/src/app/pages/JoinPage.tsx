import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { saveLocalEvent, saveParticipantSecret } from "@/lib/storage";
import { ScreenHeader, PrimaryButton } from "@/components/ui/Buttons";
import { FormField, StyledInput } from "@/components/ui/EventCard";
import { colors } from "@/lib/theme";

export function JoinPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const inviteCode = (code ?? "").toUpperCase();

  const [displayName, setDisplayName] = useState("");
  const [eventName, setEventName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteCode) {
      setError("Invalid invite code");
      setLoading(false);
      return;
    }

    api
      .getEventByCode(inviteCode)
      .then((result) => {
        setEventName(result.event.name);
        setLoading(false);
      })
      .catch(() => {
        setError("Event not found");
        setLoading(false);
      });
  }, [inviteCode]);

  const handleJoin = async () => {
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const result = await api.joinEvent(inviteCode, { displayName: displayName.trim() });
      await saveParticipantSecret(result.event.id, result.participantSecret);
      await saveLocalEvent({
        eventId: result.event.id,
        role: "participant",
        displayName: result.participant.displayName,
        eventName: result.event.name,
        inviteCode: result.event.inviteCode,
        startAt: result.event.startAt,
        endAt: result.event.endAt,
      });
      navigate(`/app/event/${result.event.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to join event");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <p style={{ color: colors.brownMuted }}>Loading event…</p>;
  }

  if (error && !eventName) {
    return (
      <div>
        <ScreenHeader title="join event" onBack={() => navigate("/app")} />
        <p style={{ color: colors.error }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader title="join event" onBack={() => navigate("/app")} backLabel="cancel" />

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: colors.brownMuted, marginBottom: 4 }}>You're joining</p>
        <h2 style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>{eventName}</h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <FormField label="Your display name">
          <StyledInput
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How others will see you"
            autoFocus
          />
        </FormField>

        {error && <p style={{ color: colors.error, fontSize: 14 }}>{error}</p>}

        <PrimaryButton
          label="Join event"
          onClick={handleJoin}
          disabled={!displayName.trim()}
          loading={joining}
          fullWidth
        />
      </div>
    </div>
  );
}
