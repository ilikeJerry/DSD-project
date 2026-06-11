/**
 * Long-session regression gate — bounded loops over deterministic replay (P1).
 */
import { describe, expect, it } from "vitest";
import { ClinicalRuntimeKernel } from "../../src/kernel.js";
import { bootstrapDemoPatient, createRespiratoryScenarioContext } from "../../src/scenarios/respiratoryDeterioration.js";
import { verifyDeterministicDoubleReplay } from "@dsd/replay-runtime";

const NOW = "2026-05-14T12:00:00.000Z";
const ITERATIONS = 40;

describe("gate: long-session-regression", () => {
  it(`deterministic double replay remains stable over ${ITERATIONS} scenario iterations`, () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const seed = `long-session-${i}`;
      const ctx = createRespiratoryScenarioContext(seed);
      const initial = bootstrapDemoPatient(ctx, NOW);
      const k = new ClinicalRuntimeKernel(seed, NOW);
      k.runRespiratoryCriticalTick({ nowIso: NOW, tickId: `t-${i}`, forceStale: true });
      const v = verifyDeterministicDoubleReplay(initial, k.audit.entries);
      expect(v.ok, `${seed}: ${v.detail}`).toBe(true);
    }
  });
});
