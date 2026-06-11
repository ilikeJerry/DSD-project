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

/** Operator queue display tiers — rail + badge + background */
export const dsdQueueTier = {
  p0: {
    backgroundColor: "#4a0f14",
    borderColor: "#ef4444",
    railColor: "#fca5a5",
    textColor: "#fff1f2",
    badgeBackground: "#991b1b",
    badgeColor: "#fecaca",
    railWidth: 4,
  },
  critical: {
    backgroundColor: "#3a1018",
    borderColor: "#dc2626",
    railColor: "#f87171",
    textColor: "#fff1f2",
    badgeBackground: "#7f1d1d",
    badgeColor: "#fecaca",
    railWidth: 3,
  },
  warning: {
    backgroundColor: "#1f2937",
    borderColor: "#d97706",
    railColor: "#fbbf24",
    textColor: "#fffbeb",
    badgeBackground: "#78350f",
    badgeColor: "#fde68a",
    railWidth: 3,
  },
  recovery: {
    backgroundColor: "#0f1f2e",
    borderColor: "#2563eb",
    railColor: "#60a5fa",
    textColor: "#dbeafe",
    badgeBackground: "#1e3a5f",
    badgeColor: "#93c5fd",
    railWidth: 3,
  },
  stable: {
    backgroundColor: "#141c28",
    borderColor: "#475569",
    railColor: "#64748b",
    textColor: "#cbd5e1",
    badgeBackground: "#1e293b",
    badgeColor: "#94a3b8",
    railWidth: 2,
  },
  stale: {
    backgroundColor: "#1a1524",
    borderColor: "#6366f1",
    railColor: "#a5b4fc",
    textColor: "#e0e7ff",
    badgeBackground: "#312e81",
    badgeColor: "#c7d2fe",
    railWidth: 3,
  },
} as const;

export type QueueDisplayTier = keyof typeof dsdQueueTier;
export type QueueTierPalette = (typeof dsdQueueTier)[QueueDisplayTier];

export function dsdQueueTierPalette(tier: QueueDisplayTier): QueueTierPalette {
  return dsdQueueTier[tier];
}

export const dsdSeverity = {
  critical: dsdQueueTier.critical,
  major: dsdQueueTier.warning,
  default: dsdQueueTier.stable,
} as const;

export type SeverityPalette = QueueTierPalette;

export function dsdSeverityPalette(severity: string): SeverityPalette {
  if (severity === "critical") return dsdQueueTier.critical;
  if (severity === "major" || severity === "warning") return dsdQueueTier.warning;
  return dsdQueueTier.stable;
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
  queueRowMinHeight: 52,
  queueGap: dsdSpace.sm,
  sectionGap: dsdSpace.xl,
  maxQueueRowsVisible: 10,
  maxVisibleQueueCards: 10,
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

function dsdQueueRowOutlineTier(tier: QueueDisplayTier, isSelected: boolean): QueueRowOutline {
  const pal = dsdQueueTierPalette(tier);
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

/** Queue row chrome — tier rail, background, outline (longhand borders only) */
export function dsdQueueRowStyleForTier(
  tier: QueueDisplayTier,
  isSelected: boolean,
  reducedMotion: boolean,
  rowOpacity = 1,
): CSSProperties {
  const pal = dsdQueueTierPalette(tier);
  return {
    display: "grid",
    gridTemplateColumns: "2.25rem 1fr auto",
    gap: dsdSpace.sm,
    alignItems: "start",
    minHeight: dsdDensity.queueRowMinHeight,
    padding: `${dsdSpace.sm}px ${dsdSpace.md}px`,
    borderRadius: dsdRadius.sm,
    backgroundColor: pal.backgroundColor,
    borderStyle: "solid",
    opacity: rowOpacity,
    ...dsdQueueRowOutlineTier(tier, isSelected),
    width: "100%",
    textAlign: "left",
    color: pal.textColor,
    font: "inherit",
    ...(reducedMotion ? {} : { transition: `opacity ${dsdMotion.rowOpacityMs}ms ease-out` }),
  };
}

/** @deprecated Use dsdQueueRowStyleForTier */
export function dsdQueueRowStyle(severity: string, isSelected: boolean, reducedMotion: boolean): CSSProperties {
  const tier: QueueDisplayTier = severity === "critical" ? "critical" : severity === "major" ? "warning" : "stable";
  return dsdQueueRowStyleForTier(tier, isSelected, reducedMotion);
}

export function dsdQueueTierBadgeStyle(tier: QueueDisplayTier): CSSProperties {
  const pal = dsdQueueTierPalette(tier);
  return {
    display: "inline-block",
    padding: "2px 6px",
    borderRadius: dsdRadius.sm,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    backgroundColor: pal.badgeBackground,
    color: pal.badgeColor,
    whiteSpace: "nowrap",
  };
}

export function dsdWardSummaryBarStyle(): CSSProperties {
  return {
    padding: dsdSpace.md,
    borderRadius: dsdRadius.md,
    backgroundColor: "var(--dsd-elevated)",
    ...dsdHairlineBorder(DEFAULT_BORDER_COLOR),
    marginBottom: dsdSpace.md,
  };
}

export function dsdCompactSummaryStyle(): CSSProperties {
  return {
    padding: dsdSpace.sm,
    borderRadius: dsdRadius.sm,
    backgroundColor: "var(--dsd-surface)",
    ...dsdHairlineBorder(DEFAULT_BORDER_COLOR),
    ...dsdType.caption,
    color: "var(--dsd-text-muted)",
  };
}

/** Prominent recommended action in patient detail */
export function dsdDetailActionHighlightStyle(): CSSProperties {
  return {
    margin: `${dsdSpace.md}px 0`,
    padding: dsdSpace.md,
    borderRadius: dsdRadius.md,
    backgroundColor: "#132238",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#3b82f6",
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
