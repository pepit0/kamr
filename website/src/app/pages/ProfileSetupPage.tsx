import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { register, normalizeHandleInput } from "@/lib/auth";
import { ScreenHeader, PrimaryButton } from "@/components/ui/Buttons";
import { FormField, StyledInput } from "@/components/ui/EventCard";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { colors } from "@/lib/theme";

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const normalized = normalizeHandleInput(handle);
    if (!normalized) {
      setError("Choose a handle");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const availability = await api.checkHandleAvailable(normalized);
      if (!availability.available) {
        setError(availability.error ?? "That handle is already taken — try another");
        return;
      }

      await register({ handle: normalized, password });
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      navigate(redirect ?? "/app/create", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === "HANDLE_TAKEN") {
        setError("That handle is already taken — try another");
      } else {
        setError(err instanceof ApiError ? err.message : "Could not create account");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <ScreenHeader title="create your account" onBack={() => navigate(-1)} backLabel="cancel" />

      <p style={{ color: colors.brownMuted, marginBottom: 24, lineHeight: 1.6 }}>
        Hosts need a Kamr account for a permanent presence. Guests can join events without one.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <FormField label="Handle" hint="3–20 characters: letters, numbers, underscores">
          <StyledInput
            value={handle}
            onChange={(e) => setHandle(e.target.value.replace(/^@/, ""))}
            placeholder="yourname"
            autoFocus
            autoComplete="username"
          />
        </FormField>

        <FormField label="Password">
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </FormField>

        <FormField label="Confirm password">
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            autoComplete="new-password"
          />
        </FormField>

        {error && <p style={{ color: colors.error, fontSize: 14 }}>{error}</p>}

        <PrimaryButton
          label="Create account"
          onClick={handleSave}
          disabled={!handle.trim() || !password || !confirmPassword}
          loading={saving}
          fullWidth
        />

        <p style={{ textAlign: "center", fontSize: 14, color: colors.brownMuted }}>
          Already have an account?{" "}
          <Link to="/app/login" style={{ color: colors.brown }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
