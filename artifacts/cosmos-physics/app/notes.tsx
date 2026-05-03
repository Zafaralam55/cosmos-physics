import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Linking } from "react-native";
import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ScreenContainer";
import { useApp } from "@/contexts/AppContext";
import { formulas } from "@/data/notes";
import { useColors } from "@/hooks/useColors";
import { apiObjectUrl } from "@/lib/apiClient";

const TABS = ["All", "Notes", "Formula Sheet", "PYQ", "Numerical Sheet"] as const;

export default function NotesScreen() {
  const colors = useColors();
  const { allResources: resources } = useApp();
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");

  const filtered = useMemo(() => {
    return tab === "All" ? resources : resources.filter((r) => r.category === tab);
  }, [tab, resources]);

  const iconFor = (cat: string) =>
    cat === "Notes"
      ? "book"
      : cat === "Formula Sheet"
        ? "list"
        : cat === "PYQ"
          ? "archive"
          : "edit-3";

  const colorFor = (cat: string) =>
    cat === "Notes"
      ? "#5B8CFF"
      : cat === "Formula Sheet"
        ? "#FACC15"
        : cat === "PYQ"
          ? "#8B5CF6"
          : "#34D399";

  const openResource = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Cannot open link", "The file URL could not be opened on this device.");
    }
  };

  const copyFormula = async (expr: string) => {
    await Clipboard.setStringAsync(expr);
    Alert.alert("Copied!", `${expr}`);
  };

  return (
    <ScreenContainer showStars>
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={[styles.h1, { color: colors.foreground }]}>Study Material</Text>
        <Text style={[styles.h1Sub, { color: colors.mutedForeground }]}>
          Notes, formula sheets, PYQs and practice
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginTop: 16 }}
        style={{ marginTop: 16, flexGrow: 0 }}
      >
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
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
                {t}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 10 }}>
        {filtered.map((r) => {
          const c = colorFor(r.category);
          const resourceUrl = r.pdfObjectPath
            ? apiObjectUrl(r.pdfObjectPath)
            : r.driveUrl ?? null;
          return (
            <View
              key={r.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.fileIcon, { backgroundColor: c + "26" }]}>
                <Feather name={iconFor(r.category) as never} size={20} color={c} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>{r.title}</Text>
                <View style={styles.metaRow}>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>{r.topic}</Text>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>·</Text>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>{r.pages} pages</Text>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>·</Text>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>{r.size}</Text>
                </View>
                {r.driveUrl && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <Feather name="link" size={10} color={colors.primary} />
                    <Text style={[styles.meta, { color: colors.primary }]} numberOfLines={1}>
                      Drive
                    </Text>
                  </View>
                )}
              </View>
              {resourceUrl ? (
                <Pressable
                  hitSlop={10}
                  onPress={() => openResource(resourceUrl)}
                  style={[styles.dlBtn, { backgroundColor: colors.secondary }]}
                >
                  <Feather
                    name={r.pdfObjectPath ? "file-text" : "external-link"}
                    size={16}
                    color={colors.primary}
                  />
                </Pressable>
              ) : (
                <View style={[styles.dlBtn, { backgroundColor: colors.muted }]}>
                  <Feather name="download" size={16} color={colors.mutedForeground} />
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
        <Text style={[styles.section, { color: colors.foreground }]}>Quick Formula Reference</Text>
        <Text style={[styles.h1Sub, { color: colors.mutedForeground }]}>
          Tap any formula to copy
        </Text>
      </View>
      <View style={{ paddingHorizontal: 20, marginTop: 12, gap: 8 }}>
        {formulas.slice(0, 8).map((f) => (
          <Pressable
            key={f.id}
            onPress={() => copyFormula(f.expression)}
            style={[styles.formulaRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.formulaName, { color: colors.foreground }]}>{f.name}</Text>
              <Text style={[styles.formulaTopic, { color: colors.mutedForeground }]}>{f.topic}</Text>
            </View>
            <Text style={[styles.formulaExpr, { color: colors.primary }]}>{f.expression}</Text>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5, marginTop: 4 },
  h1Sub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  fileIcon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" },
  meta: { fontFamily: "Inter_500Medium", fontSize: 11 },
  dlBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  section: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: -0.3 },
  formulaRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  formulaName: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  formulaTopic: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 2 },
  formulaExpr: { fontFamily: "Inter_700Bold", fontSize: 14 },
});
