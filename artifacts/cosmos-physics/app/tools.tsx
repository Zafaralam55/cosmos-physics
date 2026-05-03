import { Feather } from "@expo/vector-icons";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/ScreenContainer";
import { formulas } from "@/data/notes";
import { useColors } from "@/hooks/useColors";

type Tab = "formula" | "sci" | "converter";

// ─── Unit Converter Data ──────────────────────────────────────────────────────

const UNIT_GROUPS: Record<string, { label: string; toBase: number; symbol: string }[]> = {
  Length: [
    { label: "Meter", toBase: 1, symbol: "m" },
    { label: "Kilometer", toBase: 1000, symbol: "km" },
    { label: "Centimeter", toBase: 0.01, symbol: "cm" },
    { label: "Millimeter", toBase: 0.001, symbol: "mm" },
    { label: "Micrometer", toBase: 1e-6, symbol: "μm" },
    { label: "Nanometer", toBase: 1e-9, symbol: "nm" },
    { label: "Mile", toBase: 1609.344, symbol: "mi" },
    { label: "Yard", toBase: 0.9144, symbol: "yd" },
    { label: "Foot", toBase: 0.3048, symbol: "ft" },
    { label: "Inch", toBase: 0.0254, symbol: "in" },
    { label: "Ångström", toBase: 1e-10, symbol: "Å" },
  ],
  Mass: [
    { label: "Kilogram", toBase: 1, symbol: "kg" },
    { label: "Gram", toBase: 0.001, symbol: "g" },
    { label: "Milligram", toBase: 1e-6, symbol: "mg" },
    { label: "Microgram", toBase: 1e-9, symbol: "μg" },
    { label: "Tonne", toBase: 1000, symbol: "t" },
    { label: "Pound", toBase: 0.453592, symbol: "lb" },
    { label: "Ounce", toBase: 0.0283495, symbol: "oz" },
    { label: "Atomic mass unit", toBase: 1.66054e-27, symbol: "u" },
  ],
  Temperature: [
    { label: "Celsius", toBase: 1, symbol: "°C" },
    { label: "Kelvin", toBase: 1, symbol: "K" },
    { label: "Fahrenheit", toBase: 1, symbol: "°F" },
  ],
  Time: [
    { label: "Second", toBase: 1, symbol: "s" },
    { label: "Millisecond", toBase: 0.001, symbol: "ms" },
    { label: "Microsecond", toBase: 1e-6, symbol: "μs" },
    { label: "Nanosecond", toBase: 1e-9, symbol: "ns" },
    { label: "Minute", toBase: 60, symbol: "min" },
    { label: "Hour", toBase: 3600, symbol: "h" },
    { label: "Day", toBase: 86400, symbol: "day" },
    { label: "Week", toBase: 604800, symbol: "week" },
    { label: "Year", toBase: 31557600, symbol: "yr" },
  ],
  Speed: [
    { label: "m/s", toBase: 1, symbol: "m/s" },
    { label: "km/h", toBase: 1 / 3.6, symbol: "km/h" },
    { label: "mph", toBase: 0.44704, symbol: "mph" },
    { label: "ft/s", toBase: 0.3048, symbol: "ft/s" },
    { label: "knot", toBase: 0.514444, symbol: "kn" },
    { label: "Mach (sea level)", toBase: 340.29, symbol: "Ma" },
    { label: "c (light)", toBase: 2.998e8, symbol: "c" },
  ],
  Force: [
    { label: "Newton", toBase: 1, symbol: "N" },
    { label: "Kilonewton", toBase: 1000, symbol: "kN" },
    { label: "Dyne", toBase: 1e-5, symbol: "dyn" },
    { label: "kg-force", toBase: 9.80665, symbol: "kgf" },
    { label: "lbf", toBase: 4.44822, symbol: "lbf" },
    { label: "poundal", toBase: 0.138255, symbol: "pdl" },
  ],
  Energy: [
    { label: "Joule", toBase: 1, symbol: "J" },
    { label: "Kilojoule", toBase: 1000, symbol: "kJ" },
    { label: "Calorie", toBase: 4.184, symbol: "cal" },
    { label: "Kilocalorie", toBase: 4184, symbol: "kcal" },
    { label: "Electronvolt", toBase: 1.602e-19, symbol: "eV" },
    { label: "Kilowatt-hour", toBase: 3.6e6, symbol: "kWh" },
    { label: "BTU", toBase: 1055.06, symbol: "BTU" },
    { label: "Erg", toBase: 1e-7, symbol: "erg" },
  ],
  Power: [
    { label: "Watt", toBase: 1, symbol: "W" },
    { label: "Kilowatt", toBase: 1000, symbol: "kW" },
    { label: "Megawatt", toBase: 1e6, symbol: "MW" },
    { label: "Horsepower", toBase: 745.7, symbol: "hp" },
    { label: "cal/s", toBase: 4.184, symbol: "cal/s" },
    { label: "BTU/hr", toBase: 0.293071, symbol: "BTU/h" },
  ],
  Pressure: [
    { label: "Pascal", toBase: 1, symbol: "Pa" },
    { label: "Kilopascal", toBase: 1000, symbol: "kPa" },
    { label: "Megapascal", toBase: 1e6, symbol: "MPa" },
    { label: "Bar", toBase: 1e5, symbol: "bar" },
    { label: "Atmosphere", toBase: 101325, symbol: "atm" },
    { label: "PSI", toBase: 6894.76, symbol: "psi" },
    { label: "mmHg (Torr)", toBase: 133.322, symbol: "mmHg" },
    { label: "cmHg", toBase: 1333.22, symbol: "cmHg" },
  ],
  Angle: [
    { label: "Degree", toBase: 1, symbol: "°" },
    { label: "Radian", toBase: 180 / Math.PI, symbol: "rad" },
    { label: "Gradian", toBase: 0.9, symbol: "grad" },
    { label: "Arcminute", toBase: 1 / 60, symbol: "′" },
    { label: "Arcsecond", toBase: 1 / 3600, symbol: "″" },
    { label: "Revolution", toBase: 360, symbol: "rev" },
  ],
  Frequency: [
    { label: "Hertz", toBase: 1, symbol: "Hz" },
    { label: "Kilohertz", toBase: 1e3, symbol: "kHz" },
    { label: "Megahertz", toBase: 1e6, symbol: "MHz" },
    { label: "Gigahertz", toBase: 1e9, symbol: "GHz" },
    { label: "rad/s", toBase: 1 / (2 * Math.PI), symbol: "rad/s" },
    { label: "RPM", toBase: 1 / 60, symbol: "RPM" },
  ],
};

