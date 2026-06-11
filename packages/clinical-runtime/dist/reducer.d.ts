/**
 * Pure replay-safe reducer.
 * Binds: state transitions must be reconstructible from envelopes (docs/safety/04, 09)
 */
import type { EventEnvelope } from "@dsd/event-schema";
import type { ClinicalDomainState } from "./types.js";
export declare function reduceClinical(state: ClinicalDomainState, envelope: EventEnvelope): ClinicalDomainState;
/** Recompute stale map from patient clocks — explicit, never hides stale (docs/safety/07) */
export declare function deriveStaleMap(state: ClinicalDomainState, nowIso: string): ReadonlyMap<string, "fresh" | "warn" | "block">;
//# sourceMappingURL=reducer.d.ts.map