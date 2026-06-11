/**
 * @dsd/event-schema
 *
 * Binds: docs/safety/03-event-envelope-standard.md
 * MUST NOT invent event types outside DOCUMENTED_EVENT_TYPES without doc PR.
 */
import { z } from "zod";
/** Normative enum — docs/safety/03-event-envelope-standard.md §2.1 */
export declare const EventSourceSchema: z.ZodEnum<["simulation", "live", "system"]>;
export type EventSource = z.infer<typeof EventSourceSchema>;
/**
 * Documented domain + audit event types (safety docs 03, 04, 05, 06, 07, 09, 10).
 * New types require governance doc update first.
 */
export declare const DOCUMENTED_EVENT_TYPES: readonly ["VITAL_UPDATED", "RULE_FIRED", "ALERT_CREATED", "ALERT_ACKED", "ALERT_RESOLVE_REQUESTED", "ALERT_RESOLVED", "ALERT_ACK_ROLLBACK", "ALERT_SUPPRESSED", "QUEUE_RECOMPUTED", "STALE_DETECTED", "STALE_CLEARED", "DEGRADED_ENTER", "DEGRADED_EXIT", "AUDIT_APPEND"];
export type DocumentedEventType = (typeof DOCUMENTED_EVENT_TYPES)[number];
export declare const EventTypeSchema: z.ZodEnum<["VITAL_UPDATED", "RULE_FIRED", "ALERT_CREATED", "ALERT_ACKED", "ALERT_RESOLVE_REQUESTED", "ALERT_RESOLVED", "ALERT_ACK_ROLLBACK", "ALERT_SUPPRESSED", "QUEUE_RECOMPUTED", "STALE_DETECTED", "STALE_CLEARED", "DEGRADED_ENTER", "DEGRADED_EXIT", "AUDIT_APPEND"]>;
export declare const EventEnvelopeSchema: z.ZodEffects<z.ZodObject<{
    eventId: z.ZodString;
    ts: z.ZodString;
    schemaVersion: z.ZodString;
    type: z.ZodEnum<["VITAL_UPDATED", "RULE_FIRED", "ALERT_CREATED", "ALERT_ACKED", "ALERT_RESOLVE_REQUESTED", "ALERT_RESOLVED", "ALERT_ACK_ROLLBACK", "ALERT_SUPPRESSED", "QUEUE_RECOMPUTED", "STALE_DETECTED", "STALE_CLEARED", "DEGRADED_ENTER", "DEGRADED_EXIT", "AUDIT_APPEND"]>;
    source: z.ZodEnum<["simulation", "live", "system"]>;
    correlationId: z.ZodString;
    build: z.ZodString;
    causalParentId: z.ZodOptional<z.ZodString>;
    patientId: z.ZodOptional<z.ZodString>;
    alertId: z.ZodOptional<z.ZodString>;
    actor: z.ZodOptional<z.ZodString>;
    payloadHash: z.ZodOptional<z.ZodString>;
    scenarioId: z.ZodOptional<z.ZodString>;
    tickId: z.ZodOptional<z.ZodString>;
    dedupeKey: z.ZodOptional<z.ZodString>;
    confidence: z.ZodOptional<z.ZodEnum<["high", "medium", "low", "unknown"]>>;
    payload: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strict", z.ZodTypeAny, {
    type: "VITAL_UPDATED" | "RULE_FIRED" | "ALERT_CREATED" | "ALERT_ACKED" | "ALERT_RESOLVE_REQUESTED" | "ALERT_RESOLVED" | "ALERT_ACK_ROLLBACK" | "ALERT_SUPPRESSED" | "QUEUE_RECOMPUTED" | "STALE_DETECTED" | "STALE_CLEARED" | "DEGRADED_ENTER" | "DEGRADED_EXIT" | "AUDIT_APPEND";
    eventId: string;
    ts: string;
    schemaVersion: string;
    source: "simulation" | "live" | "system";
    correlationId: string;
    build: string;
    causalParentId?: string | undefined;
    patientId?: string | undefined;
    alertId?: string | undefined;
    actor?: string | undefined;
    payloadHash?: string | undefined;
    scenarioId?: string | undefined;
    tickId?: string | undefined;
    dedupeKey?: string | undefined;
    confidence?: "high" | "medium" | "low" | "unknown" | undefined;
    payload?: Record<string, unknown> | undefined;
}, {
    type: "VITAL_UPDATED" | "RULE_FIRED" | "ALERT_CREATED" | "ALERT_ACKED" | "ALERT_RESOLVE_REQUESTED" | "ALERT_RESOLVED" | "ALERT_ACK_ROLLBACK" | "ALERT_SUPPRESSED" | "QUEUE_RECOMPUTED" | "STALE_DETECTED" | "STALE_CLEARED" | "DEGRADED_ENTER" | "DEGRADED_EXIT" | "AUDIT_APPEND";
    eventId: string;
    ts: string;
    schemaVersion: string;
    source: "simulation" | "live" | "system";
    correlationId: string;
    build: string;
    causalParentId?: string | undefined;
    patientId?: string | undefined;
    alertId?: string | undefined;
    actor?: string | undefined;
    payloadHash?: string | undefined;
    scenarioId?: string | undefined;
    tickId?: string | undefined;
    dedupeKey?: string | undefined;
    confidence?: "high" | "medium" | "low" | "unknown" | undefined;
    payload?: Record<string, unknown> | undefined;
}>, {
    type: "VITAL_UPDATED" | "RULE_FIRED" | "ALERT_CREATED" | "ALERT_ACKED" | "ALERT_RESOLVE_REQUESTED" | "ALERT_RESOLVED" | "ALERT_ACK_ROLLBACK" | "ALERT_SUPPRESSED" | "QUEUE_RECOMPUTED" | "STALE_DETECTED" | "STALE_CLEARED" | "DEGRADED_ENTER" | "DEGRADED_EXIT" | "AUDIT_APPEND";
    eventId: string;
    ts: string;
    schemaVersion: string;
    source: "simulation" | "live" | "system";
    correlationId: string;
    build: string;
    causalParentId?: string | undefined;
    patientId?: string | undefined;
    alertId?: string | undefined;
    actor?: string | undefined;
    payloadHash?: string | undefined;
    scenarioId?: string | undefined;
    tickId?: string | undefined;
    dedupeKey?: string | undefined;
    confidence?: "high" | "medium" | "low" | "unknown" | undefined;
    payload?: Record<string, unknown> | undefined;
}, {
    type: "VITAL_UPDATED" | "RULE_FIRED" | "ALERT_CREATED" | "ALERT_ACKED" | "ALERT_RESOLVE_REQUESTED" | "ALERT_RESOLVED" | "ALERT_ACK_ROLLBACK" | "ALERT_SUPPRESSED" | "QUEUE_RECOMPUTED" | "STALE_DETECTED" | "STALE_CLEARED" | "DEGRADED_ENTER" | "DEGRADED_EXIT" | "AUDIT_APPEND";
    eventId: string;
    ts: string;
    schemaVersion: string;
    source: "simulation" | "live" | "system";
    correlationId: string;
    build: string;
    causalParentId?: string | undefined;
    patientId?: string | undefined;
    alertId?: string | undefined;
    actor?: string | undefined;
    payloadHash?: string | undefined;
    scenarioId?: string | undefined;
    tickId?: string | undefined;
    dedupeKey?: string | undefined;
    confidence?: "high" | "medium" | "low" | "unknown" | undefined;
    payload?: Record<string, unknown> | undefined;
}>;
export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;
/** Deterministic JSON for replay hashing — stable key order */
export declare function deterministicSerialize(value: unknown): string;
export declare function parseEnvelope(input: unknown): EventEnvelope;
export declare function safeParseEnvelope(input: unknown): z.SafeParseReturnType<{
    type: "VITAL_UPDATED" | "RULE_FIRED" | "ALERT_CREATED" | "ALERT_ACKED" | "ALERT_RESOLVE_REQUESTED" | "ALERT_RESOLVED" | "ALERT_ACK_ROLLBACK" | "ALERT_SUPPRESSED" | "QUEUE_RECOMPUTED" | "STALE_DETECTED" | "STALE_CLEARED" | "DEGRADED_ENTER" | "DEGRADED_EXIT" | "AUDIT_APPEND";
    eventId: string;
    ts: string;
    schemaVersion: string;
    source: "simulation" | "live" | "system";
    correlationId: string;
    build: string;
    causalParentId?: string | undefined;
    patientId?: string | undefined;
    alertId?: string | undefined;
    actor?: string | undefined;
    payloadHash?: string | undefined;
    scenarioId?: string | undefined;
    tickId?: string | undefined;
    dedupeKey?: string | undefined;
    confidence?: "high" | "medium" | "low" | "unknown" | undefined;
    payload?: Record<string, unknown> | undefined;
}, {
    type: "VITAL_UPDATED" | "RULE_FIRED" | "ALERT_CREATED" | "ALERT_ACKED" | "ALERT_RESOLVE_REQUESTED" | "ALERT_RESOLVED" | "ALERT_ACK_ROLLBACK" | "ALERT_SUPPRESSED" | "QUEUE_RECOMPUTED" | "STALE_DETECTED" | "STALE_CLEARED" | "DEGRADED_ENTER" | "DEGRADED_EXIT" | "AUDIT_APPEND";
    eventId: string;
    ts: string;
    schemaVersion: string;
    source: "simulation" | "live" | "system";
    correlationId: string;
    build: string;
    causalParentId?: string | undefined;
    patientId?: string | undefined;
    alertId?: string | undefined;
    actor?: string | undefined;
    payloadHash?: string | undefined;
    scenarioId?: string | undefined;
    tickId?: string | undefined;
    dedupeKey?: string | undefined;
    confidence?: "high" | "medium" | "low" | "unknown" | undefined;
    payload?: Record<string, unknown> | undefined;
}>;
//# sourceMappingURL=index.d.ts.map