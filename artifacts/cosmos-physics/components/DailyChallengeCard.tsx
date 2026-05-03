import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  apiGetDailyChallenge,
  apiGetDailyChallengeAuthed,
  apiSubmitDailyAnswer,
  type DailyChallengeData,
  type DailyChallengeResult,
} from "@/lib/apiClient";

const DIFF_COLOR: Record<string, string> = {
  Easy: "#34D399",
  Medium: "#FACC15",
  Hard: "#FF5470",
};

const OPTION_LABELS = ["A", "B", "C", "D"];

export function DailyChallengeCard() {
  const colors = useColors();
  const { state } = useApp();
  const isLoggedIn = !!state.student;

  const [challenge, setChallenge] = useState<DailyChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<DailyChallengeResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [stats, setStats] = useState<{ totalParticipants: number; accuracy: number | null } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = isLoggedIn
        ? await apiGetDailyChallengeAuthed().catch(() => apiGetDailyChallenge())
        : await apiGetDailyChallenge();
      setChallenge(data);
      // If already answered, pre-fill state
      if (data.userAnswer !== null) {
        setSelected(data.userAnswer.chosenIndex);
        setResult({
          isCorrect: data.userAnswer.isCorrect,
          correctIndex: data.correctIndex!,
          explanation: data.explanation!,
          streakBonus: data.userAnswer.streakBonus,
          currentStreak: state.streak.currentStreak,
        });
      }
    } catch {
      // silently fail — card just won't show
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, state.streak.currentStreak]);

  useEffect(() => { load(); }, [load]);

  const submit = async (idx: number) => {
    if (!isLoggedIn || result !== null || submitting) return;
    setSelected(idx);
    setSubmitting(true);
    try {
      const res = await apiSubmitDailyAnswer(idx);
      setResult(res);
      // Reload to get fresh stats
      const updated = await apiGetDailyChallengeAuthed().catch(() => null);
      if (updated) setChallenge(updated);
    } catch {
      setSelected(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ActivityIndicator color="#FACC15" />
      </View>
    );
  }

  if (!challenge) return null;

  const answered = result !== null;
  const diffColor = DIFF_COLOR[challenge.difficulty] ?? "#5B8CFF";

  return (
    <View style={{ paddingHorizontal: 20 }}>
      <LinearGradient
        colors={["#0D1A0A", "#151F10"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.card, { borderColor: answered ? "#34D39955" : "#FACC1544" }]}
      >
        {/* Header */}
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <Text style={s.lightning}>⚡</Text>
            <View>
              <Text style={s.title}>Daily Challenge</Text>
              <Text style={[s.date, { color: colors.mutedForeground }]}>
                {new Date(challenge.date).toLocaleDateString("en-IN", {
                  weekday: "long", day: "numeric", month: "short",
                })}
              </Text>
            </View>
          </View>
          <View style={s.badges}>
            <View style={[s.badge, { backgroundColor: diffColor + "22" }]}>
              <Text style={[s.badgeText, { color: diffColor }]}>{challenge.difficulty}</Text>
            </View>
            <View style={[s.badge, { backgroundColor: "#5B8CFF22" }]}>
              <Text style={[s.badgeText, { color: "#5B8CFF" }]}>{challenge.topic}</Text>
            </View>
          </View>
        </View>

        {/* Question */}
        <Text style={[s.question, { color: colors.foreground }]}>{challenge.question}</Text>

        {/* Options */}
        <View style={s.options}>
          {challenge.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = answered && i === result!.correctIndex;
            const isWrong = answered && isSelected && !result!.isCorrect;

            let bg = colors.card;
            let border = colors.border;
            let textColor = colors.foreground;
            let labelBg = colors.secondary;
            let labelColor = colors.mutedForeground;

            if (isCorrect) {
              bg = "#34D39922"; border = "#34D399"; textColor = "#34D399";
              labelBg = "#34D399"; labelColor = "#050816";
            } else if (isWrong) {
              bg = "#FF547022"; border = "#FF5470"; textColor = "#FF5470";
              labelBg = "#FF5470"; labelColor = "#fff";
            } else if (isSelected && !answered) {
              bg = "#FACC1511"; border = "#FACC15";
              textColor = "#FACC15"; labelBg = "#FACC15"; labelColor = "#050816";
            }

            return (
              <Pressable
                key={i}
                onPress={() => submit(i)}
                disabled={answered || submitting || !isLoggedIn}
                style={[s.option, { backgroundColor: bg, borderColor: border }]}
              >
                <View style={[s.optLabel, { backgroundColor: labelBg }]}>
                  {submitting && isSelected
                    ? <ActivityIndicator size="small" color={labelColor} />
                    : <Text style={[s.optLabelText, { color: labelColor }]}>{OPTION_LABELS[i]}</Text>}
                </View>
                <Text style={[s.optText, { color: textColor }]}>{opt}</Text>
                {isCorrect && <Feather name="check-circle" size={16} color="#34D399" />}
                {isWrong && <Feather name="x-circle" size={16} color="#FF5470" />}
              </Pressable>
            );
          })}
        </View>

        {/* Not logged in nudge */}
        {!isLoggedIn && (
          <Text style={[s.loginNudge, { color: colors.mutedForeground }]}>
            Sign in to submit your answer and earn streak bonuses
          </Text>
        )}

        {/* Result section */}
        {answered && result && (
          <View style={[s.resultBox, { borderColor: result.isCorrect ? "#34D39944" : "#FF547044" }]}>
            <View style={s.resultRow}>
              <Text style={result.isCorrect ? s.resultCorrect : s.resultWrong}>
                {result.isCorrect ? "✓ Correct!" : "✗ Incorrect"}
              </Text>
              {result.streakBonus > 0 && (
                <View style={s.bonusBadge}>
                  <Text style={s.bonusText}>🔥 +{result.streakBonus} Streak Bonus</Text>
                </View>
              )}
            </View>

            <Pressable onPress={() => setShowExplanation((v) => !v)} style={s.explainToggle}>
              <Feather
                name={showExplanation ? "chevron-up" : "chevron-down"}
                size={14}
                color="#5B8CFF"
              />
              <Text style={s.explainToggleText}>
                {showExplanation ? "Hide" : "Show"} explanation
              </Text>
            </Pressable>

            {showExplanation && (
              <Text style={[s.explanation, { color: colors.mutedForeground }]}>
                {result.explanation}
              </Text>
            )}
          </View>
        )}

        {/* Stats footer */}
        {answered && challenge && (
          <StatsFooter date={challenge.date} colors={colors} />
        )}
      </LinearGradient>
    </View>
  );
}

