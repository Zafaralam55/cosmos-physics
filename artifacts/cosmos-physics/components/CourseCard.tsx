import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Course } from "@/data/courses";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { useProgressFor } from "@/hooks/useProgressFor";

function ProgressBar({ courseId }: { courseId: string }) {
  const colors = useColors();
  const { state } = useApp();
  const enrolled = state.enrolledCourses.includes(courseId);
  const { pct, completed } = useProgressFor(courseId);

  if (!enrolled || !state.student) return null;

  return (
    <View style={s.progressWrap}>
      <View style={[s.progressTrack, { backgroundColor: colors.muted }]}>
        <View
          style={[
            s.progressFill,
            { width: `${pct}%`, backgroundColor: completed ? "#34D399" : colors.primary },
          ]}
        />
      </View>
      <Text style={[s.progressLabel, { color: colors.mutedForeground }]}>
        {completed ? "✓ Complete" : `${pct}%`}
      </Text>
    </View>
  );
}

export function CourseCard({ course, variant = "wide" }: { course: Course; variant?: "wide" | "list" }) {
  const colors = useColors();
  const isWide = variant === "wide";

  return (
    <Pressable
      onPress={() => router.push(`/course/${course.id}` as never)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          width: isWide ? 260 : "100%",
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <LinearGradient
        colors={course.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cover}
      >
        <View style={styles.coverOverlay}>
          <Feather name={course.icon as never} size={isWide ? 36 : 28} color="#FFFFFF" />
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{course.level}</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {course.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
          {course.subtitle}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="play-circle" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {course.lessons} lessons
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="star" size={12} color="#FACC15" />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {course.rating}
            </Text>
          </View>
        </View>

        <ProgressBar courseId={course.id} />
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  progressWrap: { marginTop: 8, gap: 4 },
  progressTrack: { height: 3, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 3, borderRadius: 2 },
  progressLabel: { fontFamily: "Inter_500Medium", fontSize: 10 },
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
  },
  cover: {
    height: 110,
    justifyContent: "space-between",
    padding: 14,
  },
  coverOverlay: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-end",
  },
  levelBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.4,
  },
  body: {
    padding: 14,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
});
