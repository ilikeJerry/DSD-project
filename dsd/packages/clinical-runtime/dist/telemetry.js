export class RuntimeTelemetry {
    eventAppendedTotal = 0;
    queueRecomputeEmitted = 0;
    queueRecomputeSkippedUnchanged = 0;
    vitalUpdatedIngested = 0;
    degradedEnterCount = 0;
    degradedExitCount = 0;
    staleDetectedCount = 0;
    staleClearedCount = 0;
    lastQueueInputSnapshotHash = null;
    lastQueueOrderKey = null;
    onEventAppended() {
        this.eventAppendedTotal++;
    }
    onVitalUpdated() {
        this.vitalUpdatedIngested++;
    }
    onQueueRecomputeEmitted(hash, orderKey) {
        this.queueRecomputeEmitted++;
        this.lastQueueInputSnapshotHash = hash;
        this.lastQueueOrderKey = orderKey;
    }
    onQueueRecomputeSkippedUnchanged() {
        this.queueRecomputeSkippedUnchanged++;
    }
    snapshot() {
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
//# sourceMappingURL=telemetry.js.map