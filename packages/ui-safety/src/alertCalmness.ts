/**
 * Alert calmness — scoring for secondary emphasis / animation caps (display policy).
 * Binds: docs/ux-human-stability/OPERATOR_HUMAN_STABLE_REALTIME_UX.md PHASE 3
 */

export interface AlertCalmnessInput {
  readonly repeatCount: number;
  readonly severity: "critical" | "warning";
  readonly lifecycle: "CREATED" | "ACKNOWLEDGED" | "RESOLVED" | "SUPPRESSED";
}

/** 0 = high salience / “nervous”, 1 = calmer presentation allowed */
export function computeAlertCalmnessScore(a: AlertCalmnessInput): number {
  let s = 0.55;
  if (a.severity === "critical") s -= 0.25;
  if (a.lifecycle === "CREATED") s -= 0.1;
  if (a.repeatCount >= 2) s += 0.12 * Math.min(a.repeatCount, 6);
  return clamp01(s);
}

export function shouldDeferNonCriticalUiUpdate(calmness: number): boolean {
  return calmness > 0.72;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
