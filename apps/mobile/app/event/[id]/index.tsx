import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Share,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import type { Album, EventDetailResponse, Participant } from "@kamr/shared";
import { APP_NAME, joinInviteUrl } from "@kamr/shared";
import { api, ApiError } from "../../../lib/api";
import {
  getAnyEventSecret,
  getLocalEvents,
  saveLocalEvent,
} from "../../../lib/storage";
import {
  formatEventDate,
  formatEventDateRange,
  isEventActive,
  isEventUpcoming,
  isEventEnded,
  formatRetentionDate,
  validateEventStartAtDate,
  defaultEventStartDate,
} from "../../../lib/event-status";
import { downloadEventZip } from "../../../lib/download";
import { handleExpiredEvent, isEventExpiredError } from "../../../lib/event-errors";
import { useTheme } from "../../../lib/theme/ThemeProvider";
import { fonts, type } from "../../../lib/theme/typography";
import { BackButton, PrimaryButton } from "../../../components/ui/Buttons";
import { FormField, InfoRow, Pill } from "../../../components/ui/FormField";
import { StyledInput } from "../../../components/ui/StyledInput";
import { EventDateTimeField } from "../../../components/ui/EventDateTimeField";
import {
  IcoCalendar,
  IcoEdit,
  IcoGroup,
  IcoPerson,
  IcoPhotos,
  IcoShare,
} from "../../../components/ui/Icons";

