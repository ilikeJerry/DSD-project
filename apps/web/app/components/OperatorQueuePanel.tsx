"use client";

import { resolveDisplayQueueForOperator } from "@dsd/ui-safety";
import type { QueuePanelSnapshot } from "../../lib/queueSnapshot";
import type { PatientOperationalProjection } from "../../lib/operationalShellSnapshot";
import {
  dsdCompactSummaryStyle,
  dsdDensity,
  dsdPillButtonStyle,
  dsdQueueRowStyleForTier,
  dsdQueueTierBadgeStyle,
  dsdSectionCardStyle,
  dsdSpace,
  dsdTrust,
  dsdType,
  dsdWardSummaryBarStyle,
  type QueueDisplayTier,
} from "../../lib/clinicalSurfaceTokens";
import {
  ackDisabledReason,
  classifyQueueDisplayTier,
  computeCohortMonitoringSummary,
  computeWardCensus,
  degradedModeOperator,
  degradedReconnectLead,
  formatCohortMonitoringLines,
  formatPatientPrimaryLine,
  formatWardSituationLine,
  lifecycleShort,
  patientActionLine,
  priorityReasonLine,
  priorityReasonPrefix,
  queueRowCta,
  queueTierLabel,
  queueZoneTitle,
  repeatDetectionLabel,
  tierSortPriority,
  wardSituationTitle,
  unknownPatientLabel,
} from "../../lib/operatorMicrocopy";
import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

const COHORT_SIZE = 30;

function countOpenCritical(alerts: QueuePanelSnapshot["alerts"]): number {
  return Object.values(alerts).filter(
    (a) => a.severity === "critical" && (a.lifecycle === "CREATED" || a.lifecycle === "ACKNOWLEDGED"),
  ).length;
}

function truthIsCriticalFlags(truthQueueIds: readonly string[], alerts: QueuePanelSnapshot["alerts"]): boolean[] {
  return truthQueueIds.map((id) => {
    const a = alerts[id];
    return !!(a && a.severity === "critical" && (a.lifecycle === "CREATED" || a.lifecycle === "ACKNOWLEDGED"));
  });
}

type RowEmphasis = "primary" | "secondary" | "repeat";

function classifyQueueEmphasis(
  truthQueueIds: readonly string[],
  alerts: QueuePanelSnapshot["alerts"],
): { readonly primaryCritical: ReadonlySet<string>; readonly firstByPatient: ReadonlyMap<string, string> } {
  const openCriticalIds: string[] = [];
  const firstByPatient = new Map<string, string>();
  for (const id of truthQueueIds) {
    const a = alerts[id];
    if (!a) continue;
    if (!firstByPatient.has(a.patientId)) firstByPatient.set(a.patientId, id);
    if (a.severity === "critical" && (a.lifecycle === "CREATED" || a.lifecycle === "ACKNOWLEDGED")) {
      openCriticalIds.push(id);
    }
  }
  return { primaryCritical: new Set(openCriticalIds.slice(0, 3)), firstByPatient };
}

function rowEmphasisFor(
  alertId: string,
  alert: QueuePanelSnapshot["alerts"][string] | undefined,
  emphasis: ReturnType<typeof classifyQueueEmphasis>,
): RowEmphasis {
  if (!alert) return "secondary";
  if (emphasis.firstByPatient.get(alert.patientId) !== alertId) return "repeat";
  if (emphasis.primaryCritical.has(alertId)) return "primary";
  if (alert.severity === "critical" && (alert.lifecycle === "CREATED" || alert.lifecycle === "ACKNOWLEDGED")) {
    return "secondary";
  }
  return "secondary";
}

function selectVisibleQueueIds(input: {
  truthQueueIds: readonly string[];
  alerts: QueuePanelSnapshot["alerts"];
  patients: Readonly<Record<string, PatientOperationalProjection>>;
  emphasis: ReturnType<typeof classifyQueueEmphasis>;
  maxVisible: number;
}): { readonly visibleIds: readonly string[]; readonly monitoringCount: number } {
  const candidates: { id: string; tier: QueueDisplayTier; priority: number; patientId: string }[] = [];
  let stalePick: string | null = null;

  for (const id of input.truthQueueIds) {
    const a = input.alerts[id];
    if (!a) continue;
    const rowEm = rowEmphasisFor(id, a, input.emphasis);
    if (rowEm === "repeat") continue;
    const patient = input.patients[a.patientId];
    const tier = classifyQueueDisplayTier({
      alertSeverity: a.severity,
      alertLifecycle: a.lifecycle,
      patientStale: patient?.stale ?? "fresh",
      dynamicStatus: patient?.dynamicStatus ?? "",
      isPrimaryCritical: input.emphasis.primaryCritical.has(id),
    });
    if ((patient?.stale === "block" || patient?.stale === "warn") && !stalePick) stalePick = id;
    candidates.push({
      id,
      tier,
      priority: tierSortPriority(tier),
      patientId: a.patientId,
    });
  }

  const must = new Set<string>();
  for (const c of candidates) {
    if (c.tier === "p0" || c.tier === "critical") must.add(c.id);
  }
  if (stalePick) must.add(stalePick);

  const sorted = [...candidates].sort((a, b) => b.priority - a.priority || input.truthQueueIds.indexOf(a.id) - input.truthQueueIds.indexOf(b.id));
  const visible = new Set(must);
  for (const c of sorted) {
    if (visible.size >= input.maxVisible) break;
    visible.add(c.id);
  }

  const visibleIds = input.truthQueueIds.filter((id) => visible.has(id));
  const visiblePatients = new Set(visibleIds.map((id) => input.alerts[id]?.patientId).filter(Boolean));
  const monitoringCount = Math.max(0, COHORT_SIZE - visiblePatients.size);

  return { visibleIds, monitoringCount };
}

