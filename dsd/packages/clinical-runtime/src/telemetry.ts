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

export class RuntimeTelemetry {
  eventAppendedTotal = 0;
  queueRecomputeEmitted = 0;
  queueRecomputeSkippedUnchanged = 0;
  vitalUpdatedIngested = 0;
  degradedEnterCount = 0;
  degradedExitCount = 0;
  staleDetectedCount = 0;
  staleClearedCount = 0;
  lastQueueInputSnapshotHash: string | null = null;
  lastQueueOrderKey: string | null = null;

  onEventAppended(): void {
    this.eventAppendedTotal++;
  }

  onVitalUpdated(): void {
    this.vitalUpdatedIngested++;
  }

  onQueueRecomputeEmitted(hash: string, orderKey: string): void {
    this.queueRecomputeEmitted++;
    this.lastQueueInputSnapshotHash = hash;
    this.lastQueueOrderKey = orderKey;
  }

  onQueueRecomputeSkippedUnchanged(): void {
    this.queueRecomputeSkippedUnchanged++;
  }

  snapshot(): RuntimeTelemetrySnapshot {
    return {
      eventAppendedTotal: this.eventAppendedTotal,
      queueRecomputeEmitted: this.queueRecomputeEmitted,
      queueRecomputeSkippedUnchanged: this.queueRecomputeSkippedUnchanged,
      vitalUpdatedIngested: this.vitalUpdatedIngested,
      degradedEnterCount: this.degradedEnterCount,
      degradedExitCount: this.degradedExitCount,
      staleDetectedCount: this.staleDetectedCount,
      staleClearedCount: this.staleClearedCount,
      lastQueueInputSnapshotHash: this.lastQueueInputSnapshotHash,
      lastQueueOrderKey: this.lastQueueOrderKey,
    };
  }
}
