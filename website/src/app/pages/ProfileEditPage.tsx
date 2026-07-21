import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { getAccount } from "@/lib/auth";
import { ScreenHeader, PrimaryButton } from "@/components/ui/Buttons";
import { FormField, StyledInput } from "@/components/ui/EventCard";
import { colors } from "@/lib/theme";

export function ProfileEditPage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAccount().then((account) => {
      if (!account) {
        navigate("/app/profile-setup", { replace: true });
        return;
      }
      setDisplayName(account.displayName);
      setHandle(account.handle);
      setLoading(false);
    });
  }, [navigate]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await api.updateMe({ displayName: displayName.trim() });
      navigate("/app/profile", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ color: colors.brownMuted }}>Loading…</p>;
  }

  return (
    <div>
      <ScreenHeader title="edit profile" onBack={() => navigate("/app/profile")} backLabel="cancel" />

      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 8 }}>
        <FormField label="Display name">
          <StyledInput
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            autoFocus
          />
        </FormField>

        <FormField label="Handle">
          <div
            style={{
              backgroundColor: colors.brownLight,
              borderRadius: 12,
              padding: "14px 16px",
              color: colors.brownMuted,
              fontSize: 14,
            }}
          >
            @{handle}
          </div>
          <p style={{ fontSize: 12, color: colors.brownMuted, marginTop: 6 }}>Your handle cannot be changed.</p>
        </FormField>

        {error && <p style={{ color: colors.error, fontSize: 14 }}>{error}</p>}

        <PrimaryButton
          label="Save changes"
          onClick={handleSave}
          disabled={!displayName.trim()}
          loading={saving}
          fullWidth
        />
      </div>
    </div>
  );
}
