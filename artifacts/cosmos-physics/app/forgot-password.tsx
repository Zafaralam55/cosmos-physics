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
import { useColors } from "@/hooks/useColors";
import { apiForgotPassword, apiResetPassword } from "@/lib/apiClient";

type Step = "email" | "otp" | "newpwd" | "done";

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = isWeb ? Math.max(insets.bottom, 34) : insets.bottom;

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [shownCode, setShownCode] = useState<string | null>(null);
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!email.includes("@")) {
      Alert.alert("Enter a valid email address");
      return;
    }
    setLoading(true);
    setShownCode(null);
    try {
      const res = await apiForgotPassword(email.trim().toLowerCase());
      if (res.dev && res.otp) {
        // No email service configured — auto-fill and show code on screen
        setOtp(res.otp);
        setShownCode(res.otp);
      } else {
        Alert.alert("Code sent", `A 6-digit reset code was sent to ${email.trim()}`);
      }
      setStep("otp");
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = () => {
    if (otp.replace(/\D/g, "").length < 6) {
      Alert.alert("Enter the 6-digit code from your email");
      return;
    }
    setStep("newpwd");
  };

  const resetPassword = async () => {
    if (newPwd.length < 6) {
      Alert.alert("Password must be at least 6 characters");
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await apiResetPassword(email.trim().toLowerCase(), otp.trim(), newPwd);
      setStep("done");
    } catch (err: unknown) {
      Alert.alert("Reset failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = step === "email" ? 0 : step === "otp" ? 1 : step === "newpwd" ? 2 : 3;

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
            <Feather name="arrow-left" size={22} color={colors.foreground} />
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
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <AtomLogo size={68} />
            <Text style={[styles.title, { color: colors.foreground }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              We'll send a code to your registered email
            </Text>
          </View>

          {step !== "done" && (
            <View style={[styles.stepRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {["Email", "Code", "New Password"].map((label, i) => (
                <View key={label} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: i < stepIndex ? colors.primary : i === stepIndex ? colors.primary : colors.muted,
                        opacity: i <= stepIndex ? 1 : 0.35,
                      },
                    ]}
                  >
                    {i < stepIndex ? (
                      <Feather name="check" size={10} color="#fff" />
                    ) : (
                      <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 10 }}>{i + 1}</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      {
                        color: i <= stepIndex ? colors.foreground : colors.mutedForeground,
                        opacity: i <= stepIndex ? 1 : 0.45,
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Step 1: Email ── */}
          {step === "email" && (
            <View style={{ marginTop: 24, gap: 12 }}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                Enter the email address linked to your Cosmos account
              </Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="mail" size={16} color={colors.mutedForeground} />
                <TextInput
                  placeholder="Your email address"
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.input, { color: colors.foreground }]}
                />
              </View>
              <PrimaryButton
                label={loading ? "Sending…" : "Send Reset Code"}
                icon="send"
                onPress={sendOtp}
                style={{ marginTop: 4 }}
              />
            </View>
          )}

          {/* ── Step 2: OTP ── */}
          {step === "otp" && (
            <View style={{ marginTop: 24, gap: 12 }}>
              {shownCode ? (
                <View
                  style={{
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
                      YOUR RESET CODE
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
                    {shownCode}
                  </Text>
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "center" }}>
                    Code is pre-filled below. Valid for 15 minutes.
                  </Text>
                </View>
              ) : (
                <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Feather name="mail" size={14} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                    A 6-digit code was sent to{" "}
                    <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>{email}</Text>
                    . It expires in 15 minutes.
                  </Text>
                </View>
              )}
              <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="hash" size={16} color={colors.mutedForeground} />
                <TextInput
                  placeholder="6-digit code"
                  placeholderTextColor={colors.mutedForeground}
                  value={otp}
                  onChangeText={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
                  keyboardType="number-pad"
                  style={[styles.input, { color: colors.foreground, letterSpacing: 8, fontFamily: "Inter_700Bold" }]}
                />
              </View>
              <PrimaryButton
                label="Verify Code"
                icon="check-circle"
                onPress={verifyOtp}
                style={{ marginTop: 4 }}
              />
              <Pressable onPress={sendOtp} style={{ alignSelf: "center", paddingVertical: 4 }}>
                <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>
                  Resend code
                </Text>
              </Pressable>
            </View>
          )}

          {/* ── Step 3: New password ── */}
          {step === "newpwd" && (
            <View style={{ marginTop: 24, gap: 12 }}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                Choose a strong new password (min 6 characters)
              </Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="lock" size={16} color={colors.mutedForeground} />
                <TextInput
                  placeholder="New password"
                  placeholderTextColor={colors.mutedForeground}
                  value={newPwd}
                  onChangeText={setNewPwd}
                  secureTextEntry={!showPwd}
                  autoCapitalize="none"
                  style={[styles.input, { color: colors.foreground }]}
                />
                <Pressable onPress={() => setShowPwd((v) => !v)} hitSlop={10}>
                  <Feather name={showPwd ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
                </Pressable>
              </View>
              <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="lock" size={16} color={colors.mutedForeground} />
                <TextInput
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.mutedForeground}
                  value={confirmPwd}
                  onChangeText={setConfirmPwd}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  style={[styles.input, { color: colors.foreground }]}
                />
                <Pressable onPress={() => setShowConfirm((v) => !v)} hitSlop={10}>
                  <Feather name={showConfirm ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
                </Pressable>
              </View>
              {newPwd.length > 0 && confirmPwd.length > 0 && newPwd !== confirmPwd ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Feather name="alert-circle" size={12} color="#FF5470" />
                  <Text style={{ color: "#FF5470", fontFamily: "Inter_500Medium", fontSize: 12 }}>
                    Passwords do not match
                  </Text>
                </View>
              ) : null}
              <PrimaryButton
                label={loading ? "Saving…" : "Set New Password"}
                icon="shield"
                onPress={resetPassword}
                style={{ marginTop: 4 }}
              />
            </View>
          )}

          {/* ── Done ── */}
          {step === "done" && (
            <View style={{ alignItems: "center", gap: 20, marginTop: 16 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.primary + "22",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="check-circle" size={40} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.foreground, marginTop: 0 }]}>Password reset!</Text>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                Your password has been updated successfully. You can now sign in with your new password.
              </Text>
              <Pressable
                onPress={() => router.replace("/login" as never)}
                style={[
                  styles.goSignIn,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Feather name="log-in" size={16} color="#fff" />
                <Text style={styles.goSignInLabel}>Go to Sign In</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: "Inter_700Bold", fontSize: 24, marginTop: 14, letterSpacing: -0.5, textAlign: "center" },
  subtitle: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 6, textAlign: "center" },
  stepRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 4,
  },
  stepItem: { flex: 1, alignItems: "center", gap: 6 },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  fieldLabel: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
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
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  goSignIn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  goSignInLabel: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 15 },
});
