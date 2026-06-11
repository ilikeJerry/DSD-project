"use client";

import {
  RECONNECT_GRACE_MIN_MS,
  RECONNECT_TRUST_PHASES,
  TRUST_RESTORATION_NUDGE_MS,
  resolveDisplayQueueForOperator,
} from "@dsd/ui-safety";
import type { QueuePanelSnapshot } from "../../lib/queueSnapshot";
import type { PatientOperationalProjection } from "../../lib/operationalShellSnapshot";
import {
  dsdDensity,
  dsdPillButtonStyle,
  dsdQueueRowStyle,
  dsdSectionCardStyle,
  dsdSpace,
  dsdTrust,
  dsdType,
} from "../../lib/clinicalSurfaceTokens";
import {
  ackDisabledReason,
  degradedModeOperator,
  degradedReconnectLead,
  formatPatientPrimaryLine,
  lifecycleShort,
  patientActionLine,
  patientClinicalStatusLine,
  patientEvidenceLine,
  queueDisplayCaption,
  queueRowCta,
  queueTruthCaption,
  queueZoneTitle,
  repeatDetectionLabel,
  rowActionPrefix,
  rowClinicianPrefix,
  rowEvidencePrefix,
  rowPatientPrefix,
  rowStatusPrefix,
  severityShort,
  unknownPatientLabel,
} from "../../lib/operatorMicrocopy";
import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

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

function repeatCountByPatient(
  truthQueueIds: readonly string[],
  alerts: QueuePanelSnapshot["alerts"],
): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();
  for (const id of truthQueueIds) {
    const a = alerts[id];
    if (!a) continue;
    counts.set(a.patientId, (counts.get(a.patientId) ?? 0) + 1);
  }
  return counts;
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

type RowProps = {
  readonly alertId: string;
  readonly alert: NonNullable<QueuePanelSnapshot["alerts"][string]>;
  readonly patient?: PatientOperationalProjection;
  readonly severity: string;
  readonly lifecycle: string;
  readonly position: number;
  readonly reducedMotion: boolean;
  readonly emphasis: RowEmphasis;
  readonly degraded: boolean;
  readonly repeatCount: number;
  readonly selectable?: boolean;
  readonly isSelected?: boolean;
  readonly onSelect?: () => void;
  readonly onAcknowledge?: () => void;
};

