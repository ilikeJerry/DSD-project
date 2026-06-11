/**
 * @dsd/replay-runtime
 * Binds: docs/safety/08-incident-replay-architecture.md (event log replay authority)
 */
import { parseEnvelope } from "@dsd/event-schema";
import { reduceClinical } from "@dsd/clinical-runtime";
export function replayFromInitialState(initial, envelopes) {
    const parsed = [];
    const mismatches = [];
    let state = initial;
    let prevQueueSig = "";
    for (const raw of envelopes) {
        const e = parseEnvelope(raw);
        parsed.push(e);
        state = reduceClinical(state, e);
        if (e.type === "QUEUE_RECOMPUTED") {
            const topK = e.payload?.topK ?? [];
            const key = topK.join("\u001e");
            const hash = e.payload.inputSnapshotHash ?? "";
            if (key !== state.queueOrderIds.join("\u001e")) {
                mismatches.push(`queue_payload_state_mismatch:${e.eventId}`);
            }
            const sig = `${hash}:${key}`;
            if (sig === prevQueueSig && prevQueueSig !== "") {
                mismatches.push(`queue_duplicate_recompute_sig:${e.eventId}`);
            }
            prevQueueSig = sig;
        }
    }
    return { state, parsed, mismatches };
}
/** PHASE 5 — same stream twice → identical terminal state + zero mismatches */
export function verifyDeterministicDoubleReplay(initial, envelopes) {
    const a = replayFromInitialState(initial, envelopes);
    const b = replayFromInitialState(initial, envelopes);
    if (a.mismatches.length || b.mismatches.length) {
        return { ok: false, detail: `mismatch:${[...a.mismatches, ...b.mismatches].join(";")}` };
    }
    const qA = [...a.state.queueOrderIds].join("|");
    const qB = [...b.state.queueOrderIds].join("|");
    if (qA !== qB || a.state.degradedMode !== b.state.degradedMode) {
        return { ok: false, detail: `state_divergence:queue:${qA} vs ${qB}` };
    }
    return { ok: true, detail: "ok" };
}
export function extractQueueHashesFromTimeline(entries) {
    return entries
        .filter((e) => e.type === "QUEUE_RECOMPUTED")
        .map((e) => e.payload.inputSnapshotHash ?? "missing");
}
export function assertReplaySameQueueHashes(a, b) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
}
//# sourceMappingURL=index.js.map