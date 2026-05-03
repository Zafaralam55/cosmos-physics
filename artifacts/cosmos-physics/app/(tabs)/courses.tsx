import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { CourseCard } from "@/components/CourseCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const FILTERS = ["All", "Class 9-10", "Class 11-12", "JEE/NEET", "Engineering"] as const;

export default function CoursesScreen() {
  const colors = useColors();
  const { allCourses } = useApp();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return allCourses.filter((c) => {
      const fOk = filter === "All" || c.level === filter;
      const sOk =
        search.length === 0 ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(search.toLowerCase());
      return fOk && sOk;
    });
  }, [filter, search, allCourses]);

  return (
    <ScreenContainer>
      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <Text style={[styles.h1, { color: colors.foreground }]}>Courses</Text>
        <Text style={[styles.h1Sub, { color: colors.mutedForeground }]}>
          Choose your learning track
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <View
          style={[
            styles.search,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            placeholder="Search by chapter or topic"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginTop: 16 }}
        style={{ marginTop: 16, flexGrow: 0 }}
      >
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  { color: active ? "#FFFFFF" : colors.mutedForeground },
                ]}
              >
                {f}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 14 }}>
        {filtered.map((c) => (
          <CourseCard key={c.id} course={c} variant="list" />
        ))}
        {filtered.length === 0 ? (
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Feather name="search" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No courses found
            </Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
              Try a different filter or search term.
            </Text>
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    letterSpacing: -0.6,
  },
  h1Sub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  empty: {
    alignItems: "center",
    padding: 32,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 8,
  },
  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  emptyBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
  },
});
