/**
 * Failure-survivable operational UX — pure projections (no runtime orchestration).
 * Binds: docs/ux-human-stability/FAILURE_SURVIVABLE_CLINICAL_UX.md
 */
import type { ClinicalDomainState } from "@dsd/clinical-runtime";
export type PanelConfidence = "HIGH" | "PARTIAL_STALE" | "DEGRADED" | "RECONNECTING";
/** Narrow telemetry slice so UI packages do not depend on full kernel shape evolution. */
export interface TrustTelemetrySlice {
    readonly queueRecomputeEmitted: number;
    readonly queueRecomputeSkippedUnchanged: number;
    readonly degradedEnterCount: number;
    readonly degradedExitCount: number;
    readonly staleDetectedCount: number;
    readonly staleClearedCount: number;
}
export interface OperationalTrustSurface {
    /** Single token all panels must echo for temporal alignment (queue + detail + banners). */
    readonly syncVersionKey: string;
    readonly panelConfidence: PanelConfidence;
    readonly partialStalePatientIds: readonly string[];
    readonly hasMixedFreshness: boolean;
    readonly recoveryTimelineLabel: string;
    readonly queueRecoveryNarrative: string;
    readonly staleHierarchySummary: string;
    readonly replayReconciliationHint: string;
    readonly crossPanelConsistencyRule: "single_sync_version_all_panels";
}
export interface TrustObservabilityStrip {
    readonly completedDegradedCycles: number;
    readonly queueReconciliationBursts: number;
    readonly queueReconcileSkipsUnchanged: number;
    readonly staleDetections: number;
    readonly staleClears: number;
    readonly operatorFacingSummary: string;
}
/**
 * Deterministic cross-panel version: degraded + queue + stale map.
 * Forbidden: hidden partial stale — partialStalePatientIds always enumerated when non-empty.
 */
export declare function projectOperationalTrustSurface(state: ClinicalDomainState): OperationalTrustSurface;
export declare function projectTrustObservability(input: {
    readonly telemetry: TrustTelemetrySlice;
    readonly surface: OperationalTrustSurface;
}): TrustObservabilityStrip;
//# sourceMappingURL=operationalTrustSurface.d.ts.map