// MegaHome Ulgurji - Shared Remotion Styles
// Brand colors and design tokens extracted from globals.css

export const BRAND_COLORS = {
  gray100: "#EEEEEE",
  gray200: "#5e5e5e",
  text: "#6B6B6B",
  blackText: "#0e141b",
  white: "#FFFFFF",
  background: "#F8F8F8",
  accent: "#0e141b",
  overlay: "rgba(14, 20, 27, 0.65)",
  overlayLight: "rgba(14, 20, 27, 0.35)",
  cardShadow: "0 4px 24px rgba(0, 0, 0, 0.10)",
  cardShadowHover: "0 8px 32px rgba(0, 0, 0, 0.16)",
} as const;

export const FONT_FAMILY =
  'Geist Sans, "Geist Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// ── Typography ──────────────────────────────────────────────

export const typography = {
  heroTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 52,
    fontWeight: 800 as const,
    color: BRAND_COLORS.blackText,
    lineHeight: 1.1,
    letterSpacing: -1,
  },
  title: {
    fontFamily: FONT_FAMILY,
    fontSize: 38,
    fontWeight: 700 as const,
    color: BRAND_COLORS.blackText,
    lineHeight: 1.15,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: 500 as const,
    color: BRAND_COLORS.text,
    lineHeight: 1.35,
  },
  body: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: 400 as const,
    color: BRAND_COLORS.text,
    lineHeight: 1.5,
  },
  caption: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: 400 as const,
    color: BRAND_COLORS.gray200,
    lineHeight: 1.4,
  },
  price: {
    fontFamily: FONT_FAMILY,
    fontSize: 32,
    fontWeight: 700 as const,
    color: BRAND_COLORS.blackText,
    lineHeight: 1,
  },
  discount: {
    fontFamily: FONT_FAMILY,
    fontSize: 72,
    fontWeight: 800 as const,
    color: BRAND_COLORS.white,
    lineHeight: 1,
    letterSpacing: -2,
  },
  badge: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: 600 as const,
    color: BRAND_COLORS.white,
    lineHeight: 1,
    textTransform: "uppercase" as const,
    letterSpacing: 1.5,
  },
} as const;

// ── Layout ──────────────────────────────────────────────────

export const layout = {
  fullFrame: {
    width: "100%",
    height: "100%",
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  centered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  column: {
    display: "flex",
    flexDirection: "column" as const,
  },
  row: {
    display: "flex",
    flexDirection: "row" as const,
  },
  padding: {
    sm: 16,
    md: 32,
    lg: 48,
    xl: 64,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 28,
  },
} as const;

// ── Animation Presets ───────────────────────────────────────

export const springPresets = {
  gentle: { mass: 1, damping: 18, stiffness: 80 },
  snappy: { mass: 0.6, damping: 14, stiffness: 200 },
  bouncy: { mass: 0.8, damping: 10, stiffness: 180 },
  smooth: { mass: 1, damping: 26, stiffness: 120 },
  slow: { mass: 1.2, damping: 30, stiffness: 60 },
} as const;

// ── Video Dimensions ────────────────────────────────────────

export const videoDimensions = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
} as const;
