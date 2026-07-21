import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getLocalEvents } from "@/lib/storage";
import { getProfile, profileInitials } from "@/lib/profile";
import { ScreenHeader, PrimaryButton } from "@/components/ui/Buttons";
import { colors, fonts } from "@/lib/theme";

export function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getProfile>>>(null);
  const [hostedCount, setHostedCount] = useState(0);

  useEffect(() => {
    Promise.all([getProfile(), getLocalEvents()]).then(([p, events]) => {
      setProfile(p);
      setHostedCount(events.filter((e) => e.role === "admin").length);
    });
  }, []);

  return (
    <div>
      <ScreenHeader title="profile" onBack={() => navigate("/app")} />

      {!profile ? (
        <div style={{ textAlign: "center", paddingTop: 32 }}>
          <p style={{ fontFamily: fonts.display, fontSize: 28, marginBottom: 8 }}>no profile yet</p>
          <p style={{ color: colors.brownMuted, marginBottom: 24 }}>
            Create a profile so guests know who invited them to your events.
          </p>
          <PrimaryButton label="Create profile" onClick={() => navigate("/app/profile-setup")} />
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: colors.brown,
                color: colors.cream,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 500,
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              {profile.photoUri ? (
                <img src={profile.photoUri} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                profileInitials(profile.name)
              )}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px" }}>{profile.name}</h2>
            <p style={{ color: colors.brownMuted, margin: 0 }}>@{profile.handle}</p>
          </div>

          <div
            style={{
              padding: 20,
              borderRadius: 16,
              border: `1px solid ${colors.brownBorder}`,
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 500 }}>{hostedCount}</div>
            <div style={{ fontSize: 13, color: colors.brownMuted }}>Events hosted</div>
          </div>

          <Link
            to="/app/profile-setup"
            style={{
              display: "block",
              padding: "16px 20px",
              borderRadius: 12,
              border: `1px solid ${colors.brownBorder}`,
              color: colors.brown,
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Edit profile
          </Link>
        </div>
      )}
    </div>
  );
}
