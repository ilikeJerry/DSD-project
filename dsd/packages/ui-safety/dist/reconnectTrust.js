/**
 * Reconnect / trust UX — constants + grace (no silent recovery).
 * Binds: PHASE 5, docs/safety/06-degraded-mode-policy.md
 */
/** Minimum time reconnecting banner should be perceptible (anti-flicker). */
export const RECONNECT_GRACE_MIN_MS = 600;
/** Phases for copy / timeline (operator-readable). */
export const RECONNECT_TRUST_PHASES = ["reconnecting", "syncing", "restored"];
/** After HEALTHY, optional “recently reconnected” chip duration (UX only). */
export const TRUST_RESTORATION_NUDGE_MS = 4_000;
export function reconnectBannerPriority(mode) {
    if (mode === "OFFLINE")
        return 4;
    if (mode === "RECONNECTING")
        return 3;
    if (mode === "DEGRADED_REALTIME" || mode === "SIMULATION_LAG")
        return 2;
    return 0;
}
//# sourceMappingURL=reconnectTrust.js.map