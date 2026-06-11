/**
 * Temporal stability — display layer only (truth unchanged in clinical-runtime).
 * Binds: docs/ux-human-stability/OPERATOR_HUMAN_STABLE_REALTIME_UX.md PHASE 1–2
 */
export interface DampenQueueDisplayResult {
    readonly displayIds: readonly string[];
    readonly committedToTruth: boolean;
    readonly reason: "aligned" | "initial_fill" | "cleared" | "critical_top" | "dampen_hold" | "commit_truth" | "p0_open_critical";
}
/**
 * Suppresses micro-reorders within minHold unless top critical changes or large movement.
 */
export declare function dampenQueueOrderDisplay(input: {
    readonly truthIds: readonly string[];
    readonly displayedIds: readonly string[];
    /** Parallel to truthIds — true if that row is critical (truth authority). */
    readonly truthIsCritical: readonly boolean[];
    readonly nowMs: number;
    readonly lastDisplayCommitMs: number;
    readonly minHoldMs?: number;
    readonly minIndexMove?: number;
}): DampenQueueDisplayResult;
/**
 * Severity visual hysteresis — demotion delayed; promotion immediate (caller: promotion if !delay).
 */
export declare function shouldDelaySeverityDemotion(input: {
    readonly wasCriticalVisual: boolean;
    readonly truthIsCritical: boolean;
    readonly nowMs: number;
    readonly lastCriticalVisualTrueMs: number;
    readonly minDemoteVisualMs: number;
}): boolean;
export declare const DEFAULT_MIN_DEMOTE_VISUAL_MS = 1800;
export declare const DEFAULT_QUEUE_STABILIZATION_HOLD_MS = 450;
/**
 * P0: any open critical → display MUST track truth immediately (temporal dampening overridden).
 * Binds: OPERATOR_HUMAN_STABLE_REALTIME_UX.md PHASE 6
 */
export declare function resolveDisplayQueueForOperator(input: {
    readonly truthIds: readonly string[];
    readonly displayedIds: readonly string[];
    readonly truthIsCritical: readonly boolean[];
    readonly openCriticalCount: number;
    readonly nowMs: number;
    readonly lastDisplayCommitMs: number;
    readonly minHoldMs?: number;
    readonly minIndexMove?: number;
}): DampenQueueDisplayResult;
//# sourceMappingURL=temporalStability.d.ts.map