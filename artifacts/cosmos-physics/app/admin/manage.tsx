import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import {
  ChipRow,
  Field,
  FormCard,
  ItemRow,
  LivePanel,
  NotesPanel,
  QuizPanel,
} from "@/components/ContentPanels";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useApp, type AppSettings } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  apiAnnounce,
  apiExportContent,
  apiGetAnnouncements,
  apiGetDoubts,
  apiGetHistory,
  apiGetLockedCourses,
  apiGetStudentCourseAccess,
  apiImportContent,
  apiRemoveCourseAccess,
  apiRestoreVersion,
  apiReplyToDoubt,
  apiSetCourseAccess,
  apiSolveDoubt,
  apiReopenDoubt,
  type CourseAccessRecord,
  type Doubt,
  type ExportBundle,
  type VersionHistoryEntry,
} from "@/lib/apiClient";
import * as DocumentPicker from "expo-document-picker";
import { Share } from "react-native";

type Tab =
  | "app"
  | "courses"
  | "live"
  | "quizzes"
  | "notes"
  | "notifications"
  | "students"
  | "teachers"
  | "history"
  | "doubts";

const TABS: { id: Tab; label: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
  { id: "app", label: "App", icon: "settings" },
  { id: "courses", label: "Courses", icon: "book-open" },
  { id: "live", label: "Live", icon: "radio" },
  { id: "quizzes", label: "Quizzes", icon: "award" },
  { id: "notes", label: "Notes", icon: "file-text" },
  { id: "notifications", label: "Notify", icon: "bell" },
  { id: "students", label: "Students", icon: "user" },
  { id: "teachers", label: "Teachers", icon: "users" },
  { id: "doubts", label: "Doubts", icon: "message-circle" },
  { id: "history", label: "History", icon: "clock" },
];

const DEFAULT_GRADIENT: [string, string] = ["#5B8CFF", "#8B5CF6"];

export default function ManageScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ type?: string }>();
  const initial = (params.type as Tab) || "app";
  const [tab, setTab] = useState<Tab>(initial);
  const {
    state,
    allCourses,
    allLiveClasses,
    allQuizzes,
    allResources,
    allNotifications,
    addCourse,
    updateCourse,
    removeCourse,
    addLiveClass,
    updateLiveClass,
    removeLiveClass,
    addQuiz,
    updateQuiz,
    removeQuiz,
    addResource,
    updateResource,
    removeResource,
    sendNotification,
    updateNotification,
    removeNotification,
    addTeacher,
    updateTeacher,
    removeTeacher,
    addStudent,
    updateStudent,
    removeStudent,
  } = useApp();

  if (!state.isAdmin) {
    return (
      <ScreenContainer scroll={false}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Feather name="lock" size={28} color={colors.mutedForeground} />
          <Text style={[styles.section, { color: colors.foreground, marginTop: 12 }]}>
            Admin only
          </Text>
          <Text style={[styles.helper, { color: colors.mutedForeground, textAlign: "center" }]}>
            Sign in as the founder to manage content.
          </Text>
          <PrimaryButton
            label="Go to Founder Sign In"
            icon="log-in"
            onPress={() => router.replace("/admin" as never)}
            style={{ marginTop: 16 }}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer showStars>
      <View style={{ paddingHorizontal: 20, marginTop: 4, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.h1, { color: colors.foreground }]}>Manage Content</Text>
          <Text style={[styles.h1Sub, { color: colors.mutedForeground }]}>
            Edit branding, content, and add or remove items
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
      </View>

      {tab === "app" ? <SettingsPanel colors={colors} /> : null}
      {tab === "courses" ? (
        <CoursesPanel
          colors={colors}
          items={allCourses}
          onAdd={addCourse}
          onUpdate={updateCourse}
          onRemove={removeCourse}
        />
      ) : null}
      {tab === "live" ? (
        <LivePanel
          colors={colors}
          items={allLiveClasses}
          onAdd={addLiveClass}
          onUpdate={updateLiveClass}
          onRemove={removeLiveClass}
        />
      ) : null}
      {tab === "quizzes" ? (
        <QuizPanel
          colors={colors}
          items={allQuizzes}
          onAdd={addQuiz}
          onUpdate={updateQuiz}
          onRemove={removeQuiz}
        />
      ) : null}
      {tab === "notes" ? (
        <NotesPanel
          colors={colors}
          items={allResources}
          onAdd={addResource}
          onUpdate={updateResource}
          onRemove={removeResource}
        />
      ) : null}
      {tab === "notifications" ? (
        <NotificationsPanel colors={colors} />
      ) : null}
      {tab === "students" ? (
        <StudentsPanel
          colors={colors}
          items={state.students}
          allCourses={allCourses}
          onAdd={addStudent}
          onUpdate={updateStudent}
          onRemove={removeStudent}
        />
      ) : null}
      {tab === "teachers" ? (
        <TeachersPanel
          colors={colors}
          items={state.teachers}
          onAdd={addTeacher}
          onUpdate={updateTeacher}
          onRemove={removeTeacher}
        />
      ) : null}
      {tab === "doubts" ? <DoubtsInboxPanel colors={colors} role="admin" /> : null}
      {tab === "history" ? <HistoryPanel colors={colors} /> : null}
    </ScreenContainer>
  );
}

/* ----------------- Students Panel (with edit) ----------------- */

const STUDENT_LEVELS = [
  "Class 9-10",
  "Class 11-12",
  "JEE/NEET",
  "Engineering",
  "Other",
] as const;

