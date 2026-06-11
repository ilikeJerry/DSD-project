/**
 * @dsd/runtime-sync
 *
 * Binds: docs/safety/03-event-envelope-standard.md §3 correlationId rules
 * Single responsibility: correlation + deterministic ids (no extra governance layers)
 */
export type CorrelationId = string;

export function tickCorrelationId(tickId: string): CorrelationId {
  return `tick-${tickId}`;
}

export function userActionCorrelation(prefix: string): CorrelationId {
  return `user-${prefix}-${Date.now()}`;
}

/** Deterministic for replay — use in simulation/scenario only */
export function createDeterministicIdFactory(seed: string): () => string {
  let n = 0;
  return () => `${seed}_${++n}`;
}
