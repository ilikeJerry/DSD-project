/**
 * Respiratory deterioration → Critical alert (P0 vertical slice seed).
 * Binds: PHASE 5 scope only — no scope expansion
 */
import type { EventEnvelope } from "@dsd/event-schema";
import { BUILD_PLACEHOLDER } from "../constants.js";
import { buildQueueRecomputedEnvelope, recomputeQueue } from "../queueRecompute.js";
import type { ClinicalDomainState, PatientEntity } from "../types.js";
import { tickCorrelationId } from "@dsd/runtime-sync";
import {
  MOCK_PATIENT_PROFILES,
  formatProfileDisplayLine,
  type PatientProfile,
} from "./mockPatientProfiles.js";

export interface RespiratoryScenarioContext {
  readonly seed: string;
  readonly nextId: () => string;
  readonly build: string;
  readonly patientId: string;
  readonly patientDisplayName: string;
  readonly scenarioId: string;
}

export function createRespiratoryScenarioContext(seed: string): RespiratoryScenarioContext {
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

function patientEntityFromProfile(p: PatientProfile, nowIso: string): PatientEntity {
  const b = p.baselineVitals;
  return {
    id: p.patientId,
    displayName: formatProfileDisplayLine(p),
    vitals: { hr: b.hr, spo2: b.spo2, sbp: b.sbp },
    lastConfirmedAt: nowIso,
  };
}

/** Bootstrap full mock cohort (30) — profiles fixed, dynamics vary per tick. */
export function bootstrapDemoCohort(ctx: RespiratoryScenarioContext, nowIso: string): ClinicalDomainState {
  const patients = new Map<string, PatientEntity>();
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
export function bootstrapDemoPatient(ctx: RespiratoryScenarioContext, nowIso: string): ClinicalDomainState {
  return bootstrapDemoCohort(ctx, nowIso);
}

/**
 * Emits: VITAL_UPDATED → RULE_FIRED → ALERT_CREATED → (optional STALE) → QUEUE_RECOMPUTED
 * correlation: single tick bucket per docs/safety/03
 */
export function emitRespiratoryCriticalTick(input: {
  ctx: RespiratoryScenarioContext;
  nowIso: string;
  tickId: string;
  /** If true, vital timestamp lags to force explicit stale surface (docs/07) */
  readonly forceStaleField?: boolean;
}): readonly EventEnvelope[] {
  const { ctx, nowIso, tickId } = input;
  const correlationId = tickCorrelationId(tickId);
  const e1: EventEnvelope = {
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
  const e2: EventEnvelope = {
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
  const e3: EventEnvelope = {
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
  const envelopes: EventEnvelope[] = [e1, e2, e3];
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
export function emitPatientStaleDetected(input: {
  ctx: RespiratoryScenarioContext;
  nowIso: string;
  tickId: string;
}): readonly EventEnvelope[] {
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

export function buildQueueRecomputedEnvelopeForState(input: {
  ctx: RespiratoryScenarioContext;
  state: ClinicalDomainState;
  nowIso: string;
  tickId: string;
  causalParentId: string;
}): EventEnvelope {
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