function StudentsPanel({
  colors,
  items,
  allCourses,
  onAdd,
  onUpdate,
  onRemove,
}: {
  colors: ReturnType<typeof useColors>;
  items: any[];
  allCourses: any[];
  onAdd: (s: any) => void;
  onUpdate: (id: string, partial: any) => void;
  onRemove: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [accessStudentId, setAccessStudentId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState<(typeof STUDENT_LEVELS)[number]>("Class 11-12");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!editingId) return;
    const item = items.find((i) => i.id === editingId);
    if (!item) return;
    setName(item.name);
    setEmail(item.email);
    setPhone(item.phone);
    setLevel(item.level);
    setPassword(item.password);
  }, [editingId, items]);

  const reset = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
    setLevel("Class 11-12");
    setPassword("");
  };

  const generatePwd = () => "Cosmos@" + Math.floor(1000 + Math.random() * 9000).toString();

  const submit = () => {
    if (!name.trim() || !email.trim() || !email.includes("@")) {
      Alert.alert("Add the student's name and a valid email");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password must be at least 6 characters");
      return;
    }
    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || "—",
      level,
      password,
    };
    if (editingId) {
      onUpdate(editingId, payload);
      Alert.alert("Updated", `${name.trim()}'s account has been updated.`);
    } else {
      onAdd(payload);
      Alert.alert(
        "Student account created",
        `${name.trim()} can now sign in with:\n\nEmail: ${email.trim().toLowerCase()}\nPassword: ${password}`,
      );
    }
    reset();
  };

  return (
    <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 12 }}>
      <FormCard
        colors={colors}
        title={editingId ? "Edit Student" : "Create a Student Account"}
        badge={editingId ? { label: "Cancel edit", onPress: reset } : undefined}
      >
        <Field colors={colors} label="Full name" value={name} onChangeText={setName} placeholder="e.g. Riya Patel" />
        <Field colors={colors} label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Field colors={colors} label="Phone" value={phone} onChangeText={setPhone} placeholder="+91 ..." />
        <View>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Level</Text>
          <ChipRow
            colors={colors}
            options={STUDENT_LEVELS}
            value={level}
            onChange={setLevel}
          />
        </View>
        <View>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Password</Text>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-end" }}>
            <View style={{ flex: 1 }}>
              <Field colors={colors} label="" value={password} onChangeText={setPassword} placeholder="Min 6 characters" />
            </View>
            <Pressable
              onPress={() => setPassword(generatePwd())}
              style={[
                styles.generateBtn,
                { backgroundColor: colors.secondary, borderColor: colors.border },
              ]}
            >
              <Feather name="refresh-cw" size={14} color={colors.primary} />
              <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 11 }}>
                New
              </Text>
            </Pressable>
          </View>
        </View>
        <PrimaryButton
          label={editingId ? "Save Changes" : "Create Student Account"}
          icon={editingId ? "save" : "user-plus"}
          onPress={submit}
        />
      </FormCard>

      <Text style={[styles.section, { color: colors.foreground, marginTop: 8 }]}>
        All Students ({items.length})
      </Text>
      {items.length === 0 ? (
        <Text style={[styles.helper, { color: colors.mutedForeground, textAlign: "center" }]}>
          No students enrolled yet.
        </Text>
      ) : null}
      {items.map((s) => (
        <View key={s.id}>
          <View style={[{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 12, flexDirection: "row", alignItems: "center", gap: 10 }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 14 }}>{s.name}</Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 2 }}>
                {s.email} · {s.level}
              </Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => setAccessStudentId(accessStudentId === s.id ? null : s.id)}
              style={[styles.iconBtn, { backgroundColor: accessStudentId === s.id ? colors.primary + "22" : colors.secondary, borderColor: colors.border }]}
            >
              <Feather name="key" size={14} color={accessStudentId === s.id ? colors.primary : colors.mutedForeground} />
            </Pressable>
            <Pressable
              hitSlop={8}
              onPress={() => setEditingId(editingId === s.id ? null : s.id)}
              style={[styles.iconBtn, { backgroundColor: editingId === s.id ? colors.primary + "22" : colors.secondary, borderColor: colors.border }]}
            >
              <Feather name="edit-2" size={14} color={editingId === s.id ? colors.primary : colors.mutedForeground} />
            </Pressable>
            <Pressable
              hitSlop={8}
              onPress={() => onRemove(s.id)}
              style={[styles.iconBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            >
              <Feather name="trash-2" size={14} color="#EF4444" />
            </Pressable>
          </View>
          {accessStudentId === s.id ? (
            <CourseAccessPanel
              colors={colors}
              studentId={s.id}
              studentName={s.name}
              allCourses={allCourses}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}

/* ----------------- Course Access Panel (per student) ----------------- */

function CourseAccessPanel({
  colors,
  studentId,
  studentName,
  allCourses,
}: {
  colors: ReturnType<typeof useColors>;
  studentId: string;
  studentName: string;
  allCourses: any[];
}) {
  const [records, setRecords] = useState<CourseAccessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGetStudentCourseAccess(studentId);
      setRecords(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const getStatus = (courseId: string) =>
    records.find((r) => r.courseId === courseId)?.status ?? null;

  const setAccess = async (courseId: string, status: "granted" | "blocked" | null) => {
    setSaving(courseId);
    try {
      if (status === null) {
        await apiRemoveCourseAccess(studentId, courseId);
        setRecords((r) => r.filter((x) => x.courseId !== courseId));
      } else {
        await apiSetCourseAccess(studentId, courseId, status);
        setRecords((r) => {
          const existing = r.find((x) => x.courseId === courseId);
          if (existing) return r.map((x) => x.courseId === courseId ? { ...x, status } : x);
          return [...r, { id: "", studentId, courseId, status, updatedAt: "" }];
        });
      }
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to update access");
    } finally {
      setSaving(null);
    }
  };

  return (
    <View style={[{ backgroundColor: colors.secondary, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 4, gap: 8 }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <Feather name="key" size={13} color={colors.primary} />
        <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 12 }}>
          Course Access — {studentName}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        allCourses.map((course) => {
          const status = getStatus(course.id);
          const isSaving = saving === course.id;
          return (
            <View
              key={course.id}
              style={[{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 10, flexDirection: "row", alignItems: "center", gap: 8 }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>{course.title}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 10 }}>₹{course.price}</Text>
                  {status === "granted" ? (
                    <View style={{ backgroundColor: "#22c55e22", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ color: "#22c55e", fontFamily: "Inter_700Bold", fontSize: 9 }}>GRANTED</Text>
                    </View>
                  ) : status === "blocked" ? (
                    <View style={{ backgroundColor: "#ef444422", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ color: "#ef4444", fontFamily: "Inter_700Bold", fontSize: 9 }}>BLOCKED</Text>
                    </View>
                  ) : (
                    <View style={{ backgroundColor: colors.border + "66", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_700Bold", fontSize: 9 }}>DEFAULT</Text>
                    </View>
                  )}
                </View>
              </View>
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <Pressable
                    onPress={() => setAccess(course.id, status === "granted" ? null : "granted")}
                    style={[styles.accessBtn, { backgroundColor: status === "granted" ? "#22c55e33" : colors.card, borderColor: status === "granted" ? "#22c55e" : colors.border }]}
                  >
                    <Feather name="check" size={12} color={status === "granted" ? "#22c55e" : colors.mutedForeground} />
                  </Pressable>
                  <Pressable
                    onPress={() => setAccess(course.id, status === "blocked" ? null : "blocked")}
                    style={[styles.accessBtn, { backgroundColor: status === "blocked" ? "#ef444433" : colors.card, borderColor: status === "blocked" ? "#ef4444" : colors.border }]}
                  >
                    <Feather name="x" size={12} color={status === "blocked" ? "#ef4444" : colors.mutedForeground} />
                  </Pressable>
                </View>
              )}
            </View>
          );
        })
      )}
      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 10, marginTop: 4 }}>
        ✓ Grant = student can access · ✗ Block = student is denied · Default = normal rules apply
      </Text>
    </View>
  );
}

