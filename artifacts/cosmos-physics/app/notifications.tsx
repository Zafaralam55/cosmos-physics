import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/ScreenContainer";
import { useColors } from "@/hooks/useColors";
import { apiGetAnnouncements, type AnnouncementRecord } from "@/lib/apiClient";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const TYPE_META: Record<string, { icon: React.ComponentProps<typeof Feather>["name"]; color: string; label: string }> = {
  live: { icon: "radio", color: "#FF5470", label: "Live Class" },
  exam: { icon: "edit-3", color: "#FACC15", label: "Exam" },
  result: { icon: "award", color: "#34D399", label: "Result" },
  info: { icon: "info", color: "#5B8CFF", label: "Info" },
};

export default function NotificationsScreen() {
  const colors = useColors();
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await apiGetAnnouncements();
      setAnnouncements(data);
      setError(null);
    } catch {
      setError("Could not load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <ScreenContainer showStars scroll={false}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor="#5B8CFF"
          />
        }
      >
        <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
          <Text style={[styles.h1, { color: colors.foreground }]}>Notifications</Text>
          <Text style={[styles.h1Sub, { color: colors.mutedForeground }]}>
            Announcements from Cosmos Physics Academy
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 10 }}>
          {loading && (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <ActivityIndicator color="#5B8CFF" />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, marginTop: 12 }]}>
                Loading…
              </Text>
            </View>
          )}

          {!loading && error && (
            <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="wifi-off" size={28} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, marginTop: 10 }]}>
                {error}
              </Text>
              <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>
                Pull down to retry
              </Text>
            </View>
          )}

          {!loading && !error && announcements.length === 0 && (
            <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="bell-off" size={28} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, marginTop: 10 }]}>
                No announcements yet
              </Text>
              <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>
                The admin will post updates here
              </Text>
            </View>
          )}

          {!loading && announcements.map((n) => {
            const meta = TYPE_META[n.type] ?? TYPE_META.info!;
            return (
              <View
                key={n.id}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.iconBox, { backgroundColor: meta.color + "26" }]}>
                  <Feather name={meta.icon} size={16} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.row}>
                    <View style={[styles.typeBadge, { backgroundColor: meta.color + "22" }]}>
                      <Text style={[styles.typeBadgeText, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                    <Text style={[styles.time, { color: colors.mutedForeground }]}>
                      {timeAgo(n.sentAt)}
                    </Text>
                  </View>
                  <Text style={[styles.title, { color: colors.foreground }]}>{n.title}</Text>
                  <Text style={[styles.body, { color: colors.mutedForeground }]}>{n.body}</Text>
                  {n.pushTotal > 0 && (
                    <View style={styles.pushRow}>
                      <Feather name="smartphone" size={10} color={colors.mutedForeground} />
                      <Text style={[styles.pushHint, { color: colors.mutedForeground }]}>
                        Sent to {n.pushSent}/{n.pushTotal} devices
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  h1Sub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  title: { fontFamily: "Inter_700Bold", fontSize: 14 },
  body: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4, lineHeight: 18 },
  time: { fontFamily: "Inter_500Medium", fontSize: 11 },
  pushRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  pushHint: { fontFamily: "Inter_400Regular", fontSize: 10 },
  emptyBox: {
    alignItems: "center",
    padding: 40,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 24,
  },
  emptyText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  emptyHint: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 6 },
});
