/**
 * @dsd/replay-runtime
 * Binds: docs/safety/08-incident-replay-architecture.md (event log replay authority)
 */
import { parseEnvelope, type EventEnvelope } from "@dsd/event-schema";
import { reduceClinical, type ClinicalDomainState } from "@dsd/clinical-runtime";

export interface ReplayResult {
  readonly state: ClinicalDomainState;
  readonly parsed: readonly EventEnvelope[];
  readonly mismatches: readonly string[];
}

export function replayFromInitialState(
  initial: ClinicalDomainState,
  envelopes: readonly unknown[],
): ReplayResult {
  const parsed: EventEnvelope[] = [];
  const mismatches: string[] = [];
  let state = initial;
  let prevQueueSig = "";
  for (const raw of envelopes) {
    const e = parseEnvelope(raw);
    parsed.push(e);
    state = reduceClinical(state, e);
    if (e.type === "QUEUE_RECOMPUTED") {
      const topK = (e.payload as { topK?: string[] } | undefined)?.topK ?? [];
      const key = topK.join("\u001e");
      const hash = (e.payload as { inputSnapshotHash?: string }).inputSnapshotHash ?? "";
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
export function verifyDeterministicDoubleReplay(
  initial: ClinicalDomainState,
  envelopes: readonly unknown[],
): { ok: boolean; detail: string } {
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

export function extractQueueHashesFromTimeline(entries: readonly EventEnvelope[]): readonly string[] {
  return entries
    .filter((e) => e.type === "QUEUE_RECOMPUTED")
    .map((e) => (e.payload as { inputSnapshotHash?: string }).inputSnapshotHash ?? "missing");
}

export function assertReplaySameQueueHashes(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
