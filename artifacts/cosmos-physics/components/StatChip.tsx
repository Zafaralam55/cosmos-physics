import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function StatChip({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  tint?: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: (tint || colors.primary) + "26" },
        ]}
      >
        <Feather name={icon} size={14} color={tint || colors.primary} />
      </View>
      <View>
        <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  label: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 1,
  },
});
