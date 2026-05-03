import { useContext } from "react";
import { useColorScheme } from "react-native";

import colors from "@/constants/colors";
import { AppContext } from "@/contexts/AppContext";

/**
 * Returns the design tokens for the current color scheme.
 *
 * Reads optional admin overrides for `primary` and `accent` from
 * AppContext (when available), so the founder can re-theme the app
 * live from the admin panel.
 */
export function useColors() {
  const scheme = useColorScheme();
  const ctx = useContext(AppContext);
  const palette =
    scheme === "dark" && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;
  const settings = ctx?.state?.appSettings;
  return {
    ...palette,
    primary: settings?.primaryColor || palette.primary,
    accent: settings?.accentColor || palette.accent,
    radius: colors.radius,
  };
}
