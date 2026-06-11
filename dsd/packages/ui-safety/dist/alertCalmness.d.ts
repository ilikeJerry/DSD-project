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
export declare function computeAlertCalmnessScore(a: AlertCalmnessInput): number;
export declare function shouldDeferNonCriticalUiUpdate(calmness: number): boolean;
//# sourceMappingURL=alertCalmness.d.ts.map