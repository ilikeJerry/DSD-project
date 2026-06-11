/**
 * Binds: docs/safety/07-stale-data-policy.md (thresholds are configuration; defaults are explicit)
 */
export const STALE_THRESHOLD_WARN_MS = 60_000;
export const STALE_THRESHOLD_BLOCK_MS = 180_000;

/** Policy version for QUEUE_RECOMPUTED trace — docs/safety/05-alert-prioritization-traceability.md */
export const QUEUE_POLICY_VERSION = "1.0.0";

export const BUILD_PLACEHOLDER = "dev-skeleton";
