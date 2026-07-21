import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { saveAdminSecret, saveLocalEvent } from "@/lib/storage";
import { ScreenHeader, PrimaryButton } from "@/components/ui/Buttons";
import { colors } from "@/lib/theme";

export function AdminRecoveryPage() {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteCode = (code ?? "").toUpperCase();
  const token = searchParams.get("token") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventName, setEventName] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteCode || !token) {
      setError("Invalid recovery link");
      return;
    }
    api
      .getEventByCode(inviteCode)
      .then((r) => setEventName(r.event.name))
      .catch(() => setError("Event not found"));
  }, [inviteCode, token]);

  const handleRecover = async () => {
    if (!inviteCode || !token) return;

    setLoading(true);
    setError(null);

    try {
      const result = await api.recoverAdmin(inviteCode, token);
      await saveAdminSecret(result.event.id, result.adminSecret);
      await saveLocalEvent({
        eventId: result.event.id,
        role: "admin",
        eventName: result.event.name,
        inviteCode: result.event.inviteCode,
        startAt: result.event.startAt,
        endAt: result.event.endAt,
      });
      navigate(`/app/event/${result.event.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Recovery failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ScreenHeader title="admin recovery" onBack={() => navigate("/app")} />

      {eventName && (
        <p style={{ marginBottom: 16 }}>
          Restore admin access to <strong>{eventName}</strong>
        </p>
      )}

      {error && <p style={{ color: colors.error, marginBottom: 16 }}>{error}</p>}

      <PrimaryButton
        label="Restore admin access"
        onClick={handleRecover}
        loading={loading}
        disabled={!token || !!error}
        fullWidth
      />
    </div>
  );
}
