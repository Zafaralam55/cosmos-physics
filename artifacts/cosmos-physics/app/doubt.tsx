import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  apiGetDoubts,
  apiObjectUrl,
  apiPostDoubt,
  apiReplyToDoubt,
  apiRequestUploadUrlForRole,
  apiUploadFile,
  type Doubt,
} from "@/lib/apiClient";

function timeSince(isoStr: string) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DoubtScreen() {
  const colors = useColors();
  const { state } = useApp();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  const isLoggedIn = !!state.student;

  const load = useCallback(async () => {
    if (!isLoggedIn) { setLoading(false); return; }
    try {
      const rows = await apiGetDoubts("student");
      setDoubts(rows);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, [isLoggedIn]);

  useEffect(() => { void load(); }, [load]);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]) setImageUri(res.assets[0].uri);
  };

  const submit = async () => {
    if (text.trim().length < 5) {
      Alert.alert("Please describe your doubt (min 5 characters).");
      return;
    }
    setSubmitting(true);
    setUploadPct(0);
    try {
      let photoUrl: string | undefined;
      if (imageUri) {
        const ext = imageUri.split(".").pop() ?? "jpg";
        const ct = ext === "png" ? "image/png" : "image/jpeg";
        const { uploadURL, objectPath } = await apiRequestUploadUrlForRole(
          `doubt-${Date.now()}.${ext}`, 0, ct, "student",
        );
        await apiUploadFile(uploadURL, imageUri, ct, setUploadPct);
        photoUrl = apiObjectUrl(objectPath);
      }
      await apiPostDoubt({ text: text.trim(), photoUrl });
      setText("");
      setImageUri(null);
      setUploadPct(0);
      await load();
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not submit doubt");
    } finally {
      setSubmitting(false);
    }
  };

  const sendReply = async (doubtId: string) => {
    const t = (replyText[doubtId] ?? "").trim();
    if (!t) return;
    setReplyingId(doubtId);
    try {
      await apiReplyToDoubt(doubtId, t, "student");
      setReplyText((prev) => ({ ...prev, [doubtId]: "" }));
      await load();
    } catch {
      Alert.alert("Error", "Could not send reply");
    } finally {
      setReplyingId(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <ScreenContainer showStars scroll={false}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 28 }}>
          <View style={[styles.iconWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="message-circle" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.h1, { color: colors.foreground, textAlign: "center", marginTop: 16 }]}>
            Sign in to Ask Doubts
          </Text>
          <Text style={[styles.sub, { color: colors.mutedForeground, textAlign: "center", marginTop: 8 }]}>
            Get answers from Md Zafar Alam and faculty within 24 hours.
          </Text>
          <PrimaryButton
            label="Student Sign In"
            icon="log-in"
            onPress={() => router.push("/login" as never)}
            style={{ marginTop: 24 }}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer showStars>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.h1, { color: colors.foreground }]}>Doubt Solving</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              Ask faculty — get answers within 24 hours
            </Text>
          </View>
          <Pressable
            onPress={load}
            style={[styles.refreshBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <Feather name="refresh-cw" size={15} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Compose */}
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <View style={[styles.composer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              placeholder="Type your doubt — equations, concepts, topic-wise…"
              placeholderTextColor={colors.mutedForeground}
              value={text}
              onChangeText={setText}
              multiline
              style={[styles.input, { color: colors.foreground }]}
            />
            {imageUri ? (
              <View style={styles.previewWrap}>
                <Image source={{ uri: imageUri }} style={styles.preview} />
                <Pressable onPress={() => setImageUri(null)} style={styles.previewClose} hitSlop={10}>
                  <Feather name="x" size={14} color="#FFF" />
                </Pressable>
                {uploadPct > 0 && uploadPct < 100 && (
                  <View style={[styles.uploadBar, { width: `${uploadPct}%` as `${number}%` }]} />
                )}
              </View>
            ) : null}
            <View style={styles.composerRow}>
              <Pressable
                onPress={pickImage}
                style={[styles.attachBtn, { backgroundColor: colors.secondary }]}
              >
                <Feather name="image" size={16} color={colors.primary} />
                <Text style={[styles.attachLabel, { color: colors.primary }]}>Photo</Text>
              </Pressable>
              <PrimaryButton
                label={submitting ? "Sending…" : "Send Doubt"}
                icon={submitting ? undefined : "send"}
                onPress={submit}
                style={{ flex: 1, marginLeft: 10 }}
              />
            </View>
          </View>
        </View>

        {/* Doubts list */}
        <View style={{ paddingHorizontal: 20, marginTop: 24, marginBottom: 8 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Doubts</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : doubts.length === 0 ? (
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Feather name="message-circle" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No doubts yet</Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
              Write a question above and hit "Send Doubt"
            </Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          >
            {doubts.map((d) => {
              const isExpanded = expandedId === d.id;
              const answered = d.status === "answered";
              return (
                <View
                  key={d.id}
                  style={[styles.card, {
                    backgroundColor: colors.card,
                    borderColor: answered ? "#10B98144" : colors.border,
                  }]}
                >
                  {/* Card header */}
                  <Pressable
                    onPress={() => setExpandedId(isExpanded ? null : d.id)}
                    style={styles.cardHead}
                  >
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: answered ? "#10B98122" : "#FACC1522" },
                    ]}>
                      <Feather
                        name={answered ? "check-circle" : "clock"}
                        size={10}
                        color={answered ? "#10B981" : "#FACC15"}
                      />
                      <Text style={[styles.statusText, { color: answered ? "#10B981" : "#FACC15" }]}>
                        {answered ? "Answered" : "Awaiting faculty"}
                      </Text>
                    </View>
                    <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
                      {timeSince(d.createdAt)}
                    </Text>
                    <Feather
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={15}
                      color={colors.mutedForeground}
                    />
                  </Pressable>

                  <Text style={[styles.doubtText, { color: colors.foreground }]} numberOfLines={isExpanded ? undefined : 2}>
                    {d.text}
                  </Text>

                  {/* Photo */}
                  {d.photoUrl ? (
                    <Image
                      source={{ uri: d.photoUrl }}
                      style={[styles.doubtPhoto, { borderColor: colors.border }]}
                      resizeMode="cover"
                    />
                  ) : null}

                  {/* Replies */}
                  {isExpanded && (
                    <View style={{ marginTop: 12, gap: 8 }}>
                      {d.replies.length > 0 && (
                        <View style={[styles.repliesDivider, { borderColor: colors.border }]} />
                      )}
                      {[...d.replies].reverse().map((r) => {
                        const isTeacher = r.role === "teacher" || r.role === "admin";
                        return (
                          <View
                            key={r.id}
                            style={[
                              styles.replyRow,
                              { alignSelf: isTeacher ? "flex-start" : "flex-end" },
                            ]}
                          >
                            {isTeacher && (
                              <View style={[styles.replyAvatar, { backgroundColor: colors.primary + "22" }]}>
                                <Feather name="award" size={12} color={colors.primary} />
                              </View>
                            )}
                            <View style={{ maxWidth: "80%" }}>
                              <View style={[
                                styles.replyBubble,
                                {
                                  backgroundColor: isTeacher
                                    ? colors.primary + "18"
                                    : colors.secondary,
                                  borderColor: isTeacher ? colors.primary + "44" : colors.border,
                                },
                              ]}>
                                <Text style={[styles.replyName, { color: isTeacher ? colors.primary : colors.mutedForeground }]}>
                                  {r.userName} {isTeacher ? "· Faculty" : ""}
                                </Text>
                                <Text style={[styles.replyText, { color: colors.foreground }]}>
                                  {r.text}
                                </Text>
                              </View>
                              <Text style={[styles.replyTime, { color: colors.mutedForeground, alignSelf: isTeacher ? "flex-start" : "flex-end" }]}>
                                {timeSince(r.createdAt)}
                              </Text>
                            </View>
                          </View>
                        );
                      })}

                      {/* Reply input */}
                      <View style={[styles.replyInputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                        <TextInput
                          placeholder="Add a follow-up…"
                          placeholderTextColor={colors.mutedForeground}
                          value={replyText[d.id] ?? ""}
                          onChangeText={(v) => setReplyText((p) => ({ ...p, [d.id]: v }))}
                          style={[styles.replyInput, { color: colors.foreground }]}
                          multiline
                        />
                        <Pressable
                          onPress={() => sendReply(d.id)}
                          disabled={replyingId === d.id}
                          style={[styles.sendBtn, { backgroundColor: colors.primary }]}
                        >
                          {replyingId === d.id
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Feather name="send" size={14} color="#fff" />
                          }
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 4,
  },
  h1: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  sub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  refreshBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center", marginTop: 4 },
  iconWrap: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  composer: { padding: 14, borderRadius: 18, borderWidth: 1, gap: 12 },
  input: { minHeight: 80, fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 20, textAlignVertical: "top" },
  previewWrap: { height: 130, borderRadius: 12, overflow: "hidden" },
  preview: { width: "100%", height: "100%" },
  previewClose: {
    position: "absolute", top: 8, right: 8, width: 28, height: 28,
    borderRadius: 14, backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center", justifyContent: "center",
  },
  uploadBar: {
    position: "absolute", bottom: 0, left: 0, height: 3,
    backgroundColor: "#5B8CFF", borderRadius: 2,
  },
  composerRow: { flexDirection: "row", alignItems: "center" },
  attachBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, height: 50, borderRadius: 14 },
  attachLabel: { fontFamily: "Inter_700Bold", fontSize: 13 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: -0.3 },
  empty: {
    alignItems: "center", padding: 28, borderRadius: 18, borderWidth: 1,
    borderStyle: "dashed", gap: 8, marginHorizontal: 20,
  },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  emptyBody: { fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center" },
  card: { borderRadius: 16, borderWidth: 1, padding: 14 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 0.3 },
  timeText: { fontFamily: "Inter_400Regular", fontSize: 11, flex: 1, textAlign: "right" },
  doubtText: { fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 20 },
  doubtPhoto: { marginTop: 10, height: 160, borderRadius: 12, borderWidth: 1 },
  repliesDivider: { borderTopWidth: 1, marginTop: 4, marginBottom: 4 },
  replyRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  replyAvatar: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 2 },
  replyBubble: { borderRadius: 12, borderWidth: 1, padding: 10 },
  replyName: { fontFamily: "Inter_700Bold", fontSize: 10, marginBottom: 3 },
  replyText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  replyTime: { fontFamily: "Inter_400Regular", fontSize: 10, marginTop: 3 },
  replyInputRow: {
    flexDirection: "row", alignItems: "flex-end", gap: 8,
    borderRadius: 12, borderWidth: 1, padding: 10, marginTop: 4,
  },
  replyInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, maxHeight: 80 },
  sendBtn: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
