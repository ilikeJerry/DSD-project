/**
 * Respiratory deterioration → Critical alert (P0 vertical slice seed).
 * Binds: PHASE 5 scope only — no scope expansion
 */
import type { EventEnvelope } from "@dsd/event-schema";
import type { ClinicalDomainState } from "../types.js";
export interface RespiratoryScenarioContext {
    readonly seed: string;
    readonly nextId: () => string;
    readonly build: string;
    readonly patientId: string;
    readonly patientDisplayName: string;
    readonly scenarioId: string;
}
export declare function createRespiratoryScenarioContext(seed: string): RespiratoryScenarioContext;
/** Bootstrap full mock cohort (30) — profiles fixed, dynamics vary per tick. */
export declare function bootstrapDemoCohort(ctx: RespiratoryScenarioContext, nowIso: string): ClinicalDomainState;
/** Bootstrap patient without audit noise — replay starts from post-bootstrap snapshot + following events */
export declare function bootstrapDemoPatient(ctx: RespiratoryScenarioContext, nowIso: string): ClinicalDomainState;
/**
 * Emits: VITAL_UPDATED → RULE_FIRED → ALERT_CREATED → (optional STALE) → QUEUE_RECOMPUTED
 * correlation: single tick bucket per docs/safety/03
 */
export declare function emitRespiratoryCriticalTick(input: {
    ctx: RespiratoryScenarioContext;
    nowIso: string;
    tickId: string;
    /** If true, vital timestamp lags to force explicit stale surface (docs/07) */
    readonly forceStaleField?: boolean;
}): readonly EventEnvelope[];
/** Stale surface without a new alert — keeps P0 queue from overfilling on repeat ticks */
export declare function emitPatientStaleDetected(input: {
    ctx: RespiratoryScenarioContext;
    nowIso: string;
    tickId: string;
}): readonly EventEnvelope[];
export declare function buildQueueRecomputedEnvelopeForState(input: {
    ctx: RespiratoryScenarioContext;
    state: ClinicalDomainState;
    nowIso: string;
    tickId: string;
    causalParentId: string;
}): EventEnvelope;
//# sourceMappingURL=respiratoryDeterioration.d.ts.map