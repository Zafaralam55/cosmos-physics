import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
import { apiRegister, setToken } from "@/lib/apiClient";

export default function SignupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { loadStudentFromApi } = useApp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = isWeb ? Math.max(insets.bottom, 34) : insets.bottom;

  const handleSignup = async () => {
    if (!name.trim()) { Alert.alert("Enter your full name"); return; }
    if (!email.includes("@")) { Alert.alert("Enter a valid email"); return; }
    if (password.length < 6) { Alert.alert("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { Alert.alert("Passwords do not match"); return; }

    setLoading(true);
    try {
      const res = await apiRegister({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
      });
      await setToken("student", res.token);
      if (loadStudentFromApi) await loadStudentFromApi(res.user);
      Alert.alert("Welcome!", `Account created for ${res.user.name}. You are now signed in.`, [
        { text: "Continue", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (err: unknown) {
      Alert.alert("Sign up failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StarryBackground />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={{ paddingTop: topInset + 12, paddingHorizontal: 20 }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
          >
            <Feather name="x" size={22} color={colors.foreground} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: bottomInset + 24,
            justifyContent: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <AtomLogo size={64} />
            <Text style={[styles.title, { color: colors.foreground }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Join as a student and start learning
            </Text>
          </View>

          <View style={[styles.badge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="user-plus" size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.6 }}>
              STUDENT SIGN UP
            </Text>
          </View>

          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 14 }]}>
            <Feather name="user" size={16} color={colors.mutedForeground} />
            <TextInput
              placeholder="Full name"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              style={[styles.input, { color: colors.foreground }]}
            />
          </View>

          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
            <Feather name="mail" size={16} color={colors.mutedForeground} />
            <TextInput
              placeholder="Email address"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, { color: colors.foreground }]}
            />
          </View>

          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold", fontSize: 14, marginRight: 2 }}>+91</Text>
            <View style={{ width: 1, height: 20, backgroundColor: colors.border, marginRight: 6 }} />
            <Feather name="smartphone" size={16} color={colors.mutedForeground} />
            <TextInput
              placeholder="Mobile number (optional)"
              placeholderTextColor={colors.mutedForeground}
              value={phone}
              onChangeText={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
              keyboardType="number-pad"
              style={[styles.input, { color: colors.foreground }]}
            />
          </View>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Add mobile to use SMS OTP login later
          </Text>

          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
            <Feather name="lock" size={16} color={colors.mutedForeground} />
            <TextInput
              placeholder="Password (min 6 characters)"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              autoCapitalize="none"
              style={[styles.input, { color: colors.foreground }]}
            />
            <Pressable onPress={() => setShowPwd((v) => !v)} hitSlop={10}>
              <Feather name={showPwd ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
            <Feather name="check-circle" size={16} color={colors.mutedForeground} />
            <TextInput
              placeholder="Confirm password"
              placeholderTextColor={colors.mutedForeground}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPwd}
              autoCapitalize="none"
              style={[styles.input, { color: colors.foreground }]}
            />
          </View>

          <PrimaryButton
            label={loading ? "Creating account…" : "Create Account"}
            icon="user-plus"
            onPress={handleSignup}
            style={{ marginTop: 18 }}
          />

          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>already have an account?</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          <Pressable
            onPress={() => router.replace("/login" as never)}
            style={[styles.signInBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="log-in" size={14} color={colors.primary} />
            <Text style={[styles.signInText, { color: colors.foreground }]}>Sign In</Text>
            <Feather name="arrow-right" size={14} color={colors.mutedForeground} />
          </Pressable>

          <Text style={[styles.footer, { color: colors.mutedForeground }]}>
            By creating an account you agree to the academy's terms of use.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: "Inter_700Bold", fontSize: 24, marginTop: 14, letterSpacing: -0.5, textAlign: "center" },
  subtitle: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 6, textAlign: "center" },
  badge: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 4,
  },
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
  hint: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 4, marginLeft: 2 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 22 },
  divider: { flex: 1, height: 1 },
  dividerText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  signInBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
  },
  signInText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  footer: { fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "center", marginTop: 18, lineHeight: 16 },
});
