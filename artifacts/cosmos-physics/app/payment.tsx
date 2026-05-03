import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useApp, useSettings } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const formatINR = (n: number) => "₹" + n.toLocaleString("en-IN");

const PAYMENT_METHODS = [
  { id: "razorpay", label: "Razorpay", desc: "Cards, UPI, Netbanking", icon: "credit-card" as const },
  { id: "upi", label: "UPI", desc: "Pay via any UPI app", icon: "smartphone" as const },
  { id: "phonepe", label: "PhonePe", desc: "Quick checkout", icon: "send" as const },
];

export default function PaymentScreen() {
  const colors = useColors();
  const { state, upgrade } = useApp();
  const settings = useSettings();
  const [selected, setSelected] = useState("Pro");
  const [method, setMethod] = useState("razorpay");

  const PLANS = [
    {
      tier: "Free",
      price: formatINR(settings.pricing.free),
      cycle: "forever",
      perks: ["Sample lectures", "Daily mini quiz", "Limited notes"],
      color: "#94A3B8",
    },
    {
      tier: "Pro",
      price: formatINR(settings.pricing.pro),
      cycle: "per month",
      perks: [
        "All recorded courses",
        "Live classes & doubt hours",
        "Full notes + PYQ",
        "Quiz analytics & leaderboard",
      ],
      color: colors.primary,
      highlight: true,
    },
    {
      tier: "Lifetime",
      price: formatINR(settings.pricing.lifetime),
      cycle: "one-time",
      perks: [
        "Everything in Pro",
        "Lifetime updates",
        "Priority faculty support",
        "Engineering Physics + JEE/NEET",
      ],
      color: colors.accent,
    },
  ];

  return (
    <ScreenContainer showStars>
      <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
        <Text style={[styles.h1, { color: colors.foreground }]}>Plans & Pricing</Text>
        <Text style={[styles.h1Sub, { color: colors.mutedForeground }]}>
          Currently on {state.subscriptionTier} plan
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 18, gap: 12 }}>
        {PLANS.map((p) => {
          const active = p.tier === selected;
          return (
            <Pressable
              key={p.tier}
              onPress={() => setSelected(p.tier)}
              style={[
                styles.plan,
                {
                  backgroundColor: colors.card,
                  borderColor: active ? p.color : colors.border,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              {p.highlight ? (
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.popularBadge}
                >
                  <Feather name="star" size={10} color="#FFFFFF" />
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </LinearGradient>
              ) : null}
              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planTier, { color: colors.foreground }]}>{p.tier}</Text>
                  <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 4, gap: 6 }}>
                    <Text style={[styles.planPrice, { color: p.color }]}>{p.price}</Text>
                    <Text style={[styles.planCycle, { color: colors.mutedForeground }]}>{p.cycle}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: active ? p.color : colors.border,
                      backgroundColor: active ? p.color : "transparent",
                    },
                  ]}
                >
                  {active ? <Feather name="check" size={14} color="#FFFFFF" /> : null}
                </View>
              </View>
              <View style={{ marginTop: 12, gap: 6 }}>
                {p.perks.map((perk) => (
                  <View key={perk} style={styles.perkRow}>
                    <Feather name="check-circle" size={14} color={p.color} />
                    <Text style={[styles.perkText, { color: colors.foreground }]}>{perk}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <Text style={[styles.section, { color: colors.foreground }]}>Payment Method</Text>
      </View>
      <View style={{ paddingHorizontal: 20, marginTop: 12, gap: 10 }}>
        {PAYMENT_METHODS.map((p) => {
          const active = method === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setMethod(p.id)}
              style={[
                styles.methodRow,
                {
                  backgroundColor: colors.card,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={[styles.methodIcon, { backgroundColor: colors.secondary }]}>
                <Feather name={p.icon} size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodLabel, { color: colors.foreground }]}>{p.label}</Text>
                <Text style={[styles.methodDesc, { color: colors.mutedForeground }]}>{p.desc}</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  {
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.primary : "transparent",
                    width: 22,
                    height: 22,
                  },
                ]}
              >
                {active ? <Feather name="check" size={12} color="#FFFFFF" /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ padding: 20, marginTop: 12 }}>
        <PrimaryButton
          label={`Subscribe to ${selected}`}
          icon="zap"
          onPress={() => upgrade(selected as never)}
        />
        <Text style={[styles.fineprint, { color: colors.mutedForeground }]}>
          Cancel anytime. GST included. Refer a friend and earn ₹100 credits — share your code COSMOS-ARJUN.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  h1Sub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  plan: {
    padding: 18,
    borderRadius: 20,
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  popularText: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.6 },
  planHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planTier: { fontFamily: "Inter_700Bold", fontSize: 18 },
  planPrice: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.6 },
  planCycle: { fontFamily: "Inter_500Medium", fontSize: 12 },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  perkText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  section: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: -0.3 },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  methodIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  methodLabel: { fontFamily: "Inter_700Bold", fontSize: 14 },
  methodDesc: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  fineprint: { fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "center", marginTop: 12, lineHeight: 16 },
});
