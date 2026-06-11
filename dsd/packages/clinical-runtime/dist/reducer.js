import { mergeDegradedMode } from "./degraded.js";
import { staleLevelForAgeMs } from "./stale.js";
function mapSet(m, key, val) {
    const n = new Map(m);
    n.set(key, val);
    return n;
}
function mapUpdatePatient(state, patientId, fn) {
    const p = state.patients.get(patientId);
    if (!p)
        return state;
    return { ...state, patients: mapSet(state.patients, patientId, fn(p)) };
}
export function reduceClinical(state, envelope) {
    switch (envelope.type) {
        case "VITAL_UPDATED": {
            const pid = envelope.patientId;
            if (!pid)
                return state;
            const p = state.patients.get(pid);
            if (!p)
                return state;
            const patch = (envelope.payload ?? {});
            const nextVitals = {
                hr: patch.hr ?? p.vitals.hr,
                spo2: patch.spo2 ?? p.vitals.spo2,
                sbp: patch.sbp ?? p.vitals.sbp,
            };
            const next = {
                ...p,
                vitals: nextVitals,
                lastConfirmedAt: patch.lastConfirmedAt ?? envelope.ts,
            };
            return { ...state, patients: mapSet(state.patients, pid, next) };
        }
        case "RULE_FIRED":
            return state;
        case "ALERT_CREATED": {
            const payload = (envelope.payload ?? {});
            const alert = {
                id: envelope.alertId,
                patientId: envelope.patientId,
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
            const id = envelope.alertId;
            const a = state.alerts.get(id);
            if (!a || a.lifecycle !== "CREATED")
                return state;
            const next = { ...a, lifecycle: "ACKNOWLEDGED" };
            return { ...state, alerts: mapSet(state.alerts, id, next) };
        }
        case "ALERT_RESOLVE_REQUESTED":
            return state;
        case "ALERT_RESOLVED": {
            const id = envelope.alertId;
            const a = state.alerts.get(id);
            if (!a || a.lifecycle !== "ACKNOWLEDGED")
                return state;
            const token = envelope.payload?.confirmationToken;
            if (!token || token.length === 0)
                return state;
            const next = { ...a, lifecycle: "RESOLVED" };
            return { ...state, alerts: mapSet(state.alerts, id, next) };
        }
        case "ALERT_ACK_ROLLBACK": {
            const id = envelope.alertId;
            const a = state.alerts.get(id);
            if (!a || a.lifecycle !== "ACKNOWLEDGED")
                return state;
            const next = { ...a, lifecycle: "CREATED" };
            return { ...state, alerts: mapSet(state.alerts, id, next) };
        }
        case "ALERT_SUPPRESSED": {
            const id = envelope.alertId;
            const a = state.alerts.get(id);
            if (!a)
                return state;
            const next = { ...a, lifecycle: "SUPPRESSED" };
            return { ...state, alerts: mapSet(state.alerts, id, next) };
        }
        case "QUEUE_RECOMPUTED": {
            const topK = envelope.payload?.topK;
            if (!topK)
                return state;
            return { ...state, queueOrderIds: topK };
        }
        case "STALE_DETECTED": {
            const pid = envelope.patientId;
            if (!pid)
                return state;
            const level = envelope.payload?.level ?? "warn";
            return { ...state, staleByPatientId: mapSet(state.staleByPatientId, pid, level) };
        }
        case "STALE_CLEARED": {
            const pid = envelope.patientId;
            if (!pid)
                return state;
            const next = new Map(state.staleByPatientId);
            next.delete(pid);
            return { ...state, staleByPatientId: next };
        }
        case "DEGRADED_ENTER": {
            const mode = envelope.payload?.mode ?? "DEGRADED_REALTIME";
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
export function deriveStaleMap(state, nowIso) {
    const now = Date.parse(nowIso);
    const m = new Map();
    for (const [id, p] of state.patients) {
        const age = now - Date.parse(p.lastConfirmedAt);
        m.set(id, staleLevelForAgeMs(age));
    }
    return m;
}
//# sourceMappingURL=reducer.js.map