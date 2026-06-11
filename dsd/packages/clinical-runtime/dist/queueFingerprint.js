import { deterministicSerialize } from "@dsd/event-schema";
/** Stable fingerprint for duplicate QUEUE_RECOMPUTED suppression (replay-safe: fewer events OK). */
export function queueResultFingerprint(result) {
    return deterministicSerialize({
        h: result.inputSnapshotHash,
        o: result.orderedAlertIds,
    });
}
export function queueOrderKey(ids) {
    return ids.join("\u001e");
}
//# sourceMappingURL=queueFingerprint.js.map