import { formatProfileDisplayLine } from "./mockPatientProfiles.js";
import { tickRng } from "./seededRandom.js";
import { tickCorrelationId } from "@dsd/runtime-sync";
function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}
function round1(n) {
    return Math.round(n * 10) / 10;
}
export function initCohortDynamics(profiles, nowIso) {
    const m = new Map();
    for (const p of profiles) {
        m.set(p.patientId, {
            currentVitals: { ...p.baselineVitals },
            activeConcerns: ["stable_monitoring"],
            severity: "normal",
            dataFreshness: "fresh",
            trendDirection: "stable",
            riskScore: 0,
            recommendedAction: "경과 관찰",
            lastUpdatedAt: nowIso,
        });
    }
    return m;
}
function scenarioWeights(department, risk) {
    const base = [
        { concern: "stable_monitoring", weight: 3 },
        { concern: "recovery_observation", weight: 2 },
        { concern: "acute_change", weight: 2 },
        { concern: "data_delay", weight: 1 },
    ];
    if (department === "ICU") {
        base.push({ concern: "respiratory_deterioration", weight: risk === "high" ? 5 : 3 }, { concern: "hypotension_risk", weight: risk === "high" ? 4 : 2 }, { concern: "tachycardia", weight: 3 });
    }
    else if (department === "ER") {
        base.push({ concern: "acute_change", weight: 5 }, { concern: "respiratory_deterioration", weight: 3 }, { concern: "data_delay", weight: risk === "low" ? 1 : 3 });
    }
    else {
        base.push({ concern: "fever_persistence", weight: 4 }, { concern: "stable_monitoring", weight: 5 }, { concern: "recovery_observation", weight: 4 }, { concern: "respiratory_deterioration", weight: 1 });
    }
    return base;
}
function pickConcern(rng, weights) {
    const total = weights.reduce((s, w) => s + w.weight, 0);
    let r = rng.next() * total;
    for (const w of weights) {
        r -= w.weight;
        if (r <= 0)
            return w.concern;
    }
    return weights[weights.length - 1].concern;
}
function applyConcernDelta(concern, vitals, rng, profile) {
    const v = { ...vitals };
    let trend = "stable";
    let freshness = "fresh";
    switch (concern) {
        case "respiratory_deterioration":
            v.spo2 = clamp(v.spo2 - rng.int(1, 4), 82, 100);
            v.rr = clamp(v.rr + rng.int(1, 5), 10, 36);
            v.hr = clamp(v.hr + rng.int(3, 12), 50, 160);
            trend = "worsening";
            break;
        case "hypotension_risk":
            v.sbp = clamp(v.sbp - rng.int(5, 15), 70, 180);
            v.hr = clamp(v.hr + rng.int(3, 8), 50, 160);
            trend = "worsening";
            break;
        case "tachycardia":
            v.hr = clamp(v.hr + rng.int(8, 12), 50, 160);
            trend = "worsening";
            break;
        case "fever_persistence":
            v.temp = round1(clamp(v.temp + rng.int(1, 4) / 10, 36, 40));
            v.hr = clamp(v.hr + rng.int(3, 6), 50, 160);
            trend = "worsening";
            break;
        case "acute_change":
            v.spo2 = clamp(v.spo2 + rng.int(-3, 3), 82, 100);
            v.hr = clamp(v.hr + rng.int(-8, 8), 50, 160);
            v.sbp = clamp(v.sbp + rng.int(-10, 10), 70, 180);
            trend = rng.chance(0.5) ? "worsening" : "improving";
            break;
        case "recovery_observation":
            v.spo2 = clamp(v.spo2 + rng.int(2, 4), 82, 100);
            v.hr = clamp(v.hr - rng.int(3, 8), 50, 160);
            v.sbp = clamp(v.sbp + rng.int(3, 10), 70, 180);
            trend = "improving";
            break;
        case "data_delay":
            freshness = rng.chance(0.6) ? "block" : "warn";
            trend = "stable";
            break;
        case "stable_monitoring":
        default:
            v.spo2 = clamp(v.spo2 + rng.int(-1, 1), 82, 100);
            v.hr = clamp(v.hr + rng.int(-3, 3), 50, 160);
            v.sbp = clamp(v.sbp + rng.int(-5, 5), 70, 180);
            v.temp = round1(clamp(v.temp + rng.int(-2, 2) / 10, 36, 40));
            v.rr = clamp(v.rr + rng.int(-2, 2), 10, 36);
            trend = "stable";
            break;
    }
    // Soft pull toward baseline — prevents runaway values
    const b = profile.baselineVitals;
    v.spo2 = Math.round(v.spo2 * 0.85 + b.spo2 * 0.15);
    v.hr = Math.round(v.hr * 0.9 + b.hr * 0.1);
    return { vitals: v, trend, freshness };
}
export function computeRiskAssessment(vitals, freshness) {
    let warnings = 0;
    let critical = false;
    let ruleId = null;
    let alertSeverity = null;
    if (vitals.spo2 < 90) {
        critical = true;
        ruleId = "SPO2_LT_90";
        alertSeverity = "critical";
    }
    else if (vitals.spo2 < 92)
        warnings++;
    if (vitals.sbp < 85) {
        critical = true;
        ruleId = ruleId ?? "SBP_LT_85";
        alertSeverity = "critical";
    }
    else if (vitals.sbp < 95)
        warnings++;
    if (vitals.hr > 130) {
        critical = true;
        ruleId = ruleId ?? "HR_GT_130";
        alertSeverity = "critical";
    }
    else if (vitals.hr > 110)
        warnings++;
    if (vitals.temp > 38.5)
        warnings++;
    if (freshness === "block")
        warnings += 2;
    else if (freshness === "warn")
        warnings++;
    if (!critical && warnings >= 2) {
        critical = true;
        ruleId = ruleId ?? "MULTI_WARNING";
        alertSeverity = "critical";
    }
    else if (!critical && warnings === 1) {
        alertSeverity = "warning";
        ruleId = ruleId ?? "VITAL_TREND_WARN";
    }
    const severity = critical ? "critical" : warnings > 0 ? "warning" : "normal";
    const riskScore = (vitals.spo2 < 90 ? 100 : vitals.spo2 < 94 ? 40 : 0) +
        (vitals.sbp < 85 ? 90 : vitals.sbp < 95 ? 30 : 0) +
        (vitals.hr > 130 ? 80 : vitals.hr > 110 ? 25 : 0) +
        (vitals.temp > 38.5 ? 20 : 0) +
        (freshness === "block" ? 35 : freshness === "warn" ? 12 : 0) +
        warnings * 8;
    return { severity, riskScore, ruleId, alertSeverity };
}
function concernLabel(concern) {
    const map = {
        respiratory_deterioration: "산소포화도 하락",
        hypotension_risk: "저혈압 위험",
        tachycardia: "빈맥",
        fever_persistence: "발열 지속",
        acute_change: "급격한 변화",
        stable_monitoring: "안정 감시",
        recovery_observation: "회복 관찰",
        data_delay: "데이터 지연",
    };
    return map[concern];
}
function recommendedActionFor(input) {
    if (input.freshness === "block")
        return "데이터 확인 후 인지";
    if (input.severity === "critical")
        return "즉시 확인 필요";
    if (input.severity === "warning")
        return "인지 검토";
    if (input.concern === "recovery_observation" || input.trend === "improving")
        return "경과 관찰";
    if (input.concern === "stable_monitoring")
        return "루틴 감시 유지";
    return "상세 확인";
}
export function primaryConcernLabel(state) {
    const c = state.activeConcerns[0] ?? "stable_monitoring";
    return concernLabel(c);
}
export function vitalTrendGlyph(trend) {
    if (trend === "improving")
        return "↑";
    if (trend === "worsening")
        return "↓";
    return "→";
}
export function formatDynamicVitalSummary(state) {
    const v = state.currentVitals;
    const arrow = vitalTrendGlyph(state.trendDirection);
    return `SpO₂ ${v.spo2}% ${arrow} · HR ${v.hr}`;
}
function hasOpenAlertForRule(state, patientId, ruleId) {
    for (const a of state.alerts.values()) {
        if (a.patientId === patientId &&
            a.ruleId === ruleId &&
            (a.lifecycle === "CREATED" || a.lifecycle === "ACKNOWLEDGED")) {
            return true;
        }
    }
    return false;
}
export function planCohortControlledTick(input) {
    const rng = tickRng(input.seed, input.tickIndex);
    const correlationId = tickCorrelationId(input.tickId);
    const envelopes = [];
    const next = new Map(input.prior);
    const profileIds = input.profiles.map((p) => p.patientId);
    const changeCount = rng.int(2, 5);
    const selected = new Set();
    while (selected.size < changeCount && selected.size < profileIds.length) {
        selected.add(rng.pick(profileIds));
    }
    for (const patientId of selected) {
        const profile = input.profiles.find((p) => p.patientId === patientId);
        if (!profile)
            continue;
        const prev = next.get(patientId) ?? initCohortDynamics([profile], input.nowIso).get(patientId);
        const concern = pickConcern(rng, scenarioWeights(profile.department, profile.baselineRisk));
        const { vitals, trend, freshness } = applyConcernDelta(concern, prev.currentVitals, rng, profile);
        const assessment = computeRiskAssessment(vitals, freshness);
        const dynamic = {
            currentVitals: vitals,
            activeConcerns: [concern],
            severity: assessment.severity,
            dataFreshness: freshness,
            trendDirection: trend,
            riskScore: assessment.riskScore,
            recommendedAction: recommendedActionFor({
                severity: assessment.severity,
                concern,
                trend,
                freshness,
            }),
            lastUpdatedAt: input.nowIso,
        };
        next.set(patientId, dynamic);
        const staleLag = freshness !== "fresh";
        const vitalEventId = input.ctx.nextId();
        envelopes.push({
            eventId: vitalEventId,
            ts: input.nowIso,
            schemaVersion: "1.0.0",
            type: "VITAL_UPDATED",
            source: "simulation",
            correlationId,
            build: input.ctx.build,
            patientId,
            tickId: input.tickId,
            scenarioId: input.ctx.scenarioId,
            payload: {
                hr: vitals.hr,
                spo2: vitals.spo2,
                sbp: vitals.sbp,
                lastConfirmedAt: staleLag ? "2020-01-01T00:00:00.000Z" : input.nowIso,
            },
        });
        if (freshness === "warn" || freshness === "block") {
            envelopes.push({
                eventId: input.ctx.nextId(),
                ts: input.nowIso,
                schemaVersion: "1.0.0",
                type: "STALE_DETECTED",
                source: "simulation",
                correlationId,
                build: input.ctx.build,
                patientId,
                tickId: input.tickId,
                scenarioId: input.ctx.scenarioId,
                payload: { level: freshness },
            });
        }
        else if (input.domain.staleByPatientId.get(patientId)) {
            envelopes.push({
                eventId: input.ctx.nextId(),
                ts: input.nowIso,
                schemaVersion: "1.0.0",
                type: "STALE_CLEARED",
                source: "simulation",
                correlationId,
                build: input.ctx.build,
                patientId,
                tickId: input.tickId,
                scenarioId: input.ctx.scenarioId,
                payload: {},
            });
        }
        if (assessment.ruleId && assessment.alertSeverity && !hasOpenAlertForRule(input.domain, patientId, assessment.ruleId)) {
            const ruleEv = {
                eventId: input.ctx.nextId(),
                ts: input.nowIso,
                schemaVersion: "1.0.0",
                type: "RULE_FIRED",
                source: "simulation",
                correlationId,
                build: input.ctx.build,
                patientId,
                tickId: input.tickId,
                scenarioId: input.ctx.scenarioId,
                causalParentId: vitalEventId,
                payload: { ruleId: assessment.ruleId, result: assessment.alertSeverity },
            };
            const alertId = input.ctx.nextId();
            const alertEv = {
                eventId: input.ctx.nextId(),
                ts: input.nowIso,
                schemaVersion: "1.0.0",
                type: "ALERT_CREATED",
                source: "simulation",
                correlationId,
                build: input.ctx.build,
                patientId,
                alertId,
                tickId: input.tickId,
                scenarioId: input.ctx.scenarioId,
                causalParentId: ruleEv.eventId,
                dedupeKey: `${patientId}:${assessment.ruleId}`,
                payload: {
                    ruleId: assessment.ruleId,
                    severity: assessment.alertSeverity,
                    dedupeKey: `${patientId}:${assessment.ruleId}`,
                },
            };
            envelopes.push(ruleEv, alertEv);
        }
    }
    // Occasional global reconnect beat (deterministic)
    const phase = input.globalPhase ?? input.tickIndex % 8;
    if (phase === 4 && rng.chance(0.35)) {
        envelopes.push({
            eventId: input.ctx.nextId(),
            ts: input.nowIso,
            schemaVersion: "1.0.0",
            type: "DEGRADED_ENTER",
            source: "system",
            correlationId,
            build: input.ctx.build,
            payload: { mode: "RECONNECTING" },
        });
    }
    if (phase === 7 && rng.chance(0.5)) {
        envelopes.push({
            eventId: input.ctx.nextId(),
            ts: input.nowIso,
            schemaVersion: "1.0.0",
            type: "DEGRADED_EXIT",
            source: "system",
            correlationId,
            build: input.ctx.build,
            payload: {},
        });
    }
    return {
        dynamics: next,
        envelopes,
        selectedPatientIds: [...selected],
    };
}
export function bootstrapProfilesDisplayNames(profiles) {
    const m = new Map();
    for (const p of profiles)
        m.set(p.patientId, formatProfileDisplayLine(p));
    return m;
}
//# sourceMappingURL=patientDynamicState.js.map