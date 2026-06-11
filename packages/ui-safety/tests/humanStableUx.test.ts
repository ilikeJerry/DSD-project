import { describe, expect, it } from "vitest";
import { dampenQueueOrderDisplay, resolveDisplayQueueForOperator, shouldDelaySeverityDemotion } from "../src/temporalStability.js";
import { computeAlertCalmnessScore } from "../src/alertCalmness.js";

describe("temporal stability (display dampening)", () => {
  it("suppresses micro-reorder within hold window", () => {
    const truth = ["a", "b", "c"];
    const shown = ["a", "c", "b"];
    const crit = [false, false, false];
    const r = dampenQueueOrderDisplay({
      truthIds: truth,
      displayedIds: shown,
      truthIsCritical: crit,
      nowMs: 1000,
      lastDisplayCommitMs: 900,
      minHoldMs: 450,
      minIndexMove: 2,
    });
    expect(r.reason).toBe("dampen_hold");
    expect(r.displayIds).toEqual(shown);
    expect(r.committedToTruth).toBe(false);
  });

  it("commits immediately when critical occupies top of truth order", () => {
    const truth = ["x", "a", "b"];
    const shown = ["a", "b", "x"];
    const crit = [true, false, false];
    const r = dampenQueueOrderDisplay({
      truthIds: truth,
      displayedIds: shown,
      truthIsCritical: crit,
      nowMs: 1000,
      lastDisplayCommitMs: 900,
    });
    expect(r.reason).toBe("critical_top");
    expect(r.displayIds).toEqual(truth);
    expect(r.committedToTruth).toBe(true);
  });
});

describe("resolveDisplayQueueForOperator (P0 + dampen)", () => {
  it("forces truth immediately when any open critical exists (overrides dampen hold)", () => {
    const truth = ["a", "b", "c"];
    const shown = ["a", "c", "b"];
    const crit = [false, false, false];
    const r = resolveDisplayQueueForOperator({
      truthIds: truth,
      displayedIds: shown,
      truthIsCritical: crit,
      openCriticalCount: 1,
      nowMs: 1000,
      lastDisplayCommitMs: 999,
      minHoldMs: 900,
      minIndexMove: 99,
    });
    expect(r.reason).toBe("p0_open_critical");
    expect(r.displayIds).toEqual(truth);
    expect(r.committedToTruth).toBe(true);
  });

  it("delegates to dampen when open critical count is zero", () => {
    const truth = ["a", "b", "c"];
    const shown = ["a", "c", "b"];
    const crit = [false, false, false];
    const r = resolveDisplayQueueForOperator({
      truthIds: truth,
      displayedIds: shown,
      truthIsCritical: crit,
      openCriticalCount: 0,
      nowMs: 1000,
      lastDisplayCommitMs: 900,
      minHoldMs: 450,
      minIndexMove: 2,
    });
    expect(r.reason).toBe("dampen_hold");
    expect(r.displayIds).toEqual(shown);
  });
});

describe("severity demotion hysteresis", () => {
  it("delays visual demotion from critical", () => {
    expect(
      shouldDelaySeverityDemotion({
        wasCriticalVisual: true,
        truthIsCritical: false,
        nowMs: 1000,
        lastCriticalVisualTrueMs: 0,
        minDemoteVisualMs: 2000,
      }),
    ).toBe(true);
  });
});

describe("alert calmness", () => {
  it("increases calmness when repeatCount rises (fatigue-aware)", () => {
    const low = computeAlertCalmnessScore({ repeatCount: 0, severity: "critical", lifecycle: "CREATED" });
    const high = computeAlertCalmnessScore({ repeatCount: 5, severity: "critical", lifecycle: "CREATED" });
    expect(high).toBeGreaterThan(low);
  });
});
