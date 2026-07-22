import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, resolveLoginError, validateHandleForAccount } from "@/lib/auth";
import { ScreenHeader, PrimaryButton } from "@/components/ui/Buttons";
import { FormField, StyledInput } from "@/components/ui/EventCard";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { colors } from "@/lib/theme";

export function LoginPage() {
  const navigate = useNavigate();
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidation = validateHandleForAccount(handle);
  const canSubmit = !handleValidation.error && password.length > 0;

  const handleSubmit = async () => {
    if (handleValidation.error) {
      setError(handleValidation.error);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login({ handle: handleValidation.normalized, password });
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      navigate(redirect ?? "/app", { replace: true });
    } catch (err) {
      setError(await resolveLoginError(handle, err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ScreenHeader title="sign in" onBack={() => navigate(-1)} backLabel="cancel" />

      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 8 }}>
        <FormField label="Handle">
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
            autoComplete="current-password"
          />
        </FormField>

        {error && <p style={{ color: colors.error, fontSize: 14 }}>{error}</p>}

        <PrimaryButton
          label="Sign in"
          onClick={handleSubmit}
          disabled={!canSubmit}
          loading={loading}
          fullWidth
        />

        <p style={{ textAlign: "center", fontSize: 14, color: colors.brownMuted }}>
          Need an account?{" "}
          <Link to="/app/profile-setup" style={{ color: colors.brown }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
