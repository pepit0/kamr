import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  persistProfilePhoto,
  profileInitials,
  saveProfile,
} from "@/lib/profile";
import { ScreenHeader, PrimaryButton } from "@/components/ui/Buttons";
import { FormField, StyledInput } from "@/components/ui/EventCard";
import { colors } from "@/lib/theme";

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile().then((profile) => {
      if (profile) {
        setIsEditing(true);
        setName(profile.name);
        setHandle(profile.handle);
        setPhotoUri(profile.photoUri);
      }
    });
  }, []);

  const handlePhotoPick = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const uri = await persistProfilePhoto(file);
    setPhotoUri(uri);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const trimmedHandle =
      handle.trim() || trimmedName.toLowerCase().replace(/\s+/g, "");

    setSaving(true);
    await saveProfile({
      name: trimmedName,
      handle: isEditing ? handle : trimmedHandle,
      photoUri,
    });
    setSaving(false);
    navigate(isEditing ? "/app/profile" : "/app/create", { replace: true });
  };

  return (
    <div>
      <ScreenHeader
        title={isEditing ? "edit profile" : "create profile"}
        onBack={() => navigate(-1)}
        backLabel="cancel"
      />

      <p style={{ color: colors.brownMuted, marginBottom: 24 }}>
        {isEditing
          ? "Update how guests see you when you host events."
          : "As a host, your profile is how guests know who invited them."}
      </p>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            backgroundColor: colors.brown,
            color: colors.cream,
            border: "none",
            cursor: "pointer",
            fontSize: 28,
            overflow: "hidden",
          }}
        >
          {photoUri ? (
            <img src={photoUri} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            profileInitials(name.trim() || " ")
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handlePhotoPick(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          style={{
            marginTop: 8,
            background: "none",
            border: "none",
            color: colors.brownMuted,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          {photoUri ? "Change photo" : "Add photo"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <FormField label="Your name">
          <StyledInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            autoFocus
          />
        </FormField>

        {isEditing ? (
          <FormField label="Handle">
            <StyledInput value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="username" />
          </FormField>
        ) : (
          name.trim() && (
            <p style={{ fontSize: 14, color: colors.brownMuted }}>
              Your handle will be @{name.trim().toLowerCase().replace(/\s+/g, "")}
            </p>
          )
        )}

        <PrimaryButton
          label={isEditing ? "Save changes" : "Save profile"}
          onClick={handleSave}
          disabled={!name.trim()}
          loading={saving}
          fullWidth
        />
      </div>
    </div>
  );
}