/* ----------------- App Settings Panel ----------------- */

const COLOR_PRESETS = [
  { label: "Galaxy Blue", primary: "#5B8CFF", accent: "#8B5CF6" },
  { label: "Nebula Purple", primary: "#8B5CF6", accent: "#5B8CFF" },
  { label: "Sunset", primary: "#FF7849", accent: "#F472B6" },
  { label: "Forest", primary: "#22C55E", accent: "#14B8A6" },
  { label: "Crimson", primary: "#EF4444", accent: "#F59E0B" },
  { label: "Monochrome", primary: "#94A3B8", accent: "#64748B" },
];

function SettingsPanel({ colors }: { colors: ReturnType<typeof useColors> }) {
  const { state, updateSettings, resetSettings, updateAdminCredentials, resetAdminCredentials } =
    useApp();
  const s = state.appSettings;
  const creds = state.adminCredentials;

  // Admin credential editor (separate save flow so password isn't lost on tab switch)
  const [adminEmail, setAdminEmail] = useState(creds.email);
  const [adminPwd, setAdminPwd] = useState("");
  const [currentPwd, setCurrentPwd] = useState("");
  const [showAdminPwd, setShowAdminPwd] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);

  useEffect(() => {
    setAdminEmail(creds.email);
  }, [creds.email]);

  const [savingCreds, setSavingCreds] = useState(false);

  const saveAdminCreds = async () => {
    if (!adminEmail.trim() || !adminEmail.includes("@")) {
      Alert.alert("Enter a valid admin email");
      return;
    }
    if (!currentPwd) {
      Alert.alert("Current password required", "Enter your current admin password to confirm the change.");
      return;
    }
    if (adminPwd && adminPwd.length < 6) {
      Alert.alert("New password must be at least 6 characters");
      return;
    }
    setSavingCreds(true);
    try {
      await updateAdminCredentials({
        email: adminEmail.trim().toLowerCase(),
        password: adminPwd || undefined,
        currentPassword: currentPwd,
      });
      setCurrentPwd("");
      setAdminPwd("");
      Alert.alert("Updated", "Admin login updated. Use the new credentials next time you sign in.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to update credentials";
      Alert.alert("Error", msg);
    } finally {
      setSavingCreds(false);
    }
  };

  const confirmResetAdmin = () => {
    Alert.alert("Reset admin login?", "Restore founder login to the original default credentials (zafar@cosmos.in / Cosmos@2026).", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          resetAdminCredentials()
            .then(() => Alert.alert("Reset", "Admin login restored to defaults."))
            .catch(() => Alert.alert("Error", "Could not reset credentials."));
        },
      },
    ]);
  };

  const [appName, setAppName] = useState(s.appName);
  const [tagline, setTagline] = useState(s.tagline);
  const [founderName, setFounderName] = useState(s.founderName);
  const [founderRole, setFounderRole] = useState(s.founderRole);
  const [founderBio, setFounderBio] = useState(s.founderBio);
  const [primary, setPrimary] = useState(s.primaryColor);
  const [accent, setAccent] = useState(s.accentColor);
  const [free, setFree] = useState(String(s.pricing.free));
  const [pro, setPro] = useState(String(s.pricing.pro));
  const [lifetime, setLifetime] = useState(String(s.pricing.lifetime));

  useEffect(() => {
    setAppName(s.appName);
    setTagline(s.tagline);
    setFounderName(s.founderName);
    setFounderRole(s.founderRole);
    setFounderBio(s.founderBio);
    setPrimary(s.primaryColor);
    setAccent(s.accentColor);
    setFree(String(s.pricing.free));
    setPro(String(s.pricing.pro));
    setLifetime(String(s.pricing.lifetime));
  }, [s]);

  const save = () => {
    const partial: Partial<AppSettings> = {
      appName: appName.trim() || s.appName,
      tagline: tagline.trim() || s.tagline,
      founderName: founderName.trim() || s.founderName,
      founderRole: founderRole.trim() || s.founderRole,
      founderBio: founderBio.trim() || s.founderBio,
      primaryColor: primary,
      accentColor: accent,
      pricing: {
        free: parseInt(free, 10) || 0,
        pro: parseInt(pro, 10) || 0,
        lifetime: parseInt(lifetime, 10) || 0,
      },
    };
    updateSettings(partial);
    Alert.alert("Saved", "App settings updated. Changes are applied across the app.");
  };

  const confirmReset = () => {
    Alert.alert("Reset settings", "Restore all branding and pricing to defaults?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: resetSettings },
    ]);
  };

  return (
    <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 12 }}>
      <FormCard colors={colors} title="Brand & Identity">
        <Field colors={colors} label="App name" value={appName} onChangeText={setAppName} />
        <Field colors={colors} label="Tagline" value={tagline} onChangeText={setTagline} />
      </FormCard>

      <FormCard colors={colors} title="Founder Profile">
        <Field colors={colors} label="Founder name" value={founderName} onChangeText={setFounderName} />
        <Field colors={colors} label="Role / Title" value={founderRole} onChangeText={setFounderRole} />
        <Field
          colors={colors}
          label="Bio / Mission"
          value={founderBio}
          onChangeText={setFounderBio}
          multiline
        />
      </FormCard>

      <FormCard colors={colors} title="Theme Colors">
        <View>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Color preset</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {COLOR_PRESETS.map((p) => {
              const active = p.primary === primary && p.accent === accent;
              return (
                <Pressable
                  key={p.label}
                  onPress={() => {
                    setPrimary(p.primary);
                    setAccent(p.accent);
                  }}
                  style={[
                    styles.preset,
                    {
                      backgroundColor: active ? colors.secondary : "transparent",
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.swatch, { backgroundColor: p.primary }]} />
                  <View style={[styles.swatch, { backgroundColor: p.accent, marginLeft: -8 }]} />
                  <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 11 }}>
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <Field colors={colors} label="Primary color (hex)" value={primary} onChangeText={setPrimary} placeholder="#5B8CFF" />
        <Field colors={colors} label="Accent color (hex)" value={accent} onChangeText={setAccent} placeholder="#8B5CF6" />
        <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
          <View style={[styles.colorPreview, { backgroundColor: primary, flex: 1 }]}>
            <Text style={styles.colorPreviewText}>Primary</Text>
          </View>
          <View style={[styles.colorPreview, { backgroundColor: accent, flex: 1 }]}>
            <Text style={styles.colorPreviewText}>Accent</Text>
          </View>
        </View>
      </FormCard>

      <FormCard colors={colors} title="Admin Login (Founder Credentials)">
        <Text style={[styles.helper, { color: colors.mutedForeground }]}>
          Change the email and password used to sign in to the Founder Dashboard.
        </Text>
        <Field colors={colors} label="New admin email" value={adminEmail} onChangeText={setAdminEmail} keyboardType="email-address" />
        <View>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>New password (leave blank to keep current)</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: colors.muted,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 12,
              height: 46,
            }}
          >
            <TextInput
              value={adminPwd}
              onChangeText={setAdminPwd}
              placeholder="Min 6 characters"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showAdminPwd}
              autoCapitalize="none"
              style={{
                flex: 1,
                color: colors.foreground,
                fontFamily: "Inter_500Medium",
                fontSize: 14,
              }}
            />
            <Pressable onPress={() => setShowAdminPwd((v) => !v)} hitSlop={8}>
              <Feather
                name={showAdminPwd ? "eye-off" : "eye"}
                size={16}
                color={colors.mutedForeground}
              />
            </Pressable>
          </View>
        </View>
        <View>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Current password (required to save)</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: colors.muted,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 12,
              height: 46,
            }}
          >
            <TextInput
              value={currentPwd}
              onChangeText={setCurrentPwd}
              placeholder="Your current admin password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showCurrentPwd}
              autoCapitalize="none"
              style={{
                flex: 1,
                color: colors.foreground,
                fontFamily: "Inter_500Medium",
                fontSize: 14,
              }}
            />
            <Pressable onPress={() => setShowCurrentPwd((v) => !v)} hitSlop={8}>
              <Feather
                name={showCurrentPwd ? "eye-off" : "eye"}
                size={16}
                color={colors.mutedForeground}
              />
            </Pressable>
          </View>
        </View>
        <PrimaryButton label={savingCreds ? "Saving…" : "Update Admin Login"} icon="shield" onPress={saveAdminCreds} />
        <Pressable onPress={confirmResetAdmin} style={{ alignSelf: "center", paddingVertical: 6 }}>
          <Text style={{ color: colors.destructive, fontFamily: "Inter_700Bold", fontSize: 11 }}>
            Reset admin login to default
          </Text>
        </Pressable>
      </FormCard>

      <FormCard colors={colors} title="Subscription Pricing (₹)">
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field colors={colors} label="Free" value={free} onChangeText={setFree} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Field colors={colors} label="Pro / month" value={pro} onChangeText={setPro} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Field colors={colors} label="Lifetime" value={lifetime} onChangeText={setLifetime} keyboardType="number-pad" />
          </View>
        </View>
      </FormCard>

      <ExportImportCard colors={colors} />

      <PrimaryButton label="Save All Settings" icon="save" onPress={save} />
      <Pressable onPress={confirmReset} style={{ alignSelf: "center", paddingVertical: 8 }}>
        <Text style={{ color: colors.destructive, fontFamily: "Inter_700Bold", fontSize: 12 }}>
          Reset to defaults
        </Text>
      </Pressable>
    </View>
  );
}

