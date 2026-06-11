/**
 * @dsd/event-schema
 *
 * Binds: docs/safety/03-event-envelope-standard.md
 * MUST NOT invent event types outside DOCUMENTED_EVENT_TYPES without doc PR.
 */
import { z } from "zod";

/** Normative enum — docs/safety/03-event-envelope-standard.md §2.1 */
export const EventSourceSchema = z.enum(["simulation", "live", "system"]);
export type EventSource = z.infer<typeof EventSourceSchema>;

/**
 * Documented domain + audit event types (safety docs 03, 04, 05, 06, 07, 09, 10).
 * New types require governance doc update first.
 */
export const DOCUMENTED_EVENT_TYPES = [
  "VITAL_UPDATED",
  "RULE_FIRED",
  "ALERT_CREATED",
  "ALERT_ACKED",
  "ALERT_RESOLVE_REQUESTED",
  "ALERT_RESOLVED",
  "ALERT_ACK_ROLLBACK",
  "ALERT_SUPPRESSED",
  "QUEUE_RECOMPUTED",
  "STALE_DETECTED",
  "STALE_CLEARED",
  "DEGRADED_ENTER",
  "DEGRADED_EXIT",
  "AUDIT_APPEND", // internal mirror if needed — prefer domain events only
] as const;

export type DocumentedEventType = (typeof DOCUMENTED_EVENT_TYPES)[number];

export const EventTypeSchema = z.enum(DOCUMENTED_EVENT_TYPES);

export const EventEnvelopeSchema = z
  .object({
    eventId: z.string().min(1),
    ts: z.string().datetime({ offset: true }),
    schemaVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
    type: EventTypeSchema,
    source: EventSourceSchema,
    correlationId: z.string().min(1),
    build: z.string().min(1),
    causalParentId: z.string().min(1).optional(),
    patientId: z.string().min(1).optional(),
    alertId: z.string().min(1).optional(),
    actor: z.string().min(1).optional(),
    payloadHash: z.string().min(1).optional(),
    scenarioId: z.string().min(1).optional(),
    tickId: z.string().min(1).optional(),
    dedupeKey: z.string().min(1).optional(),
    confidence: z.enum(["high", "medium", "low", "unknown"]).optional(),
    payload: z.record(z.unknown()).optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    const needsPatient = [
      "VITAL_UPDATED",
      "RULE_FIRED",
      "ALERT_CREATED",
      "ALERT_ACKED",
      "ALERT_RESOLVE_REQUESTED",
      "ALERT_RESOLVED",
      "ALERT_ACK_ROLLBACK",
      "ALERT_SUPPRESSED",
    ] as const satisfies readonly DocumentedEventType[];
    if ((needsPatient as readonly string[]).includes(val.type) && !val.patientId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "patientId required for this type", path: ["patientId"] });
    }
    const staleNeedsPatient = ["STALE_DETECTED", "STALE_CLEARED"] as const;
    if ((staleNeedsPatient as readonly string[]).includes(val.type) && !val.patientId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "patientId required for stale events", path: ["patientId"] });
    }
    const needsAlert = [
      "ALERT_CREATED",
      "ALERT_ACKED",
      "ALERT_RESOLVE_REQUESTED",
      "ALERT_RESOLVED",
      "ALERT_ACK_ROLLBACK",
      "ALERT_SUPPRESSED",
    ] as const;
    if ((needsAlert as readonly string[]).includes(val.type) && !val.alertId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "alertId required for this type", path: ["alertId"] });
    }
    const needsActor = ["ALERT_ACKED", "ALERT_RESOLVE_REQUESTED", "ALERT_RESOLVED"] as const;
    if ((needsActor as readonly string[]).includes(val.type) && !val.actor) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "actor required for human action", path: ["actor"] });
    }
  });

export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;

/** Deterministic JSON for replay hashing — stable key order */
export function deterministicSerialize(value: unknown): string {
  return stableStringify(value);
}

function stableStringify(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  const obj = v as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const entries = keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`);
  return `{${entries.join(",")}}`;
}

export function parseEnvelope(input: unknown): EventEnvelope {
  return EventEnvelopeSchema.parse(input);
}

export function safeParseEnvelope(input: unknown) {
  return EventEnvelopeSchema.safeParse(input);
}
