/**
 * @dsd/runtime-sync
 *
 * Binds: docs/safety/03-event-envelope-standard.md §3 correlationId rules
 * Single responsibility: correlation + deterministic ids (no extra governance layers)
 */
export type CorrelationId = string;
export declare function tickCorrelationId(tickId: string): CorrelationId;
export declare function userActionCorrelation(prefix: string): CorrelationId;
/** Deterministic for replay — use in simulation/scenario only */
export declare function createDeterministicIdFactory(seed: string): () => string;
//# sourceMappingURL=index.d.ts.map