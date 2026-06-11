/**
 * @dsd/replay-runtime
 * Binds: docs/safety/08-incident-replay-architecture.md (event log replay authority)
 */
import { type EventEnvelope } from "@dsd/event-schema";
import { type ClinicalDomainState } from "@dsd/clinical-runtime";
export interface ReplayResult {
    readonly state: ClinicalDomainState;
    readonly parsed: readonly EventEnvelope[];
    readonly mismatches: readonly string[];
}
export declare function replayFromInitialState(initial: ClinicalDomainState, envelopes: readonly unknown[]): ReplayResult;
/** PHASE 5 — same stream twice → identical terminal state + zero mismatches */
export declare function verifyDeterministicDoubleReplay(initial: ClinicalDomainState, envelopes: readonly unknown[]): {
    ok: boolean;
    detail: string;
};
export declare function extractQueueHashesFromTimeline(entries: readonly EventEnvelope[]): readonly string[];
export declare function assertReplaySameQueueHashes(a: readonly string[], b: readonly string[]): boolean;
//# sourceMappingURL=index.d.ts.map