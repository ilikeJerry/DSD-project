/**
 * P1 gate — queue stabilization / amplification caps (merge-blocking per policy).
 */
import { describe, expect, it } from "vitest";
import { ClinicalRuntimeKernel } from "../../src/kernel.js";

const NOW = "2026-05-14T12:00:00.000Z";

describe("gate: queue-stabilization", () => {
  it("ingestVitalBatch: 100 VITAL_UPDATED must not cause 100 QUEUE_RECOMPUTED (amplification cap)", () => {
    const k = new ClinicalRuntimeKernel("pressure-1", NOW);
    const pid = k.state.patients.keys().next().value!;
    const patches = Array.from({ length: 100 }, () => ({ spo2: 88 }));
    k.ingestVitalBatch({
      correlationId: "tick-pressure-1",
      tickId: "pressure-1",
      nowIso: NOW,
      patientId: pid,
      patches,
    });
    const queueEvents = k.audit.entries.filter((e) => e.type === "QUEUE_RECOMPUTED");
    expect(queueEvents.length).toBe(1);
    expect(k.telemetry.vitalUpdatedIngested).toBe(100);
    expect(k.telemetry.queueRecomputeEmitted).toBe(1);
  });

  it("queue stabilization: identical queue fingerprint skips duplicate QUEUE emit", () => {
    const k = new ClinicalRuntimeKernel("pressure-2", NOW);
    const pid = k.state.patients.keys().next().value!;
    const patch = { spo2: 88 };
    k.ingestVitalBatch({
      correlationId: "c1",
      tickId: "t1",
      nowIso: NOW,
      patientId: pid,
      patches: [patch],
    });
    k.ingestVitalBatch({
      correlationId: "c2",
      tickId: "t2",
      nowIso: NOW,
      patientId: pid,
      patches: [patch],
    });
    const queues = k.audit.entries.filter((e) => e.type === "QUEUE_RECOMPUTED");
    expect(queues.length).toBe(1);
    expect(k.telemetry.queueRecomputeSkippedUnchanged).toBeGreaterThanOrEqual(1);
  });
});
