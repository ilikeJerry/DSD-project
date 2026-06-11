/**
 * Reconnect / trust UX — constants + grace (no silent recovery).
 * Binds: PHASE 5, docs/safety/06-degraded-mode-policy.md
 */
/** Minimum time reconnecting banner should be perceptible (anti-flicker). */
export declare const RECONNECT_GRACE_MIN_MS = 600;
/** Phases for copy / timeline (operator-readable). */
export declare const RECONNECT_TRUST_PHASES: readonly ["reconnecting", "syncing", "restored"];
export type ReconnectTrustPhase = (typeof RECONNECT_TRUST_PHASES)[number];
/** After HEALTHY, optional “recently reconnected” chip duration (UX only). */
export declare const TRUST_RESTORATION_NUDGE_MS = 4000;
export declare function reconnectBannerPriority(mode: string): number;
//# sourceMappingURL=reconnectTrust.d.ts.map