type RowProps = {
  readonly alertId: string;
  readonly alert: NonNullable<QueuePanelSnapshot["alerts"][string]>;
  readonly patient?: PatientOperationalProjection;
  readonly tier: QueueDisplayTier;
  readonly position: number;
  readonly reducedMotion: boolean;
  readonly degraded: boolean;
  readonly isPrimary: boolean;
  readonly selectable?: boolean;
  readonly isSelected?: boolean;
  readonly onSelect?: () => void;
  readonly onAcknowledge?: () => void;
};

const QueueRow = memo(function QueueRow({
  patient,
  alert,
  tier,
  position,
  reducedMotion,
  degraded,
  isPrimary,
  selectable,
  isSelected,
  onSelect,
  onAcknowledge,
}: RowProps) {
  const rowOpacity = tier === "p0" || (tier === "critical" && isPrimary) ? 1 : tier === "warning" ? 0.88 : tier === "stale" ? 0.9 : 0.72;
  const rowStyle = {
    ...dsdQueueRowStyleForTier(tier, !!isSelected, reducedMotion, rowOpacity),
    cursor: selectable ? ("pointer" as const) : undefined,
  };
  const primaryLine = patient ? formatPatientPrimaryLine(patient.displayName) : unknownPatientLabel;
  const cta = queueRowCta({
    lifecycle: alert.lifecycle,
    degraded,
    isPrimaryCritical: isPrimary,
  });
  const reason = priorityReasonLine({
    tier,
    alertSeverity: alert.severity,
    alertLifecycle: alert.lifecycle,
    patientStale: patient?.stale ?? "fresh",
    dynamicVitals: patient?.dynamicVitals,
    dynamicStatus: patient?.dynamicStatus,
  });

  const inner = (
    <>
      <span style={{ ...dsdType.caption, opacity: 0.85, fontVariantNumeric: "tabular-nums" }}>{position + 1}</span>
      <span style={dsdType.bodySm}>
        <span style={dsdQueueTierBadgeStyle(tier)}>{queueTierLabel(tier)}</span>
        <span style={{ display: "block", fontWeight: tier === "p0" || tier === "critical" ? 700 : 600, marginTop: 4 }}>
          {primaryLine}
        </span>
        <span style={{ display: "block", color: "var(--dsd-text-subtle)", marginTop: 4, ...dsdType.caption }}>
          {patient?.dynamicStatus ?? "현재: 임상 상태 확인 중"}
        </span>
        <span style={{ display: "block", color: "var(--dsd-text-muted)", marginTop: 2, ...dsdType.caption }}>
          {priorityReasonPrefix}: {reason}
        </span>
      </span>
      <span style={{ ...dsdType.caption, whiteSpace: "nowrap", textAlign: "right" }}>
        {lifecycleShort(alert.lifecycle)}
        <span style={{ display: "block", marginTop: 4 }}>{patientActionLine(patient?.recommendedAction) || cta.actionLabel}</span>
      </span>
    </>
  );

  const label = `${primaryLine}, ${queueTierLabel(tier)}, ${reason}`;

  if (selectable && onSelect) {
    return (
      <li className="dsd-motion-safe" style={{ listStyle: "none", marginBottom: dsdDensity.queueGap }}>
        <button type="button" className="dsd-motion-safe dsd-surface-focus" style={rowStyle} aria-selected={isSelected} aria-label={label} onClick={onSelect}>
          {inner}
        </button>
        {onAcknowledge && cta.showButton && (
          <button
            type="button"
            className="dsd-surface-focus"
            style={{ ...dsdPillButtonStyle, marginTop: dsdSpace.xs, marginLeft: "2.25rem", opacity: cta.disabled ? 0.45 : 1 }}
            disabled={cta.disabled}
            aria-label={cta.ariaLabel}
            onClick={onAcknowledge}
          >
            {cta.buttonLabel}
          </button>
        )}
      </li>
    );
  }

  return (
    <li className="dsd-motion-safe" style={{ listStyle: "none", marginBottom: dsdDensity.queueGap }}>
      <div style={rowStyle} aria-label={label}>
        {inner}
      </div>
    </li>
  );
});

