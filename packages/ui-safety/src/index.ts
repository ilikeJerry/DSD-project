/**
 * @dsd/ui-safety
 * Binds: docs/safety/CRITICAL_VISIBILITY_GUARANTEE.md (state-level checks; UI must also enforce layout)
 */
import type { ClinicalDomainState } from "@dsd/clinical-runtime";

export interface VisibilityReport {
  readonly ok: boolean;
  readonly violations: readonly string[];
  readonly openCriticalCount: number;
}

function isOpenCritical(a: { severity: string; lifecycle: string }): boolean {
  return a.severity === "critical" && (a.lifecycle === "CREATED" || a.lifecycle === "ACKNOWLEDGED");
}

/**
 * State-level invariant helper — does not replace on-screen layout validation (HF checklist).
 */
export function verifyCriticalVisibilityInvariant(state: ClinicalDomainState): VisibilityReport {
  const violations: string[] = [];
  const openCritical = [...state.alerts.values()].filter(isOpenCritical);
  const count = openCritical.length;
  if (count > 0 && state.queueOrderIds.length === 0) {
    violations.push("INV_QUEUE_EMPTY_WITH_OPEN_CRITICAL");
  }
  if (count > 0) {
    const first = state.queueOrderIds[0];
    const firstAlert = first ? state.alerts.get(first) : undefined;
    if (!firstAlert || !isOpenCritical(firstAlert)) {
      violations.push("INV_QUEUE_TOP_NOT_OPEN_CRITICAL");
    }
  }
  return { ok: violations.length === 0, violations, openCriticalCount: count };
}

export function staleBannerRequired(state: ClinicalDomainState): boolean {
  return [...state.staleByPatientId.values()].some((v) => v !== "fresh");
}

export function degradedBannerRequired(state: ClinicalDomainState): boolean {
  return state.degradedMode !== "HEALTHY";
}

export {
  dampenQueueOrderDisplay,
  shouldDelaySeverityDemotion,
  resolveDisplayQueueForOperator,
  DEFAULT_MIN_DEMOTE_VISUAL_MS,
  DEFAULT_QUEUE_STABILIZATION_HOLD_MS,
} from "./temporalStability.js";
export { computeAlertCalmnessScore, shouldDeferNonCriticalUiUpdate, type AlertCalmnessInput } from "./alertCalmness.js";
export {
  RECONNECT_GRACE_MIN_MS,
  RECONNECT_TRUST_PHASES,
  TRUST_RESTORATION_NUDGE_MS,
  reconnectBannerPriority,
  type ReconnectTrustPhase,
} from "./reconnectTrust.js";
export {
  projectOperationalTrustSurface,
  projectTrustObservability,
  type OperationalTrustSurface,
  type PanelConfidence,
  type TrustObservabilityStrip,
  type TrustTelemetrySlice,
} from "./operationalTrustSurface.js";
