/**
 * Domain types — clinical-runtime internal.
 * UI projections live in apps/web; invariants checked via @dsd/ui-safety
 */
import type { DegradedMode } from "./degraded.js";

export interface VitalSigns {
  readonly hr: number;
  readonly spo2: number;
  readonly sbp: number;
}

export interface PatientEntity {
  readonly id: string;
  readonly displayName: string;
  readonly vitals: VitalSigns;
  /** RFC3339 — last authoritative vital refresh */
  readonly lastConfirmedAt: string;
}

export type AlertLifecycle = "CREATED" | "ACKNOWLEDGED" | "RESOLVED" | "SUPPRESSED";

export interface AlertEntity {
  readonly id: string;
  readonly patientId: string;
  readonly ruleId: string;
  readonly severity: "critical" | "warning";
  readonly lifecycle: AlertLifecycle;
  readonly dedupeKey: string;
  readonly repeatCount: number;
  readonly createdAt: string;
}

export interface ClinicalDomainState {
  readonly degradedMode: DegradedMode;
  readonly patients: ReadonlyMap<string, PatientEntity>;
  readonly alerts: ReadonlyMap<string, AlertEntity>;
  /** Authoritative queue order after QUEUE_RECOMPUTED — docs/safety/05 */
  readonly queueOrderIds: readonly string[];
  readonly staleByPatientId: ReadonlyMap<string, "fresh" | "warn" | "block">;
}

export function emptyClinicalState(degradedMode: DegradedMode = "HEALTHY"): ClinicalDomainState {
  return {
    degradedMode,
    patients: new Map(),
    alerts: new Map(),
    queueOrderIds: [],
    staleByPatientId: new Map(),
  };
}