const QueueRow = memo(function QueueRow({
  patient,
  severity,
  lifecycle,
  position,
  reducedMotion,
  emphasis,
  degraded,
  repeatCount,
  selectable,
  isSelected,
  onSelect,
  onAcknowledge,
}: RowProps) {
  const isRepeat = emphasis === "repeat";
  const displaySeverity = isRepeat ? "default" : severity;
  const rowOpacity = emphasis === "primary" ? 1 : emphasis === "secondary" ? 0.82 : 0.58;
  const rowStyle = {
    ...dsdQueueRowStyle(displaySeverity, !!isSelected && !isRepeat, reducedMotion),
    opacity: rowOpacity,
    cursor: selectable && !isRepeat ? ("pointer" as const) : undefined,
  };
  const primaryLine = patient ? formatPatientPrimaryLine(patient.displayName) : unknownPatientLabel;
  const cta = queueRowCta({
    lifecycle,
    degraded,
    isPrimaryCritical: emphasis === "primary",
  });

  const inner = isRepeat ? (
    <>
      <span style={{ ...dsdType.caption, opacity: 0.8, fontVariantNumeric: "tabular-nums" }}>{position + 1}</span>
      <span style={dsdType.bodySm}>
        <span style={{ fontWeight: 600 }}>{primaryLine}</span>
        <span style={{ display: "block", color: "var(--dsd-text-subtle)", marginTop: 2, ...dsdType.caption }}>
          {repeatDetectionLabel(repeatCount)}
        </span>
      </span>
      <span style={{ ...dsdType.caption, whiteSpace: "nowrap", textAlign: "right", color: "var(--dsd-text-muted)" }}>
        {severityShort(severity)} · {lifecycleShort(lifecycle)}
      </span>
    </>
  ) : (
    <>
      <span style={{ ...dsdType.caption, opacity: 0.8, fontVariantNumeric: "tabular-nums" }}>{position + 1}</span>
      <span style={dsdType.bodySm}>
        <span style={{ fontWeight: emphasis === "primary" ? 700 : 600 }}>
          {rowPatientPrefix}: {primaryLine}
        </span>
        <span style={{ display: "block", color: "var(--dsd-text-subtle)", marginTop: 2, ...dsdType.caption }}>
          {rowStatusPrefix}: {patientClinicalStatusLine(patient?.dynamicStatus)}
        </span>
        <span style={{ display: "block", color: "var(--dsd-text-subtle)", marginTop: 2, ...dsdType.caption }}>
          {rowEvidencePrefix}:{" "}
          {patient
            ? patientEvidenceLine(patient.stale, patient.dynamicVitals)
            : patientEvidenceLine("fresh")}
        </span>
        {patient && (
          <span style={{ display: "block", color: "var(--dsd-text-subtle)", marginTop: 2, ...dsdType.caption }}>
            {rowClinicianPrefix}: {patient.assignedClinician}
          </span>
        )}
      </span>
      <span style={{ ...dsdType.caption, whiteSpace: "nowrap", textAlign: "right" }}>
        {severityShort(severity)} · {lifecycleShort(lifecycle)}
        <span style={{ display: "block", marginTop: 2, color: "var(--dsd-text-muted)" }}>
          {rowActionPrefix}: {patientActionLine(patient?.recommendedAction) || cta.actionLabel}
        </span>
      </span>
    </>
  );

  const label = isRepeat
    ? `${primaryLine}, ${repeatDetectionLabel(repeatCount)}, 순위 ${position + 1}`
    : `${primaryLine}, ${severityShort(severity)}, ${lifecycleShort(lifecycle)}, 순위 ${position + 1}`;

  if (selectable && onSelect && !isRepeat) {
    return (
      <li className="dsd-motion-safe" style={{ listStyle: "none", marginBottom: dsdDensity.queueGap }}>
        <button
          type="button"
          className="dsd-motion-safe dsd-surface-focus"
          style={rowStyle}
          aria-selected={isSelected}
          aria-label={label}
          onClick={onSelect}
        >
          {inner}
        </button>
      </li>
    );
  }

  return (
    <li className="dsd-motion-safe" style={{ listStyle: "none", marginBottom: dsdDensity.queueGap }}>
      <div style={rowStyle} aria-label={label}>
        {inner}
      </div>
      {!isRepeat && onAcknowledge && cta.showButton && (
        <button
          type="button"
          className="dsd-surface-focus"
          style={{
            ...dsdPillButtonStyle,
            marginTop: dsdSpace.xs,
            marginLeft: "2rem",
            opacity: cta.disabled ? 0.45 : 1,
            cursor: cta.disabled ? "not-allowed" : "pointer",
          }}
          disabled={cta.disabled}
          aria-label={cta.ariaLabel}
          onClick={onAcknowledge}
        >
          {cta.buttonLabel}
        </button>
      )}
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
  const patientRepeatCounts = useMemo(
    () => repeatCountByPatient(snapshot.truthQueueIds, snapshot.alerts),
    [snapshot.truthQueueIds, snapshot.alerts],
  );

  const lastCommitRef = useRef(typeof performance !== "undefined" ? performance.now() : 0);
  const [displayIds, setDisplayIds] = useState<string[]>(() => [...snapshot.truthQueueIds]);
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
  }, [truthOrderKey, openCritical, truthCrit, snapshot.truthQueueIds, reconcilePulse]);

  const degraded = snapshot.degradedMode !== "HEALTHY";
  const interactionLocked = degraded;

  const ackAttempt = useCallback(
    (alertId: string, genAtPaint: number) => {
      if (interactionLocked) return;
      if (reconcileGenRef.current !== genAtPaint) {
        window.alert("큐가 바뀌었습니다. 다시 선택한 뒤 조치하세요.");
        return;
      }
      if (onAcknowledgeAlert) {
        onAcknowledgeAlert(alertId);
        return;
      }
      window.alert("인지 처리되었습니다.");
    },
    [interactionLocked, onAcknowledgeAlert],
  );

  const renderRow = (id: string, i: number, selectable: boolean) => {
    const a = snapshot.alerts[id];
    if (!a) return null;
    const rowEm = rowEmphasisFor(id, a, emphasis);
    const repeatCount = patientRepeatCounts.get(a.patientId) ?? 1;
    return (
      <QueueRow
        key={id}
        alertId={id}
        alert={a}
        patient={patients[a.patientId]}
        severity={a.severity}
        lifecycle={a.lifecycle}
        position={i}
        reducedMotion={reducedMotion}
        emphasis={rowEm}
        degraded={degraded}
        repeatCount={repeatCount}
        selectable={selectable}
        isSelected={selectedAlertId === id}
        onSelect={selectable && onSelectAlert ? () => onSelectAlert(id) : undefined}
        onAcknowledge={
          onAcknowledgeAlert && a.lifecycle === "CREATED" ? () => ackAttempt(id, reconcileGen) : undefined
        }
      />
    );
  };

  return (
    <section aria-labelledby="operator-queue-heading" className="dsd-operator-queue" style={{ marginBottom: dsdSpace.lg }}>
      <h2 id="operator-queue-heading" style={{ margin: "0 0 " + dsdSpace.md + "px", ...dsdType.title, fontSize: 17 }}>
        {queueZoneTitle}
      </h2>
      {!embedded && (
        <p style={{ ...dsdType.caption, margin: "0 0 " + dsdSpace.md + "px", maxWidth: 640 }}>
          위급 알림은 권위 순서를 따릅니다. 동일 환자 반복 알림은 낮은 강조로 표시됩니다.
        </p>
      )}

      {degraded && (
        <div
          role="status"
          aria-live="polite"
          id="dsd-ack-lock-reason"
          aria-busy="true"
          className="dsd-motion-safe"
          style={{
            ...dsdSectionCardStyle,
            marginBottom: dsdSpace.md,
            borderColor: dsdTrust.reconnecting.borderColor,
            backgroundColor: dsdTrust.reconnecting.backgroundColor,
          }}
        >
          <p style={{ margin: 0, ...dsdType.bodySm, fontWeight: 600 }}>
            {degradedModeOperator(snapshot.degradedMode)}
          </p>
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
            {openCritical > 0 ? ` · 열린 위급 ${openCritical}건` : ""}
          </p>
          <p style={{ ...dsdType.caption, margin: 0 }}>
            단계: {RECONNECT_TRUST_PHASES.join(" → ")} · 유예 {RECONNECT_GRACE_MIN_MS}ms · 복구 안내{" "}
            {TRUST_RESTORATION_NUDGE_MS}ms
          </p>
        </details>
      )}

      <div className="dsd-queue-split">
        <div>
          <h3 style={{ margin: "0 0 " + dsdSpace.sm + "px", ...dsdType.section }}>{queueTruthCaption}</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: 480, overflow: "auto" }}>
            {snapshot.truthQueueIds.map((id, i) => renderRow(id, i, !!onSelectAlert))}
          </ul>
        </div>
        <div>
          <h3 style={{ margin: "0 0 " + dsdSpace.sm + "px", ...dsdType.section }}>{queueDisplayCaption}</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: 480, overflow: "auto" }}>
            {displayIds.map((id, i) => renderRow(id, i, false))}
          </ul>
        </div>
      </div>
    </section>
  );
}
