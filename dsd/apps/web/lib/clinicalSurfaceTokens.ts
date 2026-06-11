/**
 * Clinical command-center surface tokens — presentation only (no runtime/governance logic).
 */
import type { CSSProperties } from "react";

export const dsdSpace = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const dsdRadius = {
  sm: 6,
  md: 8,
  lg: 10,
} as const;

export const dsdType = {
  /** Unit / product title */
  title: { fontSize: 18, fontWeight: 600 as const, lineHeight: 1.25, letterSpacing: "-0.02em" as const },
  /** Section labels */
  section: { fontSize: 12, fontWeight: 600 as const, lineHeight: 1.35, letterSpacing: "0.04em" as const, textTransform: "uppercase" as const, opacity: 0.72 },
  body: { fontSize: 14, fontWeight: 400 as const, lineHeight: 1.45 },
  bodySm: { fontSize: 13, fontWeight: 400 as const, lineHeight: 1.45 },
  caption: { fontSize: 12, fontWeight: 400 as const, lineHeight: 1.4, opacity: 0.82 },
  kpi: { fontSize: 20, fontWeight: 600 as const, lineHeight: 1.2, fontVariantNumeric: "tabular-nums" as const },
} as const;

/** Severity — explicit longhand-friendly palette (critical > major > default contrast) */
export const dsdSeverity = {
  critical: {
    backgroundColor: "#3a1018",
    borderColor: "#dc2626",
    railColor: "#f87171",
    textColor: "#fff1f2",
    accentColor: "#fca5a5",
    railWidth: 3,
  },
  major: {
    backgroundColor: "#1a2433",
    borderColor: "#c2410c",
    railColor: "rgba(253, 186, 116, 0.55)",
    textColor: "#fff7ed",
    accentColor: "#fdba74",
    railWidth: 3,
  },
  default: {
    backgroundColor: "#151f2e",
    borderColor: "#475569",
    railColor: "transparent",
    textColor: "#e8eefc",
    accentColor: "#94a3b8",
    railWidth: 3,
  },
} as const;

export type SeverityPalette = (typeof dsdSeverity)[keyof typeof dsdSeverity];

export function dsdSeverityPalette(severity: string): SeverityPalette {
  if (severity === "critical") return dsdSeverity.critical;
  if (severity === "major") return dsdSeverity.major;
  return dsdSeverity.default;
}

export const dsdTrust = {
  healthy: { borderColor: "#1d4ed8", backgroundColor: "#0f1729", strip: "#bfdbfe" },
  reconnecting: { borderColor: "#b45309", backgroundColor: "#292524", strip: "#fde68a" },
  degraded: { borderColor: "#a21caf", backgroundColor: "#1a1024", strip: "#f5d0fe" },
  stale: { borderColor: "#9d174d", backgroundColor: "#2a1022", strip: "#fbcfe8" },
} as const;

export type TrustStripTone = { readonly borderColor: string; readonly backgroundColor: string };

export function dsdTrustStripTone(panelConfidence: string): TrustStripTone {
  if (panelConfidence === "RECONNECTING") {
    return { borderColor: dsdTrust.reconnecting.borderColor, backgroundColor: dsdTrust.reconnecting.backgroundColor };
  }
  if (panelConfidence === "DEGRADED") {
    return { borderColor: dsdTrust.degraded.borderColor, backgroundColor: dsdTrust.degraded.backgroundColor };
  }
  if (panelConfidence === "PARTIAL_STALE") {
    return { borderColor: dsdTrust.stale.borderColor, backgroundColor: dsdTrust.stale.backgroundColor };
  }
  return { borderColor: dsdTrust.healthy.borderColor, backgroundColor: dsdTrust.healthy.backgroundColor };
}

export const dsdMotion = {
  rowOpacityMs: 160,
  /** No toast in slice — reserved for product policy */
  toastMs: 4500,
  hoverTransitionMs: 120,
} as const;

export const dsdDensity = {
  queueRowMinHeight: 44,
  queueGap: dsdSpace.sm,
  sectionGap: dsdSpace.xl,
  maxQueueRowsVisible: 12,
} as const;

/** Non-severity surfaces — token hex lives here only */
export const dsdSurface = {
  detailCardBackground: "#0c1220",
  detailCardBorder: "#3d4f66",
  selectionErrorBackground: "#292524",
  selectionErrorBorder: "#d97706",
} as const;

/** Sticky anchor stack — keep total block visually bounded */
export const dsdSticky = {
  zIndex: 1,
  top: 0,
} as const;

const FOCUS_RING_COLOR = "var(--dsd-focus)";
const DEFAULT_BORDER_COLOR = "var(--dsd-border)";

type HairlineBorder = Pick<CSSProperties, "borderWidth" | "borderStyle" | "borderColor">;

/** Uniform 1px solid border — no shorthand */
export function dsdHairlineBorder(borderColor: string): HairlineBorder {
  return { borderWidth: 1, borderStyle: "solid", borderColor };
}

