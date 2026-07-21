import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { LocalEventEntry } from "@kamr/shared";
import { getLocalEvents, removeLocalEvent } from "@/lib/storage";
import { getProfile, profileInitials } from "@/lib/profile";
import { EventCard, SectionLabel } from "@/components/ui/EventCard";
import { PrimaryButton } from "@/components/ui/Buttons";
import { colors, fonts } from "@/lib/theme";

export function HomePage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<LocalEventEntry[]>([]);
  const [initials, setInitials] = useState("?");
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  const load = useCallback(async () => {
    const [list, profile] = await Promise.all([getLocalEvents(), getProfile()]);
    setEvents(list);
    setInitials(profile ? profileInitials(profile.name) : "?");
    setPhotoUri(profile?.photoUri);
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
          {photoUri ? (
            <img src={photoUri} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            initials
          )}
        </Link>
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
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 12,
          zIndex: 40,
        }}
      >
        <PrimaryButton label="Join event" variant="outline" onClick={() => navigate("/app/join")} />
        <PrimaryButton label="Create event" onClick={() => navigate("/app/create")} />
      </div>
    </div>
  );
}
