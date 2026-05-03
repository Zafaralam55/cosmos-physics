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
import { useApp, useSettings } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { apiRequestOtp, apiVerifyOtp, setToken } from "@/lib/apiClient";

type LoginMode = "password" | "email-otp" | "mobile-otp";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { studentLogin, loadStudentFromApi } = useApp();
  const settings = useSettings();

  const [mode, setMode] = useState<LoginMode>("password");

  // password fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  // email OTP
  const [otpEmail, setOtpEmail] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);

  // mobile OTP
  const [phone, setPhone] = useState("");
  const [mobileOtpSent, setMobileOtpSent] = useState(false);

  // shared OTP
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);

  // shown code banner (when email service not configured)
  const [shownCode, setShownCode] = useState<string | null>(null);

  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = isWeb ? Math.max(insets.bottom, 34) : insets.bottom;

  const switchMode = (m: LoginMode) => {
    setMode(m);
    setEmailOtpSent(false);
    setMobileOtpSent(false);
    setOtp("");
    setShownCode(null);
    setSending(false);
  };

  // ── Password login ──────────────────────────────────────────────────────────
  const submit = async () => {
    if (!email.includes("@")) {
      Alert.alert("Enter a valid email");
      return;
    }
    if (!password) {
      Alert.alert("Enter your password");
      return;
    }
    const found = await studentLogin(email, password);
    if (!found) {
      Alert.alert(
        "Sign-in failed",
        "Email or password is incorrect. If you don't have an account yet, tap 'Create a student account' below.",
      );
      return;
    }
    router.back();
  };

  // ── Email OTP ───────────────────────────────────────────────────────────────
  const sendEmailOtp = async () => {
    if (!otpEmail.includes("@")) {
      Alert.alert("Enter a valid email first");
      return;
    }
    setSending(true);
    setShownCode(null);
    try {
      const res = await apiRequestOtp(otpEmail.trim().toLowerCase(), "email", "student");
      setEmailOtpSent(true);
      if (res.dev && res.otp) {
        // No email service configured — show code on screen and auto-fill
        setOtp(res.otp);
        setShownCode(res.otp);
      } else {
        Alert.alert("Code sent", `A 6-digit code was sent to ${otpEmail.trim()}`);
      }
    } catch (err: unknown) {
      Alert.alert("Failed to send OTP", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSending(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (otp.length < 6) {
      Alert.alert("Enter the 6-digit code");
      return;
    }
    try {
      const res = await apiVerifyOtp(otpEmail.trim().toLowerCase(), otp.trim(), "email", "student");
      await setToken("student", res.token);
      if (loadStudentFromApi) await loadStudentFromApi(res.user);
      router.back();
    } catch (err: unknown) {
      Alert.alert("Invalid code", err instanceof Error ? err.message : "Please try again.");
    }
  };

  // ── Mobile OTP ──────────────────────────────────────────────────────────────
  const sendMobileOtp = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      Alert.alert("Enter a valid mobile number (10 digits)");
      return;
    }
    const normalPhone = cleaned.startsWith("91") && cleaned.length === 12 ? `+${cleaned}` : `+91${cleaned.slice(-10)}`;
    setSending(true);
    setShownCode(null);
    try {
      const res = await apiRequestOtp(normalPhone, "sms", "student");
      setMobileOtpSent(true);
      if (res.dev && res.otp) {
        // No SMS service configured — show code on screen and auto-fill
        setOtp(res.otp);
        setShownCode(res.otp);
      } else {
        Alert.alert("Code sent", `A 6-digit code was sent to ${normalPhone}`);
      }
    } catch (err: unknown) {
      Alert.alert("Failed to send OTP", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSending(false);
    }
  };

  const verifyMobileOtp = async () => {
    if (otp.length < 6) {
      Alert.alert("Enter the 6-digit code");
      return;
    }
    const cleaned = phone.replace(/\D/g, "");
    const normalPhone = cleaned.startsWith("91") && cleaned.length === 12 ? `+${cleaned}` : `+91${cleaned.slice(-10)}`;
    try {
      const res = await apiVerifyOtp(normalPhone, otp.trim(), "sms", "student");
      await setToken("student", res.token);
      if (loadStudentFromApi) await loadStudentFromApi(res.user);
      router.back();
    } catch (err: unknown) {
      Alert.alert("Invalid code", err instanceof Error ? err.message : "Please try again.");
    }
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

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: bottomInset + 24,
            justifyContent: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: "center", marginBottom: 28 }}>
            <AtomLogo size={72} />
            <Text style={[styles.title, { color: colors.foreground }]}>
              Welcome to {settings.appName.split(" ")[0] || "Cosmos"}
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {settings.tagline}
            </Text>
          </View>

          <View style={[styles.headerBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="user" size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.6 }}>
              STUDENT SIGN IN
            </Text>
          </View>

          {/* Mode toggle — 3 tabs */}
          <View style={[styles.modeToggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              onPress={() => switchMode("password")}
              style={[styles.modeBtn, { backgroundColor: mode === "password" ? colors.secondary : "transparent" }]}
            >
              <Feather name="lock" size={12} color={mode === "password" ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.modeBtnText, { color: mode === "password" ? colors.primary : colors.mutedForeground }]}>
                Password
              </Text>
            </Pressable>
            <Pressable
              onPress={() => switchMode("email-otp")}
              style={[styles.modeBtn, { backgroundColor: mode === "email-otp" ? colors.secondary : "transparent" }]}
            >
              <Feather name="mail" size={12} color={mode === "email-otp" ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.modeBtnText, { color: mode === "email-otp" ? colors.primary : colors.mutedForeground }]}>
                Email OTP
              </Text>
            </Pressable>
            <Pressable
              onPress={() => switchMode("mobile-otp")}
              style={[styles.modeBtn, { backgroundColor: mode === "mobile-otp" ? colors.secondary : "transparent" }]}
            >
              <Feather name="smartphone" size={12} color={mode === "mobile-otp" ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.modeBtnText, { color: mode === "mobile-otp" ? colors.primary : colors.mutedForeground }]}>
                Mobile OTP
              </Text>
            </Pressable>
          </View>

          {/* ── Password mode ── */}
          {mode === "password" && (
            <>
              <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 14 }]}>
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
                <Feather name="lock" size={16} color={colors.mutedForeground} />
                <TextInput
                  placeholder="Password"
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
              <PrimaryButton label="Sign In" icon="log-in" onPress={submit} style={{ marginTop: 16 }} />

              <Pressable
                onPress={() => router.push("/forgot-password" as never)}
                style={{ alignSelf: "center", marginTop: 10, paddingVertical: 4 }}
              >
                <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>
                  Forgot password?
                </Text>
              </Pressable>

              <View style={[styles.demoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="info" size={14} color={colors.primary} />
                  <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 12 }}>
                    Demo student account
                  </Text>
                </View>
                <Text style={[styles.demoLine, { color: colors.mutedForeground }]}>Email: arjun.sharma@cosmos.in</Text>
                <Text style={[styles.demoLine, { color: colors.mutedForeground }]}>Password: Cosmos@2026</Text>
                <Pressable
                  onPress={() => { setEmail("arjun.sharma@cosmos.in"); setPassword("Cosmos@2026"); }}
                  style={{ marginTop: 6 }}
                >
                  <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 12 }}>
                    Use demo credentials →
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          {/* ── Email OTP mode ── */}
          {mode === "email-otp" && (
            <>
              <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 14 }]}>
                <Feather name="mail" size={16} color={colors.mutedForeground} />
                <TextInput
                  placeholder="Email address"
                  placeholderTextColor={colors.mutedForeground}
                  value={otpEmail}
                  onChangeText={setOtpEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.input, { color: colors.foreground }]}
                />
              </View>
              {!emailOtpSent ? (
                <PrimaryButton
                  label={sending ? "Sending…" : "Send OTP to Email"}
                  icon="send"
                  onPress={sendEmailOtp}
                  style={{ marginTop: 14 }}
                />
              ) : (
                <>
                  {shownCode ? (
                    <OtpCodeBanner code={shownCode} colors={colors} />
                  ) : null}
                  <OtpInput colors={colors} value={otp} onChange={setOtp} />
                  <PrimaryButton label="Verify & Sign In" icon="check-circle" onPress={verifyEmailOtp} style={{ marginTop: 12 }} />
                  <ResendBtn onPress={sendEmailOtp} colors={colors} />
                </>
              )}
            </>
          )}

          {/* ── Mobile OTP mode ── */}
          {mode === "mobile-otp" && (
            <>
              <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 14 }]}>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold", fontSize: 14, marginRight: 2 }}>+91</Text>
                <View style={{ width: 1, height: 20, backgroundColor: colors.border, marginRight: 6 }} />
                <Feather name="smartphone" size={16} color={colors.mutedForeground} />
                <TextInput
                  placeholder="Mobile number"
                  placeholderTextColor={colors.mutedForeground}
                  value={phone}
                  onChangeText={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
                  keyboardType="number-pad"
                  style={[styles.input, { color: colors.foreground }]}
                />
              </View>
              <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
                Enter the mobile number registered with your account
              </Text>
              {!mobileOtpSent ? (
                <PrimaryButton
                  label={sending ? "Sending…" : "Send OTP via SMS"}
                  icon="message-square"
                  onPress={sendMobileOtp}
                  style={{ marginTop: 14 }}
                />
              ) : (
                <>
                  {shownCode ? (
                    <OtpCodeBanner code={shownCode} colors={colors} />
                  ) : null}
                  <OtpInput colors={colors} value={otp} onChange={setOtp} />
                  <PrimaryButton label="Verify & Sign In" icon="check-circle" onPress={verifyMobileOtp} style={{ marginTop: 12 }} />
                  <ResendBtn onPress={sendMobileOtp} colors={colors} />
                </>
              )}
            </>
          )}

          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          <Pressable
            onPress={() => router.push("/teacher/login" as never)}
            style={[styles.altLink, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="award" size={14} color={colors.primary} />
            <Text style={[styles.altLinkText, { color: colors.foreground }]}>I'm a teacher</Text>
            <Feather name="arrow-right" size={14} color={colors.mutedForeground} />
          </Pressable>

          <Pressable
            onPress={() => router.push("/admin" as never)}
            style={[styles.altLink, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 10 }]}
          >
            <Feather name="shield" size={14} color={colors.primary} />
            <Text style={[styles.altLinkText, { color: colors.foreground }]}>Founder / Admin sign in</Text>
            <Feather name="arrow-right" size={14} color={colors.mutedForeground} />
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>new here?</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          <Pressable
            onPress={() => router.push("/signup" as never)}
            style={[styles.altLink, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="user-plus" size={14} color={colors.primary} />
            <Text style={[styles.altLinkText, { color: colors.foreground }]}>Create a student account</Text>
            <Feather name="arrow-right" size={14} color={colors.mutedForeground} />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function OtpCodeBanner({ code, colors }: { code: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View
      style={{
        marginTop: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.primary,
        backgroundColor: colors.primary + "18",
        padding: 16,
        alignItems: "center",
        gap: 6,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Feather name="key" size={14} color={colors.primary} />
        <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 0.4 }}>
          YOUR LOGIN CODE
        </Text>
      </View>
      <Text
        style={{
          color: colors.foreground,
          fontFamily: "Inter_700Bold",
          fontSize: 32,
          letterSpacing: 10,
          marginTop: 2,
        }}
      >
        {code}
      </Text>
      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "center" }}>
        Code is pre-filled below. Tap "Verify & Sign In" to continue.
      </Text>
    </View>
  );
}

function OtpInput({ colors, value, onChange }: { colors: ReturnType<typeof useColors>; value: string; onChange: (v: string) => void }) {
  return (
    <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
      <Feather name="hash" size={16} color={colors.mutedForeground} />
      <TextInput
        placeholder="6-digit code"
        placeholderTextColor={colors.mutedForeground}
        value={value}
        onChangeText={(v) => onChange(v.replace(/\D/g, "").slice(0, 6))}
        keyboardType="number-pad"
        style={[styles.input, { color: colors.foreground, letterSpacing: 6, fontFamily: "Inter_700Bold" }]}
      />
    </View>
  );
}

function ResendBtn({ onPress, colors }: { onPress: () => void; colors: ReturnType<typeof useColors> }) {
  return (
    <Pressable onPress={onPress} style={{ alignSelf: "center", marginTop: 10, paddingVertical: 4 }}>
      <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>
        Resend code
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: "Inter_700Bold", fontSize: 24, marginTop: 16, letterSpacing: -0.5, textAlign: "center" },
  subtitle: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 6, textAlign: "center" },
  headerBadge: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 14,
  },
  modeToggle: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    alignSelf: "stretch",
  },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
  },
  modeBtnText: { fontFamily: "Inter_700Bold", fontSize: 11 },
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
  hintText: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 6, marginLeft: 2 },
  demoCard: { marginTop: 16, padding: 14, borderRadius: 14, borderWidth: 1, gap: 4 },
  demoLine: { fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 2 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 24 },
  divider: { flex: 1, height: 1 },
  dividerText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  altLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
  },
  altLinkText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  footer: { fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "center", marginTop: 20, lineHeight: 16 },
});
