import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { CoursesPanel, LivePanel, NotesPanel, QuizPanel } from "@/components/ContentPanels";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  apiGetDoubts,
  apiReplyToDoubt,
  apiReopenDoubt,
  apiSolveDoubt,
  type Doubt,
} from "@/lib/apiClient";

type Tab = "live" | "courses" | "notes" | "quizzes" | "doubts";

const TABS: { id: Tab; label: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
  { id: "live", label: "Classes", icon: "radio" },
  { id: "courses", label: "Courses", icon: "book" },
  { id: "notes", label: "Notes", icon: "file-text" },
  { id: "quizzes", label: "Quizzes", icon: "award" },
  { id: "doubts", label: "Doubts", icon: "message-circle" },
];

function timeSince(isoStr: string) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function DoubtsInboxPanel({ colors }: { colors: ReturnType<typeof useColors> }) {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "answered">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setDoubts(await apiGetDoubts("teacher")); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = doubts.filter((d) =>
    filter === "all" ? true : d.status === filter,
  );

  const sendReply = async (doubtId: string) => {
    const t = (replyText[doubtId] ?? "").trim();
    if (!t) return;
    setReplyingId(doubtId);
    try {
      await apiReplyToDoubt(doubtId, t, "teacher");
      setReplyText((p) => ({ ...p, [doubtId]: "" }));
      await load();
    } catch { Alert.alert("Error", "Could not send reply"); }
    finally { setReplyingId(null); }
  };

  const toggleStatus = async (d: Doubt) => {
    setActioningId(d.id);
    try {
      if (d.status === "open") await apiSolveDoubt(d.id, "teacher");
      else await apiReopenDoubt(d.id, "teacher");
      await load();
    } catch { Alert.alert("Error", "Could not update status"); }
    finally { setActioningId(null); }
  };

  return (
    <View style={{ marginTop: 16 }}>
      {/* Filter chips */}
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 12, alignItems: "center" }}>
        {(["all", "open", "answered"] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={{
              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1,
              backgroundColor: filter === f ? colors.primary + "22" : colors.card,
              borderColor: filter === f ? colors.primary : colors.border,
            }}
          >
            <Text style={{
              fontFamily: "Inter_700Bold", fontSize: 11,
              color: filter === f ? colors.primary : colors.mutedForeground,
            }}>
              {f === "all"
                ? `All (${doubts.length})`
                : f === "open"
                  ? `Open (${doubts.filter((d) => d.status === "open").length})`
                  : `Done (${doubts.filter((d) => d.status === "answered").length})`}
            </Text>
          </Pressable>
        ))}
        <Pressable onPress={load} style={{ marginLeft: "auto" as never, padding: 6 }}>
          <Feather name="refresh-cw" size={14} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : filtered.length === 0 ? (
        <View style={{ alignItems: "center", padding: 32, gap: 8 }}>
          <Feather name="message-circle" size={28} color={colors.mutedForeground} />
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.foreground }}>
            No doubts in this filter
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {filtered.map((d) => {
            const isExpanded = expandedId === d.id;
            const answered = d.status === "answered";
            return (
              <View
                key={d.id}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16, borderWidth: 1,
                  borderColor: answered ? "#10B98144" : colors.border,
                  padding: 14,
                }}
              >
                <Pressable
                  onPress={() => setExpandedId(isExpanded ? null : d.id)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}
                >
                  <View style={{
                    flexDirection: "row", alignItems: "center", gap: 4,
                    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
                    backgroundColor: answered ? "#10B98122" : "#FACC1522",
                  }}>
                    <Feather name={answered ? "check-circle" : "clock"} size={10} color={answered ? "#10B981" : "#FACC15"} />
                    <Text style={{ fontFamily: "Inter_700Bold", fontSize: 10, color: answered ? "#10B981" : "#FACC15" }}>
                      {answered ? "Answered" : "Open"}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: "Inter_700Bold", fontSize: 11, color: colors.primary, flex: 1 }}>
                    {d.studentName}
                  </Text>
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 10, color: colors.mutedForeground }}>
                    {timeSince(d.createdAt)}
                  </Text>
                  <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} />
                </Pressable>

                <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: colors.foreground, lineHeight: 20 }} numberOfLines={isExpanded ? undefined : 2}>
                  {d.text}
                </Text>

                {d.photoUrl ? (
                  <Image
                    source={{ uri: d.photoUrl }}
                    style={{ marginTop: 10, height: 150, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}
                    resizeMode="cover"
                  />
                ) : null}

                {isExpanded && (
                  <View style={{ marginTop: 12, gap: 8 }}>
                    <Pressable
                      onPress={() => toggleStatus(d)}
                      disabled={actioningId === d.id}
                      style={{
                        flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start",
                        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1,
                        backgroundColor: answered ? "#FACC1516" : "#10B98116",
                        borderColor: answered ? "#FACC1555" : "#10B98155",
                      }}
                    >
                      <Feather name={answered ? "rotate-ccw" : "check"} size={12} color={answered ? "#FACC15" : "#10B981"} />
                      <Text style={{ fontFamily: "Inter_700Bold", fontSize: 11, color: answered ? "#FACC15" : "#10B981" }}>
                        {actioningId === d.id ? "…" : answered ? "Reopen" : "Mark Solved"}
                      </Text>
                    </Pressable>

                    {d.replies.length > 0 && (
                      <View style={{ borderTopWidth: 1, borderColor: colors.border, marginTop: 4, paddingTop: 8, gap: 8 }}>
                        {[...d.replies].reverse().map((r) => {
                          const isFaculty = r.role === "teacher" || r.role === "admin";
                          return (
                            <View key={r.id} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, alignSelf: isFaculty ? "flex-start" : "flex-end" }}>
                              {isFaculty && (
                                <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: colors.primary + "22", alignItems: "center", justifyContent: "center" }}>
                                  <Feather name="award" size={12} color={colors.primary} />
                                </View>
                              )}
                              <View style={{ maxWidth: "80%" }}>
                                <View style={{
                                  borderRadius: 10, borderWidth: 1, padding: 9,
                                  backgroundColor: isFaculty ? colors.primary + "18" : colors.secondary,
                                  borderColor: isFaculty ? colors.primary + "44" : colors.border,
                                }}>
                                  <Text style={{ fontFamily: "Inter_700Bold", fontSize: 10, color: isFaculty ? colors.primary : colors.mutedForeground, marginBottom: 2 }}>
                                    {r.userName}{isFaculty ? " · Faculty" : ""}
                                  </Text>
                                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.foreground, lineHeight: 18 }}>
                                    {r.text}
                                  </Text>
                                </View>
                                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 10, color: colors.mutedForeground, marginTop: 2, alignSelf: isFaculty ? "flex-start" : "flex-end" }}>
                                  {timeSince(r.createdAt)}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}

                    <View style={{
                      flexDirection: "row", alignItems: "flex-end", gap: 8, borderRadius: 12,
                      borderWidth: 1, padding: 10, backgroundColor: colors.muted, borderColor: colors.border,
                    }}>
                      <TextInput
                        placeholder="Reply to this doubt…"
                        placeholderTextColor={colors.mutedForeground}
                        value={replyText[d.id] ?? ""}
                        onChangeText={(v) => setReplyText((p) => ({ ...p, [d.id]: v }))}
                        style={{ flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, color: colors.foreground, maxHeight: 80 }}
                        multiline
                      />
                      <Pressable
                        onPress={() => sendReply(d.id)}
                        disabled={replyingId === d.id}
                        style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}
                      >
                        {replyingId === d.id
                          ? <ActivityIndicator size="small" color="#fff" />
                          : <Feather name="send" size={13} color="#fff" />
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
    </View>
  );
}

