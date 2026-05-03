import React, { ReactNode } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export function GradientCard({
  colors,
  style,
  children,
  radius = 20,
}: {
  colors: [string, string];
  style?: ViewStyle | ViewStyle[];
  children?: ReactNode;
  radius?: number;
}) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderRadius: radius }, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
  },
});
