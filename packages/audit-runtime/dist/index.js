import { EventEnvelopeSchema } from "@dsd/event-schema";
export class AppendOnlyAuditWriter {
    _entries = [];
    get entries() {
        return this._entries;
    }
    /**
     * MUST validate before append — audit bypass 금지
     */
    append(raw) {
        const parsed = EventEnvelopeSchema.parse(raw);
        this._entries.push(parsed);
        return parsed;
    }
    appendMany(raws) {
        return raws.map((r) => this.append(r));
    }
    /** Export for replay bundle — does not mutate */
    snapshot() {
        return [...this._entries];
    }
}
//# sourceMappingURL=index.js.map