export default function TeacherDashboard() {
  const colors = useColors();
  const [tab, setTab] = useState<Tab>("live");
  const {
    currentTeacher,
    teacherLogout,
    allLiveClasses,
    allQuizzes,
    allResources,
    allCourses,
    addLiveClass,
    updateLiveClass,
    removeLiveClass,
    addQuiz,
    updateQuiz,
    removeQuiz,
    addResource,
    updateResource,
    removeResource,
    addCourse,
    updateCourse,
    removeCourse,
  } = useApp();

  const myLive = useMemo(
    () => allLiveClasses.filter((c) => c.createdBy === currentTeacher?.id),
    [allLiveClasses, currentTeacher],
  );
  const myQuizzes = useMemo(
    () => allQuizzes.filter((q) => q.createdBy === currentTeacher?.id),
    [allQuizzes, currentTeacher],
  );
  const myResources = useMemo(
    () => allResources.filter((r) => r.createdBy === currentTeacher?.id),
    [allResources, currentTeacher],
  );
  const myCourses = useMemo(
    () => allCourses.filter((c) => c.createdBy === currentTeacher?.id),
    [allCourses, currentTeacher],
  );

  if (!currentTeacher) {
    return (
      <ScreenContainer scroll={false} showStars>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Feather name="lock" size={28} color={colors.mutedForeground} />
          <Text style={[styles.section, { color: colors.foreground, marginTop: 12 }]}>
            Teachers only
          </Text>
          <Text
            style={[
              styles.helper,
              { color: colors.mutedForeground, textAlign: "center", marginTop: 6 },
            ]}
          >
            Sign in with your teacher account to access the teaching dashboard.
          </Text>
          <Pressable
            onPress={() => router.replace("/teacher/login" as never)}
            style={[
              styles.signInBtn,
              { backgroundColor: colors.primary, marginTop: 18 },
            ]}
          >
            <Feather name="log-in" size={16} color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 14 }}>
              Go to Teacher Sign In
            </Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const KPIS = [
    { label: "Classes", value: `${myLive.length}` },
    { label: "Courses", value: `${myCourses.length}` },
    { label: "Notes", value: `${myResources.length}` },
    { label: "Quizzes", value: `${myQuizzes.length}` },
  ];

  return (
    <ScreenContainer showStars>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, marginTop: 4, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.h1, { color: colors.foreground }]}>Teacher Dashboard</Text>
          <Text style={[styles.h1Sub, { color: colors.mutedForeground }]}>
            Welcome, {currentTeacher.name}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)" as never)}
          style={[styles.homeBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Feather name="home" size={14} color={colors.primary} />
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: 11, color: colors.primary }}>App Home</Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <LinearGradient
          colors={["#0E1430", "#1A2042"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.welcome, { borderColor: colors.border }]}
        >
          <View style={[styles.shield, { backgroundColor: colors.primary + "26" }]}>
            <Feather name="award" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>
              {currentTeacher.subject} Faculty
            </Text>
            <Text style={[styles.welcomeSub, { color: colors.mutedForeground }]}>
              {currentTeacher.email} · joined {currentTeacher.joinDate}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              teacherLogout();
              router.replace("/teacher/login" as never);
            }}
            hitSlop={8}
            style={styles.signOutBtn}
          >
            <Feather name="log-out" size={16} color={colors.destructive} />
          </Pressable>
        </LinearGradient>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <View style={styles.kpiGrid}>
          {KPIS.map((k) => (
            <View
              key={k.label}
              style={[styles.kpi, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>{k.label}</Text>
              <Text style={[styles.kpiValue, { color: colors.foreground }]}>{k.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.tabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setTab(t.id)}
                  style={[
                    styles.tab,
                    { backgroundColor: active ? colors.secondary : "transparent" },
                  ]}
                >
                  <Feather
                    name={t.icon}
                    size={14}
                    color={active ? colors.primary : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: active ? colors.primary : colors.mutedForeground },
                    ]}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {tab === "live" ? (
        <LivePanel
          colors={colors}
          items={myLive}
          onAdd={addLiveClass}
          onUpdate={updateLiveClass}
          onRemove={removeLiveClass}
          defaultFaculty={currentTeacher.name}
          createdBy={currentTeacher.id}
          scopedTitle="My Scheduled Classes"
        />
      ) : null}
      {tab === "courses" ? (
        <CoursesPanel
          colors={colors}
          items={myCourses}
          onAdd={addCourse}
          onUpdate={updateCourse}
          onRemove={removeCourse}
          createdBy={currentTeacher.id}
          scopedTitle="My Courses"
        />
      ) : null}
      {tab === "notes" ? (
        <NotesPanel
          colors={colors}
          items={myResources}
          onAdd={addResource}
          onUpdate={updateResource}
          onRemove={removeResource}
          createdBy={currentTeacher.id}
          scopedTitle="My Notes & Material"
        />
      ) : null}
      {tab === "quizzes" ? (
        <QuizPanel
          colors={colors}
          items={myQuizzes}
          onAdd={addQuiz}
          onUpdate={updateQuiz}
          onRemove={removeQuiz}
          createdBy={currentTeacher.id}
          scopedTitle="My Quizzes"
        />
      ) : null}
      {tab === "doubts" ? <DoubtsInboxPanel colors={colors} /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  h1Sub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  helper: { fontFamily: "Inter_400Regular", fontSize: 13 },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  welcome: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  shield: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  welcomeSub: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 2 },
  signOutBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,84,112,0.15)",
  },
  signInBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  kpiGrid: { flexDirection: "row", gap: 10 },
  kpi: { flex: 1, padding: 14, borderRadius: 16, borderWidth: 1 },
  kpiLabel: { fontFamily: "Inter_500Medium", fontSize: 11 },
  kpiValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    marginTop: 6,
    letterSpacing: -0.4,
  },
  tabs: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  tabLabel: { fontFamily: "Inter_700Bold", fontSize: 11 },
  section: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: -0.3 },
});
