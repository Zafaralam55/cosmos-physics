import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/contexts/AppContext";
import { registerForPushNotifications } from "@/lib/pushNotifications";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#050816" },
        headerTitleStyle: {
          color: "#E6EAFF",
          fontFamily: "Inter_700Bold",
          fontSize: 17,
        },
        headerTintColor: "#5B8CFF",
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: "#050816" },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="course/[id]" options={{ title: "Course" }} />
      <Stack.Screen name="quiz/[id]" options={{ title: "Quiz", headerShown: false }} />
      <Stack.Screen name="quiz/result" options={{ headerShown: false }} />
      <Stack.Screen name="notes" options={{ title: "Notes & Material" }} />
      <Stack.Screen name="doubt" options={{ title: "Doubt Solving" }} />
      <Stack.Screen name="founder" options={{ title: "Meet the Founder" }} />
      <Stack.Screen name="admin" options={{ title: "Founder Dashboard" }} />
      <Stack.Screen name="admin/manage" options={{ title: "Manage Content" }} />
      <Stack.Screen name="teacher/login" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="teacher/index" options={{ title: "Teacher Dashboard" }} />
      <Stack.Screen name="tools" options={{ title: "Physics Tools" }} />
      <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
      <Stack.Screen name="payment" options={{ title: "Plans & Pricing" }} />
      <Stack.Screen name="leaderboard" options={{ title: "Leaderboard" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      registerForPushNotifications();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    // Permanently suppress the Replit badge via localStorage preference key
    // (the replit-pill script checks this before creating the element)
    try { window.localStorage.setItem("replit-pill-preference", "hidden"); } catch { /* ignore */ }
    // Inject CSS targeting the actual host element id used by replit-pill.global.js
    const style = document.createElement("style");
    style.textContent = "#replit-pill-host{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;}";
    document.head.appendChild(style);
    // Hide any already-created instance and watch for new ones
    const hide = () => {
      const el = document.getElementById("replit-pill-host") as HTMLElement | null;
      if (el) { el.style.setProperty("display", "none", "important"); }
    };
    hide();
    const obs = new MutationObserver(hide);
    obs.observe(document.body ?? document.documentElement, { childList: true, subtree: true });
    return () => { obs.disconnect(); style.remove(); };
  }, []);

  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, backgroundColor: "#050816" }} />;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#050816" }}>
              <KeyboardProvider>
                <StatusBar style="light" />
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AppProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
