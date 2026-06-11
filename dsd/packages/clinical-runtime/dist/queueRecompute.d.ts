/**
 * Binds: docs/safety/05-alert-prioritization-traceability.md
 * Emits deterministic inputSnapshotHash for replay comparison
 */
import { type EventEnvelope } from "@dsd/event-schema";
import type { ClinicalDomainState } from "./types.js";
export interface QueueRecomputeResult {
    readonly orderedAlertIds: readonly string[];
    readonly inputSnapshotHash: string;
    readonly reasonByAlertId: ReadonlyMap<string, readonly string[]>;
}
export declare function recomputeQueue(state: ClinicalDomainState, nowIso: string): QueueRecomputeResult;
export declare function buildQueueRecomputedEnvelope(input: {
    eventId: string;
    correlationId: string;
    build: string;
    tickId?: string;
    scenarioId?: string;
    causalParentId?: string;
    result: QueueRecomputeResult;
    nowIso: string;
}): EventEnvelope;
//# sourceMappingURL=queueRecompute.d.ts.map