type Tab = "info" | "guests" | "albums" | "invite";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const eventId = id as string;
  const { c } = useTheme();

  const [detail, setDetail] = useState<EventDetailResponse | null>(null);
  const [role, setRole] = useState<"admin" | "participant" | "none" | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("info");
  const [newAlbumName, setNewAlbumName] = useState("");
  const [renamingAlbum, setRenamingAlbum] = useState<Album | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [editStartAt, setEditStartAt] = useState(defaultEventStartDate());
  const [editDisplayName, setEditDisplayName] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null);
  const [editingParticipantName, setEditingParticipantName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const loadEvent = useCallback(async () => {
    setRefreshing(true);
    try {
      const eventSecret = await getAnyEventSecret(eventId);
      if (!eventSecret) {
        Alert.alert("Access lost", "Rejoin the event or use an admin recovery link.");
        router.replace("/(tabs)");
        return;
      }

      const localEvents = await getLocalEvents();
      const local = localEvents.find((e) => e.eventId === eventId);
      const result = await api.getEvent(eventId, eventSecret);

      setDetail(result);
      setRole(local?.role ?? result.role);
      setSecret(eventSecret);
      setEditStartAt(new Date(result.event.startAt));
      setEditDisplayName(result.participant?.displayName ?? local?.displayName ?? "");
      setNameInput(result.participant?.displayName ?? local?.displayName ?? "");

      if (local?.role === "admin" || result.role === "admin") {
        const code = result.event.inviteCode;
        setInviteCode(code);
        setInviteUrl(joinInviteUrl(code));
      }
    } catch (err) {
      if (isEventExpiredError(err)) {
        await handleExpiredEvent(eventId, router);
        return;
      }
      Alert.alert("Error", err instanceof ApiError ? err.message : "Failed to load event");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId, router]);

  const loadParticipants = useCallback(async () => {
    const eventSecret = await getAnyEventSecret(eventId);
    if (!eventSecret) return;
    try {
      const result = await api.getParticipants(eventId, eventSecret);
      setParticipants(result.participants);
    } catch {
      // Admin-only
    }
  }, [eventId]);

  useFocusEffect(
    useCallback(() => {
      loadEvent();
    }, [loadEvent])
  );

  useFocusEffect(
    useCallback(() => {
      if (tab === "guests" && role === "admin") {
        loadParticipants();
      }
    }, [tab, role, loadParticipants])
  );

  const handleCreateAlbum = async () => {
    if (!secret || !newAlbumName.trim()) return;
    try {
      await api.createAlbum(eventId, secret, newAlbumName.trim());
      setNewAlbumName("");
      await loadEvent();
    } catch (err) {
      Alert.alert("Error", err instanceof ApiError ? err.message : "Failed to create album");
    }
  };

  const submitRenameAlbum = async () => {
    if (!secret || !renamingAlbum || !renameValue.trim()) return;
    try {
      await api.renameAlbum(renamingAlbum.id, secret, renameValue.trim());
      setRenamingAlbum(null);
      setRenameValue("");
      await loadEvent();
    } catch (err) {
      Alert.alert("Error", err instanceof ApiError ? err.message : "Failed to rename album");
    }
  };

  const handleDeleteAlbum = (album: Album) => {
    if (!secret) return;
    Alert.alert("Delete album", `Delete "${album.name}" and all its photos?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.deleteAlbum(album.id, secret);
            await loadEvent();
          } catch (err) {
            Alert.alert("Error", err instanceof ApiError ? err.message : "Failed to delete album");
          }
        },
      },
    ]);
  };

  const handleUpdateStartDate = async () => {
    if (!secret) return;
    const validation = validateEventStartAtDate(editStartAt);
    if (validation) {
      Alert.alert("Invalid date", validation);
      return;
    }
    try {
      const result = await api.updateEvent(eventId, secret, { startAt: editStartAt.toISOString() });
      await saveLocalEvent({
        eventId,
        role: role === "admin" ? "admin" : "participant",
        eventName: detail?.event.name,
        inviteCode: detail?.event.inviteCode,
        startAt: result.event.startAt,
        endAt: result.event.endAt,
      });
      await loadEvent();
      Alert.alert("Updated", "Event start date updated.");
    } catch (err) {
      Alert.alert("Error", err instanceof ApiError ? err.message : "Failed to update event");
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!secret || !detail?.participant?.id || !editDisplayName.trim()) return;
    try {
      const result = await api.updateParticipant(
        detail.participant.id,
        secret,
        editDisplayName.trim()
      );
      await saveLocalEvent({
        eventId,
        role: "participant",
        displayName: result.participant.displayName,
        eventName: detail.event.name,
        inviteCode: detail.event.inviteCode,
        endAt: detail.event.endAt,
        startAt: detail.event.startAt,
      });
      await loadEvent();
    } catch (err) {
      Alert.alert("Error", err instanceof ApiError ? err.message : "Failed to update name");
    }
  };

  const handleSaveGuestName = async () => {
    if (!nameInput.trim() || !secret || !detail?.participant?.id) return;
    setEditingName(false);
    try {
      const result = await api.updateParticipant(
        detail.participant.id,
        secret,
        nameInput.trim()
      );
      setEditDisplayName(result.participant.displayName);
      await saveLocalEvent({
        eventId,
        role: "participant",
        displayName: result.participant.displayName,
        eventName: detail.event.name,
        inviteCode: detail.event.inviteCode,
        endAt: detail.event.endAt,
        startAt: detail.event.startAt,
      });
      await loadEvent();
    } catch (err) {
      Alert.alert("Error", err instanceof ApiError ? err.message : "Failed to update name");
    }
  };

  const handleUpdateParticipantName = async (participantId: string) => {
    if (!secret || !editingParticipantName.trim()) return;
    try {
      await api.updateParticipant(participantId, secret, editingParticipantName.trim());
      setEditingParticipantId(null);
      setEditingParticipantName("");
      await loadParticipants();
    } catch (err) {
      Alert.alert("Error", err instanceof ApiError ? err.message : "Failed to update participant");
    }
  };

  const copyInvite = async () => {
    if (!inviteUrl) return;
    await Clipboard.setStringAsync(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareInvite = async () => {
    if (!inviteUrl) return;
    await Share.share({ message: `Join my event on ${APP_NAME}: ${inviteUrl}`, url: inviteUrl });
  };

  const handleDownloadEvent = async () => {
    if (!secret) return;
    setDownloading(true);
    try {
      await downloadEventZip(eventId, secret, detail?.event.name ?? "event");
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, padding: 24 }}>
        <Text style={{ color: c.error }}>Event not found</Text>
      </View>
    );
  }

  const active = isEventActive(detail.event.startAt, detail.event.endAt);
  const upcoming = isEventUpcoming(detail.event.startAt);
  const ended = isEventEnded(detail.event.endAt);
  const retained = detail.event.isRetained;
  const isAdmin = role === "admin";
  const tabs: Tab[] = isAdmin ? ["info", "guests", "albums", "invite"] : ["info", "guests", "albums"];
  const tabLabels: Record<Tab, string> = {
    info: "Details",
    guests: "Guests",
    albums: "Albums",
    invite: "Invite",
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={{
          paddingTop: 56,
          paddingHorizontal: 24,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: c.border,
        }}
      >
        <BackButton label="back" onPress={() => router.back()} />
        <Text style={{ fontFamily: fonts.display, fontSize: 40, lineHeight: 44, color: c.text }}>
          {detail.event.name}
        </Text>
        <Text style={[type.bodySmall, { color: c.textSec, marginTop: 4 }]}>
          {formatEventDateRange(detail.event.startAt, detail.event.endAt)}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
          {active ? (
            <Pill label="Active" inverted />
          ) : upcoming ? (
            <Pill label="Upcoming" />
          ) : retained ? (
            <Pill label="Archived" />
          ) : (
            <Pill label="Expired" />
          )}
          {!isAdmin && editDisplayName ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={[type.bodySmall, { color: c.textTer }]}>
                you as <Text style={{ color: c.text, fontStyle: "italic" }}>{editDisplayName}</Text>
              </Text>
              <Pressable onPress={() => { setNameInput(editDisplayName); setEditingName(true); }}>
                <IcoEdit color={c.textTer} />
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>

      {editingName ? (
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: c.surface,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
            flexDirection: "row",
            gap: 8,
          }}
        >
          <StyledInput
            value={nameInput}
            onChangeText={setNameInput}
            style={{ flex: 1 }}
            autoFocus
          />
          <PrimaryButton
            label="Save"
            onPress={handleSaveGuestName}
            style={{ width: "auto", paddingHorizontal: 16, paddingVertical: 12 }}
          />
        </View>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 24,
          borderBottomWidth: 1,
          borderBottomColor: c.border,
        }}
      >
        {tabs.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={{
              paddingVertical: 12,
              marginRight: 20,
              borderBottomWidth: 2,
              borderBottomColor: tab === t ? c.text : "transparent",
            }}
          >
            <Text
              style={{
                fontFamily: fonts.bodyMedium,
                fontSize: 13,
                color: tab === t ? c.text : c.textTer,
              }}
            >
              {tabLabels[t]}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{ padding: 24, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadEvent}
            tintColor={c.text}
            colors={[c.text]}
            progressBackgroundColor={c.surface}
          />
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        {tab === "info" ? (
          <View style={{ gap: 20 }}>
            <InfoRow
              icon={<IcoCalendar color={c.textTer} />}
              label="Starts"
              value={formatEventDate(detail.event.startAt)}
            />
            <InfoRow
              icon={<IcoCalendar color={c.textTer} />}
              label="Ends"
              value={formatEventDate(detail.event.endAt)}
            />
            <InfoRow
              icon={<IcoGroup color={c.textTer} />}
              label="Albums"
              value={`${detail.albums.length} album${detail.albums.length === 1 ? "" : "s"}`}
            />
            <InfoRow
              icon={<IcoPerson color={c.textTer} />}
              label="Your role"
              value={isAdmin ? "Host" : "Guest"}
            />
            {upcoming ? (
              <Text style={[type.bodySmall, { color: c.textSec }]}>
                This event has not started yet. Uploads open when it begins.
              </Text>
            ) : null}
            {!active && !upcoming && retained ? (
              <Text style={[type.bodySmall, { color: c.textSec }]}>
                This event has ended. Albums are available to view and download until{" "}
                {formatRetentionDate(detail.event.retentionExpiresAt)}.
              </Text>
            ) : !active && !upcoming && !retained ? (
              <Text style={[type.bodySmall, { color: c.error }]}>
                This event has expired and its albums were permanently deleted.
              </Text>
            ) : null}

            {retained && detail.albums.length > 0 ? (
              <PrimaryButton
                label={downloading ? "Preparing download..." : "Download all albums"}
                onPress={handleDownloadEvent}
                disabled={downloading}
              />
            ) : null}

            {isAdmin && upcoming ? (
              <View style={{ gap: 12, marginTop: 8 }}>
                <FormField label="Start date & time">
                  <EventDateTimeField value={editStartAt} onChange={setEditStartAt} />
                </FormField>
                <PrimaryButton label="Update start date" onPress={handleUpdateStartDate} />
              </View>
            ) : null}

            {!isAdmin && detail.participant ? (
              <View style={{ gap: 12, marginTop: 8 }}>
                <FormField label="Your display name">
                  <StyledInput value={editDisplayName} onChangeText={setEditDisplayName} />
                </FormField>
                <PrimaryButton label="Update name" onPress={handleUpdateDisplayName} />
              </View>
            ) : null}
          </View>
        ) : null}

        {tab === "guests" ? (
          <View>
            {role === "admin" ? (
              participants.length === 0 ? (
                <Text style={[type.body, { color: c.textTer }]}>No participants yet.</Text>
              ) : (
                participants.map((p) => (
                  <View key={p.id}>
                    {editingParticipantId === p.id ? (
                      <View style={{ flexDirection: "row", gap: 8, paddingVertical: 6 }}>
                        <StyledInput
                          value={editingParticipantName}
                          onChangeText={setEditingParticipantName}
                          style={{ flex: 1 }}
                          autoFocus
                        />
                        <PrimaryButton
                          label="Save"
                          onPress={() => handleUpdateParticipantName(p.id)}
                          style={{ width: "auto", paddingHorizontal: 16, paddingVertical: 12 }}
                        />
                      </View>
                    ) : (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingVertical: 11,
                          borderBottomWidth: 1,
                          borderBottomColor: c.border,
                        }}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                          <View
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 15,
                              backgroundColor: c.surface,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={[type.caption, { color: c.textSec }]}>
                              {p.displayName.slice(0, 2).toUpperCase()}
                            </Text>
                          </View>
                          <View>
                            <Text style={[type.body, { color: c.text }]}>{p.displayName}</Text>
                            {p.handle ? (
                              <Text style={[type.caption, { color: c.textTer, marginTop: 2 }]}>
                                @{p.handle}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                        <Pressable
                          onPress={() => {
                            setEditingParticipantId(p.id);
                            setEditingParticipantName(p.displayName);
                          }}
                        >
                          <IcoEdit color={c.textTer} />
                        </Pressable>
                      </View>
                    )}
                  </View>
                ))
              )
            ) : (
              <Text style={[type.body, { color: c.textTer }]}>
                Guest list is visible to hosts only.
              </Text>
            )}
          </View>
        ) : null}

        {tab === "albums" ? (
          <View style={{ gap: 12 }}>
            {isAdmin ? (
              <View style={{ gap: 12, marginBottom: 8 }}>
                <FormField label="New album">
                  <StyledInput
                    value={newAlbumName}
                    onChangeText={setNewAlbumName}
                    placeholder="Album name"
                  />
                </FormField>
                <PrimaryButton
                  label="Add album"
                  onPress={handleCreateAlbum}
                  disabled={!newAlbumName.trim()}
                />
              </View>
            ) : null}

            {renamingAlbum ? (
              <View style={{ gap: 8, marginBottom: 8 }}>
                <FormField label="Rename album">
                  <StyledInput value={renameValue} onChangeText={setRenameValue} autoFocus />
                </FormField>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <PrimaryButton label="Save" onPress={submitRenameAlbum} style={{ flex: 1 }} />
                  <PrimaryButton
                    label="Cancel"
                    onPress={() => setRenamingAlbum(null)}
                    style={{ flex: 1, backgroundColor: c.surface }}
                  />
                </View>
              </View>
            ) : null}

            {detail.albums.length === 0 ? (
              <Text style={[type.body, { color: c.textTer }]}>
                {isAdmin ? "No albums yet. Create one above." : "No albums yet."}
              </Text>
            ) : (
              detail.albums.map((album) => (
                <Pressable
                  key={album.id}
                  onPress={() => router.push(`/event/${eventId}/album/${album.id}`)}
                  onLongPress={
                    isAdmin
                      ? () => {
                          Alert.alert(album.name, "Choose an action", [
                            {
                              text: "Rename",
                              onPress: () => {
                                setRenamingAlbum(album);
                                setRenameValue(album.name);
                              },
                            },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: () => handleDeleteAlbum(album),
                            },
                            { text: "Cancel", style: "cancel" },
                          ]);
                        }
                      : undefined
                  }
                  style={{
                    backgroundColor: c.card,
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <IcoPhotos color={c.textTer} />
                  <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 16, color: c.text, flex: 1 }}>
                    {album.name}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        ) : null}

        {tab === "invite" && isAdmin && inviteUrl && inviteCode ? (
          <View style={{ alignItems: "center" }}>
            <Text
              style={[
                type.bodySmall,
                { color: c.textTer, textAlign: "center", lineHeight: 20, marginBottom: 24 },
              ]}
            >
              Invite guests to{" "}
              <Text style={{ color: c.text, fontStyle: "italic" }}>{detail.event.name}</Text>
              {"\n"}by sharing any of the options below
            </Text>

            <View
              style={{
                backgroundColor: c.bg,
                borderRadius: 24,
                padding: 20,
                marginBottom: 24,
              }}
            >
              <QRCode value={inviteUrl} size={180} backgroundColor={c.bg} color={c.text} />
              <Text style={[type.caption, { color: c.textSec, textAlign: "center", marginTop: 12 }]}>
                Code: {inviteCode}
              </Text>
            </View>

            <View style={{ width: "100%", gap: 8 }}>
              <Pressable
                onPress={shareInvite}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: c.surface,
                  borderRadius: 16,
                  padding: 12,
                }}
              >
                <IcoShare color={c.text} />
                <View>
                  <Text style={[type.body, { fontFamily: fonts.bodyMedium, color: c.text }]}>
                    Share link
                  </Text>
                  <Text style={[type.caption, { color: c.textTer }]}>send via messages</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={copyInvite}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: c.surface,
                  borderRadius: 16,
                  padding: 12,
                }}
              >
                <Text style={{ fontSize: 18 }}>🔗</Text>
                <View>
                  <Text style={[type.body, { fontFamily: fonts.bodyMedium, color: c.text }]}>
                    {copied ? "Copied!" : "Copy link"}
                  </Text>
                  <Text style={[type.caption, { color: c.textTer }]} numberOfLines={1}>
                    {inviteUrl}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