/* ----------------- Export / Import Card ----------------- */

const TYPE_SUMMARY_LABELS: Record<string, string> = {
  liveClass: "Live Classes",
  resource: "Notes / Resources",
  course: "Courses",
  quiz: "Quizzes",
  notification: "Notifications",
};

function ExportImportCard({ colors }: { colors: ReturnType<typeof useColors> }) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<ExportBundle | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const bundle = await apiExportContent();
      const json = JSON.stringify(bundle, null, 2);
      await Share.share({
        message: json,
        title: `cosmos-backup-${new Date().toISOString().slice(0, 10)}.json`,
      });
    } catch (e) {
      if (e instanceof Error && e.message !== "The user did not share") {
        Alert.alert("Export failed", e.message);
      }
    } finally {
      setExporting(false);
    }
  };

  const readFileUri = (uri: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", uri, true);
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => reject(new Error("Could not read the selected file"));
      xhr.send();
    });

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const uri = result.assets[0]!.uri;
      const raw = await readFileUri(uri);
      let parsed: ExportBundle;
      try {
        parsed = JSON.parse(raw) as ExportBundle;
      } catch {
        Alert.alert("Invalid file", "The selected file is not valid JSON.");
        return;
      }
      if (!Array.isArray(parsed.items)) {
        Alert.alert("Invalid backup", "The file does not look like a Cosmos backup (missing items array).");
        return;
      }
      setPreview(parsed);
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not read file");
    }
  };

  const handleConfirmImport = async () => {
    if (!preview) return;
    setConfirming(true);
    try {
      const result = await apiImportContent({ items: preview.items });
      setPreview(null);
      Alert.alert(
        "Import complete",
        `${result.imported} item${result.imported !== 1 ? "s" : ""} imported${result.skipped > 0 ? `, ${result.skipped} skipped (missing type/action)` : ""}.\n\nReload the app to see all changes.`,
      );
    } catch (e) {
      Alert.alert("Import failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setConfirming(false);
    }
  };

  // Count items by type in the preview bundle
  const typeSummary = preview
    ? preview.items.reduce<Record<string, number>>((acc, item) => {
        acc[item.type] = (acc[item.type] ?? 0) + 1;
        return acc;
      }, {})
    : {};

  return (
    <>
      <FormCard colors={colors} title="Backup & Restore">
        <Text style={[styles.helper, { color: colors.mutedForeground }]}>
          Export all your custom classes, notes, quizzes, and courses to a JSON file. Import a backup to restore them.
        </Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={handleExport}
            disabled={exporting}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.primary,
              backgroundColor: `${colors.primary}18`,
              opacity: exporting ? 0.6 : 1,
            }}
          >
            {exporting
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Feather name="download" size={15} color={colors.primary} />
            }
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: colors.primary }}>
              {exporting ? "Exporting…" : "Export"}
            </Text>
          </Pressable>

          <Pressable
            onPress={handlePickFile}
            disabled={importing}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.muted,
              opacity: importing ? 0.6 : 1,
            }}
          >
            <Feather name="upload" size={15} color={colors.foreground} />
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: colors.foreground }}>
              Import
            </Text>
          </Pressable>
        </View>
      </FormCard>

      {/* Import preview modal */}
      {preview ? (
        <View
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
            zIndex: 999,
          }}
        >
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 24,
            width: "100%",
            gap: 14,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{
                width: 36, height: 36, borderRadius: 12,
                backgroundColor: `${colors.primary}22`,
                alignItems: "center", justifyContent: "center",
              }}>
                <Feather name="package" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Inter_700Bold", fontSize: 16, color: colors.foreground }}>
                  Import Backup
                </Text>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground }}>
                  {preview.appName} · {preview.exportedAt}
                </Text>
              </View>
            </View>

            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.mutedForeground }}>
              {preview.itemCount ?? preview.items.length} item{(preview.itemCount ?? preview.items.length) !== 1 ? "s" : ""} will be added:
            </Text>

            <View style={{ gap: 6 }}>
              {Object.entries(typeSummary).map(([type, count]) => (
                <View key={type} style={{
                  flexDirection: "row", alignItems: "center", gap: 8,
                  paddingHorizontal: 12, paddingVertical: 8,
                  borderRadius: 10, backgroundColor: colors.muted,
                }}>
                  <Feather
                    name={({ liveClass: "radio", resource: "file-text", course: "book-open", quiz: "award", notification: "bell" } as Record<string, React.ComponentProps<typeof Feather>["name"]>)[type] ?? "circle"}
                    size={13}
                    color={colors.primary}
                  />
                  <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.foreground, flex: 1 }}>
                    {TYPE_SUMMARY_LABELS[type] ?? type}
                  </Text>
                  <Text style={{ fontFamily: "Inter_700Bold", fontSize: 12, color: colors.primary }}>
                    {count}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground }}>
              These items will be added alongside your existing content. Nothing will be deleted.
            </Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => setPreview(null)}
                style={{
                  flex: 1, paddingVertical: 12, borderRadius: 12,
                  borderWidth: 1, borderColor: colors.border,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: colors.mutedForeground }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmImport}
                disabled={confirming}
                style={{
                  flex: 1, paddingVertical: 12, borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: "center", justifyContent: "center",
                  flexDirection: "row", gap: 6,
                  opacity: confirming ? 0.6 : 1,
                }}
              >
                {confirming
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Feather name="check" size={14} color="#fff" />
                }
                <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: "#fff" }}>
                  {confirming ? "Importing…" : "Import All"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </>
  );
}

