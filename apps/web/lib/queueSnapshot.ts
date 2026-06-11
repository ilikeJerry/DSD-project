import type { ClinicalDomainState } from "@dsd/clinical-runtime";

/**
 * JSON-serializable projection for client truth/display reconciliation.
 * Maps stay on server; Records cross the RSC → client boundary safely.
 */
export type QueuePanelAlertProjection = {
  readonly id: string;
  readonly patientId: string;
  readonly severity: string;
  readonly lifecycle: string;
};

export type QueuePanelSnapshot = {
  readonly truthQueueIds: readonly string[];
  readonly alerts: Readonly<Record<string, QueuePanelAlertProjection>>;
  readonly degradedMode: string;
};

export function queuePanelSnapshotFromState(state: ClinicalDomainState): QueuePanelSnapshot {
  const alerts: Record<string, QueuePanelAlertProjection> = {};
  for (const [id, a] of state.alerts) {
    alerts[id] = {
      id: a.id,
      patientId: a.patientId,
      severity: a.severity,
      lifecycle: a.lifecycle,
    };
  }
  return {
    truthQueueIds: [...state.queueOrderIds],
    alerts,
    degradedMode: state.degradedMode,
  };
}
