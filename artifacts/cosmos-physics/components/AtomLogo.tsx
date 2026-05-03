import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export function AtomLogo({ size = 56 }: { size?: number }) {
  const rot = useSharedValue(0);

  React.useEffect(() => {
    rot.value = withRepeat(
      withTiming(360, { duration: 9000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rot]);

  const ring1 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }],
  }));
  const ring2 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-rot.value * 0.7}deg` }, { skewX: "0deg" }],
  }));
  const ring3 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value * 0.5 + 60}deg` }],
  }));

  const ringStyle = (rotation: number) => ({
    width: size,
    height: size * 0.45,
    borderRadius: size,
    borderWidth: 1.5,
    borderColor: "#5B8CFF",
    position: "absolute" as const,
    top: size * 0.275,
    left: 0,
    transform: [{ rotate: `${rotation}deg` }],
  });

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View style={[ringStyle(0), ring1]} />
      <Animated.View style={[ringStyle(60), ring2]} />
      <Animated.View style={[ringStyle(-60), ring3]} />
      <View
        style={{
          width: size * 0.18,
          height: size * 0.18,
          borderRadius: size,
          backgroundColor: "#FFFFFF",
          shadowColor: "#5B8CFF",
          shadowOpacity: 1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
