import type { QueueRecomputeResult } from "./queueRecompute.js";
/** Stable fingerprint for duplicate QUEUE_RECOMPUTED suppression (replay-safe: fewer events OK). */
export declare function queueResultFingerprint(result: QueueRecomputeResult): string;
export declare function queueOrderKey(ids: readonly string[]): string;
//# sourceMappingURL=queueFingerprint.d.ts.map