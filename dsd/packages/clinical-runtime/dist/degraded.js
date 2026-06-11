const ORDER = [
    "HEALTHY",
    "SIMULATION_LAG",
    "DEGRADED_REALTIME",
    "RECONNECTING",
    "OFFLINE",
];
function idx(m) {
    return ORDER.indexOf(m);
}
/** Worst mode wins (higher severity index). */
export function mergeDegradedMode(current, incoming) {
    return idx(incoming) > idx(current) ? incoming : current;
}
//# sourceMappingURL=degraded.js.map