function isOpenCritical(a) {
    return a.severity === "critical" && (a.lifecycle === "CREATED" || a.lifecycle === "ACKNOWLEDGED");
}
/**
 * State-level invariant helper — does not replace on-screen layout validation (HF checklist).
 */
export function verifyCriticalVisibilityInvariant(state) {
    const violations = [];
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
export function staleBannerRequired(state) {
    return [...state.staleByPatientId.values()].some((v) => v !== "fresh");
}
export function degradedBannerRequired(state) {
    return state.degradedMode !== "HEALTHY";
}
export { dampenQueueOrderDisplay, shouldDelaySeverityDemotion, resolveDisplayQueueForOperator, DEFAULT_MIN_DEMOTE_VISUAL_MS, DEFAULT_QUEUE_STABILIZATION_HOLD_MS, } from "./temporalStability.js";
export { computeAlertCalmnessScore, shouldDeferNonCriticalUiUpdate } from "./alertCalmness.js";
export { RECONNECT_GRACE_MIN_MS, RECONNECT_TRUST_PHASES, TRUST_RESTORATION_NUDGE_MS, reconnectBannerPriority, } from "./reconnectTrust.js";
export { projectOperationalTrustSurface, projectTrustObservability, } from "./operationalTrustSurface.js";
//# sourceMappingURL=index.js.map