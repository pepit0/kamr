import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { LocalEventEntry } from "@kamr/shared";
import { getLocalEvents, removeLocalEvent } from "@/lib/storage";
import { getAccount, handleInitials } from "@/lib/auth";
import { EventCard, SectionLabel } from "@/components/ui/EventCard";
import { PrimaryButton } from "@/components/ui/Buttons";
import { IcoScan } from "@/components/ui/Icons";
import { colors, fonts } from "@/lib/theme";

export function HomePage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<LocalEventEntry[]>([]);
  const [initials, setInitials] = useState("?");

  const load = useCallback(async () => {
    const [list, account] = await Promise.all([getLocalEvents(), getAccount()]);
    setEvents(list);
    setInitials(account ? handleInitials(account.handle) : "?");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const hosted = events.filter((e) => e.role === "admin");
  const attending = events.filter((e) => e.role === "participant");

  const handleRemove = async (event: LocalEventEntry) => {
    if (!confirm(`Remove "${event.eventName ?? "Event"}" from this device?`)) return;
    await removeLocalEvent(event.eventId);
    await load();
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div>
          <h1 style={{ fontFamily: fonts.display, fontSize: 36, margin: 0 }}>your events</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => navigate("/app/join?scan=1")}
            aria-label="Scan QR code"
            title="Scan QR code"
            style={{
              color: colors.brownMuted,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              lineHeight: 0,
            }}
          >
            <IcoScan size={24} />
          </button>
          <Link
            to="/app/profile"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: colors.brown,
              color: colors.cream,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              overflow: "hidden",
            }}
          >
            {initials}
          </Link>
        </div>
      </div>

      {hosted.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionLabel>Hosting</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {hosted.map((e) => (
              <EventCard
                key={e.eventId}
                entry={e}
                onClick={() => navigate(`/app/event/${e.eventId}`)}
                onRemove={() => handleRemove(e)}
              />
            ))}
          </div>
        </section>
      )}

      {attending.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionLabel>Attending</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {attending.map((e) => (
              <EventCard
                key={e.eventId}
                entry={e}
                onClick={() => navigate(`/app/event/${e.eventId}`)}
                onRemove={() => handleRemove(e)}
              />
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <p style={{ textAlign: "center", color: colors.brownMuted, marginTop: 48 }}>
          No events yet. Create one or join with an invite link.
        </p>
      )}

      <div
        style={{
          position: "fixed",
          bottom: 24,
          left: 16,
          right: 16,
          display: "flex",
          gap: 12,
          justifyContent: "center",
          zIndex: 40,
          maxWidth: 688,
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <PrimaryButton label="Join event" variant="outline" onClick={() => navigate("/app/join")} />
        <PrimaryButton label="Create event" onClick={() => navigate("/app/create")} />
      </div>
    </div>
  );
}
