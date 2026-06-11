/**
 * Binds: docs/safety/06-degraded-mode-policy.md §2
 */
export type DegradedMode =
  | "HEALTHY"
  | "DEGRADED_REALTIME"
  | "RECONNECTING"
  | "OFFLINE"
  | "SIMULATION_LAG";

const ORDER: readonly DegradedMode[] = [
  "HEALTHY",
  "SIMULATION_LAG",
  "DEGRADED_REALTIME",
  "RECONNECTING",
  "OFFLINE",
] as const;

function idx(m: DegradedMode): number {
  return ORDER.indexOf(m);
}

/** Worst mode wins (higher severity index). */
export function mergeDegradedMode(current: DegradedMode, incoming: DegradedMode): DegradedMode {
  return idx(incoming) > idx(current) ? incoming : current;
}
