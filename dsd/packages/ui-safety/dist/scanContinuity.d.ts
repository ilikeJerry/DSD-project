/**
 * Scan continuity — stable anchors for ward-style scanning.
 * Binds: PHASE 6
 */
/** Visual zone identifiers — layout must not swap zones between routes. */
export declare const SCAN_ZONE_PRIMARY = "dsd_zone_primary";
export declare const SCAN_ZONE_QUEUE = "dsd_zone_queue";
export declare const SCAN_ZONE_CONTEXT = "dsd_zone_context";
/** Left-to-right scan anchor order (do not reorder without HF review). */
export declare const SCAN_ANCHOR_ORDER: readonly ["severity_landmark", "patient_identity", "risk_one_liner", "action_slot"];
export type ScanAnchor = (typeof SCAN_ANCHOR_ORDER)[number];
//# sourceMappingURL=scanContinuity.d.ts.map