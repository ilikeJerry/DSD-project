/**
 * @dsd/clinical-runtime — public surface (minimal exports to reduce coupling)
 */
export { AppendOnlyAuditWriter } from "@dsd/audit-runtime";
export { deterministicSerialize, parseEnvelope, EventEnvelopeSchema } from "@dsd/event-schema";
export { ClinicalRuntimeKernel } from "./kernel.js";
export { queueResultFingerprint, queueOrderKey } from "./queueFingerprint.js";
export { RuntimeTelemetry } from "./telemetry.js";
export { reduceClinical, deriveStaleMap } from "./reducer.js";
export { emptyClinicalState } from "./types.js";
export { recomputeQueue, buildQueueRecomputedEnvelope } from "./queueRecompute.js";
export { STALE_THRESHOLD_WARN_MS, STALE_THRESHOLD_BLOCK_MS, QUEUE_POLICY_VERSION, BUILD_PLACEHOLDER } from "./constants.js";
export { staleLevelForAgeMs } from "./stale.js";
export { mergeDegradedMode } from "./degraded.js";
export { bootstrapDemoPatient, bootstrapDemoCohort, createRespiratoryScenarioContext, emitRespiratoryCriticalTick, emitPatientStaleDetected, buildQueueRecomputedEnvelopeForState, } from "./scenarios/respiratoryDeterioration.js";
export { MOCK_PATIENT_PROFILES, MOCK_COHORT_SIZE, profileById, formatProfileDisplayLine, } from "./scenarios/mockPatientProfiles.js";
export { initCohortDynamics, planCohortControlledTick, computeRiskAssessment, primaryConcernLabel, formatDynamicVitalSummary, vitalTrendGlyph, } from "./scenarios/patientDynamicState.js";
export { createSeededRng, tickRng } from "./scenarios/seededRandom.js";
//# sourceMappingURL=index.js.map