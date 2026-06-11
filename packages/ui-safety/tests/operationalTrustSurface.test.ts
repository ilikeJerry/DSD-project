import { describe, expect, it } from "vitest";
import { emptyClinicalState, type AlertEntity, type ClinicalDomainState, type PatientEntity } from "@dsd/clinical-runtime";
import { projectOperationalTrustSurface, projectTrustObservability } from "../src/operationalTrustSurface.js";

describe("projectOperationalTrustSurface", () => {
  it("changes syncVersionKey when queue order changes", () => {
    const a = emptyClinicalState("HEALTHY");
    const b: ClinicalDomainState = { ...a, queueOrderIds: ["x"] };
    const sa = projectOperationalTrustSurface(a);
    const sb = projectOperationalTrustSurface(b);
    expect(sa.syncVersionKey).not.toBe(sb.syncVersionKey);
  });

  it("flags RECONNECTING confidence and lists partial stale patients", () => {
    const p1: PatientEntity = {
      id: "p1",
      displayName: "One",
      vitals: { hr: 80, spo2: 96, sbp: 120 },
      lastConfirmedAt: "2020-01-01T00:00:00Z",
    };
    const a1: AlertEntity = {
      id: "a1",
      patientId: "p1",
      ruleId: "r",
      severity: "critical",
      lifecycle: "CREATED",
      dedupeKey: "k",
      repeatCount: 0,
      createdAt: "2020-01-01T00:00:00Z",
    };
    const patients = new Map<string, PatientEntity>([["p1", p1]]);
    const stale = new Map<string, "fresh" | "warn" | "block">([["p1", "warn"]]);
    const alerts = new Map<string, AlertEntity>([["a1", a1]]);
    const state: ClinicalDomainState = {
      degradedMode: "RECONNECTING",
      patients,
      staleByPatientId: stale,
      alerts,
      queueOrderIds: ["a1"],
    };
    const s = projectOperationalTrustSurface(state);
    expect(s.panelConfidence).toBe("RECONNECTING");
    expect(s.partialStalePatientIds).toEqual(["p1"]);
    expect(s.hasMixedFreshness).toBe(false);
  });
});

describe("projectTrustObservability", () => {
  it("summarizes telemetry with surface confidence", () => {
    const surface = projectOperationalTrustSurface(emptyClinicalState("HEALTHY"));
    const o = projectTrustObservability({
      telemetry: {
        queueRecomputeEmitted: 3,
        queueRecomputeSkippedUnchanged: 10,
        degradedEnterCount: 1,
        degradedExitCount: 1,
        staleDetectedCount: 2,
        staleClearedCount: 1,
      },
      surface,
    });
    expect(o.completedDegradedCycles).toBe(1);
    expect(o.queueReconciliationBursts).toBe(3);
    expect(o.operatorFacingSummary).toContain("Trust:");
  });
});
