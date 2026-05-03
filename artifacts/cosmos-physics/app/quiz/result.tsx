import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StarryBackground } from "@/components/StarryBackground";
import { useColors } from "@/hooks/useColors";

export default function QuizResult() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { score, total, title } = useLocalSearchParams<{
    score?: string;
    total?: string;
    title?: string;
  }>();
  const s = Number(score ?? 0);
  const t = Number(total ?? 0);
  const pct = t > 0 ? Math.round((s / t) * 100) : 0;

  const grade =
    pct >= 90
      ? { label: "Outstanding", color: "#34D399", icon: "award" as const }
      : pct >= 70
        ? { label: "Great Work", color: "#5B8CFF", icon: "trending-up" as const }
        : pct >= 50
          ? { label: "Keep Going", color: "#FACC15", icon: "target" as const }
          : { label: "Practice More", color: "#FF8A4C", icon: "rotate-ccw" as const };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StarryBackground />
      <View style={{ flex: 1, paddingTop: insets.top + 16, paddingHorizontal: 24 }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <View
            style={[
              styles.icon,
              { backgroundColor: grade.color + "26", borderColor: grade.color },
            ]}
          >
            <Feather name={grade.icon} size={40} color={grade.color} />
          </View>

          <Text style={[styles.gradeLabel, { color: grade.color }]}>{grade.label}</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>{title ?? "Quiz Complete"}</Text>

          <LinearGradient
            colors={["#5B8CFF", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreCard}
          >
            <Text style={styles.scoreLabel}>YOUR SCORE</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 8 }}>
              <Text style={styles.scoreBig}>{s}</Text>
              <Text style={styles.scoreSmall}>/ {t}</Text>
            </View>
            <Text style={styles.scorePct}>{pct}% accuracy</Text>
          </LinearGradient>

          <View style={styles.row}>
            <View style={[styles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="check-circle" size={16} color="#34D399" />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Correct</Text>
            </View>
            <View style={[styles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="x-circle" size={16} color="#FF5470" />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{Math.max(0, t - s)}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Wrong</Text>
            </View>
          </View>
        </View>

        <View style={{ paddingBottom: insets.bottom + 24, gap: 10 }}>
          <Pressable
            onPress={() => router.replace("/leaderboard" as never)}
            style={{ borderRadius: 14, overflow: "hidden" }}
          >
            <LinearGradient
              colors={["#5B8CFF", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cta}
            >
              <Feather name="trending-up" size={16} color="#FFFFFF" />
              <Text style={styles.ctaLabel}>View Leaderboard</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            onPress={() => router.replace("/(tabs)/quiz" as never)}
            style={[styles.outlineBtn, { borderColor: colors.border }]}
          >
            <Text style={[styles.outlineBtnLabel, { color: colors.foreground }]}>Back to Quizzes</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  gradeLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: 1.2,
    marginTop: 16,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    textAlign: "center",
    letterSpacing: -0.4,
    marginTop: 6,
  },
  scoreCard: {
    width: "100%",
    padding: 22,
    borderRadius: 22,
    alignItems: "center",
    marginTop: 24,
  },
  scoreLabel: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.4,
  },
  scoreBig: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 64, letterSpacing: -2 },
  scoreSmall: { color: "rgba(255,255,255,0.85)", fontFamily: "Inter_500Medium", fontSize: 22, marginLeft: 4 },
  scorePct: { color: "rgba(255,255,255,0.92)", fontFamily: "Inter_600SemiBold", fontSize: 13, marginTop: 6 },
  row: { flexDirection: "row", gap: 10, marginTop: 18, width: "100%" },
  stat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 20 },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 11 },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  ctaLabel: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 14 },
  outlineBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  outlineBtnLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
