/**
 * @dsd/clinical-runtime — orchestration kernel (NOT extra governance).
 * Binds transaction order: validate → audit.append → reduce (docs/safety/04)
 *
 * Hardening: queue stabilization (skip duplicate QUEUE_RECOMPUTED), vital batching, telemetry.
 */
import { AppendOnlyAuditWriter } from "@dsd/audit-runtime";
import type { ClinicalDomainState } from "./types.js";
import { type CohortDynamicsMap } from "./scenarios/patientDynamicState.js";
import type { DegradedMode } from "./degraded.js";
import { RuntimeTelemetry } from "./telemetry.js";
export declare class ClinicalRuntimeKernel {
    private _state;
    readonly audit: AppendOnlyAuditWriter;
    readonly telemetry: RuntimeTelemetry;
    private readonly ctx;
    private _lastQueueFingerprint;
    constructor(seed: string, nowIso: string);
    get state(): ClinicalDomainState;
    /** Apply envelopes: audit bypass 금지 — append는 검증 내장 */
    private applyMany;
    /**
     * Single QUEUE_RECOMPUTED emission point — duplicate suppression (event amplification control).
     * Forbidden: silent queue mutation without audit — skip only when hash+order unchanged (no append).
     */
    private flushQueueRecompute;
    /**
     * High-frequency VITAL_UPDATED: N updates → ONE queue recompute (amplification cap).
     * Binds: PHASE 3 — VITAL x100 must not emit QUEUE x100.
     */
    ingestVitalBatch(input: {
        correlationId: string;
        tickId: string;
        nowIso: string;
        patientId: string;
        patches: ReadonlyArray<Partial<{
            hr: number;
            spo2: number;
            sbp: number;
            lastConfirmedAt: string;
        }>>;
    }): void;
    /**
     * P0 slice: respiratory deterioration tick
     */
    runRespiratoryCriticalTick(input: {
        nowIso: string;
        tickId: string;
        forceStale?: boolean;
    }): void;
    acknowledgeAlert(input: {
        alertId: string;
        actor: string;
        correlationId: string;
        nowIso: string;
    }): void;
    resolveAlert(input: {
        alertId: string;
        actor: string;
        correlationId: string;
        confirmationToken: string;
        nowIso: string;
    }): void;
    enterDegraded(mode: DegradedMode, nowIso: string, correlationId: string): void;
    exitDegraded(nowIso: string, correlationId: string): void;
    simulateReconnect(nowIso: string, correlationId: string): void;
    /** Explicit stale signal without a new alert (demo / reconciliation paths). */
    signalPatientStale(input: {
        nowIso: string;
        tickId: string;
        correlationId: string;
    }): void;
    /** Initial dynamics map for cohort — keyed by patientId. */
    createInitialCohortDynamics(nowIso: string): CohortDynamicsMap;
    /**
     * Controlled-random cohort tick — 2–5 patients change per tick (deterministic from seed).
     */
    runControlledRandomTick(input: {
        seed: string;
        tickIndex: number;
        tickId: string;
        nowIso: string;
        priorDynamics: CohortDynamicsMap;
    }): CohortDynamicsMap;
}
//# sourceMappingURL=kernel.d.ts.map