export type OperatorQueuePanelProps = {
  readonly snapshot: QueuePanelSnapshot;
  readonly patients?: Readonly<Record<string, PatientOperationalProjection>>;
  readonly selectedAlertId?: string | null;
  readonly onSelectAlert?: (alertId: string) => void;
  readonly onAcknowledgeAlert?: (alertId: string) => void;
  readonly variant?: "default" | "embedded";
};

export function OperatorQueuePanel({
  snapshot,
  patients = {},
  selectedAlertId,
  onSelectAlert,
  onAcknowledgeAlert,
  variant = "default",
}: OperatorQueuePanelProps) {
  const embedded = variant === "embedded";
  const truthOrderKey = useMemo(() => snapshot.truthQueueIds.join("|"), [snapshot.truthQueueIds]);
  const openCritical = useMemo(() => countOpenCritical(snapshot.alerts), [snapshot.alerts]);
  const truthCrit = useMemo(
    () => truthIsCriticalFlags(snapshot.truthQueueIds, snapshot.alerts),
    [snapshot.truthQueueIds, snapshot.alerts],
  );
  const emphasis = useMemo(
    () => classifyQueueEmphasis(snapshot.truthQueueIds, snapshot.alerts),
    [snapshot.truthQueueIds, snapshot.alerts],
  );

  const wardCensus = useMemo(() => computeWardCensus(patients, snapshot.alerts), [patients, snapshot.alerts]);
  const wardLine = useMemo(() => formatWardSituationLine(wardCensus), [wardCensus]);

  const { visibleIds, monitoringCount } = useMemo(
    () =>
      selectVisibleQueueIds({
        truthQueueIds: snapshot.truthQueueIds,
        alerts: snapshot.alerts,
        patients,
        emphasis,
        maxVisible: dsdDensity.maxVisibleQueueCards,
      }),
    [snapshot.truthQueueIds, snapshot.alerts, patients, emphasis],
  );

  const monitoringSummary = useMemo(
    () => computeCohortMonitoringSummary(patients, monitoringCount),
    [patients, monitoringCount],
  );
  const monitoringLines = useMemo(() => formatCohortMonitoringLines(monitoringSummary), [monitoringSummary]);

  const repeatSummaryCount = useMemo(() => {
    let n = 0;
    for (const id of snapshot.truthQueueIds) {
      const a = snapshot.alerts[id];
      if (!a) continue;
      if (rowEmphasisFor(id, a, emphasis) === "repeat") n++;
    }
    return n;
  }, [snapshot.truthQueueIds, snapshot.alerts, emphasis]);

  const lastCommitRef = useRef(typeof performance !== "undefined" ? performance.now() : 0);
  const [displayIds, setDisplayIds] = useState<string[]>(() => [...visibleIds]);
  const [reconcileGen, setReconcileGen] = useState(0);
  const [reconcilePulse, setReconcilePulse] = useState(0);
  const [lastReason, setLastReason] = useState<string>("aligned");
  const [reducedMotion, setReducedMotion] = useState(false);
  const reconcileGenRef = useRef(reconcileGen);
  reconcileGenRef.current = reconcileGen;

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useLayoutEffect(() => {
    setReconcileGen((g) => g + 1);
  }, [truthOrderKey]);

  useLayoutEffect(() => {
    if (!embedded) return;
    setDisplayIds([...visibleIds]);
  }, [embedded, visibleIds]);

  useLayoutEffect(() => {
    if (embedded) return;
    const now = performance.now();
    let nextReason = "aligned";
    setDisplayIds((prev) => {
      const r = resolveDisplayQueueForOperator({
        truthIds: snapshot.truthQueueIds,
        displayedIds: prev,
        truthIsCritical: truthCrit,
        openCriticalCount: openCritical,
        nowMs: now,
        lastDisplayCommitMs: lastCommitRef.current,
      });
      nextReason = r.reason;
      if (r.committedToTruth) lastCommitRef.current = now;
      const next = [...r.displayIds];
      if (next.length === prev.length && next.every((v, i) => v === prev[i])) return prev;
      return next;
    });
    setLastReason((prev) => (prev === nextReason ? prev : nextReason));
  }, [embedded, truthOrderKey, openCritical, truthCrit, snapshot.truthQueueIds, reconcilePulse]);

  const degraded = snapshot.degradedMode !== "HEALTHY";
  const interactionLocked = degraded;

  const ackAttempt = useCallback(
    (alertId: string, genAtPaint: number) => {
      if (interactionLocked) return;
      if (reconcileGenRef.current !== genAtPaint) {
        window.alert("큐가 바뀌었습니다. 다시 선택한 뒤 조치하세요.");
        return;
      }
      onAcknowledgeAlert?.(alertId);
    },
    [interactionLocked, onAcknowledgeAlert],
  );

  const renderRow = (id: string, i: number, selectable: boolean) => {
    const a = snapshot.alerts[id];
    if (!a) return null;
    const patient = patients[a.patientId];
    const rowEm = rowEmphasisFor(id, a, emphasis);
    if (rowEm === "repeat") return null;
    const tier = classifyQueueDisplayTier({
      alertSeverity: a.severity,
      alertLifecycle: a.lifecycle,
      patientStale: patient?.stale ?? "fresh",
      dynamicStatus: patient?.dynamicStatus ?? "",
      isPrimaryCritical: emphasis.primaryCritical.has(id),
    });
    return (
      <QueueRow
        key={id}
        alertId={id}
        alert={a}
        patient={patient}
        tier={tier}
        position={i}
        reducedMotion={reducedMotion}
        degraded={degraded}
        isPrimary={emphasis.primaryCritical.has(id)}
        selectable={selectable}
        isSelected={selectedAlertId === id}
        onSelect={selectable && onSelectAlert ? () => onSelectAlert(id) : undefined}
        onAcknowledge={
          onAcknowledgeAlert && a.lifecycle === "CREATED" ? () => ackAttempt(id, reconcileGen) : undefined
        }
      />
    );
  };

  const listIds = embedded ? visibleIds : displayIds;

  return (
    <section aria-labelledby="operator-queue-heading" className="dsd-operator-queue" style={{ marginBottom: dsdSpace.lg }}>
      <h2 id="operator-queue-heading" style={{ margin: "0 0 " + dsdSpace.sm + "px", ...dsdType.title, fontSize: 17 }}>
        {queueZoneTitle}
      </h2>

      <div role="status" aria-live="polite" style={dsdWardSummaryBarStyle()}>
        <p style={{ margin: 0, ...dsdType.section }}>{wardSituationTitle}</p>
        <p style={{ margin: dsdSpace.xs + "px 0 0", ...dsdType.bodySm }}>{wardLine}</p>
      </div>

      {degraded && (
        <div
          role="status"
          aria-live="polite"
          id="dsd-ack-lock-reason"
          style={{
            ...dsdSectionCardStyle,
            marginBottom: dsdSpace.md,
            borderColor: dsdTrust.reconnecting.borderColor,
            backgroundColor: dsdTrust.reconnecting.backgroundColor,
          }}
        >
          <p style={{ margin: 0, ...dsdType.bodySm, fontWeight: 600 }}>{degradedModeOperator(snapshot.degradedMode)}</p>
          <p style={{ margin: dsdSpace.sm + "px 0 0", ...dsdType.caption }}>{degradedReconnectLead}</p>
        </div>
      )}

      {embedded ? null : (
        <details style={{ marginBottom: dsdSpace.md }}>
          <summary className="dsd-surface-focus" style={{ ...dsdType.caption, cursor: "pointer" }}>
            동기화 시뮬레이터 (개발)
          </summary>
          <p style={{ ...dsdType.caption, margin: dsdSpace.sm + "px 0" }}>
            마지막 조정: {lastReason} · 세대 {reconcileGen}
          </p>
        </details>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: 520, overflow: "auto" }}>
        {listIds.map((id, i) => renderRow(id, i, !!onSelectAlert))}
      </ul>

      <div style={{ ...dsdCompactSummaryStyle(), marginTop: dsdSpace.md }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{monitoringLines[0]}</p>
        <ul style={{ margin: dsdSpace.xs + "px 0 0", paddingLeft: dsdSpace.lg, listStyle: "disc" }}>
          {monitoringLines.slice(1).map((line) => (
            <li key={line} style={{ marginBottom: 2 }}>
              {line}
            </li>
          ))}
        </ul>
        {repeatSummaryCount > 0 ? (
          <p style={{ margin: dsdSpace.xs + "px 0 0" }}>{repeatDetectionLabel(repeatSummaryCount)}</p>
        ) : null}
        {snapshot.truthQueueIds.length > visibleIds.length ? (
          <p style={{ margin: dsdSpace.xs + "px 0 0" }}>
            큐 {snapshot.truthQueueIds.length}건 중 {visibleIds.length}건 표시
          </p>
        ) : null}
      </div>
    </section>
  );
}
