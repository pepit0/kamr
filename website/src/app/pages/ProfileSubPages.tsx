import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenHeader } from "@/components/ui/Buttons";
import { colors } from "@/lib/theme";

function PlaceholderPage({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <div>
      <ScreenHeader title={title} onBack={() => navigate("/app/profile")} />
      <div style={{ color: colors.brownMuted, fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>{children}</div>
    </div>
  );
}

export function ProfileNotificationsPage() {
  return (
    <PlaceholderPage title="notifications">
      <p style={{ marginTop: 0 }}>
        Notification preferences are coming soon. You'll be able to choose when Kamr alerts you about new uploads,
        event reminders, and more.
      </p>
    </PlaceholderPage>
  );
}

export function ProfilePrivacyPage() {
  return (
    <PlaceholderPage title="privacy">
      <p style={{ marginTop: 0 }}>
        Kamr is built for ephemeral events. Guest profiles exist only for the event you're in and are removed when
        the event is deleted. Permanent accounts keep your @ handle across events.
      </p>
      <p>
        Event photos are retained for 30 days after an event ends, then deleted. Only people with the invite link can
        access an event's albums.
      </p>
    </PlaceholderPage>
  );
}

export function ProfileHelpPage() {
  return (
    <PlaceholderPage title="help">
      <p style={{ marginTop: 0 }}>
        <strong style={{ color: colors.brown }}>Hosting an event</strong> — Create a Kamr account, then tap the + button
        to start an event and share the invite link or QR code with guests.
      </p>
      <p>
        <strong style={{ color: colors.brown }}>Joining as a guest</strong> — Scan the QR code or open the invite link.
        You can join with just a display name, or sign in to show your @ handle.
      </p>
      <p>
        <strong style={{ color: colors.brown }}>Need more help?</strong> — Reach out at hello@kamr.app
      </p>
    </PlaceholderPage>
  );
}
