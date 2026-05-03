import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ScreenContainer";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function QuizScreen() {
  const colors = useColors();
  const { state, allQuizzes: quizzes } = useApp();

  const totalScore = state.quizScores.reduce((acc, s) => acc + s.score, 0);
  const totalPossible = state.quizScores.reduce((acc, s) => acc + s.total, 0);
  const accuracy = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

  return (
    <ScreenContainer>
      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <Text style={[styles.h1, { color: colors.foreground }]}>Quiz Arena</Text>
        <Text style={[styles.h1Sub, { color: colors.mutedForeground }]}>
          Test what you've learned today
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
        <LinearGradient
          colors={["#5B8CFF", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerLabel}>YOUR ACCURACY</Text>
            <Text style={styles.bannerValue}>{accuracy}%</Text>
            <Text style={styles.bannerSub}>
              {state.quizScores.length} quizzes attempted
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/leaderboard" as never)}
            style={styles.bannerBtn}
          >
            <Feather name="trending-up" size={14} color="#5B8CFF" />
            <Text style={styles.bannerBtnLabel}>Leaderboard</Text>
          </Pressable>
        </LinearGradient>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <Text style={[styles.section, { color: colors.foreground }]}>
          Daily quizzes & chapter tests
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 12, gap: 12 }}>
        {quizzes.map((q) => {
          const score = state.quizScores.find((s) => s.quizId === q.id);
          const diffColor =
            q.difficulty === "Easy"
              ? "#34D399"
              : q.difficulty === "Medium"
                ? "#FACC15"
                : "#FF5470";
          return (
            <Pressable
              key={q.id}
              onPress={() => router.push(`/quiz/${q.id}` as never)}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
                  <Feather name="zap" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>{q.title}</Text>
                  <Text style={[styles.cardTopic, { color: colors.mutedForeground }]}>
                    {q.topic}
                  </Text>
                </View>
                <View style={[styles.diffBadge, { backgroundColor: diffColor + "26" }]}>
                  <Text style={[styles.diffText, { color: diffColor }]}>{q.difficulty}</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Feather name="help-circle" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                      {q.questions.length} Qs
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="clock" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                      {q.durationMinutes} min
                    </Text>
                  </View>
                  {score ? (
                    <View style={styles.metaItem}>
                      <Feather name="check-circle" size={11} color="#34D399" />
                      <Text style={[styles.metaText, { color: "#34D399" }]}>
                        {score.score}/{score.total}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.startBtn}>
                  <Text style={[styles.startLabel, { color: colors.primary }]}>
                    {score ? "Retake" : "Start"}
                  </Text>
                  <Feather name="arrow-right" size={14} color={colors.primary} />
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: "Inter_700Bold", fontSize: 28, letterSpacing: -0.6 },
  h1Sub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
  },
  bannerLabel: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1,
  },
  bannerValue: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    marginTop: 4,
    letterSpacing: -1,
  },
  bannerSub: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 2,
  },
  bannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  bannerBtnLabel: { color: "#5B8CFF", fontFamily: "Inter_700Bold", fontSize: 12 },
  section: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: -0.3 },
  card: { padding: 14, borderRadius: 18, borderWidth: 1 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  cardTopic: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  diffText: { fontFamily: "Inter_700Bold", fontSize: 10 },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  metaRow: { flexDirection: "row", gap: 14 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  startBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  startLabel: { fontFamily: "Inter_700Bold", fontSize: 13 },
});
