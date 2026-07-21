import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { parseJoinCodeFromUrl, parseAdminRecoveryFromUrl } from "../lib/event-status";
import { APP_DOMAIN, APP_NAME } from "@kamr/shared";
import { api } from "../lib/api";
import {
  saveAdminSecret,
  saveLocalEvent,
  saveAdminRecoveryUrl,
} from "../lib/storage";
import { useTheme } from "../lib/theme/ThemeProvider";
import { type as typography } from "../lib/theme/typography";
import { ScreenHeader, PrimaryButton } from "../components/ui/Buttons";
import { FormField } from "../components/ui/FormField";
import { StyledInput } from "../components/ui/StyledInput";
import { KeyboardScreen } from "../components/ui/KeyboardScreen";

function ManualJoinSection({
  manualCode,
  setManualCode,
  onJoin,
  onAdminRecovery,
  joinLabel,
}: {
  manualCode: string;
  setManualCode: (v: string) => void;
  onJoin: () => void;
  onAdminRecovery?: () => void;
  joinLabel: string;
}) {
  const { c } = useTheme();

  return (
    <View style={{ gap: 16 }}>
      <FormField label="Invite link or code">
        <StyledInput
          value={manualCode}
          onChangeText={setManualCode}
          placeholder={`${APP_DOMAIN}/join/...`}
          autoCapitalize="none"
        />
      </FormField>

      <PrimaryButton label={joinLabel} onPress={onJoin} disabled={!manualCode.trim()} />

      {onAdminRecovery ? (
        <Pressable onPress={onAdminRecovery} style={{ alignItems: "center", padding: 8 }}>
          <Text style={[typography.bodySmall, { color: c.textTer }]}>Recover admin access</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function ScanScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [manualCode, setManualCode] = useState("");
  const [scanned, setScanned] = useState(false);

  const navigateToJoin = (code: string) => {
    Keyboard.dismiss();
    router.push(`/join/${code}`);
  };

  const handleManualJoin = () => {
    const code = parseJoinCodeFromUrl(manualCode);
    if (!code) {
      Alert.alert("Invalid code", "Enter a valid invite code or link.");
      return;
    }
    navigateToJoin(code);
  };

  const handleAdminRecovery = async () => {
    const parsed = parseAdminRecoveryFromUrl(manualCode.trim());
    if (!parsed) {
      Alert.alert("Invalid link", "Paste a valid admin recovery link.");
      return;
    }

    try {
      const result = await api.recoverAdmin(parsed.code, parsed.token);
      await saveAdminSecret(result.event.id, result.adminSecret);
      await saveAdminRecoveryUrl(result.event.id, manualCode.trim());
      await saveLocalEvent({
        eventId: result.event.id,
        role: "admin",
        eventName: result.event.name,
        inviteCode: result.event.inviteCode,
        startAt: result.event.startAt,
        endAt: result.event.endAt,
      });
      router.replace(`/event/${result.event.id}`);
    } catch {
      Alert.alert("Error", "Invalid admin recovery link.");
    }
  };

  const onBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    const adminRecovery = parseAdminRecoveryFromUrl(data);
    if (adminRecovery) {
      api
        .recoverAdmin(adminRecovery.code, adminRecovery.token)
        .then(async (result) => {
          await saveAdminSecret(result.event.id, result.adminSecret);
          await saveAdminRecoveryUrl(result.event.id, data);
          await saveLocalEvent({
            eventId: result.event.id,
            role: "admin",
            eventName: result.event.name,
            inviteCode: result.event.inviteCode,
            endAt: result.event.endAt,
          });
          router.replace(`/event/${result.event.id}`);
        })
        .catch(() => {
          Alert.alert("Error", "Invalid admin recovery QR code.");
          setScanned(false);
        });
      return;
    }

    const code = parseJoinCodeFromUrl(data);
    if (code) {
      navigateToJoin(code);
      return;
    }

    Alert.alert("Invalid QR code", `This QR code is not a ${APP_NAME} event invite.`);
    setScanned(false);
  };

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  }

  if (!permission.granted) {
    return (
      <KeyboardScreen
        header={<ScreenHeader title="join an event" onBack={() => router.back()} />}
        contentContainerStyle={{ padding: 24, gap: 16 }}
      >
        <Text style={[typography.bodySmall, { color: c.textSec, lineHeight: 20 }]}>
          Camera permission is required to scan QR codes.
        </Text>
        <PrimaryButton label="Grant permission" onPress={requestPermission} />
        <ManualJoinSection
          manualCode={manualCode}
          setManualCode={setManualCode}
          onJoin={handleManualJoin}
          onAdminRecovery={handleAdminRecovery}
          joinLabel="Find event"
        />
      </KeyboardScreen>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={onBarcodeScanned}
        />
        <ScrollView
          style={{ backgroundColor: c.bg }}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={Keyboard.dismiss}
        >
          <ScreenHeader title="scan invite" onBack={() => router.back()} />
          <Text style={[typography.bodySmall, { color: c.textSec, textAlign: "center" }]}>
            Scan an event invite QR code
          </Text>
          <ManualJoinSection
            manualCode={manualCode}
            setManualCode={setManualCode}
            onJoin={handleManualJoin}
            joinLabel="Join manually"
          />
          {scanned ? (
            <Pressable onPress={() => setScanned(false)} style={{ alignItems: "center" }}>
              <Text style={[typography.bodySmall, { color: c.textTer }]}>Scan again</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
