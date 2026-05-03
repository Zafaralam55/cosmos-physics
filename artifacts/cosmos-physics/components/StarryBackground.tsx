import React, { useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Star = {
  x: number;
  y: number;
  size: number;
  opacity: number;
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export function StarryBackground({
  height,
  starCount = 60,
}: {
  height?: number;
  starCount?: number;
}) {
  const h = height ?? SCREEN_H;
  const stars = useMemo<Star[]>(() => {
    const arr: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      arr.push({
        x: Math.random() * SCREEN_W,
        y: Math.random() * h,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }
    return arr;
  }, [h, starCount]);

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { height: h, overflow: "hidden" }]}
    >
      <LinearGradient
        colors={["#050816", "#0A0F2E", "#050816"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(91,140,255,0.18)", "transparent"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 0.8 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["transparent", "rgba(139,92,246,0.18)"]}
        start={{ x: 0, y: 0.4 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {stars.map((s, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            borderRadius: s.size / 2,
            backgroundColor: "#FFFFFF",
            opacity: s.opacity,
          }}
        />
      ))}
    </View>
  );
}
