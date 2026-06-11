/**
 * Temporal stability — display layer only (truth unchanged in clinical-runtime).
 * Binds: docs/ux-human-stability/OPERATOR_HUMAN_STABLE_REALTIME_UX.md PHASE 1–2
 */
const DEFAULT_MIN_HOLD_MS = 450;
const DEFAULT_MIN_INDEX_MOVE = 2;
function indexOf(ids, id) {
    const i = ids.indexOf(id);
    return i;
}
function maxIndexMovement(truth, shown) {
    const ids = new Set([...truth, ...shown]);
    let max = 0;
    for (const id of ids) {
        const a = indexOf(truth, id);
        const b = indexOf(shown, id);
        if (a < 0 || b < 0)
            return Math.max(max, Math.max(truth.length, shown.length));
        max = Math.max(max, Math.abs(a - b));
    }
    return max;
}
function sameOrder(a, b) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
}
/**
 * Suppresses micro-reorders within minHold unless top critical changes or large movement.
 */
export function dampenQueueOrderDisplay(input) {
    const minHold = input.minHoldMs ?? DEFAULT_MIN_HOLD_MS;
    const minMove = input.minIndexMove ?? DEFAULT_MIN_INDEX_MOVE;
    const { truthIds, displayedIds, truthIsCritical, nowMs, lastDisplayCommitMs } = input;
    if (truthIsCritical.length !== truthIds.length) {
        return { displayIds: truthIds, committedToTruth: true, reason: "commit_truth" };
    }
    if (truthIds.length === 0 && displayedIds.length === 0) {
        return { displayIds: displayedIds, committedToTruth: false, reason: "aligned" };
    }
    if (displayedIds.length === 0 && truthIds.length > 0) {
        return { displayIds: truthIds, committedToTruth: true, reason: "initial_fill" };
    }
    if (truthIds.length === 0 && displayedIds.length > 0) {
        return { displayIds: truthIds, committedToTruth: true, reason: "cleared" };
    }
    if (sameOrder(truthIds, displayedIds)) {
        return { displayIds: displayedIds, committedToTruth: false, reason: "aligned" };
    }
    const topTruth = truthIds[0];
    const topShown = displayedIds[0];
    if (topTruth !== topShown && truthIsCritical[0] === true) {
        return { displayIds: truthIds, committedToTruth: true, reason: "critical_top" };
    }
    const move = maxIndexMovement(truthIds, displayedIds);
    if (nowMs - lastDisplayCommitMs < minHold && move < minMove) {
        return { displayIds: displayedIds, committedToTruth: false, reason: "dampen_hold" };
    }
    return { displayIds: truthIds, committedToTruth: true, reason: "commit_truth" };
}
/**
 * Severity visual hysteresis — demotion delayed; promotion immediate (caller: promotion if !delay).
 */
export function shouldDelaySeverityDemotion(input) {
    if (input.wasCriticalVisual && !input.truthIsCritical) {
        return input.nowMs - input.lastCriticalVisualTrueMs < input.minDemoteVisualMs;
    }
    return false;
}
export const DEFAULT_MIN_DEMOTE_VISUAL_MS = 1_800;
export const DEFAULT_QUEUE_STABILIZATION_HOLD_MS = DEFAULT_MIN_HOLD_MS;
/**
 * P0: any open critical → display MUST track truth immediately (temporal dampening overridden).
 * Binds: OPERATOR_HUMAN_STABLE_REALTIME_UX.md PHASE 6
 */
export function resolveDisplayQueueForOperator(input) {
    if (input.openCriticalCount > 0) {
        return {
            displayIds: input.truthIds,
            committedToTruth: true,
            reason: "p0_open_critical",
        };
    }
    return dampenQueueOrderDisplay({
        truthIds: input.truthIds,
        displayedIds: input.displayedIds,
        truthIsCritical: input.truthIsCritical,
        nowMs: input.nowMs,
        lastDisplayCommitMs: input.lastDisplayCommitMs,
        minHoldMs: input.minHoldMs,
        minIndexMove: input.minIndexMove,
    });
}
//# sourceMappingURL=temporalStability.js.map