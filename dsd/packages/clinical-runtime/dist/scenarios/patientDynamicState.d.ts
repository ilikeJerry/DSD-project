/**
 * Controlled-random patient dynamics — profile-fixed, state variable per tick.
 */
import type { EventEnvelope } from "@dsd/event-schema";
import type { ClinicalDomainState } from "../types.js";
import type { PatientProfile, BaselineVitals } from "./mockPatientProfiles.js";
import type { RespiratoryScenarioContext } from "./respiratoryDeterioration.js";
export type ClinicalConcern = "respiratory_deterioration" | "hypotension_risk" | "tachycardia" | "fever_persistence" | "acute_change" | "stable_monitoring" | "recovery_observation" | "data_delay";
export type TrendDirection = "improving" | "worsening" | "stable";
export type DynamicSeverity = "normal" | "warning" | "critical";
export type DataFreshness = "fresh" | "warn" | "block";
export interface ExtendedVitals extends BaselineVitals {
}
export interface PatientDynamicState {
    readonly currentVitals: ExtendedVitals;
    readonly activeConcerns: readonly ClinicalConcern[];
    readonly severity: DynamicSeverity;
    readonly dataFreshness: DataFreshness;
    readonly trendDirection: TrendDirection;
    readonly riskScore: number;
    readonly recommendedAction: string;
    readonly lastUpdatedAt: string;
}
export type CohortDynamicsMap = ReadonlyMap<string, PatientDynamicState>;
export declare function initCohortDynamics(profiles: readonly PatientProfile[], nowIso: string): CohortDynamicsMap;
export declare function computeRiskAssessment(vitals: ExtendedVitals, freshness: DataFreshness): {
    severity: DynamicSeverity;
    riskScore: number;
    ruleId: string | null;
    alertSeverity: "critical" | "warning" | null;
};
export declare function primaryConcernLabel(state: PatientDynamicState): string;
export declare function vitalTrendGlyph(trend: TrendDirection): string;
export declare function formatDynamicVitalSummary(state: PatientDynamicState): string;
export type CohortTickPlan = {
    readonly dynamics: CohortDynamicsMap;
    readonly envelopes: readonly EventEnvelope[];
    readonly selectedPatientIds: readonly string[];
};
export declare function planCohortControlledTick(input: {
    seed: string;
    tickIndex: number;
    tickId: string;
    nowIso: string;
    ctx: RespiratoryScenarioContext;
    profiles: readonly PatientProfile[];
    prior: CohortDynamicsMap;
    domain: ClinicalDomainState;
    /** Optional global stale / reconnect beat */
    globalPhase?: number;
}): CohortTickPlan;
export declare function bootstrapProfilesDisplayNames(profiles: readonly PatientProfile[]): ReadonlyMap<string, string>;
//# sourceMappingURL=patientDynamicState.d.ts.map