/**
 * Hydration-runtime gate (CI): same seed + same transitions → identical trust projection inputs.
 * No browser; enforces deterministic server-side projection used by RSC shells.
 */
import { ClinicalRuntimeKernel, bootstrapDemoPatient, createRespiratoryScenarioContext } from "../packages/clinical-runtime/dist/index.js";
import { projectOperationalTrustSurface, verifyCriticalVisibilityInvariant } from "../packages/ui-safety/dist/index.js";

const NOW = "2026-05-14T12:00:00.000Z";

function runScenario(seed) {
  const ctx = createRespiratoryScenarioContext(seed);
  const initial = bootstrapDemoPatient(ctx, NOW);
  const k = new ClinicalRuntimeKernel(seed, NOW);
  k.runRespiratoryCriticalTick({ nowIso: NOW, tickId: "t1", forceStale: true });
  k.simulateReconnect(NOW, "reconnect-1");
  const surface = projectOperationalTrustSurface(k.state);
  const vis = verifyCriticalVisibilityInvariant(k.state);
  return {
    queueOrderIds: [...k.state.queueOrderIds],
    syncVersionKey: surface.syncVersionKey,
    degradedMode: k.state.degradedMode,
    visibilityOk: vis.ok,
    initialPatients: initial.patients.size,
  };
}

const a = runScenario("hydration-determinism-a");
const b = runScenario("hydration-determinism-a");
const mismatch = JSON.stringify(a) !== JSON.stringify(b);
if (mismatch) {
  console.error("projection determinism failed", { a, b });
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, projection: a }, null, 0));
