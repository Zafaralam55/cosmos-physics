import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AtomLogo } from "@/components/AtomLogo";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function AdminScreen() {
  const colors = useColors();
  const { state, adminLogin, adminLogout, allCourses, allLiveClasses, allQuizzes, allResources } =
    useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const tryLogin = async () => {
    const ok = await adminLogin(email, password);
    if (!ok) Alert.alert("Invalid credentials", "Please check the admin ID and password.");
    else {
      setEmail("");
      setPassword("");
    }
  };

  if (!state.isAdmin) {
    return (
      <ScreenContainer showStars>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.loginWrap}>
            <AtomLogo size={64} />
            <Text style={[styles.h1, { color: colors.foreground, marginTop: 16 }]}>
              Founder Sign In
            </Text>
            <Text style={[styles.h1Sub, { color: colors.mutedForeground, textAlign: "center" }]}>
              Restricted area — for the academy founder only
            </Text>

            <View style={{ width: "100%", marginTop: 28, gap: 12 }}>
              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Feather name="mail" size={16} color={colors.mutedForeground} />
                <TextInput
                  placeholder="Admin email"
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[styles.input, { color: colors.foreground }]}
                />
              </View>

              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Feather name="lock" size={16} color={colors.mutedForeground} />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPwd}
                  style={[styles.input, { color: colors.foreground }]}
                />
                <Pressable onPress={() => setShowPwd((v) => !v)} hitSlop={10}>
                  <Feather
                    name={showPwd ? "eye-off" : "eye"}
                    size={16}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              </View>

              <PrimaryButton label="Sign In as Founder" icon="shield" onPress={tryLogin} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScreenContainer>
    );
  }

  const KPIS = [
    { label: "Courses Live", value: `${allCourses.length}` },
    { label: "Upcoming Live", value: `${allLiveClasses.length}` },
    { label: "Quizzes", value: `${allQuizzes.length}` },
    { label: "Study Resources", value: `${allResources.length}` },
  ];

  const SECTIONS: {
    icon: React.ComponentProps<typeof Feather>["name"];
    label: string;
    desc: string;
    color: string;
    type: "courses" | "live" | "quizzes" | "notes" | "notifications";
  }[] = [
    {
      icon: "book-open",
      label: "Manage Courses",
      desc: "Add new courses or hide existing ones",
      color: "#5B8CFF",
      type: "courses",
    },
    {
      icon: "radio",
      label: "Schedule Live Classes",
      desc: "Plan upcoming live sessions",
      color: "#FF5470",
      type: "live",
    },
    {
      icon: "award",
      label: "Manage Quizzes",
      desc: "Create or remove chapter quizzes",
      color: "#22D3EE",
      type: "quizzes",
    },
    {
      icon: "file-text",
      label: "Manage Notes & PDFs",
      desc: "Upload notes, formula sheets and PYQs",
      color: "#34D399",
      type: "notes",
    },
    {
      icon: "bell",
      label: "Send Notifications",
      desc: "Push reminders and announcements",
      color: "#FACC15",
      type: "notifications",
    },
  ];

  return (
    <ScreenContainer showStars>
      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <Text style={[styles.h1, { color: colors.foreground }]}>Founder Dashboard</Text>
        <Text style={[styles.h1Sub, { color: colors.mutedForeground }]}>
          Manage Cosmos Physics Academy
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
        <LinearGradient
          colors={["#0E1430", "#1A2042"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.welcome, { borderColor: colors.border }]}
        >
          <View style={[styles.shield, { backgroundColor: colors.primary + "26" }]}>
            <Feather name="shield" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>
              Welcome, Md Zafar Alam
            </Text>
            <Text style={[styles.welcomeSub, { color: colors.mutedForeground }]}>
              You have full admin access
            </Text>
          </View>
          <Pressable onPress={adminLogout} hitSlop={8} style={styles.signOutBtn}>
            <Feather name="log-out" size={16} color={colors.destructive} />
          </Pressable>
        </LinearGradient>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
        <Text style={[styles.section, { color: colors.foreground }]}>Snapshot</Text>
        <View style={styles.kpiGrid}>
          {KPIS.map((k) => (
            <View
              key={k.label}
              style={[styles.kpi, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>{k.label}</Text>
              <Text style={[styles.kpiValue, { color: colors.foreground }]}>{k.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <Text style={[styles.section, { color: colors.foreground }]}>Manage Content</Text>
        <View style={{ marginTop: 12, gap: 10 }}>
          {SECTIONS.map((a) => (
            <Pressable
              key={a.label}
              onPress={() =>
                router.push({ pathname: "/admin/manage", params: { type: a.type } } as never)
              }
              style={[styles.action, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.actionIcon, { backgroundColor: a.color + "26" }]}>
                <Feather name={a.icon} size={18} color={a.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionLabel, { color: colors.foreground }]}>{a.label}</Text>
                <Text style={[styles.actionDesc, { color: colors.mutedForeground }]}>{a.desc}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loginWrap: { paddingHorizontal: 24, alignItems: "center", marginTop: 40 },
  h1: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  h1Sub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 6 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
  },
  input: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14 },
  hint: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  hintTitle: { fontFamily: "Inter_700Bold", fontSize: 12 },
  hintLine: { fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 4 },
  welcome: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  shield: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  welcomeSub: { fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 2 },
  signOutBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,84,112,0.15)",
  },
  section: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  kpi: { flex: 1, minWidth: "45%", padding: 14, borderRadius: 16, borderWidth: 1 },
  kpiLabel: { fontFamily: "Inter_500Medium", fontSize: 11 },
  kpiValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    marginTop: 6,
    letterSpacing: -0.4,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { fontFamily: "Inter_700Bold", fontSize: 14 },
  actionDesc: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
});
