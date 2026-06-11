/**
 * Pure replay-safe reducer.
 * Binds: state transitions must be reconstructible from envelopes (docs/safety/04, 09)
 */
import type { EventEnvelope } from "@dsd/event-schema";
import { mergeDegradedMode, type DegradedMode } from "./degraded.js";
import type { AlertEntity, ClinicalDomainState, PatientEntity, VitalSigns } from "./types.js";
import { staleLevelForAgeMs } from "./stale.js";

function mapSet<K, V>(m: ReadonlyMap<K, V>, key: K, val: V): ReadonlyMap<K, V> {
  const n = new Map(m);
  n.set(key, val);
  return n;
}

function mapUpdatePatient(
  state: ClinicalDomainState,
  patientId: string,
  fn: (p: PatientEntity) => PatientEntity,
): ClinicalDomainState {
  const p = state.patients.get(patientId);
  if (!p) return state;
  return { ...state, patients: mapSet(state.patients, patientId, fn(p)) };
}

export function reduceClinical(state: ClinicalDomainState, envelope: EventEnvelope): ClinicalDomainState {
  switch (envelope.type) {
    case "VITAL_UPDATED": {
      const pid = envelope.patientId;
      if (!pid) return state;
      const p = state.patients.get(pid);
      if (!p) return state;
      const patch = (envelope.payload ?? {}) as Partial<VitalSigns> & { lastConfirmedAt?: string };
      const nextVitals: VitalSigns = {
        hr: patch.hr ?? p.vitals.hr,
        spo2: patch.spo2 ?? p.vitals.spo2,
        sbp: patch.sbp ?? p.vitals.sbp,
      };
      const next: PatientEntity = {
        ...p,
        vitals: nextVitals,
        lastConfirmedAt: patch.lastConfirmedAt ?? envelope.ts,
      };
      return { ...state, patients: mapSet(state.patients, pid, next) };
    }
    case "RULE_FIRED":
      return state;
    case "ALERT_CREATED": {
      const payload = (envelope.payload ?? {}) as {
        ruleId?: string;
        severity?: "critical" | "warning";
        dedupeKey?: string;
      };
      const alert: AlertEntity = {
        id: envelope.alertId!,
        patientId: envelope.patientId!,
        ruleId: payload.ruleId ?? "UNKNOWN",
        severity: payload.severity ?? "warning",
        lifecycle: "CREATED",
        dedupeKey: payload.dedupeKey ?? `${envelope.patientId}:${payload.ruleId ?? "UNKNOWN"}`,
        repeatCount: 1,
        createdAt: envelope.ts,
      };
      return { ...state, alerts: mapSet(state.alerts, alert.id, alert) };
    }
    case "ALERT_ACKED": {
      const id = envelope.alertId!;
      const a = state.alerts.get(id);
      if (!a || a.lifecycle !== "CREATED") return state;
      const next: AlertEntity = { ...a, lifecycle: "ACKNOWLEDGED" };
      return { ...state, alerts: mapSet(state.alerts, id, next) };
    }
    case "ALERT_RESOLVE_REQUESTED":
      return state;
    case "ALERT_RESOLVED": {
      const id = envelope.alertId!;
      const a = state.alerts.get(id);
      if (!a || a.lifecycle !== "ACKNOWLEDGED") return state;
      const token = (envelope.payload as { confirmationToken?: string } | undefined)?.confirmationToken;
      if (!token || token.length === 0) return state;
      const next: AlertEntity = { ...a, lifecycle: "RESOLVED" };
      return { ...state, alerts: mapSet(state.alerts, id, next) };
    }
    case "ALERT_ACK_ROLLBACK": {
      const id = envelope.alertId!;
      const a = state.alerts.get(id);
      if (!a || a.lifecycle !== "ACKNOWLEDGED") return state;
      const next: AlertEntity = { ...a, lifecycle: "CREATED" };
      return { ...state, alerts: mapSet(state.alerts, id, next) };
    }
    case "ALERT_SUPPRESSED": {
      const id = envelope.alertId!;
      const a = state.alerts.get(id);
      if (!a) return state;
      const next: AlertEntity = { ...a, lifecycle: "SUPPRESSED" };
      return { ...state, alerts: mapSet(state.alerts, id, next) };
    }
    case "QUEUE_RECOMPUTED": {
      const topK = (envelope.payload as { topK?: string[] } | undefined)?.topK;
      if (!topK) return state;
      return { ...state, queueOrderIds: topK };
    }
    case "STALE_DETECTED": {
      const pid = envelope.patientId;
      if (!pid) return state;
      const level = (envelope.payload as { level?: "fresh" | "warn" | "block" } | undefined)?.level ?? "warn";
      return { ...state, staleByPatientId: mapSet(state.staleByPatientId, pid, level) };
    }
    case "STALE_CLEARED": {
      const pid = envelope.patientId;
      if (!pid) return state;
      const next = new Map(state.staleByPatientId);
      next.delete(pid);
      return { ...state, staleByPatientId: next };
    }
    case "DEGRADED_ENTER": {
      const mode = (envelope.payload as { mode?: DegradedMode } | undefined)?.mode ?? "DEGRADED_REALTIME";
      return { ...state, degradedMode: mergeDegradedMode(state.degradedMode, mode) };
    }
    case "DEGRADED_EXIT": {
      return { ...state, degradedMode: "HEALTHY" };
    }
    default:
      return state;
  }
}

/** Recompute stale map from patient clocks — explicit, never hides stale (docs/safety/07) */
export function deriveStaleMap(state: ClinicalDomainState, nowIso: string): ReadonlyMap<string, "fresh" | "warn" | "block"> {
  const now = Date.parse(nowIso);
  const m = new Map<string, "fresh" | "warn" | "block">();
  for (const [id, p] of state.patients) {
    const age = now - Date.parse(p.lastConfirmedAt);
    m.set(id, staleLevelForAgeMs(age));
  }
  return m;
}