/* ----------------- Courses Panel (with edit) ----------------- */

function CoursesPanel({
  colors,
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  colors: ReturnType<typeof useColors>;
  items: any[];
  onAdd: (c: any) => void;
  onUpdate: (id: string, partial: any) => void;
  onRemove: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lockedCourseIds, setLockedCourseIds] = useState<string[]>([]);
  const [lockSaving, setLockSaving] = useState<string | null>(null);

  useEffect(() => {
    apiGetLockedCourses().then((r) => setLockedCourseIds(r.lockedCourseIds)).catch(() => {});
  }, []);

  const toggleLock = async (courseId: string) => {
    const isLocked = lockedCourseIds.includes(courseId);
    setLockSaving(courseId);
    try {
      if (isLocked) {
        await apiRemoveCourseAccess("__locked__", courseId);
        setLockedCourseIds((ids) => ids.filter((id) => id !== courseId));
      } else {
        await apiSetCourseAccess("__locked__", courseId, "locked");
        setLockedCourseIds((ids) => [...ids, courseId]);
      }
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to update lock");
    } finally {
      setLockSaving(null);
    }
  };
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [level, setLevel] = useState("JEE/NEET");
  const [price, setPrice] = useState("999");
  const [description, setDescription] = useState("");
  const [youtubePlaylistUrl, setYoutubePlaylistUrl] = useState("");

  useEffect(() => {
    if (!editingId) return;
    const item = items.find((i) => i.id === editingId);
    if (!item) return;
    setTitle(item.title);
    setSubtitle(item.subtitle);
    setLevel(item.level);
    setPrice(String(item.price));
    setDescription(item.description);
    setYoutubePlaylistUrl(item.youtubePlaylistUrl ?? "");
  }, [editingId, items]);

  const reset = () => {
    setEditingId(null);
    setTitle("");
    setSubtitle("");
    setLevel("JEE/NEET");
    setPrice("999");
    setDescription("");
    setYoutubePlaylistUrl("");
  };

  const submit = () => {
    if (!title.trim() || !subtitle.trim()) {
      Alert.alert("Add a title and subtitle to continue");
      return;
    }
    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      level,
      price: parseInt(price, 10) || 0,
      description: description.trim() || `${title.trim()} — added by founder.`,
      youtubePlaylistUrl: youtubePlaylistUrl.trim() || undefined,
    };
    if (editingId) {
      onUpdate(editingId, payload);
    } else {
      onAdd({
        ...payload,
        icon: "activity",
        gradient: DEFAULT_GRADIENT,
        rating: 4.8,
        students: 0,
        lessons: 0,
        hours: 0,
        chapters: [],
      });
    }
    reset();
  };

  return (
    <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 12 }}>
      <FormCard
        colors={colors}
        title={editingId ? "Edit Course" : "Add a New Course"}
        badge={editingId ? { label: "Cancel edit", onPress: reset } : undefined}
      >
        <Field colors={colors} label="Course title" value={title} onChangeText={setTitle} placeholder="e.g. Advanced Mechanics" />
        <Field colors={colors} label="Subtitle" value={subtitle} onChangeText={setSubtitle} placeholder="e.g. JEE Advanced level" />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 2 }}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Level</Text>
            <ChipRow
              colors={colors}
              options={["Class 9-10", "Class 11-12", "JEE/NEET", "Engineering"] as const}
              value={level as any}
              onChange={(v) => setLevel(v)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field colors={colors} label="Price ₹" value={price} onChangeText={setPrice} keyboardType="number-pad" />
          </View>
        </View>
        <Field
          colors={colors}
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="What will students learn?"
        />
        <Field
          colors={colors}
          label="YouTube Playlist URL (optional)"
          value={youtubePlaylistUrl}
          onChangeText={setYoutubePlaylistUrl}
          placeholder="https://youtube.com/playlist?list=..."
        />
        <PrimaryButton
          label={editingId ? "Save Changes" : "Add Course"}
          icon={editingId ? "save" : "plus"}
          onPress={submit}
        />
      </FormCard>

      <Text style={[styles.section, { color: colors.foreground, marginTop: 8 }]}>
        All Courses ({items.length})
      </Text>
      {items.map((c) => {
        const isLocked = lockedCourseIds.includes(c.id);
        const isSavingLock = lockSaving === c.id;
        return (
          <View key={c.id} style={[{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 12, flexDirection: "row", alignItems: "center", gap: 8 }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 14 }}>{c.title}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 11 }}>{c.level} · ₹{c.price}</Text>
                {isLocked ? (
                  <View style={{ backgroundColor: "#f59e0b22", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ color: "#f59e0b", fontFamily: "Inter_700Bold", fontSize: 9 }}>PAID/LOCKED</Text>
                  </View>
                ) : null}
              </View>
            </View>
            {isSavingLock ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Pressable
                hitSlop={8}
                onPress={() => toggleLock(c.id)}
                style={[styles.iconBtn, { backgroundColor: isLocked ? "#f59e0b22" : colors.secondary, borderColor: isLocked ? "#f59e0b" : colors.border }]}
              >
                <Feather name={isLocked ? "lock" : "unlock"} size={14} color={isLocked ? "#f59e0b" : colors.mutedForeground} />
              </Pressable>
            )}
            <Pressable
              hitSlop={8}
              onPress={() => setEditingId(editingId === c.id ? null : c.id)}
              style={[styles.iconBtn, { backgroundColor: editingId === c.id ? colors.primary + "22" : colors.secondary, borderColor: colors.border }]}
            >
              <Feather name="edit-2" size={14} color={editingId === c.id ? colors.primary : colors.mutedForeground} />
            </Pressable>
            <Pressable
              hitSlop={8}
              onPress={() => onRemove(c.id)}
              style={[styles.iconBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            >
              <Feather name="trash-2" size={14} color="#EF4444" />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

/* ----------------- Notifications Panel (with edit) ----------------- */

function NotificationsPanel({ colors }: { colors: ReturnType<typeof useColors> }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<"live" | "exam" | "result" | "info">("info");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<import("@/lib/apiClient").AnnouncementRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const data = await apiGetAnnouncements();
      setHistory(data);
    } catch {
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const TYPE_COLORS: Record<string, string> = {
    live: "#FF5470", exam: "#FACC15", result: "#34D399", info: "#5B8CFF",
  };

  const sendAnnouncement = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Fill in both title and message");
      return;
    }
    setSending(true);
    try {
      const res = await apiAnnounce(title.trim(), body.trim(), type);
      setHistory((h) => [res.announcement, ...h]);
      setTitle("");
      setBody("");
      setType("info");
      if (res.pushTotal === 0) {
        Alert.alert(
          "Announcement saved",
          "No devices have push enabled yet — students will see it in the Notifications tab when they open the app.",
        );
      } else {
        Alert.alert(
          "Sent!",
          `Announcement posted and push sent to ${res.pushSent} of ${res.pushTotal} registered devices.`,
        );
      }
    } catch (err: unknown) {
      Alert.alert("Failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 12 }}>
      <FormCard colors={colors} title="Send Announcement">
        <Field
          colors={colors}
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Live Class Starting Soon"
        />
        <Field
          colors={colors}
          label="Message"
          value={body}
          onChangeText={setBody}
          multiline
          placeholder="Write your message to students…"
        />
        <View>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Type</Text>
          <ChipRow
            colors={colors}
            options={["live", "exam", "result", "info"] as const}
            value={type}
            onChange={setType}
            capitalize
          />
        </View>

        <Pressable
          onPress={sendAnnouncement}
          disabled={sending}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            height: 50,
            borderRadius: 14,
            backgroundColor: sending ? "rgba(139,92,246,0.35)" : "#8B5CF6",
          }}
        >
          {sending
            ? <ActivityIndicator size="small" color="#fff" />
            : <Feather name="send" size={15} color="#fff" />}
          <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 15 }}>
            {sending ? "Sending…" : "Send to All Students"}
          </Text>
        </Pressable>

        <Text style={[styles.helper, { color: colors.mutedForeground, textAlign: "center" }]}>
          Saves to the in-app feed and sends a push notification to all registered devices
        </Text>
      </FormCard>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <Text style={[styles.section, { color: colors.foreground }]}>
          Sent Announcements
        </Text>
        {loadingHistory
          ? <ActivityIndicator size="small" color="#5B8CFF" />
          : <Text style={[styles.helper, { color: colors.mutedForeground }]}>{history.length} total</Text>}
      </View>

      {!loadingHistory && history.length === 0 && (
        <View style={{ alignItems: "center", paddingVertical: 28 }}>
          <Feather name="bell-off" size={22} color={colors.mutedForeground} />
          <Text style={[styles.helper, { color: colors.mutedForeground, marginTop: 8 }]}>
            No announcements sent yet
          </Text>
        </View>
      )}

      {history.map((n) => {
        const c = TYPE_COLORS[n.type] ?? "#5B8CFF";
        const date = new Date(n.sentAt).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
        });
        return (
          <View
            key={n.id}
            style={[
              {
                flexDirection: "row",
                gap: 12,
                padding: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderLeftWidth: 3,
                borderLeftColor: c,
              },
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ backgroundColor: c + "22", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10, color: c, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {n.type}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.helper, { color: colors.mutedForeground }]}>{date}</Text>
              </View>
              <Text style={[{ fontFamily: "Inter_700Bold", fontSize: 13, marginTop: 6 }, { color: colors.foreground }]}>
                {n.title}
              </Text>
              <Text style={[{ fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 3, lineHeight: 17 }, { color: colors.mutedForeground }]}>
                {n.body}
              </Text>
              {n.pushTotal > 0 && (
                <Text style={[styles.helper, { color: colors.mutedForeground, marginTop: 4 }]}>
                  Push: {n.pushSent}/{n.pushTotal} devices
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/* ----------------- Teachers Panel (with edit) ----------------- */

function TeachersPanel({
  colors,
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  colors: ReturnType<typeof useColors>;
  items: any[];
  onAdd: (t: any) => void;
  onUpdate: (id: string, partial: any) => void;
  onRemove: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Mechanics");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!editingId) return;
    const item = items.find((i) => i.id === editingId);
    if (!item) return;
    setName(item.name);
    setEmail(item.email);
    setSubject(item.subject);
    setPassword(item.password);
  }, [editingId, items]);

  const reset = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setSubject("Mechanics");
    setPassword("");
  };

  const generatePwd = () => "Cosmos@" + Math.floor(1000 + Math.random() * 9000).toString();

  const submit = () => {
    if (!name.trim() || !email.trim() || !email.includes("@")) {
      Alert.alert("Add the teacher's name and a valid email");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password must be at least 6 characters");
      return;
    }
    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim() || "Physics",
      password,
    };
    if (editingId) {
      onUpdate(editingId, payload);
      Alert.alert("Updated", `${name.trim()}'s details have been updated.`);
    } else {
      onAdd(payload);
      Alert.alert(
        "Teacher added",
        `${name.trim()} can sign in with:\n\nEmail: ${email.trim().toLowerCase()}\nPassword: ${password}`,
      );
    }
    reset();
  };

  return (
    <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 12 }}>
      <FormCard
        colors={colors}
        title={editingId ? "Edit Teacher" : "Invite a New Teacher"}
        badge={editingId ? { label: "Cancel edit", onPress: reset } : undefined}
      >
        <Field colors={colors} label="Full name" value={name} onChangeText={setName} placeholder="e.g. Dr. Priya Verma" />
        <Field colors={colors} label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Field colors={colors} label="Subject" value={subject} onChangeText={setSubject} />
        <View>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Password</Text>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-end" }}>
            <View style={{ flex: 1 }}>
              <Field colors={colors} label="" value={password} onChangeText={setPassword} placeholder="Min 6 characters" />
            </View>
            <Pressable
              onPress={() => setPassword(generatePwd())}
              style={[
                styles.generateBtn,
                { backgroundColor: colors.secondary, borderColor: colors.border },
              ]}
            >
              <Feather name="refresh-cw" size={14} color={colors.primary} />
              <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 11 }}>
                New
              </Text>
            </Pressable>
          </View>
        </View>
        <PrimaryButton
          label={editingId ? "Save Changes" : "Create Teacher Account"}
          icon={editingId ? "save" : "user-plus"}
          onPress={submit}
        />
      </FormCard>

      <Text style={[styles.section, { color: colors.foreground, marginTop: 8 }]}>
        All Teachers ({items.length})
      </Text>
      {items.length === 0 ? (
        <Text style={[styles.helper, { color: colors.mutedForeground, textAlign: "center" }]}>
          No teachers added yet.
        </Text>
      ) : null}
      {items.map((t) => (
        <ItemRow
          key={t.id}
          colors={colors}
          title={t.name}
          subtitle={`${t.email} · ${t.subject} · joined ${t.joinDate}`}
          isEditing={editingId === t.id}
          onEdit={() => setEditingId(editingId === t.id ? null : t.id)}
          onRemove={() => onRemove(t.id)}
        />
      ))}
    </View>
  );
}

