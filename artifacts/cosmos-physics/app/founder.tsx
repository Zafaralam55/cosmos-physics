import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { AtomLogo } from "@/components/AtomLogo";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useSettings } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function FounderScreen() {
  const colors = useColors();
  const settings = useSettings();

  const stats = [
    { icon: "users" as const, label: "Students Mentored", value: "12k+" },
    { icon: "video" as const, label: "Live Classes", value: "640+" },
    { icon: "book-open" as const, label: "Recorded Lectures", value: "1,200+" },
    { icon: "award" as const, label: "Years Teaching", value: "6+" },
  ];

  return (
    <ScreenContainer showStars>
      <View style={{ paddingHorizontal: 20, alignItems: "center", marginTop: 12 }}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarRing}
        >
          <Image
            source={require("../assets/images/founder.png")}
            style={styles.avatar}
          />
        </LinearGradient>
        <Text style={[styles.name, { color: colors.foreground }]}>{settings.founderName}</Text>
        <Text style={[styles.role, { color: colors.primary }]}>{settings.founderRole}</Text>
        <View
          style={[styles.tagBadge, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <AtomLogo size={18} />
          <Text style={[styles.tagText, { color: colors.foreground }]}>{settings.tagline}</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <View style={styles.gridRow}>
          {stats.map((s) => (
            <View
              key={s.label}
              style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.statIcon, { backgroundColor: colors.secondary }]}>
                <Feather name={s.icon} size={16} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <Text style={[styles.section, { color: colors.foreground }]}>Background</Text>
        <View
          style={[styles.timeline, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          {[
            {
              icon: "book" as const,
              title: "B.Tech, Mechanical Engineering",
              sub: "Foundation in classical and applied physics",
              color: "#5B8CFF",
            },
            {
              icon: "compass" as const,
              title: "PhD Scholar — IIT Patna",
              sub: "Currently researching at one of India's premier institutes",
              color: "#8B5CF6",
            },
            {
              icon: "activity" as const,
              title: "Research Area: Molecular Dynamics",
              sub: "Bridging classical mechanics with computational physics",
              color: "#22D3EE",
            },
          ].map((item, idx, arr) => (
            <View key={item.title} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, { backgroundColor: item.color }]}>
                  <Feather name={item.icon} size={12} color="#FFFFFF" />
                </View>
                {idx < arr.length - 1 ? (
                  <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                ) : null}
              </View>
              <View style={{ flex: 1, paddingBottom: idx < arr.length - 1 ? 22 : 0 }}>
                <Text style={[styles.timelineTitle, { color: colors.foreground }]}>
                  {item.title}
                </Text>
                <Text style={[styles.timelineSub, { color: colors.mutedForeground }]}>
                  {item.sub}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <Text style={[styles.section, { color: colors.foreground }]}>The Mission</Text>
        <View
          style={[styles.mission, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="zap" size={20} color={colors.primary} />
          <Text style={[styles.missionText, { color: colors.foreground }]}>
            {settings.founderBio}
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  avatarRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  avatar: { width: 124, height: 124, borderRadius: 62 },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    marginTop: 16,
    letterSpacing: -0.5,
  },
  role: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginTop: 4 },
  tagBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  section: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: -0.3, marginBottom: 12 },
  gridRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 22, marginTop: 10, letterSpacing: -0.4 },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 2 },
  timeline: { padding: 18, borderRadius: 18, borderWidth: 1 },
  timelineItem: { flexDirection: "row", gap: 14 },
  timelineLeft: { alignItems: "center", width: 28 },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineLine: { width: 2, flex: 1, marginTop: 4 },
  timelineTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  timelineSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  mission: {
    flexDirection: "row",
    gap: 12,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  missionText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 21 },
});
