import { BUILD_PLACEHOLDER } from "../constants.js";
import { buildQueueRecomputedEnvelope, recomputeQueue } from "../queueRecompute.js";
import { tickCorrelationId } from "@dsd/runtime-sync";
import { MOCK_PATIENT_PROFILES, formatProfileDisplayLine, } from "./mockPatientProfiles.js";
export function createRespiratoryScenarioContext(seed) {
    let n = 0;
    return {
        seed,
        nextId: () => `${seed}_id_${++n}`,
        build: BUILD_PLACEHOLDER,
        patientId: "pt-demo-001",
        /** Demo identity — operator chart line (internal id stays in ctx.patientId). */
        patientDisplayName: "이수진 · 48세 · ICU-12",
        scenarioId: "respiratory-deterioration-v1",
    };
}
function patientEntityFromProfile(p, nowIso) {
    const b = p.baselineVitals;
    return {
        id: p.patientId,
        displayName: formatProfileDisplayLine(p),
        vitals: { hr: b.hr, spo2: b.spo2, sbp: b.sbp },
        lastConfirmedAt: nowIso,
    };
}
/** Bootstrap full mock cohort (30) — profiles fixed, dynamics vary per tick. */
export function bootstrapDemoCohort(ctx, nowIso) {
    const patients = new Map();
    for (const profile of MOCK_PATIENT_PROFILES) {
        patients.set(profile.patientId, patientEntityFromProfile(profile, nowIso));
    }
    return {
        degradedMode: "HEALTHY",
        patients,
        alerts: new Map(),
        queueOrderIds: [],
        staleByPatientId: new Map(),
    };
}
/** Bootstrap patient without audit noise — replay starts from post-bootstrap snapshot + following events */
export function bootstrapDemoPatient(ctx, nowIso) {
    return bootstrapDemoCohort(ctx, nowIso);
}
/**
 * Emits: VITAL_UPDATED → RULE_FIRED → ALERT_CREATED → (optional STALE) → QUEUE_RECOMPUTED
 * correlation: single tick bucket per docs/safety/03
 */
export function emitRespiratoryCriticalTick(input) {
    const { ctx, nowIso, tickId } = input;
    const correlationId = tickCorrelationId(tickId);
    const e1 = {
        eventId: ctx.nextId(),
        ts: nowIso,
        schemaVersion: "1.0.0",
        type: "VITAL_UPDATED",
        source: "simulation",
        correlationId,
        build: ctx.build,
        patientId: ctx.patientId,
        tickId,
        scenarioId: ctx.scenarioId,
        payload: {
            spo2: 88,
            lastConfirmedAt: input.forceStaleField ? "2020-01-01T00:00:00.000Z" : nowIso,
        },
    };
    const e2 = {
        eventId: ctx.nextId(),
        ts: nowIso,
        schemaVersion: "1.0.0",
        type: "RULE_FIRED",
        source: "simulation",
        correlationId,
        build: ctx.build,
        patientId: ctx.patientId,
        tickId,
        scenarioId: ctx.scenarioId,
        causalParentId: e1.eventId,
        payload: { ruleId: "SPO2_LT_90", result: "critical" },
    };
    const alertId = ctx.nextId();
    const e3 = {
        eventId: ctx.nextId(),
        ts: nowIso,
        schemaVersion: "1.0.0",
        type: "ALERT_CREATED",
        source: "simulation",
        correlationId,
        build: ctx.build,
        patientId: ctx.patientId,
        alertId,
        tickId,
        scenarioId: ctx.scenarioId,
        causalParentId: e2.eventId,
        dedupeKey: `${ctx.patientId}:SPO2_LT_90`,
        payload: { ruleId: "SPO2_LT_90", severity: "critical", dedupeKey: `${ctx.patientId}:SPO2_LT_90` },
    };
    const envelopes = [e1, e2, e3];
    if (input.forceStaleField) {
        envelopes.push({
            eventId: ctx.nextId(),
            ts: nowIso,
            schemaVersion: "1.0.0",
            type: "STALE_DETECTED",
            source: "simulation",
            correlationId,
            build: ctx.build,
            patientId: ctx.patientId,
            tickId,
            scenarioId: ctx.scenarioId,
            payload: { level: "block" },
        });
    }
    return envelopes;
}
/** Stale surface without a new alert — keeps P0 queue from overfilling on repeat ticks */
export function emitPatientStaleDetected(input) {
    const correlationId = tickCorrelationId(input.tickId);
    return [
        {
            eventId: input.ctx.nextId(),
            ts: input.nowIso,
            schemaVersion: "1.0.0",
            type: "STALE_DETECTED",
            source: "simulation",
            correlationId,
            build: input.ctx.build,
            patientId: input.ctx.patientId,
            tickId: input.tickId,
            scenarioId: input.ctx.scenarioId,
            payload: { level: "block" },
        },
    ];
}
export function buildQueueRecomputedEnvelopeForState(input) {
    const correlationId = tickCorrelationId(input.tickId);
    const result = recomputeQueue(input.state, input.nowIso);
    return buildQueueRecomputedEnvelope({
        eventId: input.ctx.nextId(),
        correlationId,
        build: input.ctx.build,
        tickId: input.tickId,
        scenarioId: input.ctx.scenarioId,
        causalParentId: input.causalParentId,
        result,
        nowIso: input.nowIso,
    });
}
//# sourceMappingURL=respiratoryDeterioration.js.map