/* ----------------- History Panel ----------------- */

const TYPE_COLORS: Record<string, string> = {
  liveClass: "#5B8CFF",
  resource: "#10B981",
  course: "#F59E0B",
  quiz: "#EF4444",
  notification: "#8B5CF6",
};

const TYPE_LABELS: Record<string, string> = {
  liveClass: "Live Class",
  resource: "Note / Resource",
  course: "Course",
  quiz: "Quiz",
  notification: "Notification",
};

const TYPE_ICONS: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  liveClass: "radio",
  resource: "file-text",
  course: "book-open",
  quiz: "award",
  notification: "bell",
};

/* ─────────────── Doubts Inbox Panel ─────────────── */

function timeSince(isoStr: string) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function DoubtsInboxPanel({
  colors,
  role,
}: {
  colors: ReturnType<typeof useColors>;
  role: "teacher" | "admin";
}) {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "answered">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await apiGetDoubts(role);
      setDoubts(rows);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const filtered = doubts.filter((d) =>
    filter === "all" ? true : d.status === filter,
  );

  const sendReply = async (doubtId: string) => {
    const t = (replyText[doubtId] ?? "").trim();
    if (!t) return;
    setReplyingId(doubtId);
    try {
      await apiReplyToDoubt(doubtId, t, role);
      setReplyText((p) => ({ ...p, [doubtId]: "" }));
      await load();
    } catch { Alert.alert("Error", "Could not send reply"); }
    finally { setReplyingId(null); }
  };

  const toggleStatus = async (d: Doubt) => {
    setActioningId(d.id);
    try {
      if (d.status === "open") await apiSolveDoubt(d.id, role);
      else await apiReopenDoubt(d.id, role);
      await load();
    } catch { Alert.alert("Error", "Could not update status"); }
    finally { setActioningId(null); }
  };

  return (
    <View style={{ marginTop: 16 }}>
      {/* Filter chips */}
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 12 }}>
        {(["all", "open", "answered"] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              {
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1,
                backgroundColor: filter === f ? colors.primary + "22" : colors.card,
                borderColor: filter === f ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={{
              fontFamily: "Inter_700Bold", fontSize: 11,
              color: filter === f ? colors.primary : colors.mutedForeground,
              textTransform: "capitalize",
            }}>
              {f === "all" ? `All (${doubts.length})` : f === "open" ? `Open (${doubts.filter((d) => d.status === "open").length})` : `Answered (${doubts.filter((d) => d.status === "answered").length})`}
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
            No doubts here
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 80 }}>
          {filtered.map((d) => {
            const isExpanded = expandedId === d.id;
            const answered = d.status === "answered";
            return (
              <View
                key={d.id}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: answered ? "#10B98144" : colors.border,
                  padding: 14,
                }}
              >
                {/* Card head */}
                <Pressable
                  onPress={() => setExpandedId(isExpanded ? null : d.id)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}
                >
                  <View style={{
                    backgroundColor: answered ? "#10B98122" : "#FACC1522",
                    flexDirection: "row", alignItems: "center", gap: 4,
                    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
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
                    {/* Solve / Reopen button */}
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

                    {/* Replies */}
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

                    {/* Reply input */}
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

function HistoryPanel({ colors }: { colors: ReturnType<typeof useColors> }) {
  const [entries, setEntries] = useState<VersionHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await apiGetHistory();
      setEntries(rows);
    } catch {
      Alert.alert("Error", "Could not load version history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleRestore = useCallback(async (entry: VersionHistoryEntry) => {
    Alert.alert(
      "Restore this version?",
      `"${entry.label}" will replace the current content. The current state will be saved as a new history entry so you can undo.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: async () => {
            setRestoring(entry.id);
            try {
              await apiRestoreVersion(entry.id);
              Alert.alert("Restored", "The content has been restored. Reload the app to see changes.");
              await load();
            } catch {
              Alert.alert("Error", "Could not restore this version.");
            } finally {
              setRestoring(null);
            }
          },
        },
      ],
    );
  }, [load]);

  const allTypes = Array.from(new Set(entries.map((e) => e.type)));
  const filtered = filter === "all" ? entries : entries.filter((e) => e.type === filter);

  // Group by overrideId to show history per item
  const groups = filtered.reduce<Record<string, VersionHistoryEntry[]>>((acc, e) => {
    const key = e.overrideId;
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(e);
    return acc;
  }, {});

  const groupKeys = Object.keys(groups);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <Text style={[styles.section, { color: colors.foreground }]}>Version History</Text>
        <Pressable
          onPress={load}
          style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Feather name="refresh-cw" size={14} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <Text style={[styles.helper, { color: colors.mutedForeground, marginBottom: 16 }]}>
        Every time you edit a class, note, course, or quiz, the previous version is saved here. Tap "Restore" to roll back.
      </Text>

      {/* Type filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {["all", ...allTypes].map((t) => {
            const active = filter === t;
            const color = t === "all" ? colors.primary : (TYPE_COLORS[t] ?? colors.primary);
            return (
              <Pressable
                key={t}
                onPress={() => setFilter(t)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: active ? color : colors.border,
                  backgroundColor: active ? `${color}22` : colors.card,
                }}
              >
                {t !== "all" && (
                  <Feather name={TYPE_ICONS[t] ?? "clock"} size={11} color={active ? color : colors.mutedForeground} />
                )}
                <Text style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 11,
                  color: active ? color : colors.mutedForeground,
                }}>
                  {t === "all" ? "All Types" : (TYPE_LABELS[t] ?? t)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : groupKeys.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 60, gap: 12 }}>
          <Feather name="clock" size={36} color={colors.mutedForeground} />
          <Text style={[styles.section, { color: colors.mutedForeground, fontSize: 14 }]}>No history yet</Text>
          <Text style={[styles.helper, { color: colors.mutedForeground, textAlign: "center" }]}>
            Edit a live class, note, course, or quiz to start tracking versions.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {groupKeys.map((overrideId) => {
            const group = groups[overrideId]!;
            const latest = group[0]!;
            const typeColor = TYPE_COLORS[latest.type] ?? colors.primary;
            const typeLabel = TYPE_LABELS[latest.type] ?? latest.type;
            const typeIcon = TYPE_ICONS[latest.type] ?? "clock";
            const title = (latest.data["title"] as string | undefined) ?? "Untitled";
            const isOpen = expanded === overrideId;

            return (
              <View
                key={overrideId}
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: isOpen ? `${typeColor}55` : colors.border,
                  backgroundColor: colors.card,
                  overflow: "hidden",
                }}
              >
                {/* Group header */}
                <Pressable
                  onPress={() => setExpanded(isOpen ? null : overrideId)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 14,
                    gap: 10,
                  }}
                >
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: `${typeColor}22`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Feather name={typeIcon} size={15} color={typeColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: colors.foreground }} numberOfLines={1}>
                      {title}
                    </Text>
                    <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground, marginTop: 1 }}>
                      {typeLabel} · {group.length} version{group.length !== 1 ? "s" : ""}
                    </Text>
                  </View>
                  <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
                </Pressable>

                {/* Version list */}
                {isOpen && (
                  <View style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                    {group.map((entry, idx) => {
                      const isRestoring = restoring === entry.id;
                      const entryData = entry.data;
                      const desc = [
                        entryData["meetUrl"] as string | undefined,
                        entryData["driveUrl"] as string | undefined,
                        entryData["description"] as string | undefined,
                      ].find(Boolean);

                      return (
                        <View
                          key={entry.id}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                            gap: 10,
                            borderTopWidth: idx > 0 ? 1 : 0,
                            borderTopColor: colors.border,
                            backgroundColor: idx === 0 ? `${typeColor}08` : "transparent",
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.foreground }}>
                              {entry.label}
                            </Text>
                            {desc ? (
                              <Text
                                style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground, marginTop: 2 }}
                                numberOfLines={1}
                              >
                                {desc}
                              </Text>
                            ) : null}
                          </View>
                          <Pressable
                            onPress={() => handleRestore(entry)}
                            disabled={isRestoring}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 4,
                              paddingHorizontal: 10,
                              paddingVertical: 6,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: typeColor,
                              backgroundColor: `${typeColor}18`,
                              opacity: isRestoring ? 0.5 : 1,
                            }}
                          >
                            {isRestoring
                              ? <ActivityIndicator size="small" color={typeColor} />
                              : <Feather name="rotate-ccw" size={12} color={typeColor} />
                            }
                            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 11, color: typeColor }}>
                              {isRestoring ? "Restoring…" : "Restore"}
                            </Text>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  h1Sub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  helper: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 6 },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  tab: {
    flexBasis: "30%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabLabel: { fontFamily: "Inter_700Bold", fontSize: 11 },
  homeBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  fieldLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  preset: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  swatch: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  colorPreview: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  colorPreviewText: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 12 },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
  },
  section: { fontFamily: "Inter_700Bold", fontSize: 16, letterSpacing: -0.3 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  accessBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
