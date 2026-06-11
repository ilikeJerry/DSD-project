import {
  ClinicalRuntimeKernel,
  MOCK_COHORT_SIZE,
  type CohortDynamicsMap,
  type PatientDynamicState,
} from "@dsd/clinical-runtime";
import { demoScenarioPhase, type DemoScenarioPhase } from "./operatorMicrocopy";
import { operationalShellSnapshotFromState, type OperationalShellSnapshot } from "./operationalShellSnapshot";

export const DEFAULT_DEMO_SEED = "demo-seed";
export const DEFAULT_DEMO_INTERVAL_MS = 4000;

export type DemoDisplayMode = "HEALTHY" | "RECONNECTING" | "STALE" | "DEGRADED";

export type DemoSimContext = {
  readonly tickIndex: number;
  readonly seed: string;
  readonly scenarioPhase: DemoScenarioPhase;
  readonly patientDynamics: Readonly<Record<string, PatientDynamicState>>;
};

export function newDemoSeed(): string {
  return `demo-${Date.now().toString(36)}`;
}

export function demoDisplayMode(state: ClinicalRuntimeKernel["state"]): DemoDisplayMode {
  if (state.degradedMode === "RECONNECTING") return "RECONNECTING";
  if (state.degradedMode !== "HEALTHY") return "DEGRADED";
  for (const level of state.staleByPatientId.values()) {
    if (level === "warn" || level === "block") return "STALE";
  }
  return "HEALTHY";
}

export function createDemoKernel(seed: string, nowIso: string): ClinicalRuntimeKernel {
  return new ClinicalRuntimeKernel(seed, nowIso);
}

function dynamicsToRecord(map: CohortDynamicsMap): Record<string, PatientDynamicState> {
  return Object.fromEntries(map.entries());
}

export function shellFromKernel(
  kernel: ClinicalRuntimeKernel,
  dynamics: Readonly<Record<string, PatientDynamicState>>,
): OperationalShellSnapshot {
  return operationalShellSnapshotFromState(
    kernel.state,
    kernel.telemetry.snapshot(),
    kernel.audit.entries,
    12,
    dynamics,
  );
}

export function initialDemoContext(seed: string, kernel: ClinicalRuntimeKernel, nowIso: string): DemoSimContext {
  return {
    tickIndex: 0,
    seed,
    scenarioPhase: demoScenarioPhase(0),
    patientDynamics: dynamicsToRecord(kernel.createInitialCohortDynamics(nowIso)),
  };
}

function tickId(index: number): string {
  return `demo-t-${index}`;
}

function mapToCohort(dynamics: Readonly<Record<string, PatientDynamicState>>): CohortDynamicsMap {
  return new Map(Object.entries(dynamics));
}

/**
 * Controlled-random cohort tick — 2–5 patients update per tick (deterministic from seed).
 */
export function runDemoSimulationTick(
  kernel: ClinicalRuntimeKernel,
  ctx: DemoSimContext,
  nowIso: string,
): DemoSimContext {
  const n = ctx.tickIndex;
  const nextDynamics = kernel.runControlledRandomTick({
    seed: ctx.seed,
    tickIndex: n,
    tickId: tickId(n),
    nowIso,
    priorDynamics: mapToCohort(ctx.patientDynamics),
  });
  const nextIndex = n + 1;
  return {
    tickIndex: nextIndex,
    seed: ctx.seed,
    scenarioPhase: demoScenarioPhase(nextIndex),
    patientDynamics: dynamicsToRecord(nextDynamics),
  };
}

export { MOCK_COHORT_SIZE };
