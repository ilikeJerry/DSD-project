/**
 * P0 gate — stale visibility, degraded banners, critical visibility invariant.
 */
import { describe, expect, it } from "vitest";
import {
  emptyClinicalState,
  type AlertEntity,
  type ClinicalDomainState,
  type PatientEntity,
} from "@dsd/clinical-runtime";
import {
  degradedBannerRequired,
  staleBannerRequired,
  verifyCriticalVisibilityInvariant,
} from "../../src/index.js";

describe("gate: stale-degraded", () => {
  it("staleBannerRequired when any patient not fresh", () => {
    const p1: PatientEntity = {
      id: "p1",
      displayName: "One",
      vitals: { hr: 80, spo2: 96, sbp: 120 },
      lastConfirmedAt: "2020-01-01T00:00:00Z",
    };
    const s = emptyClinicalState("HEALTHY");
    const state: ClinicalDomainState = {
      ...s,
      patients: new Map([["p1", p1]]),
      staleByPatientId: new Map([["p1", "warn"]]),
    };
    expect(staleBannerRequired(state)).toBe(true);
  });

  it("degradedBannerRequired when not HEALTHY", () => {
    const s = emptyClinicalState("RECONNECTING");
    expect(degradedBannerRequired(s)).toBe(true);
  });

  it("P0 visibility: open critical forces queue top critical", () => {
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
    const good: ClinicalDomainState = {
      degradedMode: "HEALTHY",
      patients: new Map([["p1", p1]]),
      staleByPatientId: new Map([["p1", "fresh"]]),
      alerts: new Map([["a1", a1]]),
      queueOrderIds: ["a1"],
    };
    expect(verifyCriticalVisibilityInvariant(good).ok).toBe(true);

    const badOrder: ClinicalDomainState = { ...good, queueOrderIds: [] };
    expect(verifyCriticalVisibilityInvariant(badOrder).ok).toBe(false);
  });
});
