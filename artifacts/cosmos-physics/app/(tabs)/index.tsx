import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AtomLogo } from "@/components/AtomLogo";
import { CourseCard } from "@/components/CourseCard";
import { DailyChallengeCard } from "@/components/DailyChallengeCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { StatChip } from "@/components/StatChip";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const { state, allCourses, allLiveClasses, leaderboard } = useApp();

  const upcoming = allLiveClasses.filter((l) => !l.isLive).slice(0, 3);
  const courses = allCourses;

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AtomLogo size={42} />
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.brand, { color: colors.foreground }]}>Cosmos</Text>
            <Text style={[styles.brandSub, { color: colors.mutedForeground }]}>
              Physics Academy
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push("/notifications" as never)}
          style={[styles.bell, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Feather name="bell" size={18} color={colors.foreground} />
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        </Pressable>
      </View>

      {/* Welcome */}
      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
          Welcome back,
        </Text>
        <Text style={[styles.name, { color: colors.foreground }]}>
          {state.student?.name ?? "Explorer"}
        </Text>
        <Text style={[styles.tagline, { color: colors.primary }]}>
          Explore the Universe of Physics
        </Text>
      </View>

      {/* Hero */}
      <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
        <View style={styles.hero}>
          <Image
            source={require("../../assets/images/hero-galaxy.png")}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(5,8,22,0.1)", "rgba(5,8,22,0.85)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <View style={[styles.liveDot, { backgroundColor: "#FF5470" }]} />
              <Text style={styles.heroBadgeText}>LIVE NOW</Text>
            </View>
            <Text style={styles.heroTitle}>Rotational Dynamics</Text>
            <Text style={styles.heroMeta}>Master Class · 90 min · Md Zafar Alam</Text>
            <Pressable
              onPress={() => router.push("/(tabs)/live" as never)}
              style={styles.heroBtn}
            >
              <Feather name="play" size={14} color="#050816" />
              <Text style={styles.heroBtnLabel}>Join Live</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 20, marginTop: 16 }}>
        <StatChip icon="book-open" label="Enrolled" value={`${state.enrolledCourses.length}`} />
        <StatChip
          icon="award"
          label="Quizzes"
          value={`${state.quizScores.length}`}
          tint="#8B5CF6"
        />
        <StatChip
          icon="trending-up"
          label="Streak"
          value={state.streak.currentStreak > 0 ? `${state.streak.currentStreak}d` : "–"}
          tint="#FF8A4C"
        />
      </View>

      {/* Quick actions */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 20, marginTop: 14 }}>
        {[
          { icon: "file-text" as const, label: "Notes", to: "/notes", color: "#5B8CFF" },
          { icon: "help-circle" as const, label: "Doubts", to: "/doubt", color: "#FF8A4C" },
          { icon: "tool" as const, label: "Tools", to: "/tools", color: "#8B5CF6" },
          { icon: "shield" as const, label: "Admin", to: "/admin", color: "#22D3EE" },
        ].map((q) => (
          <Pressable
            key={q.label}
            onPress={() => router.push(q.to as never)}
            style={[
              styles.quickAction,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.quickIcon, { backgroundColor: q.color + "26" }]}>
              <Feather name={q.icon} size={16} color={q.color} />
            </View>
            <Text style={[styles.quickLabel, { color: colors.foreground }]}>{q.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Daily Challenge */}
      <SectionHeader
        title="Daily Challenge"
        subtitle="One question · refreshes at midnight"
      />
      <DailyChallengeCard />

      {/* Popular Courses */}
      <SectionHeader
        title="Popular Courses"
        subtitle="Hand-picked physics specializations"
        actionLabel="See all"
        onAction={() => router.push("/(tabs)/courses" as never)}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
      >
        {courses.slice(0, 5).map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </ScrollView>

      {/* Upcoming Live */}
      <SectionHeader
        title="Upcoming Live Classes"
        subtitle="Reserve your seat now"
        actionLabel="See all"
        onAction={() => router.push("/(tabs)/live" as never)}
      />
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        {upcoming.map((cls) => (
          <Pressable
            key={cls.id}
            onPress={() => router.push("/(tabs)/live" as never)}
            style={[styles.liveItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.liveDate, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.liveDateText, { color: colors.primary }]}>
                {cls.date.split(",")[0]}
              </Text>
              <Text style={[styles.liveTimeText, { color: colors.mutedForeground }]}>
                {cls.time.split(" ")[0]}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.liveTitle, { color: colors.foreground }]} numberOfLines={1}>
                {cls.title}
              </Text>
              <Text style={[styles.liveTopic, { color: colors.mutedForeground }]}>
                {cls.topic} · {cls.durationMinutes} min
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>

      {/* Founder */}
      <SectionHeader
        title="Meet the Founder"
        actionLabel="Profile"
        onAction={() => router.push("/founder" as never)}
      />
      <Pressable
        onPress={() => router.push("/founder" as never)}
        style={[
          styles.founderCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Image
          source={require("../../assets/images/founder.png")}
          style={styles.founderImg}
        />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={[styles.founderName, { color: colors.foreground }]}>Md Zafar Alam</Text>
          <Text style={[styles.founderRole, { color: colors.primary }]}>
            PhD Scholar · IIT Patna
          </Text>
          <Text style={[styles.founderDesc, { color: colors.mutedForeground }]}>
            B.Tech Mechanical · Researching Molecular Dynamics
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </Pressable>

      {/* Success */}
      <SectionHeader
        title="Top Achievers"
        subtitle="Students leading the leaderboard this week"
        actionLabel="Full board"
        onAction={() => router.push("/leaderboard" as never)}
      />
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        {leaderboard.slice(0, 3).map((entry) => (
          <View
            key={entry.rank}
            style={[styles.rankRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View
              style={[
                styles.rankBadge,
                {
                  backgroundColor:
                    entry.rank === 1
                      ? "#FACC15"
                      : entry.rank === 2
                        ? "#94A3B8"
                        : "#F97316",
                },
              ]}
            >
              <Text style={styles.rankBadgeText}>{entry.rank}</Text>
            </View>
            <View
              style={[styles.avatar, { backgroundColor: colors.secondary }]}
            >
              <Text style={[styles.avatarText, { color: colors.primary }]}>{entry.avatar}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rankName, { color: colors.foreground }]}>{entry.name}</Text>
              <Text style={[styles.rankCity, { color: colors.mutedForeground }]}>{entry.city}</Text>
            </View>
            <Text style={[styles.rankScore, { color: colors.primary }]}>{entry.score}</Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  brand: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: -0.3,
  },
  brandSub: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  dot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  greeting: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 12,
  },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    marginTop: 2,
    letterSpacing: -0.6,
  },
  tagline: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  hero: {
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroContent: {
    padding: 18,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,84,112,0.15)",
    borderColor: "#FF5470",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heroBadgeText: {
    color: "#FF5470",
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    marginTop: 8,
    letterSpacing: -0.4,
  },
  heroMeta: {
    color: "#C7CCE6",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 4,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  heroBtnLabel: {
    color: "#050816",
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  quickAction: {
    flex: 1,
    minWidth: "22%",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  liveItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  liveDate: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  liveDateText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  liveTimeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    marginTop: 2,
  },
  liveTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  liveTopic: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  founderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
  },
  founderImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  founderName: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  founderRole: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    marginTop: 2,
  },
  founderDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeText: {
    color: "#0A0F2E",
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  rankName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  rankCity: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  rankScore: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
});
