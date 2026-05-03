import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, ViewStyle } from "react-native";

export function PrimaryButton({
  label,
  onPress,
  icon,
  loading,
  disabled,
  variant = "primary",
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Feather>["name"];
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "outline";
  style?: ViewStyle | ViewStyle[];
}) {
  const handle = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

  if (variant === "ghost") {
    return (
      <Pressable
        onPress={handle}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.ghost,
          { opacity: pressed ? 0.7 : 1 },
          style,
        ]}
      >
        {icon ? <Feather name={icon} size={16} color="#5B8CFF" /> : null}
        <Text style={styles.ghostLabel}>{label}</Text>
      </Pressable>
    );
  }

  if (variant === "outline") {
    return (
      <Pressable
        onPress={handle}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.outline,
          { opacity: pressed ? 0.8 : 1 },
          disabled && { opacity: 0.5 },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#5B8CFF" />
        ) : (
          <>
            {icon ? <Feather name={icon} size={16} color="#5B8CFF" /> : null}
            <Text style={styles.outlineLabel}>{label}</Text>
          </>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handle}
      disabled={disabled || loading}
      style={({ pressed }) => [
        { opacity: disabled ? 0.5 : pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        style,
      ]}
    >
      <LinearGradient
        colors={["#5B8CFF", "#8B5CF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            {icon ? <Feather name={icon} size={16} color="#FFFFFF" /> : null}
            <Text style={styles.gradLabel}>{label}</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  gradLabel: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    letterSpacing: 0.2,
  },
  outline: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#5B8CFF",
    backgroundColor: "transparent",
  },
  outlineLabel: {
    color: "#5B8CFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  ghost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  ghostLabel: {
    color: "#5B8CFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
