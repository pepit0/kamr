import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { APP_NAME } from "@kamr/shared";
import { api, ApiError } from "@/lib/api";
import { parseAdminRecoveryFromUrl, parseJoinCodeFromUrl } from "@/lib/event-status";
import { saveAdminRecoveryUrl, saveAdminSecret, saveLocalEvent } from "@/lib/storage";
import { ScreenHeader, PrimaryButton } from "@/components/ui/Buttons";
import { FormField, StyledInput } from "@/components/ui/EventCard";
import { IcoScan } from "@/components/ui/Icons";
import { QrScanner } from "@/components/ui/QrScanner";
import { colors } from "@/lib/theme";

export function JoinManualPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(searchParams.get("scan") === "1");
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (searchParams.get("scan") === "1") {
      setScanning(true);
    }
  }, [searchParams]);

  const navigateToJoin = (code: string) => {
    navigate(`/join/${code}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = parseJoinCodeFromUrl(input);
    if (!code) {
      setError("Enter a valid invite link or code");
      return;
    }
    navigateToJoin(code);
  };

  const handleAdminRecovery = async () => {
    const parsed = parseAdminRecoveryFromUrl(input.trim());
    if (!parsed) {
      setError("Paste a valid admin recovery link");
      return;
    }

    setRecovering(true);
    setError(null);

    try {
      const result = await api.recoverAdmin(parsed.code, parsed.token);
      await saveAdminSecret(result.event.id, result.adminSecret);
      await saveAdminRecoveryUrl(result.event.id, input.trim());
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
      setError(err instanceof ApiError ? err.message : "Invalid admin recovery link");
    } finally {
      setRecovering(false);
    }
  };

  const handleScan = async (data: string) => {
    const adminRecovery = parseAdminRecoveryFromUrl(data);
    if (adminRecovery) {
      setRecovering(true);
      setError(null);
      try {
        const result = await api.recoverAdmin(adminRecovery.code, adminRecovery.token);
        await saveAdminSecret(result.event.id, result.adminSecret);
        await saveAdminRecoveryUrl(result.event.id, data);
        await saveLocalEvent({
          eventId: result.event.id,
          role: "admin",
          eventName: result.event.name,
          inviteCode: result.event.inviteCode,
          startAt: result.event.startAt,
          endAt: result.event.endAt,
        });
        navigate(`/app/event/${result.event.id}`, { replace: true });
      } catch {
        setError("Invalid admin recovery QR code");
        setScanning(false);
      } finally {
        setRecovering(false);
      }
      return;
    }

    const code = parseJoinCodeFromUrl(data);
    if (code) {
      navigateToJoin(code);
      return;
    }

    setError(`This QR code is not a ${APP_NAME} event invite.`);
    setScanning(false);
  };

  return (
    <div>
      <ScreenHeader title="join event" onBack={() => navigate(-1)} backLabel="cancel" />

      {scanning ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 13, color: colors.brownMuted, textAlign: "center", margin: 0 }}>
            Point your camera at an event invite QR code
          </p>
          <QrScanner
            onScan={handleScan}
            onError={(message) => {
              setError(message);
              setScanning(false);
            }}
          />
          {error && <p style={{ color: colors.error, fontSize: 14, margin: 0 }}>{error}</p>}
          <button
            type="button"
            onClick={() => {
              setScanning(false);
              setError(null);
            }}
            style={{
              background: "none",
              border: "none",
              color: colors.brownMuted,
              cursor: "pointer",
              fontSize: 14,
              padding: 8,
            }}
          >
            Enter code manually
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <FormField
            label="Invite link or code"
            hint="Paste the link from your host or enter the invite code."
          >
            <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
              <StyledInput
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(null);
                }}
                placeholder="https://kamr.app/join/ABC123 or ABC123"
                autoFocus
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setScanning(true);
                }}
                aria-label="Scan QR code"
                title="Scan QR code"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  flexShrink: 0,
                  borderRadius: 12,
                  border: `1px solid ${colors.brownBorder}`,
                  background: colors.brownLight,
                  color: colors.brown,
                  cursor: "pointer",
                }}
              >
                <IcoScan size={22} />
              </button>
            </div>
          </FormField>

          {error && <p style={{ color: colors.error, fontSize: 14, margin: 0 }}>{error}</p>}

          <PrimaryButton
            label="Continue"
            type="submit"
            fullWidth
            disabled={!input.trim() || recovering}
            loading={recovering}
          />

          <button
            type="button"
            onClick={handleAdminRecovery}
            disabled={!input.trim() || recovering}
            style={{
              background: "none",
              border: "none",
              color: colors.brownMuted,
              cursor: input.trim() && !recovering ? "pointer" : "not-allowed",
              fontSize: 13,
              padding: 8,
              opacity: input.trim() && !recovering ? 1 : 0.5,
            }}
          >
            Recover admin access
          </button>
        </form>
      )}
    </div>
  );
}
