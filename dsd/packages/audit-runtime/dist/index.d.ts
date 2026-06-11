/**
 * @dsd/audit-runtime
 *
 * Binds: docs/safety/04-audit-trail-architecture.md (append-only)
 * Forbidden: mutation of prior entries, audit bypass, envelope 미검증 append
 */
import type { EventEnvelope } from "@dsd/event-schema";
export interface ReadonlyAuditTrail {
    readonly entries: readonly EventEnvelope[];
}
export declare class AppendOnlyAuditWriter implements ReadonlyAuditTrail {
    private readonly _entries;
    get entries(): readonly EventEnvelope[];
    /**
     * MUST validate before append — audit bypass 금지
     */
    append(raw: unknown): EventEnvelope;
    appendMany(raws: readonly unknown[]): readonly EventEnvelope[];
    /** Export for replay bundle — does not mutate */
    snapshot(): readonly EventEnvelope[];
}
//# sourceMappingURL=index.d.ts.map