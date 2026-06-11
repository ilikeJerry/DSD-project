/**
 * P0 merge/release gate — replay consistency (no retries in CI for this job).
 */
import { describe, expect, it } from "vitest";
import { ClinicalRuntimeKernel } from "../../src/kernel.js";
import { bootstrapDemoPatient, createRespiratoryScenarioContext } from "../../src/scenarios/respiratoryDeterioration.js";
import {
  assertReplaySameQueueHashes,
  extractQueueHashesFromTimeline,
  replayFromInitialState,
  verifyDeterministicDoubleReplay,
} from "@dsd/replay-runtime";

const NOW = "2026-05-14T12:00:00.000Z";

describe("gate: replay-consistency (P0)", () => {
  it("verifyDeterministicDoubleReplay ok for respiratory critical tick audit", () => {
    const ctx = createRespiratoryScenarioContext("replay-gate-seed");
    const initial = bootstrapDemoPatient(ctx, NOW);
    const k = new ClinicalRuntimeKernel("replay-gate-seed", NOW);
    k.runRespiratoryCriticalTick({ nowIso: NOW, tickId: "t1", forceStale: true });
    const v = verifyDeterministicDoubleReplay(initial, k.audit.entries);
    expect(v.ok, v.detail).toBe(true);
  });

  it("replayFromInitialState queue hashes match live kernel timeline", () => {
    const ctx = createRespiratoryScenarioContext("replay-hash-seed");
    const initial = bootstrapDemoPatient(ctx, NOW);
    const k = new ClinicalRuntimeKernel("replay-hash-seed", NOW);
    k.runRespiratoryCriticalTick({ nowIso: NOW, tickId: "t1", forceStale: true });
    const replay = replayFromInitialState(initial, k.audit.entries);
    const liveHashes = extractQueueHashesFromTimeline(k.audit.entries);
    const replayHashes = extractQueueHashesFromTimeline(replay.parsed);
    expect(assertReplaySameQueueHashes(liveHashes, replayHashes)).toBe(true);
    expect(replay.mismatches.length).toBe(0);
    expect(JSON.stringify(k.state.queueOrderIds)).toBe(JSON.stringify(replay.state.queueOrderIds));
  });
});
