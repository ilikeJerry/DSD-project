/**
 * Binds: docs/safety/06-degraded-mode-policy.md §2
 */
export type DegradedMode = "HEALTHY" | "DEGRADED_REALTIME" | "RECONNECTING" | "OFFLINE" | "SIMULATION_LAG";
/** Worst mode wins (higher severity index). */
export declare function mergeDegradedMode(current: DegradedMode, incoming: DegradedMode): DegradedMode;
//# sourceMappingURL=degraded.d.ts.map