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
/**
 * State-level invariant helper — does not replace on-screen layout validation (HF checklist).
 */
export declare function verifyCriticalVisibilityInvariant(state: ClinicalDomainState): VisibilityReport;
export declare function staleBannerRequired(state: ClinicalDomainState): boolean;
export declare function degradedBannerRequired(state: ClinicalDomainState): boolean;
export { dampenQueueOrderDisplay, shouldDelaySeverityDemotion, resolveDisplayQueueForOperator, DEFAULT_MIN_DEMOTE_VISUAL_MS, DEFAULT_QUEUE_STABILIZATION_HOLD_MS, } from "./temporalStability.js";
export { computeAlertCalmnessScore, shouldDeferNonCriticalUiUpdate, type AlertCalmnessInput } from "./alertCalmness.js";
export { RECONNECT_GRACE_MIN_MS, RECONNECT_TRUST_PHASES, TRUST_RESTORATION_NUDGE_MS, reconnectBannerPriority, type ReconnectTrustPhase, } from "./reconnectTrust.js";
export { projectOperationalTrustSurface, projectTrustObservability, type OperationalTrustSurface, type PanelConfidence, type TrustObservabilityStrip, type TrustTelemetrySlice, } from "./operationalTrustSurface.js";
//# sourceMappingURL=index.d.ts.map