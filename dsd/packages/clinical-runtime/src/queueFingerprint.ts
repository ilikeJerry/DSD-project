import { deterministicSerialize } from "@dsd/event-schema";
import type { QueueRecomputeResult } from "./queueRecompute.js";

/** Stable fingerprint for duplicate QUEUE_RECOMPUTED suppression (replay-safe: fewer events OK). */
export function queueResultFingerprint(result: QueueRecomputeResult): string {
  return deterministicSerialize({
    h: result.inputSnapshotHash,
    o: result.orderedAlertIds,
  });
}

export function queueOrderKey(ids: readonly string[]): string {
  return ids.join("\u001e");
}