function StatsFooter({
  date,
  colors,
}: {
  date: string;
  colors: ReturnType<typeof useColors>;
}) {
  const [stats, setStats] = useState<{ totalParticipants: number; accuracy: number | null } | null>(null);

  useEffect(() => {
    import("@/lib/apiClient").then(({ apiGetDailyChallengeStats }) =>
      apiGetDailyChallengeStats()
        .then(setStats)
        .catch(() => {}),
    );
  }, [date]);

  if (!stats) return null;

  return (
    <View style={[s.statsRow, { borderTopColor: colors.border }]}>
      <Feather name="users" size={11} color={colors.mutedForeground} />
      <Text style={[s.statsText, { color: colors.mutedForeground }]}>
        {stats.totalParticipants} answered today
        {stats.accuracy !== null ? ` · ${stats.accuracy}% correct` : ""}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  lightning: { fontSize: 24 },
  title: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#FACC15", letterSpacing: -0.2 },
  date: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
  badges: { gap: 4, alignItems: "flex-end" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontFamily: "Inter_600SemiBold", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 },
  question: { fontFamily: "Inter_600SemiBold", fontSize: 14, lineHeight: 21 },
  options: { gap: 8 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  optLabel: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  optLabelText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  optText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 13, lineHeight: 18 },
  loginNudge: { fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center", paddingVertical: 4 },
  resultBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  resultRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  resultCorrect: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#34D399" },
  resultWrong: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#FF5470" },
  bonusBadge: { backgroundColor: "#FF8A4C22", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  bonusText: { fontFamily: "Inter_700Bold", fontSize: 12, color: "#FF8A4C" },
  explainToggle: { flexDirection: "row", alignItems: "center", gap: 4 },
  explainToggleText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#5B8CFF" },
  explanation: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingTop: 10, borderTopWidth: 1 },
  statsText: { fontFamily: "Inter_400Regular", fontSize: 11 },
});
