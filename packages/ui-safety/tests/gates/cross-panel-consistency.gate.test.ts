/**
 * P0/P1 gate — cross-panel truth anchoring via syncVersionKey + observability coherence.
 */
import { describe, expect, it } from "vitest";
import {
  emptyClinicalState,
  type AlertEntity,
  type ClinicalDomainState,
  type PatientEntity,
} from "@dsd/clinical-runtime";
import { projectOperationalTrustSurface, projectTrustObservability } from "../../src/operationalTrustSurface.js";

describe("gate: cross-panel-consistency", () => {
  it("syncVersionKey is stable for identical state (idempotent projection)", () => {
    const a = emptyClinicalState("HEALTHY");
    const s1 = projectOperationalTrustSurface(a);
    const s2 = projectOperationalTrustSurface(a);
    expect(s1.syncVersionKey).toBe(s2.syncVersionKey);
  });

  it("syncVersionKey changes when queue order changes (panels must invalidate together)", () => {
    const a = emptyClinicalState("HEALTHY");
    const b: ClinicalDomainState = { ...a, queueOrderIds: ["x"] };
    expect(projectOperationalTrustSurface(a).syncVersionKey).not.toBe(projectOperationalTrustSurface(b).syncVersionKey);
  });

  it("trust observability references same surface confidence as cross-panel strip", () => {
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
    const state: ClinicalDomainState = {
      degradedMode: "RECONNECTING",
      patients: new Map([["p1", p1]]),
      staleByPatientId: new Map([["p1", "warn"]]),
      alerts: new Map([["a1", a1]]),
      queueOrderIds: ["a1"],
    };
    const surface = projectOperationalTrustSurface(state);
    const o = projectTrustObservability({
      telemetry: {
        queueRecomputeEmitted: 1,
        queueRecomputeSkippedUnchanged: 0,
        degradedEnterCount: 1,
        degradedExitCount: 0,
        staleDetectedCount: 1,
        staleClearedCount: 0,
      },
      surface,
    });
    expect(o.operatorFacingSummary).toContain("Trust:");
    expect(surface.panelConfidence).toBe("RECONNECTING");
  });
});
