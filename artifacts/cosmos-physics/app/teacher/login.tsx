import { Feather } from "@expo/vector-icons";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AtomLogo } from "@/components/AtomLogo";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StarryBackground } from "@/components/StarryBackground";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function TeacherLogin() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { teacherLogin, state } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = isWeb ? Math.max(insets.bottom, 34) : insets.bottom;

  const submit = async () => {
    const t = await teacherLogin(email, password);
    if (!t) {
      Alert.alert(
        "Invalid credentials",
        state.teachers.length === 0
          ? "No teacher accounts exist yet. Ask the founder to create one."
          : "Please double-check your email and password.",
      );
      return;
    }
    router.replace("/teacher" as never);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StarryBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ paddingTop: topInset + 12, paddingHorizontal: 20 }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
          >
            <Feather name="x" size={22} color={colors.foreground} />
          </Pressable>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: "center" }}>
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <AtomLogo size={64} />
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.secondary, borderColor: colors.border },
              ]}
            >
              <Feather name="award" size={12} color={colors.primary} />
              <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 11 }}>
                TEACHER PORTAL
              </Text>
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Sign in to teach</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground, textAlign: "center" }]}>
              Schedule live classes, post notes, and create quizzes
            </Text>
          </View>

          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="mail" size={16} color={colors.mutedForeground} />
            <TextInput
              placeholder="Teacher email"
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
              { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 },
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

          <PrimaryButton
            label="Sign In to Teach"
            icon="log-in"
            onPress={submit}
            style={{ marginTop: 16 }}
          />

          <View
            style={[
              styles.hint,
              { backgroundColor: colors.card, borderColor: colors.border, marginTop: 16 },
            ]}
          >
            <Feather name="info" size={14} color={colors.primary} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 12 }]}>
                Demo teacher account
              </Text>
              <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
                Email: priya.teacher@cosmos.in
              </Text>
              <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
                Password: Teacher@2026
              </Text>
              <Pressable
                onPress={() => {
                  setEmail("priya.teacher@cosmos.in");
                  setPassword("Teacher@2026");
                }}
                style={{ marginTop: 4 }}
              >
                <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 12 }}>
                  Use demo credentials →
                </Text>
              </Pressable>
            </View>
          </View>

          <View
            style={[
              styles.hint,
              { backgroundColor: colors.card, borderColor: colors.border, marginTop: 10 },
            ]}
          >
            <Feather name="user-plus" size={14} color={colors.mutedForeground} />
            <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
              Don't have an account? Ask the founder to invite you from the Founder Dashboard → Teachers.
            </Text>
          </View>

          <Text
            style={[
              styles.footer,
              { color: colors.mutedForeground, marginBottom: bottomInset + 8 },
            ]}
          >
            Cosmos Physics Academy · Teacher Portal
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 14,
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, marginTop: 10, letterSpacing: -0.5 },
  subtitle: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 6 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
  },
  input: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 15 },
  hint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  hintText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 12, lineHeight: 17 },
  footer: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textAlign: "center",
    marginTop: 24,
  },
});