export function dsdBottomHairline(borderColor: string = DEFAULT_BORDER_COLOR): Pick<
  CSSProperties,
  "borderBottomWidth" | "borderBottomStyle" | "borderBottomColor"
> {
  return { borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: borderColor };
}

type QueueRowOutline = Pick<
  CSSProperties,
  | "borderTopWidth"
  | "borderRightWidth"
  | "borderBottomWidth"
  | "borderLeftWidth"
  | "borderTopColor"
  | "borderRightColor"
  | "borderBottomColor"
  | "borderLeftColor"
>;

function dsdQueueRowOutline(severity: string, isSelected: boolean): QueueRowOutline {
  const pal = dsdSeverityPalette(severity);
  if (isSelected) {
    return {
      borderTopWidth: 2,
      borderRightWidth: 2,
      borderBottomWidth: 2,
      borderLeftWidth: pal.railWidth,
      borderTopColor: FOCUS_RING_COLOR,
      borderRightColor: FOCUS_RING_COLOR,
      borderBottomColor: FOCUS_RING_COLOR,
      borderLeftColor: pal.railColor,
    };
  }
  return {
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: pal.railWidth,
    borderTopColor: pal.borderColor,
    borderRightColor: pal.borderColor,
    borderBottomColor: pal.borderColor,
    borderLeftColor: pal.railColor,
  };
}

/** Queue row chrome — severity rail, background, outline, motion (longhand borders only) */
export function dsdQueueRowStyle(severity: string, isSelected: boolean, reducedMotion: boolean): CSSProperties {
  const pal = dsdSeverityPalette(severity);
  return {
    display: "grid",
    gridTemplateColumns: "2rem 1fr auto",
    gap: dsdSpace.sm,
    alignItems: "center",
    minHeight: dsdDensity.queueRowMinHeight,
    padding: `${dsdSpace.sm}px ${dsdSpace.md}px`,
    borderRadius: dsdRadius.sm,
    backgroundColor: pal.backgroundColor,
    borderStyle: "solid",
    ...dsdQueueRowOutline(severity, isSelected),
    width: "100%",
    textAlign: "left",
    color: pal.textColor,
    font: "inherit",
    ...(reducedMotion ? {} : { transition: `opacity ${dsdMotion.rowOpacityMs}ms ease-out` }),
  };
}

export const dsdSectionCardStyle: CSSProperties = {
  padding: dsdSpace.md,
  borderRadius: dsdRadius.md,
  backgroundColor: "var(--dsd-surface)",
  ...dsdHairlineBorder(DEFAULT_BORDER_COLOR),
};

export const dsdPillButtonStyle: CSSProperties = {
  padding: `${dsdSpace.xs}px ${dsdSpace.md}px`,
  borderRadius: dsdRadius.sm,
  backgroundColor: "var(--dsd-elevated)",
  color: "var(--dsd-text)",
  font: "inherit",
  fontSize: 13,
  ...dsdHairlineBorder(DEFAULT_BORDER_COLOR),
};

export const dsdDetailCardVariant = {
  base: {
    padding: dsdSpace.md,
    borderRadius: dsdRadius.md,
    backgroundColor: dsdSurface.detailCardBackground,
    ...dsdHairlineBorder(dsdSurface.detailCardBorder),
  } satisfies CSSProperties,
  dashed: {
    padding: dsdSpace.md,
    borderRadius: dsdRadius.md,
    backgroundColor: dsdSurface.detailCardBackground,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: dsdSurface.detailCardBorder,
    opacity: 0.92,
  } satisfies CSSProperties,
  selectionError: {
    padding: dsdSpace.md,
    borderRadius: dsdRadius.md,
    backgroundColor: dsdSurface.selectionErrorBackground,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: dsdSurface.selectionErrorBorder,
  } satisfies CSSProperties,
} as const;

export function dsdTrustBadgeStyle(tone: TrustStripTone): CSSProperties {
  return {
    padding: `${dsdSpace.xs}px ${dsdSpace.md}px`,
    borderRadius: dsdRadius.lg,
    backgroundColor: tone.backgroundColor,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: tone.borderColor,
  };
}

export function dsdTrustRegionStyle(tone: TrustStripTone): CSSProperties {
  return {
    padding: dsdSpace.md,
    borderRadius: dsdRadius.md,
    backgroundColor: tone.backgroundColor,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: tone.borderColor,
  };
}

export function dsdElevatedPanelStyle(): CSSProperties {
  return {
    padding: dsdSpace.md,
    borderRadius: dsdRadius.md,
    backgroundColor: "var(--dsd-elevated)",
    ...dsdHairlineBorder(DEFAULT_BORDER_COLOR),
  };
}

export function dsdSurfacePanelStyle(): CSSProperties {
  return {
    padding: dsdSpace.md,
    borderRadius: dsdRadius.md,
    backgroundColor: "var(--dsd-surface)",
    ...dsdHairlineBorder(DEFAULT_BORDER_COLOR),
  };
}
