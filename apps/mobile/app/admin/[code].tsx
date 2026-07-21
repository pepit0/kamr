import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "../../lib/api";
import {
  saveAdminSecret,
  saveAdminRecoveryUrl,
  saveLocalEvent,
} from "../../lib/storage";
import { adminRecoveryUrl } from "@kamr/shared";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { type } from "../../lib/theme/typography";

export default function AdminRecoveryScreen() {
  const { code, token } = useLocalSearchParams<{ code: string; token: string }>();
  const router = useRouter();
  const { c } = useTheme();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || !token) {
      setError("Invalid admin recovery link");
      return;
    }

    api
      .recoverAdmin(code.toUpperCase(), token)
      .then(async (result) => {
        await saveAdminSecret(result.event.id, result.adminSecret);
        await saveAdminRecoveryUrl(
          result.event.id,
          adminRecoveryUrl(code.toUpperCase(), token)
        );
        await saveLocalEvent({
          eventId: result.event.id,
          role: "admin",
          eventName: result.event.name,
        inviteCode: result.event.inviteCode,
        startAt: result.event.startAt,
        endAt: result.event.endAt,
      });
        router.replace(`/event/${result.event.id}`);
      })
      .catch(() => {
        setError("Invalid or expired admin recovery link");
        Alert.alert("Error", "Invalid admin recovery link");
      });
  }, [code, token, router]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center", padding: 24 }}>
      {error ? (
        <Text style={{ color: c.error, fontFamily: type.body.fontFamily }}>{error}</Text>
      ) : (
        <>
          <ActivityIndicator size="large" />
          <Text style={[type.bodySmall, { color: c.textSec, marginTop: 12 }]}>
            Restoring admin access...
          </Text>
        </>
      )}
    </View>
  );
}
