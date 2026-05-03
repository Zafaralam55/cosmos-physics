import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StarryBackground } from "@/components/StarryBackground";
import { useApp, useQuiz } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function QuizPlay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addQuizScore } = useApp();
  const quiz = useQuiz(id);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState((quiz?.durationMinutes ?? 10) * 60);

  useEffect(() => {
    if (!quiz) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [quiz]);

  const score = useMemo(() => {
    if (!quiz) return 0;
    let s = 0;
    for (const q of quiz.questions) {
      if (answers[q.id] === q.correctIndex) s++;
    }
    return s;
  }, [answers, quiz]);

  if (!quiz) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>Quiz not found</Text>
      </View>
    );
  }

  const q = quiz.questions[current]!;
  const selected = answers[q.id];
  const finish = () => {
    addQuizScore({
      quizId: quiz.id,
      title: quiz.title,
      score,
      total: quiz.questions.length,
      takenAt: "Just now",
    });
    router.replace({
      pathname: "/quiz/result" as never,
      params: { score: String(score), total: String(quiz.questions.length), title: quiz.title },
    } as never);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StarryBackground />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={10}>
          <Feather name="x" size={20} color={colors.foreground} />
        </Pressable>
        <View style={[styles.timerWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="clock" size={12} color={secondsLeft < 60 ? colors.destructive : colors.primary} />
          <Text
            style={[
              styles.timer,
              { color: secondsLeft < 60 ? colors.destructive : colors.foreground },
            ]}
          >
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </Text>
        </View>
        <Text style={[styles.qCount, { color: colors.mutedForeground }]}>
          {current + 1} / {quiz.questions.length}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
          <LinearGradient
            colors={["#5B8CFF", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progressBar,
              { width: `${((current + 1) / quiz.questions.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.topic, { color: colors.primary }]}>{quiz.topic}</Text>
        <Text style={[styles.question, { color: colors.foreground }]}>{q.question}</Text>

        <View style={{ gap: 10, marginTop: 22 }}>
          {q.options.map((opt, idx) => {
            const isSelected = selected === idx;
            return (
              <Pressable
                key={idx}
                onPress={() => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                style={[
                  styles.option,
                  {
                    backgroundColor: isSelected ? colors.primary + "26" : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.bullet,
                    {
                      backgroundColor: isSelected ? colors.primary : "transparent",
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  {isSelected ? (
                    <Feather name="check" size={12} color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.bulletText, { color: colors.mutedForeground }]}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  )}
                </View>
                <Text style={[styles.optionText, { color: colors.foreground }]}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable
          onPress={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          style={[
            styles.navBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: current === 0 ? 0.4 : 1,
            },
          ]}
        >
          <Feather name="chevron-left" size={18} color={colors.foreground} />
          <Text style={[styles.navBtnLabel, { color: colors.foreground }]}>Prev</Text>
        </Pressable>

        {current === quiz.questions.length - 1 ? (
          <Pressable onPress={finish} style={styles.submitBtn}>
            <LinearGradient
              colors={["#5B8CFF", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGrad}
            >
              <Feather name="check-circle" size={18} color="#FFFFFF" />
              <Text style={styles.submitLabel}>Submit Quiz</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setCurrent((c) => Math.min(quiz.questions.length - 1, c + 1))}
            style={styles.submitBtn}
          >
            <LinearGradient
              colors={["#5B8CFF", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGrad}
            >
              <Text style={styles.submitLabel}>Next</Text>
              <Feather name="chevron-right" size={18} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  timerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  timer: { fontFamily: "Inter_700Bold", fontSize: 13 },
  qCount: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  progressTrack: { height: 4, borderRadius: 2, overflow: "hidden", marginTop: 8 },
  progressBar: { height: 4, borderRadius: 2 },
  topic: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 0.8,
    marginTop: 12,
  },
  question: { fontFamily: "Inter_700Bold", fontSize: 20, lineHeight: 28, marginTop: 8, letterSpacing: -0.3 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  bullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bulletText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  optionText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 20 },
  bottom: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1F2547",
    backgroundColor: "rgba(5,8,22,0.85)",
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  navBtnLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  submitBtn: { flex: 1, borderRadius: 14, overflow: "hidden" },
  submitGrad: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  submitLabel: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 14 },
});
