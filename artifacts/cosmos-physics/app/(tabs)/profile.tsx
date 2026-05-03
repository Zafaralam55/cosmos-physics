import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AtomLogo } from "@/components/AtomLogo";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { useProgressFor } from "@/hooks/useProgressFor";

function EnrolledCourseRow({ c }: { c: import("@/data/courses").Course }) {
  const colors = useColors();
  const { done, total, pct, completed } = useProgressFor(c.id);
  return (
    <Pressable
      onPress={() => router.push(`/course/${c.id}` as never)}
      style={[styles.row, { backgroundColor: colors.card, borderColor: completed ? "#34D39944" : colors.border }]}
    >
      <LinearGradient colors={c.gradient} style={styles.rowIcon}>
        <Feather name={c.icon as never} size={18} color="#FFFFFF" />
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={[styles.rowTitle, { color: colors.foreground }]}>{c.title}</Text>
          {completed && <Text style={{ fontSize: 13 }}>🎓</Text>}
          {!completed && (
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, color: colors.primary }}>
              {pct}%
            </Text>
          )}
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: completed ? "#34D399" : colors.primary, width: `${pct}%` },
            ]}
          />
        </View>
        {total > 0 && (
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 10, color: colors.mutedForeground, marginTop: 3 }}>
            {done}/{total} chapters
          </Text>
        )}
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const { state, logout, allCourses } = useApp();
  const student = state.student;
  const courses = allCourses;

  if (!student) {
    return (
      <ScreenContainer scroll={false}>
        <View style={styles.signOutWrap}>
          <AtomLogo size={64} />
          <Text style={[styles.h1, { color: colors.foreground, marginTop: 16 }]}>Welcome</Text>
          <Text style={[styles.subtle, { color: colors.mutedForeground, marginTop: 4 }]}>
            Sign in to access your courses
          </Text>
          <Pressable
            onPress={() => router.push("/login" as never)}
            style={styles.signInBtn}
          >
            <Text style={styles.signInBtnLabel}>Sign In</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const enrolled = courses.filter((c) => state.enrolledCourses.includes(c.id));
  const totalScore = state.quizScores.reduce((a, b) => a + b.score, 0);
  const totalPossible = state.quizScores.reduce((a, b) => a + b.total, 0);
  const accuracy = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
  const progressItems = [
    { label: "Courses Enrolled", value: enrolled.length },
    { label: "Quizzes Taken", value: state.quizScores.length },
    { label: "Live Attended", value: state.attendance.length },
    { label: "Accuracy", value: `${accuracy}%` },
  ];

  return (
    <ScreenContainer>
      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <Text style={[styles.h1, { color: colors.foreground }]}>Profile</Text>
      </View>

      {/* Profile Card */}
      <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
        <LinearGradient
          colors={["#0E1430", "#1A2042"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.profileCard, { borderColor: colors.border }]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>{student.name}</Text>
            <Text style={[styles.profileMeta, { color: colors.mutedForeground }]}>
              {student.level}
            </Text>
            <View style={styles.tierBadge}>
              <Feather name="award" size={11} color="#FACC15" />
              <Text style={styles.tierText}>{state.subscriptionTier} Member</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Streak Banner */}
      <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
        <LinearGradient
          colors={["#1A1008", "#261508"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.streakCard, { borderColor: "#FF8A4C44" }]}
        >
          <View style={styles.streakLeft}>
            <Text style={styles.streakFire}>🔥</Text>
            <View>
              <Text style={styles.streakValue}>
                {state.streak.currentStreak > 0 ? `${state.streak.currentStreak} day streak` : "No active streak"}
              </Text>
              <Text style={[styles.streakSub, { color: colors.mutedForeground }]}>
                {state.streak.currentStreak > 0
                  ? "Keep it up — open the app daily!"
                  : "Open the app daily to build your streak"}
              </Text>
            </View>
          </View>
          <View style={styles.streakRight}>
            <Text style={styles.streakBestVal}>{state.streak.longestStreak}</Text>
            <Text style={[styles.streakBestLabel, { color: colors.mutedForeground }]}>best</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Progress grid */}
      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <View style={styles.grid}>
          {progressItems.map((it) => (
            <View
              key={it.label}
              style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.gridValue, { color: colors.primary }]}>{it.value}</Text>
              <Text style={[styles.gridLabel, { color: colors.mutedForeground }]}>{it.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Enrolled courses */}
      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <Text style={[styles.section, { color: colors.foreground }]}>My Learning</Text>
      </View>
      <View style={{ paddingHorizontal: 20, marginTop: 12, gap: 10 }}>
        {enrolled.length === 0 ? (
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Feather name="book-open" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No enrolled courses yet
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/courses" as never)}
              style={[styles.emptyBtn, { borderColor: colors.primary }]}
            >
              <Text style={[styles.emptyBtnLabel, { color: colors.primary }]}>Browse courses</Text>
            </Pressable>
          </View>
        ) : (
          enrolled.map((c) => <EnrolledCourseRow key={c.id} c={c} />)
        )}
      </View>

      {/* Menu */}
      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <Text style={[styles.section, { color: colors.foreground }]}>Account</Text>
      </View>
      <View style={{ paddingHorizontal: 20, marginTop: 12, gap: 8 }}>
        {[
          { icon: "edit-2" as const, label: "Edit Profile", to: "/edit-profile" },
          { icon: "credit-card" as const, label: "Plans & Billing", to: "/payment" },
          { icon: "file-text" as const, label: "Notes & PDFs", to: "/notes" },
          { icon: "help-circle" as const, label: "Doubt Solving", to: "/doubt" },
          { icon: "tool" as const, label: "Physics Tools", to: "/tools" },
          { icon: "user" as const, label: "About the Founder", to: "/founder" },
          { icon: "award" as const, label: "Teacher Sign In", to: "/teacher/login" },
          { icon: "shield" as const, label: "Founder Dashboard", to: "/admin" },
        ].map((m) => (
          <Pressable
            key={m.label}
            onPress={() => router.push(m.to as never)}
            style={[styles.menuRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.secondary }]}>
              <Feather name={m.icon} size={16} color={colors.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>{m.label}</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        ))}

        <Pressable
          onPress={() => {
            logout();
            router.push("/login" as never);
          }}
          style={[styles.menuRow, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.menuIcon, { backgroundColor: "rgba(255,84,112,0.16)" }]}>
            <Feather name="log-out" size={16} color={colors.destructive} />
          </View>
          <Text style={[styles.menuLabel, { color: colors.destructive }]}>Sign Out</Text>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: "Inter_700Bold", fontSize: 28, letterSpacing: -0.6 },
  subtle: { fontFamily: "Inter_400Regular", fontSize: 13 },
  signOutWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  signInBtn: {
    marginTop: 24,
    backgroundColor: "#5B8CFF",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
  },
  signInBtnLabel: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 14 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#5B8CFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 20 },
  profileName: { fontFamily: "Inter_700Bold", fontSize: 17 },
  profileMeta: { fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 2 },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(250,204,21,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  tierText: { color: "#FACC15", fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 0.4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridItem: {
    flex: 1,
    minWidth: "45%",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  gridValue: { fontFamily: "Inter_700Bold", fontSize: 22, letterSpacing: -0.4 },
  gridLabel: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 2 },
  section: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: -0.3 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, borderWidth: 1 },
  rowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    marginTop: 6,
    overflow: "hidden",
  },
  progressBar: { height: 4, borderRadius: 2 },
  empty: {
    alignItems: "center",
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 10,
  },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  emptyBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  emptyBtnLabel: { fontFamily: "Inter_700Bold", fontSize: 12 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  streakLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  streakFire: { fontSize: 32 },
  streakValue: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#FF8A4C", letterSpacing: -0.3 },
  streakSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  streakRight: { alignItems: "center", paddingLeft: 12 },
  streakBestVal: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#FF8A4C", letterSpacing: -0.5 },
  streakBestLabel: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 1 },
});
