import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { getAccount, login, normalizeHandleInput, resolveLoginError } from "@/lib/auth";
import { saveLocalEvent, saveParticipantSecret } from "@/lib/storage";
import { ScreenHeader, PrimaryButton } from "@/components/ui/Buttons";
import { FormField, StyledInput } from "@/components/ui/EventCard";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { colors } from "@/lib/theme";

type JoinMode = "guest" | "account";

export function JoinPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const inviteCode = (code ?? "").toUpperCase();

  const [mode, setMode] = useState<JoinMode>("guest");
  const [displayName, setDisplayName] = useState("");
  const [loginHandle, setLoginHandle] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [account, setAccount] = useState<Awaited<ReturnType<typeof getAccount>>>(null);
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

    Promise.all([api.getEventByCode(inviteCode), getAccount()])
      .then(([eventResult, user]) => {
        setEventName(eventResult.event.name);
        setAccount(user);
        if (user) {
          setMode("account");
          setDisplayName(user.displayName);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Event not found");
        setLoading(false);
      });
  }, [inviteCode]);

  const completeJoin = async (name: string) => {
    const result = await api.joinEvent(inviteCode, { displayName: name });
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
  };

  const handleJoin = async () => {
    setJoining(true);
    setError(null);

    try {
      if (mode === "account" && account) {
        await completeJoin(displayName.trim() || account.displayName);
        return;
      }

      if (mode === "account" && !account) {
        if (!loginHandle.trim() || !loginPassword) {
          setError("Enter your handle and password to join with your account");
          return;
        }
        const user = await login({ handle: normalizeHandleInput(loginHandle), password: loginPassword });
        setAccount(user);
        await completeJoin(displayName.trim() || user.displayName);
        return;
      }

      if (!displayName.trim()) {
        setError("Display name is required");
        return;
      }

      await completeJoin(displayName.trim());
    } catch (err) {
      if (mode === "account" && !account && loginHandle.trim()) {
        setError(await resolveLoginError(loginHandle, err));
      } else {
        setError(err instanceof ApiError ? err.message : "Failed to join event");
      }
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

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <ModeButton active={mode === "guest"} onClick={() => setMode("guest")} label="Join as guest" />
        <ModeButton active={mode === "account"} onClick={() => setMode("account")} label="Use Kamr account" />
      </div>

      {mode === "guest" ? (
        <>
          <p style={{ fontSize: 13, color: colors.brownMuted, marginBottom: 16, lineHeight: 1.5 }}>
            Guest profiles are only for this event and are removed when the event is deleted.
          </p>
          <FormField label="Display name for this event">
            <StyledInput
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How others will see you"
              autoFocus
            />
          </FormField>
        </>
      ) : account ? (
        <>
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              border: `1px solid ${colors.brownBorder}`,
              marginBottom: 16,
            }}
          >
            <p style={{ margin: 0, fontWeight: 500 }}>@{account.handle}</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: colors.brownMuted }}>
              Signed in — your handle will appear in this event
            </p>
          </div>
          <FormField label="Display name for this event" hint="Optional — defaults to your handle">
            <StyledInput
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={account.displayName}
            />
          </FormField>
        </>
      ) : (
        <>
          <p style={{ fontSize: 13, color: colors.brownMuted, marginBottom: 16, lineHeight: 1.5 }}>
            Sign in to join with your @ handle, or{" "}
            <Link to="/app/profile-setup" style={{ color: colors.brown }}>
              create an account
            </Link>
            .
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FormField label="Handle">
              <StyledInput
                value={loginHandle}
                onChange={(e) => setLoginHandle(e.target.value.replace(/^@/, ""))}
                placeholder="yourname"
                autoComplete="username"
              />
            </FormField>
            <FormField label="Password">
              <PasswordInput
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                autoComplete="current-password"
              />
            </FormField>
            <FormField label="Display name for this event" hint="Optional — defaults to your handle">
              <StyledInput
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How others will see you"
              />
            </FormField>
          </div>
        </>
      )}

      {error && <p style={{ color: colors.error, fontSize: 14, marginTop: 16 }}>{error}</p>}

      <div style={{ marginTop: 24 }}>
        <PrimaryButton
          label="Join event"
          onClick={handleJoin}
          disabled={mode === "guest" ? !displayName.trim() : false}
          loading={joining}
          fullWidth
        />
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: "10px 12px",
        borderRadius: 999,
        border: `1px solid ${active ? colors.brown : colors.brownBorder}`,
        background: active ? colors.brown : "transparent",
        color: active ? colors.cream : colors.brown,
        cursor: "pointer",
        fontSize: 13,
      }}
    >
      {label}
    </button>
  );
}
