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

import { PrimaryButton } from "@/components/PrimaryButton";
import { StarryBackground } from "@/components/StarryBackground";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { apiChangePassword, apiUpdateProfile, setToken } from "@/lib/apiClient";

type Section = "info" | "password";

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, loadStudentFromApi } = useApp();
  const student = state.student;

  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = isWeb ? Math.max(insets.bottom, 34) : insets.bottom;

  const [section, setSection] = useState<Section>("info");

  // Profile info
  const [name, setName] = useState(student?.name ?? "");
  const [phone, setPhone] = useState(
    (student?.phone ?? "").replace(/^\+91/, ""),
  );
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);

  // Password change
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  if (!student) {
    return null;
  }

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const saveInfo = async () => {
    if (!name.trim()) {
      Alert.alert("Name cannot be empty");
      return;
    }
    setSavingInfo(true);
    setInfoSaved(false);
    try {
      const updated = await apiUpdateProfile({ name: name.trim(), phone: phone.trim() });
      if (loadStudentFromApi) await loadStudentFromApi(updated);
      setInfoSaved(true);
      setTimeout(() => setInfoSaved(false), 3000);
    } catch (err: unknown) {
      Alert.alert("Save failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSavingInfo(false);
    }
  };

  const savePassword = async () => {
    if (!currentPwd) {
      Alert.alert("Enter your current password");
      return;
    }
    if (newPwd.length < 6) {
      Alert.alert("New password must be at least 6 characters");
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert("Passwords do not match");
      return;
    }
    setSavingPwd(true);
    try {
      const res = await apiChangePassword(currentPwd, newPwd, "student");
      await setToken("student", res.token);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      Alert.alert("Password updated", "Your password has been changed successfully.");
    } catch (err: unknown) {
      Alert.alert("Failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSavingPwd(false);
    }
  };

  const pwdMismatch = newPwd.length > 0 && confirmPwd.length > 0 && newPwd !== confirmPwd;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StarryBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { paddingTop: topInset + 12, borderBottomColor: colors.border },
          ]}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={styles.backBtn}
          >
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Edit Profile
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: bottomInset + 32,
            paddingTop: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar + name display */}
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ marginLeft: 14 }}>
              <Text style={[styles.displayName, { color: colors.foreground }]}>
                {student.name}
              </Text>
              <Text style={[styles.displayEmail, { color: colors.mutedForeground }]}>
                {student.email}
              </Text>
              {student.level ? (
                <View
                  style={[styles.levelChip, { backgroundColor: colors.secondary }]}
                >
                  <Text style={[styles.levelText, { color: colors.primary }]}>
                    {student.level}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Section toggle */}
          <View
            style={[
              styles.toggle,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Pressable
              onPress={() => setSection("info")}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor:
                    section === "info" ? colors.secondary : "transparent",
                },
              ]}
            >
              <Feather
                name="user"
                size={13}
                color={section === "info" ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.toggleLabel,
                  {
                    color:
                      section === "info" ? colors.primary : colors.mutedForeground,
                  },
                ]}
              >
                Personal Info
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSection("password")}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor:
                    section === "password" ? colors.secondary : "transparent",
                },
              ]}
            >
              <Feather
                name="lock"
                size={13}
                color={
                  section === "password" ? colors.primary : colors.mutedForeground
                }
              />
              <Text
                style={[
                  styles.toggleLabel,
                  {
                    color:
                      section === "password"
                        ? colors.primary
                        : colors.mutedForeground,
                  },
                ]}
              >
                Change Password
              </Text>
            </Pressable>
          </View>

          {/* ── Personal Info ── */}
          {section === "info" && (
            <View style={{ marginTop: 24, gap: 14 }}>
              {/* Name */}
              <View style={{ gap: 6 }}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  Full Name
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Feather name="user" size={16} color={colors.mutedForeground} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Your full name"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="words"
                    style={[styles.input, { color: colors.foreground }]}
                  />
                </View>
              </View>

              {/* Phone */}
              <View style={{ gap: 6 }}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  Mobile Number
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                    }}
                  >
                    +91
                  </Text>
                  <View
                    style={{
                      width: 1,
                      height: 20,
                      backgroundColor: colors.border,
                      marginHorizontal: 2,
                    }}
                  />
                  <Feather
                    name="smartphone"
                    size={16}
                    color={colors.mutedForeground}
                  />
                  <TextInput
                    value={phone}
                    onChangeText={(v) =>
                      setPhone(v.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="10-digit mobile number"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="number-pad"
                    style={[styles.input, { color: colors.foreground }]}
                  />
                </View>
              </View>

              {/* Email (read-only) */}
              <View style={{ gap: 6 }}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  Email Address{" "}
                  <Text style={{ fontSize: 10 }}>(cannot be changed)</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.muted,
                      borderColor: colors.border,
                      opacity: 0.6,
                    },
                  ]}
                >
                  <Feather name="mail" size={16} color={colors.mutedForeground} />
                  <Text
                    style={[
                      styles.input,
                      { color: colors.mutedForeground, paddingTop: 2 },
                    ]}
                  >
                    {student.email}
                  </Text>
                </View>
              </View>

              {infoSaved ? (
                <View style={styles.successRow}>
                  <Feather name="check-circle" size={14} color="#34D399" />
                  <Text style={styles.successText}>Profile saved successfully!</Text>
                </View>
              ) : null}

              <PrimaryButton
                label={savingInfo ? "Saving…" : "Save Changes"}
                icon={infoSaved ? "check" : "save"}
                onPress={saveInfo}
                style={{ marginTop: 4 }}
              />
            </View>
          )}

          {/* ── Change Password ── */}
          {section === "password" && (
            <View style={{ marginTop: 24, gap: 14 }}>
              <View
                style={[
                  styles.infoCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Feather name="info" size={14} color={colors.primary} />
                <Text
                  style={[styles.infoText, { color: colors.mutedForeground }]}
                >
                  Enter your current password to confirm your identity, then set
                  a new one.
                </Text>
              </View>

              {/* Current password */}
              <View style={{ gap: 6 }}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  Current Password
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Feather name="lock" size={16} color={colors.mutedForeground} />
                  <TextInput
                    value={currentPwd}
                    onChangeText={setCurrentPwd}
                    placeholder="Your current password"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={!showCurrent}
                    autoCapitalize="none"
                    style={[styles.input, { color: colors.foreground }]}
                  />
                  <Pressable
                    onPress={() => setShowCurrent((v) => !v)}
                    hitSlop={10}
                  >
                    <Feather
                      name={showCurrent ? "eye-off" : "eye"}
                      size={16}
                      color={colors.mutedForeground}
                    />
                  </Pressable>
                </View>
              </View>

              {/* New password */}
              <View style={{ gap: 6 }}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  New Password
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Feather name="key" size={16} color={colors.mutedForeground} />
                  <TextInput
                    value={newPwd}
                    onChangeText={setNewPwd}
                    placeholder="Min 6 characters"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={!showNew}
                    autoCapitalize="none"
                    style={[styles.input, { color: colors.foreground }]}
                  />
                  <Pressable onPress={() => setShowNew((v) => !v)} hitSlop={10}>
                    <Feather
                      name={showNew ? "eye-off" : "eye"}
                      size={16}
                      color={colors.mutedForeground}
                    />
                  </Pressable>
                </View>
                {newPwd.length > 0 && newPwd.length < 6 ? (
                  <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                    At least 6 characters required
                  </Text>
                ) : null}
              </View>

              {/* Confirm password */}
              <View style={{ gap: 6 }}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  Confirm New Password
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.card,
                      borderColor: pwdMismatch ? "#FF5470" : colors.border,
                    },
                  ]}
                >
                  <Feather name="lock" size={16} color={colors.mutedForeground} />
                  <TextInput
                    value={confirmPwd}
                    onChangeText={setConfirmPwd}
                    placeholder="Re-enter new password"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                    style={[styles.input, { color: colors.foreground }]}
                  />
                  <Pressable
                    onPress={() => setShowConfirm((v) => !v)}
                    hitSlop={10}
                  >
                    <Feather
                      name={showConfirm ? "eye-off" : "eye"}
                      size={16}
                      color={colors.mutedForeground}
                    />
                  </Pressable>
                </View>
                {pwdMismatch ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Feather name="alert-circle" size={12} color="#FF5470" />
                    <Text style={{ color: "#FF5470", fontFamily: "Inter_500Medium", fontSize: 12 }}>
                      Passwords do not match
                    </Text>
                  </View>
                ) : confirmPwd.length > 0 && newPwd === confirmPwd ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Feather name="check-circle" size={12} color="#34D399" />
                    <Text style={{ color: "#34D399", fontFamily: "Inter_500Medium", fontSize: 12 }}>
                      Passwords match
                    </Text>
                  </View>
                ) : null}
              </View>

              <PrimaryButton
                label={savingPwd ? "Updating…" : "Update Password"}
                icon="shield"
                onPress={savePassword}
                style={{ marginTop: 4 }}
              />

              <Pressable
                onPress={() => router.push("/forgot-password" as never)}
                style={{ alignSelf: "center", paddingVertical: 4 }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                  }}
                >
                  Forgot current password?
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 22 },
  displayName: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: -0.3,
  },
  displayEmail: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  levelChip: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  levelText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  toggle: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
  },
  toggleLabel: { fontFamily: "Inter_700Bold", fontSize: 12 },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.2,
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
  hint: { fontFamily: "Inter_400Regular", fontSize: 11 },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  successRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
  },
  successText: {
    color: "#34D399",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
});
