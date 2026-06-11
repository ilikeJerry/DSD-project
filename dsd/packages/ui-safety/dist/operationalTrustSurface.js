function sortedStaleKey(state) {
    return [...state.staleByPatientId.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([id, level]) => `${id}:${level}`)
        .join(";");
}
function panelConfidenceFrom(state, partialStaleCount) {
    if (state.degradedMode === "RECONNECTING")
        return "RECONNECTING";
    if (state.degradedMode !== "HEALTHY")
        return "DEGRADED";
    if (partialStaleCount > 0)
        return "PARTIAL_STALE";
    return "HIGH";
}
/**
 * Deterministic cross-panel version: degraded + queue + stale map.
 * Forbidden: hidden partial stale — partialStalePatientIds always enumerated when non-empty.
 */
export function projectOperationalTrustSurface(state) {
    const partialStalePatientIds = [...state.staleByPatientId.entries()]
        .filter(([, level]) => level !== "fresh")
        .map(([id]) => id)
        .sort((a, b) => a.localeCompare(b));
    const hasMixedFreshness = partialStalePatientIds.length > 0 && partialStalePatientIds.length < state.patients.size;
    const panelConfidence = panelConfidenceFrom(state, partialStalePatientIds.length);
    const queueKey = state.queueOrderIds.join("|");
    const syncVersionKey = `${state.degradedMode}#q:${queueKey}#stale:${sortedStaleKey(state)}`;
    const recoveryTimelineLabel = state.degradedMode === "RECONNECTING"
        ? "Timeline: reconnecting → syncing → restored (await HEALTHY)"
        : state.degradedMode !== "HEALTHY"
            ? `Timeline: degraded (${state.degradedMode}) — exit requires explicit DEGRADED_EXIT`
            : "Timeline: HEALTHY — last reconciliation authoritative";
    const queueRecoveryNarrative = state.degradedMode === "RECONNECTING"
        ? "Queue order reflects last QUEUE_RECOMPUTED before/during reconnect; expect no silent jump — next recompute is visible in audit tail."
        : "Queue order follows deterministic policy version; replay rebuild must match this order after the same envelope stream.";
    const staleHierarchySummary = partialStalePatientIds.length === 0
        ? "Stale: none — all tracked patients fresh."
        : `Stale: ${partialStalePatientIds.length} patient(s) non-fresh — worst level drives banner (warn vs block).`;
    const replayReconciliationHint = "Replay: reconstruct from append-only audit; compare queue hash sequence to live kernel — mismatch is a trust-critical incident signal.";
    return {
        syncVersionKey,
        panelConfidence,
        partialStalePatientIds,
        hasMixedFreshness,
        recoveryTimelineLabel,
        queueRecoveryNarrative,
        staleHierarchySummary,
        replayReconciliationHint,
        crossPanelConsistencyRule: "single_sync_version_all_panels",
    };
}
export function projectTrustObservability(input) {
    const { telemetry, surface } = input;
    const completedDegradedCycles = Math.min(telemetry.degradedEnterCount, telemetry.degradedExitCount);
    const operatorFacingSummary = surface.panelConfidence === "RECONNECTING"
        ? `Trust: reconnecting — degraded cycles completed (min enter/exit): ${completedDegradedCycles}; queue recomputes emitted: ${telemetry.queueRecomputeEmitted}.`
        : surface.panelConfidence === "PARTIAL_STALE"
            ? `Trust: partial freshness — ${surface.partialStalePatientIds.length} stale patient channel(s); recomputes ${telemetry.queueRecomputeEmitted}, skips ${telemetry.queueRecomputeSkippedUnchanged}.`
            : surface.panelConfidence === "DEGRADED"
                ? `Trust: degraded (${surface.syncVersionKey.split("#")[0]}) — prefer non-silent actions; recomputes ${telemetry.queueRecomputeEmitted}.`
                : `Trust: high — recomputes ${telemetry.queueRecomputeEmitted}, stale clears ${telemetry.staleClearedCount}/${telemetry.staleDetectedCount}.`;
    return {
        completedDegradedCycles,
        queueReconciliationBursts: telemetry.queueRecomputeEmitted,
        queueReconcileSkipsUnchanged: telemetry.queueRecomputeSkippedUnchanged,
        staleDetections: telemetry.staleDetectedCount,
        staleClears: telemetry.staleClearedCount,
        operatorFacingSummary,
    };
}
//# sourceMappingURL=operationalTrustSurface.js.map