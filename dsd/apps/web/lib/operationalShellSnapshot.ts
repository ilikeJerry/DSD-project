import type { ClinicalDomainState, PatientDynamicState, RuntimeTelemetrySnapshot } from "@dsd/clinical-runtime";
import { formatDynamicVitalSummary, primaryConcernLabel, profileById, vitalTrendGlyph } from "@dsd/clinical-runtime";
import {
  projectOperationalTrustSurface,
  projectTrustObservability,
  type OperationalTrustSurface,
  type TrustObservabilityStrip,
} from "@dsd/ui-safety";
import { queuePanelSnapshotFromState, type QueuePanelSnapshot } from "./queueSnapshot";

export type PatientOperationalProjection = {
  readonly id: string;
  readonly displayName: string;
  readonly stale: string;
  readonly lastConfirmedAt: string;
  readonly assignedClinician: string;
  readonly dynamicStatus: string;
  readonly dynamicVitals: string;
  readonly dynamicTrend: string;
  readonly recommendedAction: string;
  readonly riskScore: number;
};

export type OperationalShellSnapshot = QueuePanelSnapshot & {
  readonly trust: OperationalTrustSurface;
  readonly observability: TrustObservabilityStrip;
  readonly patients: Readonly<Record<string, PatientOperationalProjection>>;
  /** Recent audit event types — replay / reconciliation visibility (tail only). */
  readonly auditTailTypes: readonly string[];
};

export function operationalShellSnapshotFromState(
  state: ClinicalDomainState,
  telemetry: RuntimeTelemetrySnapshot,
  auditEntries: ReadonlyArray<{ readonly type: string }>,
  auditTailMax = 12,
  dynamics: Readonly<Record<string, PatientDynamicState>> = {},
): OperationalShellSnapshot {
  const base = queuePanelSnapshotFromState(state);
  const trust = projectOperationalTrustSurface(state);
  const observability = projectTrustObservability({ telemetry, surface: trust });
  const patients: Record<string, PatientOperationalProjection> = {};
  for (const [id, p] of state.patients) {
    const dyn = dynamics[id];
    const profile = profileById(id);
    const stale = state.staleByPatientId.get(id) ?? "fresh";
    patients[id] = {
      id: p.id,
      displayName: p.displayName,
      stale,
      lastConfirmedAt: p.lastConfirmedAt,
      assignedClinician: profile?.assignedClinician ?? "담당 확인 필요",
      dynamicStatus: dyn ? `현재: ${primaryConcernLabel(dyn)}` : "현재: 임상 상태 확인 중",
      dynamicVitals: dyn ? formatDynamicVitalSummary(dyn) : `SpO₂ ${p.vitals.spo2}% · HR ${p.vitals.hr}`,
      dynamicTrend: dyn ? vitalTrendGlyph(dyn.trendDirection) : "→",
      recommendedAction: dyn?.recommendedAction ?? "경과 관찰",
      riskScore: dyn?.riskScore ?? 0,
    };
  }
  const tail = auditEntries.slice(-auditTailMax).map((e) => e.type);
  return { ...base, trust, observability, patients, auditTailTypes: tail };
}
