import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ScreenContainer";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function LiveScreen() {
  const colors = useColors();
  const { state, markAttendance, allLiveClasses } = useApp();

  const live = allLiveClasses.find((l) => l.isLive);
  const upcoming = allLiveClasses.filter((l) => !l.isLive);

  const open = (url: string, id: string) => {
    markAttendance(id);
    WebBrowser.openBrowserAsync(url).catch(() => {});
  };

  return (
    <ScreenContainer>
      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <Text style={[styles.h1, { color: colors.foreground }]}>Live Classes</Text>
        <Text style={[styles.h1Sub, { color: colors.mutedForeground }]}>
          Real-time master classes & doubt sessions
        </Text>
      </View>

      {live ? (
        <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
          <View style={[styles.liveCard, { backgroundColor: colors.card, borderColor: "#FF5470" }]}>
            <View style={styles.liveBadge}>
              <View style={styles.dot} />
              <Text style={styles.liveBadgeText}>LIVE NOW</Text>
            </View>
            <Text style={[styles.liveTitle, { color: colors.foreground }]}>{live.title}</Text>
            <Text style={[styles.liveMeta, { color: colors.mutedForeground }]}>
              {live.topic} · {live.durationMinutes} min · {live.faculty}
            </Text>
            <View style={styles.liveStats}>
              <View style={styles.liveStat}>
                <Feather name="users" size={12} color={colors.mutedForeground} />
                <Text style={[styles.liveStatText, { color: colors.mutedForeground }]}>
                  {live.enrolled.toLocaleString()} attending
                </Text>
              </View>
              <View style={styles.liveStat}>
                <Feather name="check-circle" size={12} color="#34D399" />
                <Text style={[styles.liveStatText, { color: "#34D399" }]}>
                  Attendance auto-tracked
                </Text>
              </View>
            </View>
            <View style={{ gap: 10, marginTop: 16 }}>
              <Pressable style={styles.joinBtn} onPress={() => open(live.meetUrl, live.id)}>
                <Feather name="video" size={16} color="#FFFFFF" />
                <Text style={styles.joinBtnLabel}>Join Live Class</Text>
              </Pressable>
              {live.youtubeUrl ? (
                <Pressable
                  style={[styles.ytBtn, { backgroundColor: colors.secondary, borderColor: "#FF0000" + "44" }]}
                  onPress={() => open(live.youtubeUrl!, live.id)}
                >
                  <Feather name="youtube" size={16} color="#FF0000" />
                  <Text style={[styles.ytBtnLabel, { color: colors.foreground }]}>Watch on YouTube</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}

      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <Text style={[styles.section, { color: colors.foreground }]}>Upcoming</Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 12, gap: 10 }}>
        {upcoming.length === 0 ? (
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", marginTop: 20 }}>
            No upcoming classes scheduled yet.
          </Text>
        ) : null}
        {upcoming.map((cls) => {
          const attended = state.attendance.includes(cls.id);
          return (
            <View
              key={cls.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.dateChip, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.dateText, { color: colors.primary }]}>{cls.date}</Text>
                  <Text style={[styles.timeText, { color: colors.mutedForeground }]}>{cls.time}</Text>
                </View>
                <View style={[styles.topicBadge, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.topicText, { color: colors.mutedForeground }]}>
                    {cls.topic}
                  </Text>
                </View>
              </View>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>{cls.title}</Text>
              <Text style={[styles.cardFaculty, { color: colors.mutedForeground }]}>
                {cls.faculty}
              </Text>
              <View style={styles.cardFooter}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={styles.cardMeta}>
                    <Feather name="clock" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.cardMetaText, { color: colors.mutedForeground }]}>
                      {cls.durationMinutes}m
                    </Text>
                  </View>
                  <View style={styles.cardMeta}>
                    <Feather name="users" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.cardMetaText, { color: colors.mutedForeground }]}>
                      {cls.enrolled.toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  {cls.youtubeUrl ? (
                    <Pressable
                      onPress={() => open(cls.youtubeUrl!, cls.id)}
                      style={[styles.ytSmallBtn, { borderColor: "#FF000033" }]}
                    >
                      <Feather name="youtube" size={13} color="#FF0000" />
                      <Text style={{ color: "#FF0000", fontFamily: "Inter_600SemiBold", fontSize: 11 }}>
                        Recording
                      </Text>
                    </Pressable>
                  ) : null}
                  {cls.meetUrl && cls.meetUrl !== "https://meet.google.com/cosmos-" ? (
                    <Pressable
                      onPress={() => open(cls.meetUrl, cls.id)}
                      style={[styles.remindBtn, { backgroundColor: "transparent", borderColor: colors.primary }]}
                    >
                      <Feather name="video" size={12} color={colors.primary} />
                      <Text style={[styles.remindLabel, { color: colors.primary }]}>Join</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => markAttendance(cls.id)}
                      style={[
                        styles.remindBtn,
                        {
                          backgroundColor: attended ? colors.primary : "transparent",
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      <Feather
                        name={attended ? "check" : "bell"}
                        size={12}
                        color={attended ? "#FFFFFF" : colors.primary}
                      />
                      <Text
                        style={[
                          styles.remindLabel,
                          { color: attended ? "#FFFFFF" : colors.primary },
                        ]}
                      >
                        {attended ? "Reminded" : "Remind me"}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: "Inter_700Bold", fontSize: 28, letterSpacing: -0.6 },
  h1Sub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  liveCard: { padding: 18, borderRadius: 20, borderWidth: 1 },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,84,112,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF5470" },
  liveBadgeText: { color: "#FF5470", fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 0.6 },
  liveTitle: { fontFamily: "Inter_700Bold", fontSize: 20, marginTop: 12, letterSpacing: -0.4 },
  liveMeta: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 },
  liveStats: { flexDirection: "row", gap: 14, marginTop: 12 },
  liveStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  liveStatText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FF5470",
    paddingVertical: 14,
    borderRadius: 14,
  },
  joinBtnLabel: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 14 },
  ytBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  ytBtnLabel: { fontFamily: "Inter_700Bold", fontSize: 14 },
  section: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: -0.3 },
  card: { padding: 14, borderRadius: 18, borderWidth: 1 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateChip: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dateText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  timeText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  topicBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  topicText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, marginTop: 12 },
  cardFaculty: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardMetaText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  remindBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  remindLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  ytSmallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
});
