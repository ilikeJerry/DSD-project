/**
 * Operational runtime observability (no new governance layer).
 * Binds intent: docs/safety/SAFETY_ORIENTED_OBSERVABILITY.md — runtime counters for ops/debug.
 */
export interface RuntimeTelemetrySnapshot {
    readonly eventAppendedTotal: number;
    readonly queueRecomputeEmitted: number;
    readonly queueRecomputeSkippedUnchanged: number;
    readonly vitalUpdatedIngested: number;
    readonly degradedEnterCount: number;
    readonly degradedExitCount: number;
    readonly staleDetectedCount: number;
    readonly staleClearedCount: number;
    readonly lastQueueInputSnapshotHash: string | null;
    readonly lastQueueOrderKey: string | null;
}
export declare class RuntimeTelemetry {
    eventAppendedTotal: number;
    queueRecomputeEmitted: number;
    queueRecomputeSkippedUnchanged: number;
    vitalUpdatedIngested: number;
    degradedEnterCount: number;
    degradedExitCount: number;
    staleDetectedCount: number;
    staleClearedCount: number;
    lastQueueInputSnapshotHash: string | null;
    lastQueueOrderKey: string | null;
    onEventAppended(): void;
    onVitalUpdated(): void;
    onQueueRecomputeEmitted(hash: string, orderKey: string): void;
    onQueueRecomputeSkippedUnchanged(): void;
    snapshot(): RuntimeTelemetrySnapshot;
}
//# sourceMappingURL=telemetry.d.ts.map