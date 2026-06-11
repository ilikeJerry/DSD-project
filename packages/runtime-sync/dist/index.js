export function tickCorrelationId(tickId) {
    return `tick-${tickId}`;
}
export function userActionCorrelation(prefix) {
    return `user-${prefix}-${Date.now()}`;
}
/** Deterministic for replay — use in simulation/scenario only */
export function createDeterministicIdFactory(seed) {
    let n = 0;
    return () => `${seed}_${++n}`;
}
//# sourceMappingURL=index.js.map