function convertTemp(v: number, from: string, to: string): number {
  let c = v;
  if (from === "Kelvin") c = v - 273.15;
  else if (from === "Fahrenheit") c = ((v - 32) * 5) / 9;
  if (to === "Celsius") return c;
  if (to === "Kelvin") return c + 273.15;
  return (c * 9) / 5 + 32;
}

// ─── Scientific Calculator ────────────────────────────────────────────────────

type CalcHistory = { expr: string; result: string };

const evaluateExpr = (raw: string, isRad: boolean): string => {
  try {
    let expr = raw
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, String(Math.PI))
      .replace(/ℯ/g, String(Math.E))
      .replace(/(\d+(?:\.\d+)?)²/g, "($1**2)")
      .replace(/²/g, "**2");

    const deg2rad = (d: number) => (d * Math.PI) / 180;

    const fnMap: Record<string, (x: number) => number> = isRad
      ? {
          sin: Math.sin,
          cos: Math.cos,
          tan: Math.tan,
          asin: Math.asin,
          acos: Math.acos,
          atan: Math.atan,
          sinh: Math.sinh,
          cosh: Math.cosh,
          tanh: Math.tanh,
          log: Math.log10,
          ln: Math.log,
          "√": Math.sqrt,
          abs: Math.abs,
        }
      : {
          sin: (x) => Math.sin(deg2rad(x)),
          cos: (x) => Math.cos(deg2rad(x)),
          tan: (x) => Math.tan(deg2rad(x)),
          asin: (x) => (Math.asin(x) * 180) / Math.PI,
          acos: (x) => (Math.acos(x) * 180) / Math.PI,
          atan: (x) => (Math.atan(x) * 180) / Math.PI,
          sinh: Math.sinh,
          cosh: Math.cosh,
          tanh: Math.tanh,
          log: Math.log10,
          ln: Math.log,
          "√": Math.sqrt,
          abs: Math.abs,
        };

    // Replace function calls
    for (const [fn, impl] of Object.entries(fnMap)) {
      const safeName = `__fn_${fn.replace(/[^a-z]/gi, "X")}__`;
      expr = expr.replace(new RegExp(fn.replace("√", "√") + "\\(", "g"), safeName + "(");
      (globalThis as Record<string, unknown>)[safeName] = impl;
    }

    // Validate: only allow safe characters
    if (!/^[\d\s+\-*/().e^,_a-zA-Z]+$/.test(expr)) {
      return "Error";
    }

    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${expr})`)() as number;

    if (!isFinite(result)) return "Undefined";
    if (isNaN(result)) return "Error";

    const abs = Math.abs(result);
    if (abs !== 0 && (abs >= 1e12 || abs < 1e-6)) {
      return result.toExponential(6);
    }
    return parseFloat(result.toPrecision(10)).toString();
  } catch {
    return "Error";
  }
};

type BtnVariant = "digit" | "op" | "fn" | "eq" | "action";

type CalcBtn = {
  label: string;
  value: string;
  variant: BtnVariant;
  wide?: boolean;
};

const CALC_ROWS: CalcBtn[][] = [
  [
    { label: "sin", value: "sin(", variant: "fn" },
    { label: "cos", value: "cos(", variant: "fn" },
    { label: "tan", value: "tan(", variant: "fn" },
    { label: "log", value: "log(", variant: "fn" },
    { label: "ln", value: "ln(", variant: "fn" },
  ],
  [
    { label: "asin", value: "asin(", variant: "fn" },
    { label: "acos", value: "acos(", variant: "fn" },
    { label: "atan", value: "atan(", variant: "fn" },
    { label: "√", value: "√(", variant: "fn" },
    { label: "abs", value: "abs(", variant: "fn" },
  ],
  [
    { label: "π", value: "π", variant: "fn" },
    { label: "ℯ", value: "ℯ", variant: "fn" },
    { label: "x²", value: "²", variant: "fn" },
    { label: "xⁿ", value: "**", variant: "op" },
    { label: "(", value: "(", variant: "op" },
  ],
  [
    { label: "7", value: "7", variant: "digit" },
    { label: "8", value: "8", variant: "digit" },
    { label: "9", value: "9", variant: "digit" },
    { label: "÷", value: "÷", variant: "op" },
    { label: ")", value: ")", variant: "op" },
  ],
  [
    { label: "4", value: "4", variant: "digit" },
    { label: "5", value: "5", variant: "digit" },
    { label: "6", value: "6", variant: "digit" },
    { label: "×", value: "×", variant: "op" },
    { label: "⌫", value: "DEL", variant: "action" },
  ],
  [
    { label: "1", value: "1", variant: "digit" },
    { label: "2", value: "2", variant: "digit" },
    { label: "3", value: "3", variant: "digit" },
    { label: "−", value: "-", variant: "op" },
    { label: "AC", value: "AC", variant: "action" },
  ],
  [
    { label: "0", value: "0", variant: "digit" },
    { label: ".", value: ".", variant: "digit" },
    { label: "(−)", value: "NEG", variant: "digit" },
    { label: "+", value: "+", variant: "op" },
    { label: "=", value: "=", variant: "eq" },
  ],
];

function ScientificCalculator({ colors }: { colors: ReturnType<typeof useColors> }) {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("0");
  const [isRad, setIsRad] = useState(true);
  const [history, setHistory] = useState<CalcHistory[]>([]);
  const [justEvaled, setJustEvaled] = useState(false);

  const liveResult = useMemo(() => {
    if (!expr) return "0";
    const r = evaluateExpr(expr, isRad);
    return r === "Error" ? "" : r;
  }, [expr, isRad]);

  const handleBtn = useCallback((btn: CalcBtn) => {
    if (btn.value === "AC") {
      setExpr("");
      setResult("0");
      setJustEvaled(false);
      return;
    }
    if (btn.value === "DEL") {
      setExpr((e) => e.slice(0, -1));
      setJustEvaled(false);
      return;
    }
    if (btn.value === "NEG") {
      setExpr((e) => (e.startsWith("-") ? e.slice(1) : e ? "-" + e : "-"));
      setJustEvaled(false);
      return;
    }
    if (btn.value === "=") {
      const r = evaluateExpr(expr, isRad);
      if (r !== "Error" && r !== "Undefined") {
        setHistory((h) => [{ expr, result: r }, ...h.slice(0, 9)]);
        setResult(r);
        setExpr(r);
        setJustEvaled(true);
      } else {
        setResult(r);
      }
      return;
    }
    // If just evaluated and user presses an operator → chain
    if (justEvaled && ["+", "-", "×", "÷", "**"].includes(btn.value)) {
      setExpr((e) => e + btn.value);
      setJustEvaled(false);
      return;
    }
    // If just evaluated and user presses digit/fn → start fresh
    if (justEvaled && btn.variant !== "op") {
      setExpr(btn.value);
      setResult("0");
      setJustEvaled(false);
      return;
    }
    setJustEvaled(false);
    setExpr((e) => e + btn.value);
  }, [expr, isRad, justEvaled]);

  const btnBg = (v: BtnVariant) => {
    if (v === "eq") return colors.primary;
    if (v === "fn") return colors.secondary;
    if (v === "op") return colors.card;
    if (v === "action") return "rgba(239,68,68,0.14)";
    return colors.card;
  };

  const btnColor = (v: BtnVariant) => {
    if (v === "eq") return "#FFFFFF";
    if (v === "fn") return colors.primary;
    if (v === "action") return "#EF4444";
    if (v === "op") return colors.foreground;
    return colors.foreground;
  };

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
      {/* Display */}
      <View style={[styles.sciDisplay, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Deg/Rad toggle */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            {[true, false].map((rad) => (
              <Pressable
                key={rad ? "RAD" : "DEG"}
                onPress={() => setIsRad(rad)}
                style={[
                  styles.modeChip,
                  {
                    backgroundColor: isRad === rad ? colors.primary + "26" : "transparent",
                    borderColor: isRad === rad ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={{ color: isRad === rad ? colors.primary : colors.mutedForeground, fontFamily: "Inter_700Bold", fontSize: 10 }}>
                  {rad ? "RAD" : "DEG"}
                </Text>
              </Pressable>
            ))}
          </View>
          {history.length > 0 ? (
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 10 }}>
              Prev: {history[0]?.result}
            </Text>
          ) : null}
        </View>

        {/* Expression */}
        <Text
          numberOfLines={2}
          style={[styles.sciExpr, { color: expr ? colors.mutedForeground : colors.border }]}
        >
          {expr || "0"}
        </Text>

        {/* Live result */}
        <Text numberOfLines={1} style={[styles.sciResult, { color: colors.foreground }]}>
          {liveResult || result}
        </Text>
      </View>

      {/* Button grid */}
      <View style={{ gap: 6, marginTop: 10 }}>
        {CALC_ROWS.map((row, ri) => (
          <View key={ri} style={{ flexDirection: "row", gap: 6 }}>
            {row.map((btn) => (
              <Pressable
                key={btn.label}
                onPress={() => handleBtn(btn)}
                style={({ pressed }) => [
                  styles.calcBtn,
                  {
                    backgroundColor: btnBg(btn.variant),
                    borderColor: btn.variant === "eq" ? colors.primary : colors.border,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <Text style={[styles.calcBtnLabel, { color: btnColor(btn.variant), fontSize: btn.variant === "fn" ? 12 : 16 }]}>
                  {btn.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>

      {/* History */}
      {history.length > 0 ? (
        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={[styles.histTitle, { color: colors.foreground }]}>History</Text>
            <Pressable onPress={() => setHistory([])}>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 12 }}>Clear</Text>
            </Pressable>
          </View>
          {history.map((h, i) => (
            <Pressable
              key={i}
              onPress={() => { setExpr(h.result); setJustEvaled(true); }}
              style={[styles.histRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, flex: 1 }} numberOfLines={1}>
                {h.expr}
              </Text>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 14 }}>
                = {h.result}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ToolsScreen() {
  const colors = useColors();
  const [tab, setTab] = useState<Tab>("sci");

  // Converter state
  const [group, setGroup] = useState<keyof typeof UNIT_GROUPS>("Length");
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(1);
  const [val, setVal] = useState("1");

  const converted = useMemo(() => {
    const v = parseFloat(val);
    if (Number.isNaN(v)) return "—";
    const units = UNIT_GROUPS[group]!;
    const f = units[from]!;
    const t = units[to]!;
    if (from === to) return `${v} ${t.symbol}`;
    let result: number;
    if (group === "Temperature") {
      result = convertTemp(v, f.label, t.label);
    } else {
      result = (v * f.toBase) / t.toBase;
    }
    const abs = Math.abs(result);
    const str =
      abs !== 0 && (abs >= 1e9 || (abs < 1e-4 && abs > 0))
        ? result.toExponential(4)
        : parseFloat(result.toPrecision(8)).toString();
    return `${str} ${t.symbol}`;
  }, [val, group, from, to]);

  // All results for the "all units" table
  const allConverted = useMemo(() => {
    const v = parseFloat(val);
    if (Number.isNaN(v)) return [];
    const units = UNIT_GROUPS[group]!;
    const f = units[from]!;
    return units.map((t) => {
      if (group === "Temperature") {
        const r = convertTemp(v, f.label, t.label);
        const str = parseFloat(r.toPrecision(6)).toString();
        return { label: t.label, symbol: t.symbol, value: str };
      }
      const r = (v * f.toBase) / t.toBase;
      const abs = Math.abs(r);
      const str =
        abs !== 0 && (abs >= 1e9 || (abs < 1e-4 && abs > 0))
          ? r.toExponential(4)
          : parseFloat(r.toPrecision(6)).toString();
      return { label: t.label, symbol: t.symbol, value: str };
    });
  }, [val, group, from]);

  const TABS_DEF: { id: Tab; label: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
    { id: "sci", label: "Calculator", icon: "cpu" },
    { id: "converter", label: "Converter", icon: "shuffle" },
    { id: "formula", label: "Formulas", icon: "list" },
  ];

  const GROUP_ICONS: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
    Length: "maximize-2",
    Mass: "feather",
    Temperature: "thermometer",
    Time: "clock",
    Speed: "wind",
    Force: "zap",
    Energy: "battery-charging",
    Power: "activity",
    Pressure: "compress" as never,
    Angle: "rotate-cw",
    Frequency: "radio",
  };

  return (
    <ScreenContainer showStars>
      <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
        <Text style={[styles.h1, { color: colors.foreground }]}>Physics Tools</Text>
        <Text style={[styles.h1Sub, { color: colors.mutedForeground }]}>
          Scientific calculator · 11 unit families · Formula reference
        </Text>
      </View>

      {/* Tab bar */}
      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {TABS_DEF.map((t) => {
            const active = tab === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setTab(t.id)}
                style={[styles.tabBtn, { backgroundColor: active ? colors.primary : "transparent" }]}
              >
                <Feather name={t.icon} size={14} color={active ? "#FFFFFF" : colors.mutedForeground} />
                <Text style={[styles.tabLabel, { color: active ? "#FFFFFF" : colors.mutedForeground }]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Scientific Calculator ── */}
      {tab === "sci" ? <ScientificCalculator colors={colors} /> : null}

      {/* ── Unit Converter ── */}
      {tab === "converter" ? (
        <View style={{ marginTop: 14 }}>
          {/* Category picker */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
            style={{ flexGrow: 0 }}
          >
            {Object.keys(UNIT_GROUPS).map((g) => {
              const active = g === group;
              return (
                <Pressable
                  key={g}
                  onPress={() => { setGroup(g as keyof typeof UNIT_GROUPS); setFrom(0); setTo(1); setVal("1"); }}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: active ? colors.primary : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Feather name={GROUP_ICONS[g] ?? "circle"} size={12} color={active ? "#FFFFFF" : colors.mutedForeground} />
                  <Text style={[styles.catChipLabel, { color: active ? "#FFFFFF" : colors.mutedForeground }]}>{g}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Converter card */}
          <View style={[styles.convCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20, marginTop: 14 }]}>
            {/* From */}
            <Text style={[styles.convSectionLabel, { color: colors.mutedForeground }]}>FROM</Text>
            <View style={[styles.inputRow, { borderColor: colors.border }]}>
              <TextInput
                value={val}
                onChangeText={setVal}
                keyboardType="decimal-pad"
                style={[styles.convInput, { color: colors.foreground }]}
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
              />
              <View style={[styles.unitBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.unitBadgeText, { color: colors.primary }]}>
                  {UNIT_GROUPS[group]![from]!.symbol}
                </Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 4 }} style={{ marginTop: 8 }}>
              {UNIT_GROUPS[group]!.map((u, i) => (
                <Pressable key={u.label} onPress={() => setFrom(i)} style={[styles.unitOpt, { backgroundColor: i === from ? colors.primary : "transparent", borderColor: i === from ? colors.primary : colors.border }]}>
                  <Text style={{ color: i === from ? "#FFFFFF" : colors.mutedForeground, fontFamily: "Inter_600SemiBold", fontSize: 11 }}>{u.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Arrow */}
            <View style={{ alignItems: "center", marginVertical: 14 }}>
              <View style={[styles.swapIcon, { backgroundColor: colors.primary + "22" }]}>
                <Feather name="arrow-down" size={18} color={colors.primary} />
              </View>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_700Bold", fontSize: 28, letterSpacing: -0.6, marginTop: 6 }}>
                {converted}
              </Text>
            </View>

            {/* To */}
            <Text style={[styles.convSectionLabel, { color: colors.mutedForeground }]}>TO</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 4 }} style={{ marginTop: 8 }}>
              {UNIT_GROUPS[group]!.map((u, i) => (
                <Pressable key={u.label} onPress={() => setTo(i)} style={[styles.unitOpt, { backgroundColor: i === to ? colors.primary : "transparent", borderColor: i === to ? colors.primary : colors.border }]}>
                  <Text style={{ color: i === to ? "#FFFFFF" : colors.mutedForeground, fontFamily: "Inter_600SemiBold", fontSize: 11 }}>{u.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* All-units table */}
          <View style={{ marginHorizontal: 20, marginTop: 16, marginBottom: 8 }}>
            <Text style={[styles.allUnitsTitle, { color: colors.foreground }]}>All {group} units</Text>
            {allConverted.map((row, i) => (
              <Pressable
                key={row.label}
                onPress={() => setTo(i)}
                style={[
                  styles.allRow,
                  {
                    backgroundColor: i === to ? colors.primary + "18" : colors.card,
                    borderColor: i === to ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: i === to ? colors.primary : colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
                    {row.label}
                  </Text>
                </View>
                <Text style={{ color: i === to ? colors.primary : colors.mutedForeground, fontFamily: "Inter_700Bold", fontSize: 13 }}>
                  {row.value} {row.symbol}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {/* ── Formulas ── */}
      {tab === "formula" ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 8 }}>
          {formulas.map((f) => (
            <View key={f.id} style={[styles.formula, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.formulaName, { color: colors.foreground }]}>{f.name}</Text>
                <Text style={[styles.formulaTopic, { color: colors.mutedForeground }]}>{f.topic}</Text>
              </View>
              <Text style={[styles.formulaExpr, { color: colors.primary }]}>{f.expression}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  h1Sub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },

  // Tabs
  tabBar: { flexDirection: "row", padding: 4, borderRadius: 14, borderWidth: 1, gap: 4 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 10, borderRadius: 10 },
  tabLabel: { fontFamily: "Inter_700Bold", fontSize: 12 },

  // Scientific calc
  sciDisplay: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  modeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  sciExpr: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    letterSpacing: -0.2,
    textAlign: "right",
    minHeight: 28,
  },
  sciResult: {
    fontFamily: "Inter_700Bold",
    fontSize: 38,
    letterSpacing: -1,
    textAlign: "right",
    marginTop: 4,
  },
  calcBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  calcBtnLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  histTitle: { fontFamily: "Inter_700Bold", fontSize: 15, letterSpacing: -0.3 },
  histRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 6,
  },

  // Converter
  catChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  catChipLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  convCard: { padding: 18, borderRadius: 20, borderWidth: 1 },
  convSectionLabel: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1.2 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  convInput: { flex: 1, fontFamily: "Inter_700Bold", fontSize: 32, letterSpacing: -0.8 },
  unitBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  unitBadgeText: { fontFamily: "Inter_700Bold", fontSize: 14 },
  unitOpt: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  swapIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  allUnitsTitle: { fontFamily: "Inter_700Bold", fontSize: 16, letterSpacing: -0.3, marginBottom: 10 },
  allRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 6 },

  // Formulas
  formula: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 },
  formulaName: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  formulaTopic: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 2 },
  formulaExpr: { fontFamily: "Inter_700Bold", fontSize: 14 },
});
