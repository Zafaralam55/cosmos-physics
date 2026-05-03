import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/ScreenContainer";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  type LeaderboardEntry,
  apiGetLeaderboard,
} from "@/lib/apiClient";

type Period = "alltime" | "week" | "month";

const PERIOD_LABELS: Record<Period, string> = {
  alltime: "All Time",
  week: "This Week",
  month: "This Month",
};

const RANK_COLORS = ["#FACC15", "#94A3B8", "#F97316"] as const;
const RANK_LABELS = ["1st", "2nd", "3rd"] as const;

export default function LeaderboardScreen() {
  const colors = useColors();
  const { state } = useApp();
  const myId = state.student?.id ?? null;

  const [period, setPeriod] = useState<Period>("alltime");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const data = await apiGetLeaderboard(period);
        setEntries(data);
      } catch {
        setError("Could not load leaderboard. Pull down to retry.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const myEntry = myId ? entries.find((e) => e.studentId === myId) : null;

  // Podium order: 2nd (left), 1st (centre), 3rd (right)
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumHeights = [110, 148, 90];
  const podiumRanks = [2, 1, 3];

  return (
    <ScreenContainer showStars>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
        <Text style={[styles.h1, { color: colors.foreground }]}>Leaderboard</Text>
        <Text style={[styles.h1Sub, { color: colors.mutedForeground }]}>
          Real quiz scores from Cosmos students
        </Text>
      </View>

      {/* Period tabs */}
      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <View
          style={[
            styles.tabs,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {(["alltime", "week", "month"] as Period[]).map((p) => (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              style={[
                styles.tab,
                { backgroundColor: period === p ? colors.primary : "transparent" },
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: period === p ? "#FFFFFF" : colors.mutedForeground },
                ]}
              >
                {PERIOD_LABELS[p]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Fetching scores…
          </Text>
        </View>
      ) : error ? (
        <View style={styles.emptyWrap}>
          <Feather name="wifi-off" size={36} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Can't load scores
          </Text>
          <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
            {error}
          </Text>
          <Pressable
            onPress={() => load()}
            style={[styles.retryBtn, { borderColor: colors.primary }]}
          >
            <Text style={[styles.retryLabel, { color: colors.primary }]}>Retry</Text>
          </Pressable>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>🏆</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No scores yet
          </Text>
          <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
            Be the first on the board! Complete a quiz to earn your rank.
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/quiz" as never)}
            style={[styles.retryBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
          >
            <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 }}>
              Take a Quiz
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={colors.primary}
            />
          }
        >
          {/* Podium */}
          {top3.length >= 2 && (
            <View style={styles.podium}>
              {podiumOrder.map((p, idx) => {
                if (!p) return <View key={idx} style={{ flex: 1 }} />;
                const isMe = p.studentId === myId;
                return (
                  <View key={p.studentId} style={{ alignItems: "center", flex: 1 }}>
                    {isMe && (
                      <View
                        style={[
                          styles.youBadge,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Text style={styles.youBadgeText}>YOU</Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.podiumAvatar,
                        {
                          backgroundColor: colors.card,
                          borderColor: RANK_COLORS[idx],
                          borderWidth: isMe ? 3 : 2,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.podiumAvatarText,
                          { color: RANK_COLORS[idx] },
                        ]}
                      >
                        {p.avatar}
                      </Text>
                    </View>
                    <Text
                      style={[styles.podiumName, { color: colors.foreground }]}
                      numberOfLines={1}
                    >
                      {p.name.split(" ")[0]}
                    </Text>
                    <Text
                      style={[styles.podiumScore, { color: colors.mutedForeground }]}
                    >
                      {p.accuracy}% · {p.quizzesTaken}q
                    </Text>
                    <LinearGradient
                      colors={[RANK_COLORS[idx]!, "rgba(0,0,0,0.3)"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={[
                        styles.podiumBar,
                        { height: podiumHeights[idx] },
                      ]}
                    >
                      <Text style={styles.podiumRankLabel}>
                        {RANK_LABELS[idx]}
                      </Text>
                    </LinearGradient>
                  </View>
                );
              })}
            </View>
          )}

          {/* Stats strip */}
          <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
            <View
              style={[
                styles.statsStrip,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <StatPill
                icon="users"
                label="Ranked"
                value={String(entries.length)}
                colors={colors}
              />
              <View style={[styles.stripDivider, { backgroundColor: colors.border }]} />
              <StatPill
                icon="zap"
                label="Total Attempts"
                value={String(entries.reduce((a, e) => a + e.quizzesTaken, 0))}
                colors={colors}
              />
              {myEntry && (
                <>
                  <View
                    style={[styles.stripDivider, { backgroundColor: colors.border }]}
                  />
                  <StatPill
                    icon="star"
                    label="Your Rank"
                    value={`#${myEntry.rank}`}
                    colors={colors}
                    highlight
                  />
                </>
              )}
            </View>
          </View>

          {/* List from #4 onwards */}
          {rest.length > 0 && (
            <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 8 }}>
              {rest.map((entry) => {
                const isMe = entry.studentId === myId;
                return (
                  <View
                    key={entry.studentId + entry.rank}
                    style={[
                      styles.row,
                      {
                        backgroundColor: isMe
                          ? colors.primary + "18"
                          : colors.card,
                        borderColor: isMe ? colors.primary : colors.border,
                        borderWidth: isMe ? 1.5 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rank,
                        {
                          color: isMe ? colors.primary : colors.mutedForeground,
                        },
                      ]}
                    >
                      #{entry.rank}
                    </Text>
                    <View
                      style={[
                        styles.avatar,
                        {
                          backgroundColor: isMe
                            ? colors.primary
                            : colors.secondary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarText,
                          { color: isMe ? "#FFFFFF" : colors.primary },
                        ]}
                      >
                        {entry.avatar}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text
                          style={[
                            styles.name,
                            { color: colors.foreground },
                          ]}
                          numberOfLines={1}
                        >
                          {entry.name}
                        </Text>
                        {isMe && (
                          <View
                            style={[
                              styles.meChip,
                              { backgroundColor: colors.primary },
                            ]}
                          >
                            <Text style={styles.meChipText}>YOU</Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[styles.level, { color: colors.mutedForeground }]}
                        numberOfLines={1}
                      >
                        {entry.level || "Student"} · {entry.quizzesTaken} quiz
                        {entry.quizzesTaken !== 1 ? "zes" : ""}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 2 }}>
                      <View
                        style={[
                          styles.scoreBadge,
                          {
                            backgroundColor: isMe
                              ? colors.primary
                              : colors.secondary,
                          },
                        ]}
                      >
                        <Feather
                          name="target"
                          size={10}
                          color={isMe ? "#FFFFFF" : colors.primary}
                        />
                        <Text
                          style={[
                            styles.score,
                            { color: isMe ? "#FFFFFF" : colors.primary },
                          ]}
                        >
                          {entry.accuracy}%
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.totalScore,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {entry.totalScore}/{entry.totalPossible} pts
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* My rank card if outside top 50 */}
          {myEntry === undefined && myId && entries.length > 0 && (
            <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
              <View
                style={[
                  styles.myRankCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Feather name="info" size={14} color={colors.mutedForeground} />
                <Text
                  style={[
                    styles.myRankText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  You're not ranked yet for this period. Complete a quiz to join
                  the board!
                </Text>
              </View>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

function StatPill({
  icon,
  label,
  value,
  colors,
  highlight,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  highlight?: boolean;
}) {
  return (
    <View style={styles.statPill}>
      <Feather
        name={icon}
        size={12}
        color={highlight ? colors.primary : colors.mutedForeground}
      />
      <Text
        style={[
          styles.statPillValue,
          { color: highlight ? colors.primary : colors.foreground },
        ]}
      >
        {value}
      </Text>
      <Text style={[styles.statPillLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  h1Sub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  tabs: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    padding: 3,
    gap: 3,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabLabel: { fontFamily: "Inter_700Bold", fontSize: 11 },
  loadingText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginTop: 12,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: -0.3 },
  emptyBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  retryLabel: { fontFamily: "Inter_700Bold", fontSize: 13 },
  podium: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 6,
  },
  youBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginBottom: 4,
  },
  youBadgeText: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 0.8,
  },
  podiumAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  podiumAvatarText: { fontFamily: "Inter_700Bold", fontSize: 15 },
  podiumName: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
  podiumScore: { fontFamily: "Inter_500Medium", fontSize: 10, marginTop: 2 },
  podiumBar: {
    width: "100%",
    marginTop: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 8,
  },
  podiumRankLabel: {
    color: "#0A0F2E",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: -0.3,
  },
  statsStrip: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-around",
    gap: 8,
  },
  stripDivider: { width: 1, height: 28 },
  statPill: { flex: 1, alignItems: "center", gap: 2 },
  statPillValue: { fontFamily: "Inter_700Bold", fontSize: 16, letterSpacing: -0.3 },
  statPillLabel: { fontFamily: "Inter_500Medium", fontSize: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  rank: { fontFamily: "Inter_700Bold", fontSize: 12, width: 30 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  name: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  level: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 1 },
  meChip: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  meChipText: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 8,
    letterSpacing: 0.6,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  score: { fontFamily: "Inter_700Bold", fontSize: 11 },
  totalScore: { fontFamily: "Inter_500Medium", fontSize: 10 },
  myRankCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  myRankText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 16,
  },
});
