import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import type { Album, EventDetailResponse, Participant } from "@kamr/shared";
import { joinInviteUrl } from "@kamr/shared";
import { api, ApiError } from "@/lib/api";
import { getAnyEventSecret, getLocalEvents, saveLocalEvent } from "@/lib/storage";
import {
  formatEventDateRange,
  formatRetentionDate,
  isEventActive,
  isEventEnded,
  isEventUpcoming,
  validateEventStartAtDate,
} from "@/lib/event-status";
import { ScreenHeader, PrimaryButton } from "@/components/ui/Buttons";
import { FormField, Pill, SectionLabel, StyledInput } from "@/components/ui/EventCard";
import { colors, fonts } from "@/lib/theme";

type Tab = "info" | "guests" | "albums" | "invite";

export function EventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventId = id!;

  const [detail, setDetail] = useState<EventDetailResponse | null>(null);
  const [role, setRole] = useState<"admin" | "participant" | "none" | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("info");
  const [newAlbumName, setNewAlbumName] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editStartAt, setEditStartAt] = useState("");
  const [editName, setEditName] = useState("");

  const loadEvent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const eventSecret = await getAnyEventSecret(eventId);
      if (!eventSecret) {
        navigate("/app", { replace: true });
        return;
      }

      const localEvents = await getLocalEvents();
      const local = localEvents.find((e) => e.eventId === eventId);
      const result = await api.getEvent(eventId, eventSecret);

      setDetail(result);
      setRole(local?.role ?? result.role);
      setSecret(eventSecret);
      setEditStartAt(toLocalInputValue(new Date(result.event.startAt)));
      setEditName(result.event.name);

      if (local?.role === "admin" || result.role === "admin") {
        setInviteUrl(joinInviteUrl(result.event.inviteCode));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load event");
    } finally {
      setLoading(false);
    }
  }, [eventId, navigate]);

  const loadParticipants = useCallback(async () => {
    const eventSecret = await getAnyEventSecret(eventId);
    if (!eventSecret) return;
    try {
      const result = await api.getParticipants(eventId, eventSecret);
      setParticipants(result.participants);
    } catch {
      // admin only
    }
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  useEffect(() => {
    if (tab === "guests" && role === "admin") {
      loadParticipants();
    }
  }, [tab, role, loadParticipants]);

  const handleCreateAlbum = async () => {
    if (!secret || !newAlbumName.trim()) return;
    try {
      await api.createAlbum(eventId, secret, newAlbumName.trim());
      setNewAlbumName("");
      await loadEvent();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create album");
    }
  };

  const handleSaveEvent = async () => {
    if (!secret || !detail) return;
    const startAt = new Date(editStartAt);
    const validation = validateEventStartAtDate(startAt);
    if (validation) {
      setError(validation);
      return;
    }
    try {
      const result = await api.updateEvent(eventId, secret, {
        name: editName.trim() || detail.event.name,
        startAt: startAt.toISOString(),
      });
      await saveLocalEvent({
        eventId,
        role: role === "admin" ? "admin" : "participant",
        eventName: result.event.name,
        inviteCode: result.event.inviteCode,
        startAt: result.event.startAt,
        endAt: result.event.endAt,
      });
      await loadEvent();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update event");
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <p style={{ color: colors.brownMuted }}>Loading event…</p>;
  }

  if (!detail) {
    return (
      <div>
        <ScreenHeader title="event" onBack={() => navigate("/app")} />
        <p style={{ color: colors.error }}>{error ?? "Event not found"}</p>
      </div>
    );
  }

  const { event, albums } = detail;
  const status = isEventActive(event.startAt, event.endAt)
    ? "Live"
    : isEventUpcoming(event.startAt)
      ? "Upcoming"
      : isEventEnded(event.endAt)
        ? "Ended"
        : "Active";

  const tabs: { id: Tab; label: string; adminOnly?: boolean }[] = [
    { id: "info", label: "Details" },
    { id: "albums", label: "Albums" },
    { id: "guests", label: "Guests", adminOnly: true },
    { id: "invite", label: "Invite", adminOnly: true },
  ];

  return (
    <div>
      <ScreenHeader title={event.name} onBack={() => navigate("/app")} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <Pill active={status === "Live"}>{status}</Pill>
        <span style={{ fontSize: 13, color: colors.brownMuted }}>
          {formatEventDateRange(event.startAt, event.endAt)}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          borderBottom: `1px solid ${colors.brownBorder}`,
          overflowX: "auto",
        }}
      >
        {tabs
          .filter((t) => !t.adminOnly || role === "admin")
          .map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                padding: "10px 16px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: tab === t.id ? 500 : 400,
                color: tab === t.id ? colors.brown : colors.brownMuted,
                borderBottom: tab === t.id ? `2px solid ${colors.brown}` : "2px solid transparent",
              }}
            >
              {t.label}
            </button>
          ))}
      </div>

      {error && <p style={{ color: colors.error, marginBottom: 16 }}>{error}</p>}

      {tab === "info" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {role === "admin" ? (
            <>
              <FormField label="Event name">
                <StyledInput value={editName} onChange={(e) => setEditName(e.target.value)} />
              </FormField>
              <FormField label="Start date & time">
                <input
                  type="datetime-local"
                  value={editStartAt}
                  onChange={(e) => setEditStartAt(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `1px solid ${colors.brownBorder}`,
                    backgroundColor: "rgba(255,255,255,0.35)",
                    fontSize: 15,
                  }}
                />
              </FormField>
              <PrimaryButton label="Save changes" onClick={handleSaveEvent} />
            </>
          ) : (
            <InfoBlock label="Event" value={event.name} />
          )}
          <InfoBlock label="Photos available until" value={formatRetentionDate(event.retentionExpiresAt)} />
        </div>
      )}

      {tab === "albums" && (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {albums.map((album) => (
              <AlbumRow
                key={album.id}
                album={album}
                onClick={() => navigate(`/app/event/${eventId}/album/${album.id}`)}
              />
            ))}
            {albums.length === 0 && (
              <p style={{ color: colors.brownMuted, textAlign: "center" }}>No albums yet.</p>
            )}
          </div>

          {role === "admin" && (
            <div style={{ display: "flex", gap: 8 }}>
              <StyledInput
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                placeholder="New album name"
                style={{ flex: 1 }}
              />
              <PrimaryButton
                label="Add"
                onClick={handleCreateAlbum}
                disabled={!newAlbumName.trim()}
              />
            </div>
          )}
        </div>
      )}

      {tab === "guests" && role === "admin" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SectionLabel>{participants.length} guests</SectionLabel>
          {participants.map((p) => (
            <div
              key={p.id}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: `1px solid ${colors.brownBorder}`,
              }}
            >
              {p.displayName}
            </div>
          ))}
        </div>
      )}

      {tab === "invite" && role === "admin" && inviteUrl && (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              padding: 24,
              backgroundColor: "#fff",
              borderRadius: 16,
              marginBottom: 20,
            }}
          >
            <QRCodeSVG value={inviteUrl} size={200} fgColor={colors.brown} bgColor="#fff" />
          </div>
          <p style={{ fontFamily: fonts.display, fontSize: 28, marginBottom: 8 }}>
            {event.inviteCode}
          </p>
          <p style={{ fontSize: 13, color: colors.brownMuted, wordBreak: "break-all", marginBottom: 20 }}>
            {inviteUrl}
          </p>
          <PrimaryButton label={copied ? "Copied!" : "Copy invite link"} onClick={handleCopyInvite} />
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: colors.brownMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15 }}>{value}</div>
    </div>
  );
}

function AlbumRow({ album, onClick }: { album: Album; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "16px 20px",
        borderRadius: 12,
        border: `1px solid ${colors.brownBorder}`,
        backgroundColor: "rgba(255,255,255,0.25)",
        cursor: "pointer",
        textAlign: "left",
        fontSize: 15,
        color: colors.brown,
      }}
    >
      {album.name}
    </button>
  );
}

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
