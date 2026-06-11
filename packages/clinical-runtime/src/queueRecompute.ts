/**
 * Binds: docs/safety/05-alert-prioritization-traceability.md
 * Emits deterministic inputSnapshotHash for replay comparison
 */
import { deterministicSerialize, type EventEnvelope } from "@dsd/event-schema";
import type { AlertEntity, ClinicalDomainState, PatientEntity } from "./types.js";
import { QUEUE_POLICY_VERSION } from "./constants.js";
import { staleLevelForAgeMs } from "./stale.js";

export interface QueueRecomputeResult {
  readonly orderedAlertIds: readonly string[];
  readonly inputSnapshotHash: string;
  readonly reasonByAlertId: ReadonlyMap<string, readonly string[]>;
}

function openAlerts(state: ClinicalDomainState): readonly AlertEntity[] {
  return [...state.alerts.values()].filter((a) => a.lifecycle === "CREATED" || a.lifecycle === "ACKNOWLEDGED");
}

function vitalRiskBoost(patient: PatientEntity | undefined): number {
  if (!patient) return 0;
  const { spo2, sbp, hr } = patient.vitals;
  let boost = 0;
  if (spo2 < 90) boost += 80;
  else if (spo2 < 92) boost += 25;
  if (sbp < 85) boost += 70;
  else if (sbp < 95) boost += 20;
  if (hr > 130) boost += 60;
  else if (hr > 110) boost += 15;
  return boost;
}

function rankAlert(a: AlertEntity, patient: PatientEntity | undefined, nowMs: number): number {
  const unacked = a.lifecycle === "CREATED" ? 1 : 0;
  const sev = a.severity === "critical" ? 100 : 10;
  const created = Date.parse(a.createdAt);
  const age = Number.isFinite(created) ? nowMs - created : 0;
  const stale = patient ? staleLevelForAgeMs(nowMs - Date.parse(patient.lastConfirmedAt)) : "fresh";
  const stalePenalty = stale === "block" ? 15 : stale === "warn" ? 6 : 0;
  const trendBoost = patient ? vitalRiskBoost(patient) : 0;
  const recency = Number.isFinite(Date.parse(patient?.lastConfirmedAt ?? ""))
    ? Math.max(0, 30 - (nowMs - Date.parse(patient!.lastConfirmedAt)) / 1000)
    : 0;
  return sev + unacked * 50 + trendBoost + stalePenalty + recency + age / 10000;
}

export function recomputeQueue(state: ClinicalDomainState, nowIso: string): QueueRecomputeResult {
  const nowMs = Date.parse(nowIso);
  const open = openAlerts(state);
  const reasonByAlertId = new Map<string, string[]>();
  const sorted = [...open].sort((a, b) => {
    const pa = state.patients.get(a.patientId);
    const pb = state.patients.get(b.patientId);
    const rb = rankAlert(b, pb, nowMs);
    const ra = rankAlert(a, pa, nowMs);
    if (rb !== ra) return rb - ra;
    return a.id.localeCompare(b.id);
  });
  for (const a of sorted) {
    const p = state.patients.get(a.patientId);
    const reasons: string[] = [
      `severity:${a.severity}`,
      `lifecycle:${a.lifecycle}`,
    ];
    if (p) reasons.push(`stale:${staleLevelForAgeMs(nowMs - Date.parse(p.lastConfirmedAt))}`);
    reasonByAlertId.set(a.id, reasons);
  }
  const snapshot = {
    policyVersion: QUEUE_POLICY_VERSION,
    alertIds: sorted.map((a) => a.id),
    patientClock: [...state.patients.entries()].map(([id, p]) => [id, p.lastConfirmedAt] as const),
  };
  const inputSnapshotHash = hashFromDeterministicJson(snapshot);
  return { orderedAlertIds: sorted.map((a) => a.id), inputSnapshotHash, reasonByAlertId };
}

export function buildQueueRecomputedEnvelope(input: {
  eventId: string;
  correlationId: string;
  build: string;
  tickId?: string;
  scenarioId?: string;
  causalParentId?: string;
  result: QueueRecomputeResult;
  nowIso: string;
}): EventEnvelope {
  const payload = {
    policyVersion: QUEUE_POLICY_VERSION,
    topK: input.result.orderedAlertIds,
    inputSnapshotHash: input.result.inputSnapshotHash,
    reasons: Object.fromEntries(input.result.reasonByAlertId),
  };
  return {
    eventId: input.eventId,
    ts: input.nowIso,
    schemaVersion: "1.0.0",
    type: "QUEUE_RECOMPUTED",
    source: "simulation",
    correlationId: input.correlationId,
    build: input.build,
    causalParentId: input.causalParentId,
    tickId: input.tickId,
    scenarioId: input.scenarioId,
    payload,
  };
}

function hashFromDeterministicJson(snapshot: unknown): string {
  const s = deterministicSerialize(snapshot);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return `h${(h >>> 0).toString(16)}`;
}
