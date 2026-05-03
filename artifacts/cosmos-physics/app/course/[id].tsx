import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useApp, useCourse } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { useProgressFor } from "@/hooks/useProgressFor";
import { apiCheckCourseAccess } from "@/lib/apiClient";

export default function CourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { state, enrollCourse, addWatchHistory, markChapterComplete, unmarkChapterComplete } = useApp();
  const course = useCourse(id);
  const { done, total, pct, completed } = useProgressFor(id ?? "");

  const [accessInfo, setAccessInfo] = useState<{
    isLocked: boolean;
    isBlocked: boolean;
    hasGrant: boolean;
    canEnroll: boolean;
  } | null>(null);

  useEffect(() => {
    if (state.student && id) {
      apiCheckCourseAccess(id)
        .then(setAccessInfo)
        .catch(() => setAccessInfo(null));
    }
  }, [id, state.student]);

  if (!course) {
    return (
      <ScreenContainer scroll={false}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Feather name="alert-triangle" size={28} color={colors.mutedForeground} />
          <Text style={{ color: colors.foreground, marginTop: 8, fontFamily: "Inter_600SemiBold" }}>
            Course not found
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const enrolled = state.enrolledCourses.includes(course.id);
  const isLocked = accessInfo?.isLocked ?? false;
  const isBlocked = accessInfo?.isBlocked ?? false;
  const canEnroll = accessInfo?.canEnroll ?? true;

  const isChapterDone = (chapterId: string) =>
    state.courseProgress.some((p) => p.courseId === course.id && p.chapterId === chapterId);

  const toggleChapter = async (chapterId: string) => {
    if (!state.student) return;
    if (isChapterDone(chapterId)) {
      await unmarkChapterComplete(course.id, chapterId);
    } else {
      await markChapterComplete(course.id, chapterId);
    }
  };

  return (
    <ScreenContainer showStars>
      <View style={{ paddingHorizontal: 20 }}>
        <LinearGradient
          colors={course.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cover}
        >
          <View style={styles.coverInner}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{course.level}</Text>
            </View>
            {isLocked && !enrolled ? (
              <View style={styles.lockBadge}>
                <Feather name="lock" size={12} color="#f59e0b" />
                <Text style={styles.lockBadgeText}>APPROVAL REQUIRED</Text>
              </View>
            ) : null}
            <Feather name={course.icon as never} size={48} color="#FFFFFF" />
            <Text style={styles.coverTitle}>{course.title}</Text>
            <Text style={styles.coverSub}>{course.subtitle}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Progress bar — only for enrolled students */}
      {enrolled && state.student && total > 0 && (
        <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
          {completed ? (
            <LinearGradient
              colors={["#0A2010", "#112015"]}
              style={[styles.completionBanner, { borderColor: "#34D39955" }]}
            >
              <Text style={{ fontSize: 28 }}>🎓</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.completionTitle}>Course Complete!</Text>
                <Text style={[styles.completionSub, { color: colors.mutedForeground }]}>
                  You've finished all {total} chapters — excellent work!
                </Text>
              </View>
            </LinearGradient>
          ) : (
            <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: colors.foreground }]}>Your Progress</Text>
                <Text style={[styles.progressPct, { color: colors.primary }]}>{pct}%</Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.progressChapters, { color: colors.mutedForeground }]}>
                {done} of {total} chapters completed
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={[styles.statRow, { marginHorizontal: 20 }]}>
        {[
          { icon: "play-circle" as const, label: "Lessons", value: `${course.lessons}` },
          { icon: "clock" as const, label: "Hours", value: `${course.hours}h` },
          { icon: "users" as const, label: "Students", value: `${(course.students / 1000).toFixed(1)}k` },
          { icon: "star" as const, label: "Rating", value: `${course.rating}` },
        ].map((s) => (
          <View
            key={s.label}
            style={[styles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name={s.icon} size={14} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <Text style={[styles.section, { color: colors.foreground }]}>About this course</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>{course.description}</Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <Text style={[styles.section, { color: colors.foreground }]}>Chapters</Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 12, gap: 8 }}>
        {course.chapters.map((ch, idx) => {
          const done = isChapterDone(ch.id);
          return (
            <View
              key={ch.id}
              style={[
                styles.chRow,
                {
                  backgroundColor: done ? "#0A1F0A" : colors.card,
                  borderColor: done ? "#34D39944" : colors.border,
                },
              ]}
            >
              <View style={[styles.chNum, { backgroundColor: done ? "#34D39922" : colors.secondary }]}>
                {done ? (
                  <Feather name="check" size={14} color="#34D399" />
                ) : (
                  <Text style={[styles.chNumText, { color: colors.primary }]}>{idx + 1}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.chTitle, { color: done ? "#34D399" : colors.foreground }]}>
                  {ch.title}
                </Text>
                <View style={styles.chMeta}>
                  <View style={styles.chMetaItem}>
                    <Feather name="play" size={10} color={colors.mutedForeground} />
                    <Text style={[styles.chMetaText, { color: colors.mutedForeground }]}>
                      {ch.videoCount} videos
                    </Text>
                  </View>
                  <View style={styles.chMetaItem}>
                    <Feather name="clock" size={10} color={colors.mutedForeground} />
                    <Text style={[styles.chMetaText, { color: colors.mutedForeground }]}>
                      {ch.duration}
                    </Text>
                  </View>
                </View>
              </View>

              {/* YouTube play button */}
              <Pressable
                hitSlop={8}
                onPress={async () => {
                  const url = ch.youtubeUrl;
                  if (!url) return;
                  const ok = await Linking.canOpenURL(url);
                  if (ok) Linking.openURL(url);
                  else Alert.alert("Cannot open link");
                }}
                style={{ opacity: ch.youtubeUrl ? 1 : 0.3 }}
              >
                <Feather name="play-circle" size={22} color={colors.primary} />
              </Pressable>

              {/* Mark complete toggle — only for enrolled students */}
              {enrolled && state.student && (
                <Pressable
                  hitSlop={8}
                  onPress={() => toggleChapter(ch.id)}
                  style={[
                    styles.markBtn,
                    { backgroundColor: done ? "#34D39922" : colors.secondary, borderColor: done ? "#34D399" : colors.border },
                  ]}
                >
                  <Feather name={done ? "check-circle" : "circle"} size={16} color={done ? "#34D399" : colors.mutedForeground} />
                </Pressable>
              )}
            </View>
          );
        })}
      </View>

      <View style={{ padding: 20, marginTop: 16 }}>
        <View style={[styles.priceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>Course Price</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <Text style={[styles.price, { color: colors.foreground }]}>
                ₹{course.price}
              </Text>
              <Text style={[styles.priceOld, { color: colors.mutedForeground }]}>
                ₹{Math.round(course.price * 1.6)}
              </Text>
            </View>
          </View>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>40% OFF</Text>
          </View>
        </View>

        {isBlocked ? (
          <View style={[styles.accessWarning, { backgroundColor: "#ef444418", borderColor: "#ef4444" }]}>
            <Feather name="slash" size={16} color="#ef4444" />
            <Text style={[styles.accessWarningText, { color: "#ef4444" }]}>
              Your access to this course has been revoked by the admin.
            </Text>
          </View>
        ) : isLocked && !enrolled && !canEnroll ? (
          <View style={[styles.accessWarning, { backgroundColor: "#f59e0b18", borderColor: "#f59e0b" }]}>
            <Feather name="lock" size={16} color="#f59e0b" />
            <Text style={[styles.accessWarningText, { color: "#f59e0b" }]}>
              This is a paid course. Contact the academy admin to get access.
            </Text>
          </View>
        ) : null}

        <View style={{ marginTop: 16, gap: 10 }}>
          {isBlocked ? null : enrolled ? (
            <PrimaryButton
              label="Continue Learning"
              icon="play-circle"
              onPress={() => addWatchHistory(course.id)}
            />
          ) : isLocked && !canEnroll ? (
            <PrimaryButton
              label="Requires Admin Approval"
              icon="lock"
              onPress={() => Alert.alert("Paid Course", "Please contact the academy admin to get access to this course.")}
            />
          ) : (
            <PrimaryButton
              label={`Enroll Now · ₹${course.price}`}
              icon="zap"
              onPress={() => {
                enrollCourse(course.id);
                addWatchHistory(course.id);
              }}
            />
          )}
          {course.youtubePlaylistUrl ? (
            <PrimaryButton
              label="Watch Playlist on YouTube"
              icon="play-circle"
              variant="outline"
              onPress={async () => {
                const url = course.youtubePlaylistUrl!;
                const ok = await Linking.canOpenURL(url);
                if (ok) Linking.openURL(url);
                else Alert.alert("Cannot open YouTube link");
              }}
            />
          ) : null}
          <PrimaryButton
            label="Open Notes"
            icon="file-text"
            variant="outline"
            onPress={() => router.push("/notes" as never)}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cover: {
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
  },
  coverInner: {
    flex: 1,
    padding: 22,
    justifyContent: "flex-end",
  },
  levelBadge: {
    position: "absolute",
    top: 18,
    right: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  levelText: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 0.6 },
  lockBadge: {
    position: "absolute",
    top: 18,
    left: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lockBadgeText: { color: "#f59e0b", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.6 },
  coverTitle: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    letterSpacing: -0.6,
    marginTop: 8,
  },
  coverSub: { color: "rgba(255,255,255,0.85)", fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 4 },
  completionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  completionTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#34D399" },
  completionSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  progressCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  progressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  progressPct: { fontFamily: "Inter_700Bold", fontSize: 15 },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  progressChapters: { fontFamily: "Inter_400Regular", fontSize: 11 },
  statRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  stat: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 16, marginTop: 2 },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 10 },
  section: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: -0.3 },
  body: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, marginTop: 8 },
  chRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  chNum: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chNumText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  chTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  chMeta: { flexDirection: "row", gap: 12, marginTop: 4 },
  chMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  chMetaText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  markBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  priceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  priceLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },
  price: { fontFamily: "Inter_700Bold", fontSize: 28, letterSpacing: -0.6 },
  priceOld: { fontFamily: "Inter_500Medium", fontSize: 14, textDecorationLine: "line-through" },
  discountBadge: {
    backgroundColor: "rgba(52,211,153,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  discountText: { color: "#34D399", fontFamily: "Inter_700Bold", fontSize: 12 },
  accessWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
  },
  accessWarningText: { fontFamily: "Inter_600SemiBold", fontSize: 13, flex: 1 },
});
