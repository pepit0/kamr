import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getLocalEvents } from "@/lib/storage";
import { getAccount, handleInitials, logout } from "@/lib/auth";
import { ProfileMenuRow, ProfileStats } from "@/components/ui/ProfileMenu";
import { ScreenHeader, PrimaryButton } from "@/components/ui/Buttons";
import { colors, fonts } from "@/lib/theme";

export function ProfilePage() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<Awaited<ReturnType<typeof getAccount>>>(null);
  const [hostedCount, setHostedCount] = useState(0);
  const [attendingCount, setAttendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAccount(), getLocalEvents()]).then(([user, events]) => {
      setAccount(user);
      setHostedCount(events.filter((e) => e.role === "admin").length);
      setAttendingCount(events.filter((e) => e.role === "participant").length);
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    await logout();
    navigate("/app", { replace: true });
  };

  if (loading) {
    return <p style={{ color: colors.brownMuted }}>Loading…</p>;
  }

  return (
    <div>
      <ScreenHeader title="profile" onBack={() => navigate("/app")} />

      {!account ? (
        <div style={{ textAlign: "center", paddingTop: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              backgroundColor: colors.brownLight,
              border: `2px dashed ${colors.brownBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 28,
              color: colors.brownMuted,
            }}
          >
            ?
          </div>
          <p style={{ fontFamily: fonts.display, fontSize: 28, marginBottom: 8 }}>no account yet</p>
          <p style={{ color: colors.brownMuted, marginBottom: 24, lineHeight: 1.6, maxWidth: 360, margin: "0 auto 24px" }}>
            Create a profile to have a permanent presence on Kamr. Guests don't need an account — only hosts do.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            <PrimaryButton label="Create account" onClick={() => navigate("/app/profile-setup")} />
            <Link to="/app/login" style={{ fontSize: 14, color: colors.brownMuted }}>
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 24 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                backgroundColor: colors.brownLight,
                border: `1px solid ${colors.brownBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 300,
                marginBottom: 14,
              }}
            >
              {handleInitials(account.handle)}
            </div>
            <h2 style={{ fontFamily: fonts.display, fontSize: 28, fontWeight: 700, margin: "0 0 2px" }}>
              {account.displayName}
            </h2>
            <p style={{ color: colors.brownMuted, margin: 0, fontSize: 13 }}>@{account.handle}</p>
            <ProfileStats hosting={hostedCount} attending={attendingCount} />
          </div>

          <div>
            <ProfileMenuRow label="Edit profile" onClick={() => navigate("/app/profile/edit")} />
            <ProfileMenuRow label="Notifications" onClick={() => navigate("/app/profile/notifications")} />
            <ProfileMenuRow label="Privacy" onClick={() => navigate("/app/profile/privacy")} />
            <ProfileMenuRow label="Help" onClick={() => navigate("/app/profile/help")} />
            <ProfileMenuRow label="Sign out" onClick={handleSignOut} />
          </div>
        </div>
      )}
    </div>
  );
}
