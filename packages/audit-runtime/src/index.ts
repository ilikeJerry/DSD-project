/**
 * @dsd/audit-runtime
 *
 * Binds: docs/safety/04-audit-trail-architecture.md (append-only)
 * Forbidden: mutation of prior entries, audit bypass, envelope 미검증 append
 */
import type { EventEnvelope } from "@dsd/event-schema";
import { EventEnvelopeSchema } from "@dsd/event-schema";

export interface ReadonlyAuditTrail {
  readonly entries: readonly EventEnvelope[];
}

export class AppendOnlyAuditWriter implements ReadonlyAuditTrail {
  private readonly _entries: EventEnvelope[] = [];

  get entries(): readonly EventEnvelope[] {
    return this._entries;
  }

  /**
   * MUST validate before append — audit bypass 금지
   */
  append(raw: unknown): EventEnvelope {
    const parsed = EventEnvelopeSchema.parse(raw);
    this._entries.push(parsed);
    return parsed;
  }

  appendMany(raws: readonly unknown[]): readonly EventEnvelope[] {
    return raws.map((r) => this.append(r));
  }

  /** Export for replay bundle — does not mutate */
  snapshot(): readonly EventEnvelope[] {
    return [...this._entries];
  }
}
