import React, { ReactNode } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StarryBackground } from "@/components/StarryBackground";
import { useColors } from "@/hooks/useColors";

export function ScreenContainer({
  children,
  scroll = true,
  showStars = true,
  bottomPad = 120,
}: {
  children: ReactNode;
  scroll?: boolean;
  showStars?: boolean;
  bottomPad?: number;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = isWeb ? Math.max(insets.bottom, 34) : insets.bottom;

  const Inner = (
    <View style={{ flex: 1, paddingTop: topInset, paddingBottom: bottomInset }}>
      {children}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {showStars ? <StarryBackground /> : null}
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingTop: topInset,
            paddingBottom: bottomInset + bottomPad,
          }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        Inner
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
});
