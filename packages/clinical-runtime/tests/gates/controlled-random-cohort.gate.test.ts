import { describe, expect, it } from "vitest";
import { ClinicalRuntimeKernel } from "../../src/kernel.js";
import { MOCK_COHORT_SIZE } from "../../src/scenarios/mockPatientProfiles.js";
import { bootstrapDemoPatient, createRespiratoryScenarioContext } from "../../src/scenarios/respiratoryDeterioration.js";

const NOW = "2026-05-14T12:00:00.000Z";

describe("gate: controlled-random cohort", () => {
  it("bootstraps 30 patient profiles", () => {
    const ctx = createRespiratoryScenarioContext("cohort-size");
    const initial = bootstrapDemoPatient(ctx, NOW);
    expect(initial.patients.size).toBe(MOCK_COHORT_SIZE);
  });

  it("same seed reproduces identical dynamics after 5 ticks", () => {
    const run = (seed: string) => {
      const k = new ClinicalRuntimeKernel(seed, NOW);
      let dynamics = k.createInitialCohortDynamics(NOW);
      for (let i = 0; i < 5; i++) {
        dynamics = k.runControlledRandomTick({
          seed,
          tickIndex: i,
          tickId: `t-${i}`,
          nowIso: NOW,
          priorDynamics: dynamics,
        });
      }
      return [...dynamics.entries()].map(([id, d]) => ({
        id,
        spo2: d.currentVitals.spo2,
        concern: d.activeConcerns[0],
        risk: d.riskScore,
      }));
    };
    expect(run("alpha-seed")).toEqual(run("alpha-seed"));
  });

  it("different seeds produce different dynamics", () => {
    const run = (seed: string) => {
      const k = new ClinicalRuntimeKernel(seed, NOW);
      const dynamics = k.runControlledRandomTick({
        seed,
        tickIndex: 0,
        tickId: "t-0",
        nowIso: NOW,
        priorDynamics: k.createInitialCohortDynamics(NOW),
      });
      return [...dynamics.values()].map((d) => d.currentVitals.spo2).join(",");
    };
    expect(run("seed-a")).not.toBe(run("seed-b"));
  });
});
