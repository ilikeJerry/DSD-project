/**
 * Emits immutable release evidence bundle (JSON) for CI artifact upload.
 * Canonical: top-level keys sorted; nested objects sorted recursively.
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  ClinicalRuntimeKernel,
  bootstrapDemoPatient,
  createRespiratoryScenarioContext,
  queueOrderKey,
} from "../packages/clinical-runtime/dist/index.js";
import {
  assertReplaySameQueueHashes,
  extractQueueHashesFromTimeline,
  replayFromInitialState,
  verifyDeterministicDoubleReplay,
} from "../packages/replay-runtime/dist/index.js";
import {
  degradedBannerRequired,
  projectOperationalTrustSurface,
  staleBannerRequired,
  verifyCriticalVisibilityInvariant,
} from "../packages/ui-safety/dist/index.js";
const NOW = "2026-05-14T12:00:00.000Z";

function sortDeep(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sortDeep);
  const out = {};
  for (const k of Object.keys(value).sort()) {
    out[k] = sortDeep(value[k]);
  }
  return out;
}

function sha256hex(s) {
  return createHash("sha256").update(s, "utf8").digest("hex");
}

const seed = "evidence-bundle-seed";
const ctx = createRespiratoryScenarioContext(seed);
const initial = bootstrapDemoPatient(ctx, NOW);
const k = new ClinicalRuntimeKernel(seed, NOW);
k.runRespiratoryCriticalTick({ nowIso: NOW, tickId: "t1", forceStale: true });
k.enterDegraded("RECONNECTING", NOW, "evidence-reconnect");
const replay = replayFromInitialState(initial, k.audit.entries);
const liveHashes = extractQueueHashesFromTimeline(k.audit.entries);
const replayHashes = extractQueueHashesFromTimeline(replay.parsed);
const replayHash = sha256hex(JSON.stringify(replayHashes));
const queueFingerprint = sha256hex(queueOrderKey(k.state.queueOrderIds));
const surface = projectOperationalTrustSurface(k.state);
const vis = verifyCriticalVisibilityInvariant(k.state);

const double = verifyDeterministicDoubleReplay(initial, k.audit.entries);
const hashesOk = assertReplaySameQueueHashes(liveHashes, replayHashes);
if (!vis.ok || !double.ok || !hashesOk || replay.mismatches.length > 0) {
  console.error("evidence bundle blocked: invariant failed", {
    vis,
    double,
    hashesOk,
    mismatches: replay.mismatches,
  });
  process.exit(1);
}

const bundle = {
  schemaId: "dsd.evidence-bundle",
  schemaVersion: 1,
  buildSha: process.env.GITHUB_SHA ?? process.env.COMMIT_SHA ?? "local",
  ciRunId: process.env.GITHUB_RUN_ID ?? process.env.CI_RUN_ID ?? "local",
  generatedAt: new Date().toISOString(),
  replayHash,
  queueFingerprint,
  syncVersionKeySamples: [surface.syncVersionKey],
  invariantVerificationSummary: {
    verifyCriticalVisibilityInvariantOk: vis.ok,
    verifyCriticalVisibilityViolations: [...vis.violations],
    verifyDeterministicDoubleReplayOk: double.ok,
    assertReplaySameQueueHashesOk: hashesOk,
    replayMismatchCount: replay.mismatches.length,
  },
  staleDegradedEvidence: {
    staleBannerRequired: staleBannerRequired(k.state),
    degradedBannerRequired: degradedBannerRequired(k.state),
    degradedMode: k.state.degradedMode,
  },
  hydrationParityEvidence: {
    note: "Node double-projection; browser hydration covered by assert-projection-determinism + next build",
    replayQueueEqualsLive: JSON.stringify(k.state.queueOrderIds) === JSON.stringify(replay.state.queueOrderIds),
  },
  failureModeReplayEvidence: {
    degradedDuringReplay: replay.state.degradedMode,
    reconnecting: k.state.degradedMode === "RECONNECTING",
  },
  releaseSurvivabilitySummary: {
    auditEntryCount: k.audit.entries.length,
    queueRecomputeEmitted: k.telemetry.queueRecomputeEmitted,
  },
};

const canonical = sortDeep(bundle);
const outPath = process.argv[2] ?? "artifacts/release/evidence-bundle.json";
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(canonical)}\n`, "utf8");
const integrity = sha256hex(JSON.stringify(canonical));
writeFileSync(
  `${outPath}.integrity.txt`,
  `${integrity}  ${outPath.split("/").pop()}\n`,
  "utf8",
);
console.log(outPath);
console.log(`integrity_sha256=${integrity}`);
