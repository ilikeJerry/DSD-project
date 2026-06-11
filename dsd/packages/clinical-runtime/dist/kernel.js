/**
 * @dsd/clinical-runtime — orchestration kernel (NOT extra governance).
 * Binds transaction order: validate → audit.append → reduce (docs/safety/04)
 *
 * Hardening: queue stabilization (skip duplicate QUEUE_RECOMPUTED), vital batching, telemetry.
 */
import { AppendOnlyAuditWriter } from "@dsd/audit-runtime";
import { reduceClinical } from "./reducer.js";
import { bootstrapDemoPatient, createRespiratoryScenarioContext, emitPatientStaleDetected, emitRespiratoryCriticalTick, } from "./scenarios/respiratoryDeterioration.js";
import { initCohortDynamics, planCohortControlledTick } from "./scenarios/patientDynamicState.js";
import { MOCK_PATIENT_PROFILES } from "./scenarios/mockPatientProfiles.js";
import { buildQueueRecomputedEnvelope, recomputeQueue } from "./queueRecompute.js";
import { queueOrderKey, queueResultFingerprint } from "./queueFingerprint.js";
import { RuntimeTelemetry } from "./telemetry.js";
export class ClinicalRuntimeKernel {
    _state;
    audit;
    telemetry;
    ctx;
    _lastQueueFingerprint = null;
    constructor(seed, nowIso) {
        this.ctx = createRespiratoryScenarioContext(seed);
        this.audit = new AppendOnlyAuditWriter();
        this.telemetry = new RuntimeTelemetry();
        this._state = bootstrapDemoPatient(this.ctx, nowIso);
    }
    get state() {
        return this._state;
    }
    /** Apply envelopes: audit bypass 금지 — append는 검증 내장 */
    applyMany(raws) {
        for (const raw of raws) {
            const e = this.audit.append(raw);
            this.telemetry.onEventAppended();
            this._state = reduceClinical(this._state, e);
            if (e.type === "VITAL_UPDATED")
                this.telemetry.onVitalUpdated();
            if (e.type === "DEGRADED_ENTER")
                this.telemetry.degradedEnterCount++;
            if (e.type === "DEGRADED_EXIT")
                this.telemetry.degradedExitCount++;
            if (e.type === "STALE_DETECTED")
                this.telemetry.staleDetectedCount++;
            if (e.type === "STALE_CLEARED")
                this.telemetry.staleClearedCount++;
        }
    }
    /**
     * Single QUEUE_RECOMPUTED emission point — duplicate suppression (event amplification control).
     * Forbidden: silent queue mutation without audit — skip only when hash+order unchanged (no append).
     */
    flushQueueRecompute(input) {
        const result = recomputeQueue(this._state, input.nowIso);
        const fp = queueResultFingerprint(result);
        if (fp === this._lastQueueFingerprint) {
            this.telemetry.onQueueRecomputeSkippedUnchanged();
            return;
        }
        this._lastQueueFingerprint = fp;
        const q = buildQueueRecomputedEnvelope({
            eventId: this.ctx.nextId(),
            correlationId: input.correlationId,
            build: this.ctx.build,
            tickId: input.tickId,
            scenarioId: this.ctx.scenarioId,
            causalParentId: input.causalParentId,
            result,
            nowIso: input.nowIso,
        });
        this.applyMany([q]);
        this.telemetry.onQueueRecomputeEmitted(result.inputSnapshotHash, queueOrderKey(result.orderedAlertIds));
    }
    /**
     * High-frequency VITAL_UPDATED: N updates → ONE queue recompute (amplification cap).
     * Binds: PHASE 3 — VITAL x100 must not emit QUEUE x100.
     */
    ingestVitalBatch(input) {
        const envelopes = [];
        let parent;
        for (const patch of input.patches) {
            const e = {
                eventId: this.ctx.nextId(),
                ts: input.nowIso,
                schemaVersion: "1.0.0",
                type: "VITAL_UPDATED",
                source: "simulation",
                correlationId: input.correlationId,
                build: this.ctx.build,
                patientId: input.patientId,
                tickId: input.tickId,
                causalParentId: parent,
                payload: patch,
            };
            parent = e.eventId;
            envelopes.push(e);
        }
        if (envelopes.length === 0)
            return;
        this.applyMany(envelopes);
        const last = envelopes[envelopes.length - 1];
        this.flushQueueRecompute({
            correlationId: input.correlationId,
            tickId: input.tickId,
            causalParentId: last.eventId,
            nowIso: input.nowIso,
        });
    }
    /**
     * P0 slice: respiratory deterioration tick
     */
    runRespiratoryCriticalTick(input) {
        const pending = emitRespiratoryCriticalTick({
            ctx: this.ctx,
            nowIso: input.nowIso,
            tickId: input.tickId,
            forceStaleField: input.forceStale,
        });
        this.applyMany(pending);
        const last = pending[pending.length - 1];
        if (!last)
            return;
        this.flushQueueRecompute({
            correlationId: last.correlationId,
            tickId: input.tickId,
            causalParentId: last.eventId,
            nowIso: input.nowIso,
        });
    }
    acknowledgeAlert(input) {
        const alert = this._state.alerts.get(input.alertId);
        if (!alert || alert.lifecycle !== "CREATED") {
            throw new Error("ACK_FORBIDDEN: alert missing or not CREATED (docs/safety/09-ack-resolve-state-machine.md)");
        }
        const e = {
            eventId: this.ctx.nextId(),
            ts: input.nowIso,
            schemaVersion: "1.0.0",
            type: "ALERT_ACKED",
            source: "live",
            correlationId: input.correlationId,
            build: this.ctx.build,
            patientId: alert.patientId,
            alertId: input.alertId,
            actor: input.actor,
            payload: {},
        };
        this.applyMany([e]);
        this.flushQueueRecompute({
            correlationId: input.correlationId,
            tickId: `post-ack-${input.alertId}`,
            causalParentId: e.eventId,
            nowIso: input.nowIso,
        });
    }
    resolveAlert(input) {
        if (this._state.degradedMode === "OFFLINE") {
            throw new Error("RESOLVE_FORBIDDEN_OFFLINE: docs/safety/06-degraded-mode-policy.md");
        }
        const alert = this._state.alerts.get(input.alertId);
        if (!alert || alert.lifecycle !== "ACKNOWLEDGED") {
            throw new Error("RESOLVE_FORBIDDEN: alert missing or not ACKNOWLEDGED (docs/safety/09-ack-resolve-state-machine.md)");
        }
        if (!input.confirmationToken || input.confirmationToken.trim().length === 0) {
            throw new Error("RESOLVE_FORBIDDEN_EMPTY_CONFIRMATION");
        }
        const req = {
            eventId: this.ctx.nextId(),
            ts: input.nowIso,
            schemaVersion: "1.0.0",
            type: "ALERT_RESOLVE_REQUESTED",
            source: "live",
            correlationId: input.correlationId,
            build: this.ctx.build,
            patientId: alert.patientId,
            alertId: input.alertId,
            actor: input.actor,
            payload: {},
        };
        const res = {
            eventId: this.ctx.nextId(),
            ts: input.nowIso,
            schemaVersion: "1.0.0",
            type: "ALERT_RESOLVED",
            source: "live",
            correlationId: input.correlationId,
            build: this.ctx.build,
            causalParentId: req.eventId,
            patientId: alert.patientId,
            alertId: input.alertId,
            actor: input.actor,
            payload: { confirmationToken: input.confirmationToken },
        };
        this.applyMany([req, res]);
        this.flushQueueRecompute({
            correlationId: input.correlationId,
            tickId: `post-resolve-${input.alertId}`,
            causalParentId: res.eventId,
            nowIso: input.nowIso,
        });
    }
    enterDegraded(mode, nowIso, correlationId) {
        const e = {
            eventId: this.ctx.nextId(),
            ts: nowIso,
            schemaVersion: "1.0.0",
            type: "DEGRADED_ENTER",
            source: "system",
            correlationId,
            build: this.ctx.build,
            payload: { mode },
        };
        this.applyMany([e]);
    }
    exitDegraded(nowIso, correlationId) {
        const e = {
            eventId: this.ctx.nextId(),
            ts: nowIso,
            schemaVersion: "1.0.0",
            type: "DEGRADED_EXIT",
            source: "system",
            correlationId,
            build: this.ctx.build,
            payload: {},
        };
        this.applyMany([e]);
    }
    simulateReconnect(nowIso, correlationId) {
        this.enterDegraded("RECONNECTING", nowIso, correlationId);
        this.exitDegraded(nowIso, correlationId);
    }
    /** Explicit stale signal without a new alert (demo / reconciliation paths). */
    signalPatientStale(input) {
        const pending = emitPatientStaleDetected({
            ctx: this.ctx,
            nowIso: input.nowIso,
            tickId: input.tickId,
        });
        this.applyMany(pending);
    }
    /** Initial dynamics map for cohort — keyed by patientId. */
    createInitialCohortDynamics(nowIso) {
        return initCohortDynamics(MOCK_PATIENT_PROFILES, nowIso);
    }
    /**
     * Controlled-random cohort tick — 2–5 patients change per tick (deterministic from seed).
     */
    runControlledRandomTick(input) {
        const plan = planCohortControlledTick({
            seed: input.seed,
            tickIndex: input.tickIndex,
            tickId: input.tickId,
            nowIso: input.nowIso,
            ctx: this.ctx,
            profiles: MOCK_PATIENT_PROFILES,
            prior: input.priorDynamics,
            domain: this._state,
            globalPhase: input.tickIndex % 8,
        });
        if (plan.envelopes.length === 0)
            return plan.dynamics;
        this.applyMany(plan.envelopes);
        const qAnchor = [...plan.envelopes]
            .reverse()
            .find((e) => e.type === "ALERT_CREATED" || e.type === "VITAL_UPDATED" || e.type === "STALE_DETECTED");
        if (qAnchor) {
            this.flushQueueRecompute({
                correlationId: qAnchor.correlationId,
                tickId: input.tickId,
                causalParentId: qAnchor.eventId,
                nowIso: input.nowIso,
            });
        }
        return plan.dynamics;
    }
}
//# sourceMappingURL=kernel.js.map