import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseJoinCodeFromUrl } from "@/lib/event-status";
import { ScreenHeader, PrimaryButton } from "@/components/ui/Buttons";
import { FormField, StyledInput } from "@/components/ui/EventCard";
import { colors } from "@/lib/theme";

export function JoinManualPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = parseJoinCodeFromUrl(input);
    if (!code) {
      setError("Enter a valid invite link or code");
      return;
    }
    navigate(`/join/${code}`);
  };

  return (
    <div>
      <ScreenHeader title="join event" onBack={() => navigate(-1)} backLabel="cancel" />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <FormField
          label="Invite link or code"
          hint="Paste the link from your host or enter the invite code."
        >
          <StyledInput
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder="https://kamr.app/join/ABC123 or ABC123"
            autoFocus
          />
        </FormField>

        {error && <p style={{ color: colors.error, fontSize: 14 }}>{error}</p>}

        <PrimaryButton label="Continue" type="submit" fullWidth disabled={!input.trim()} />
      </form>
    </div>
  );
}
