import { useCallback, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import {
  getProfile,
  persistProfilePhoto,
  profileInitials,
  saveProfile,
} from "../lib/profile";
import { useTheme } from "../lib/theme/ThemeProvider";
import { type } from "../lib/theme/typography";
import { KamrLogo } from "../components/ui/KamrLogo";
import { PrimaryButton } from "../components/ui/Buttons";
import { FormField } from "../components/ui/FormField";
import { StyledInput } from "../components/ui/StyledInput";
import { ProfileAvatar } from "../components/ui/ProfileAvatar";
import { KeyboardFooter, KeyboardScreen } from "../components/ui/KeyboardScreen";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [savedPhotoUri, setSavedPhotoUri] = useState<string | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getProfile().then((profile) => {
        if (profile) {
          setIsEditing(true);
          setName(profile.name);
          setHandle(profile.handle);
          setPhotoUri(profile.photoUri);
          setSavedPhotoUri(profile.photoUri);
        } else {
          setIsEditing(false);
          setName("");
          setHandle("");
          setPhotoUri(undefined);
          setSavedPhotoUri(undefined);
        }
        setLoaded(true);
      });
    }, [])
  );

  const canSave = name.trim().length > 0;

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Photo library access is needed to add a profile photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!canSave) return;

    const trimmedName = name.trim();
    const trimmedHandle =
      handle.trim() || trimmedName.toLowerCase().replace(/\s/g, "");

    let nextPhotoUri = savedPhotoUri;
    if (photoUri && photoUri !== savedPhotoUri) {
      nextPhotoUri = await persistProfilePhoto(photoUri);
    }

    await saveProfile({
      name: trimmedName,
      handle: isEditing ? handle : trimmedHandle,
      photoUri: nextPhotoUri,
    });
    router.back();
  };

  if (!loaded) return null;

  return (
    <KeyboardScreen
      backgroundColor={c.bg}
      contentContainerStyle={{ paddingBottom: 24 }}
      footer={
        <KeyboardFooter>
          <View style={{ gap: 10 }}>
            <PrimaryButton
              label={isEditing ? "Save changes" : "Save profile"}
              onPress={handleSave}
              disabled={!canSave}
            />
            <Pressable onPress={() => router.back()} style={{ alignItems: "center", padding: 8 }}>
              <Text style={[type.bodySmall, { color: c.textTer }]}>back</Text>
            </Pressable>
          </View>
        </KeyboardFooter>
      }
    >
      <View style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 24 }}>
        <KamrLogo size={36} />
        <Text style={[type.displayMedium, { color: c.text, marginTop: 20 }]}>
          {isEditing ? "edit your profile" : "create your profile"}
        </Text>
        <Text style={[type.bodySmall, { color: c.textSec, marginTop: 8, lineHeight: 20 }]}>
          {isEditing
            ? "Update your display name or photo."
            : "As a host, your profile is how guests know who invited them."}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24, gap: 20 }}>
        <View style={{ alignItems: "center", marginBottom: 8 }}>
          <Pressable onPress={handlePickPhoto}>
            {photoUri || name.trim() ? (
              <ProfileAvatar
                initials={profileInitials(name.trim() || " ")}
                photoUri={photoUri}
                size={80}
              />
            ) : (
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: c.surface,
                  borderWidth: 2,
                  borderStyle: "dashed",
                  borderColor: c.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={[type.caption, { color: c.textTer, textAlign: "center" }]}>
                  add{"\n"}photo
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable onPress={handlePickPhoto} style={{ marginTop: 8 }}>
            <Text style={[type.bodySmall, { color: c.textTer }]}>
              {photoUri ? "Change photo" : "Add photo"}
            </Text>
          </Pressable>
        </View>

        <FormField label="Display name">
          <StyledInput value={name} onChangeText={setName} placeholder="your name" />
        </FormField>

        {isEditing ? (
          <FormField label="Handle">
            <View
              style={{
                backgroundColor: c.surface,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >
              <Text style={[type.body, { color: c.textTer }]}>@{handle}</Text>
            </View>
            <Text style={[type.caption, { color: c.textTer, marginTop: 6 }]}>
              Your handle cannot be changed.
            </Text>
          </FormField>
        ) : (
          <FormField label="Handle">
            <View style={{ position: "relative" }}>
              <Text
                style={{
                  position: "absolute",
                  left: 16,
                  top: 14,
                  fontFamily: type.body.fontFamily,
                  fontSize: 14,
                  color: c.textTer,
                  zIndex: 1,
                }}
              >
                @
              </Text>
              <StyledInput
                value={handle}
                onChangeText={(v) => setHandle(v.replace(/\s/g, "").toLowerCase())}
                placeholder="yourhandle"
                style={{ paddingLeft: 30 }}
              />
            </View>
          </FormField>
        )}
      </View>
    </KeyboardScreen>
  );
}
