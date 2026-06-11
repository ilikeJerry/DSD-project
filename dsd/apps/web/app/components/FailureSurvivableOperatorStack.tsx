"use client";

import type { DemoScenarioPhase } from "../../lib/operatorMicrocopy";
import type { OperationalShellSnapshot } from "../../lib/operationalShellSnapshot";
import {
  dsdBottomHairline,
  dsdDensity,
  dsdDetailCardVariant,
  dsdElevatedPanelStyle,
  dsdRadius,
  dsdSpace,
  dsdSticky,
  dsdSurfacePanelStyle,
  dsdTrustBadgeStyle,
  dsdTrustRegionStyle,
  dsdTrustStripTone,
  dsdType,
} from "../../lib/clinicalSurfaceTokens";
import {
  auditEventOperatorLabel,
  consoleTitle,
  countUnitSuffix,
  currentPhaseLabel,
  debugDetailsSummary,
  debugPatientIdLabel,
  debugRawEventLabel,
  debugSyncKeyLabel,
  detailActionLabel,
  detailAlertStateLabel,
  detailCardTitle,
  detailEmpty,
  detailEvidenceLabel,
  detailFreshnessLabel,
  detailRecommendedAction,
  detailSectionTitle,
  detailStaleSelection,
  formatPatientPrimaryLine,
  formatPhaseHeading,
  formatSeverityLifecycle,
  handoffStripTitle,
  kpiQueueReconcile,
  kpiQueueSkip,
  kpiRegionAriaLabel,
  kpiStaleDetect,
  mixedFreshnessSuffix,
  nextChangeLabel,
  openCriticalLabel,
  panelConfidenceLabel,
  patientActionLine,
  patientClinicalStatusLine,
  patientEvidenceLine,
  rowClinicianPrefix,
  queueWaitLabel,
  recoveryHeadline,
  skipToQueueLabel,
  staleChannelLabel,
  staleLevelOperator,
  stalePatientsLabel,
  timelineEmpty,
  timelineSectionTitle,
  trustDetailsLabel,
  trustRegionAriaLabel,
  unitLabel,
  unknownPatientLabel,
} from "../../lib/operatorMicrocopy";
import { OperatorQueuePanel } from "./OperatorQueuePanel";
import { memo, useLayoutEffect, useMemo, useState } from "react";

function countOpenCritical(alerts: OperationalShellSnapshot["alerts"]): number {
  return Object.values(alerts).filter(
    (a) => a.severity === "critical" && (a.lifecycle === "CREATED" || a.lifecycle === "ACKNOWLEDGED"),
  ).length;
}

function stalePatientLabels(
  patientIds: readonly string[],
  patients: OperationalShellSnapshot["patients"],
): string {
  return patientIds
    .map((id) => {
      const p = patients[id];
      return p ? formatPatientPrimaryLine(p.displayName) : unknownPatientLabel;
    })
    .join(", ");
}

const DetailCard = memo(function DetailCard({
  shell,
  alertId,
}: {
  readonly shell: OperationalShellSnapshot;
  readonly alertId: string | null;
}) {
  if (!alertId) {
    return (
      <div style={dsdDetailCardVariant.dashed}>
        <p style={{ margin: 0, ...dsdType.body, color: "var(--dsd-text-muted)" }}>{detailEmpty}</p>
      </div>
    );
  }
  const alert = shell.alerts[alertId];
  const patient = alert ? shell.patients[alert.patientId] : undefined;
  if (!alert || !patient) {
    return (
      <div role="alert" style={dsdDetailCardVariant.selectionError}>
        <p style={{ margin: 0, ...dsdType.bodySm }}>{detailStaleSelection}</p>
      </div>
    );
  }
  return (
    <div style={dsdDetailCardVariant.base}>
      <p style={{ ...dsdType.section, margin: "0 0 " + dsdSpace.sm + "px" }}>{detailCardTitle}</p>
      <p style={{ margin: "0 0 " + dsdSpace.xs + "px", ...dsdType.title, fontSize: 17 }}>
        {formatPatientPrimaryLine(patient.displayName)}
      </p>
      <p style={{ margin: "0 0 " + dsdSpace.xs + "px", ...dsdType.caption }}>
        {patientClinicalStatusLine(patient.dynamicStatus)}
      </p>
      <p style={{ margin: "0 0 " + dsdSpace.md + "px", ...dsdType.caption }}>
        {rowClinicianPrefix}: {patient.assignedClinician}
      </p>
      <dl
        style={{
          margin: 0,
          display: "grid",
          gridTemplateColumns: "7rem 1fr",
          gap: `${dsdSpace.xs}px ${dsdSpace.md}px`,
          ...dsdType.bodySm,
        }}
      >
        <dt style={{ color: "var(--dsd-text-muted)" }}>{detailEvidenceLabel}</dt>
        <dd style={{ margin: 0 }}>{patientEvidenceLine(patient.stale, patient.dynamicVitals)}</dd>
        <dt style={{ color: "var(--dsd-text-muted)" }}>{detailFreshnessLabel}</dt>
        <dd style={{ margin: 0 }}>{staleLevelOperator(patient.stale)}</dd>
        <dt style={{ color: "var(--dsd-text-muted)" }}>{detailAlertStateLabel}</dt>
        <dd style={{ margin: 0 }}>{formatSeverityLifecycle(alert.severity, alert.lifecycle)}</dd>
        <dt style={{ color: "var(--dsd-text-muted)" }}>{detailActionLabel}</dt>
        <dd style={{ margin: 0 }}>
          {patientActionLine(patient.recommendedAction) || detailRecommendedAction(alert.lifecycle)}
        </dd>
      </dl>
      <p style={{ ...dsdType.caption, margin: `${dsdSpace.md}px 0 0` }}>{shell.trust.queueRecoveryNarrative}</p>
      <details style={{ marginTop: dsdSpace.md }}>
        <summary style={{ ...dsdType.caption, cursor: "pointer" }}>{debugDetailsSummary}</summary>
        <p style={{ ...dsdType.caption, margin: dsdSpace.sm + "px 0 0" }}>
          {debugPatientIdLabel}: {patient.id}
        </p>
        <p style={{ ...dsdType.caption, margin: dsdSpace.xs + "px 0 0", wordBreak: "break-all" }}>
          {debugSyncKeyLabel}: {shell.trust.syncVersionKey}
        </p>
        <p style={{ ...dsdType.caption, margin: dsdSpace.xs + "px 0 0" }}>{shell.trust.recoveryTimelineLabel}</p>
      </details>
    </div>
  );
});

export function FailureSurvivableOperatorStack({
  shell,
  onAcknowledgeAlert,
  demoPhase,
  demoMode = false,
}: {
  readonly shell: OperationalShellSnapshot;
  readonly onAcknowledgeAlert?: (alertId: string) => void;
  readonly demoPhase?: DemoScenarioPhase;
  readonly demoMode?: boolean;
}) {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(() => shell.truthQueueIds[0] ?? null);

  useLayoutEffect(() => {
    setSelectedAlertId((s) => {
      if (s && shell.alerts[s]) return s;
      return shell.truthQueueIds[0] ?? null;
    });
  }, [shell.trust.syncVersionKey, shell.truthQueueIds, shell.alerts]);

  const openCritical = useMemo(() => countOpenCritical(shell.alerts), [shell.alerts]);
  const staleCount = shell.trust.partialStalePatientIds.length;
  const queueLen = shell.truthQueueIds.length;
  const operatorTimeline = useMemo(
    () => shell.auditTailTypes.map((t) => auditEventOperatorLabel(t)),
    [shell.auditTailTypes],
  );

  const strip = dsdTrustStripTone(shell.trust.panelConfidence);

  const kpiCards = [
    { label: kpiQueueReconcile, value: shell.observability.queueReconciliationBursts },
    { label: kpiQueueSkip, value: shell.observability.queueReconcileSkipsUnchanged },
    { label: kpiStaleDetect, value: `${shell.observability.staleDetections} / ${shell.observability.staleClears}` },
  ];

  return (
    <section
      style={{ position: "relative", marginBottom: dsdDensity.sectionGap }}
      aria-label="Clinical command-center surface"
    >
      <a href="#dsd-command-queue" className="dsd-skip-link dsd-surface-focus">
        {skipToQueueLabel}
      </a>

      {demoPhase && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginBottom: dsdSpace.lg,
            padding: dsdSpace.md,
            borderRadius: dsdRadius.md,
            backgroundColor: "var(--dsd-elevated)",
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "var(--dsd-border)",
          }}
        >
          <p style={{ margin: 0, ...dsdType.section }}>
            {formatPhaseHeading(currentPhaseLabel, demoPhase.title)}
          </p>
          <p style={{ margin: dsdSpace.xs + "px 0 0", ...dsdType.body, fontWeight: 500 }}>{demoPhase.beat}</p>
          <p style={{ margin: dsdSpace.xs + "px 0 0", ...dsdType.caption, color: "var(--dsd-text-muted)" }}>
            {nextChangeLabel}: {demoPhase.nextHint}
          </p>
        </div>
      )}

      <div
        style={{
          position: "sticky",
          top: dsdSticky.top,
          zIndex: dsdSticky.zIndex,
          backgroundColor: "var(--dsd-bg)",
          paddingBottom: dsdSpace.sm,
          marginBottom: dsdSpace.lg,
          ...dsdBottomHairline(),
        }}
      >
        <header
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: dsdSpace.lg,
            paddingBottom: dsdSpace.md,
          }}
        >
          <div>
            <p style={{ ...dsdType.section, marginBottom: dsdSpace.xs }}>{unitLabel}</p>
            <h1 style={{ margin: 0, ...dsdType.title }}>{consoleTitle}</h1>
          </div>
          <div style={{ ...dsdTrustBadgeStyle(strip), ...dsdType.bodySm, fontWeight: 600 }} role="status">
            {panelConfidenceLabel(shell.trust.panelConfidence)}
          </div>
        </header>

        <div role="region" aria-label={trustRegionAriaLabel} style={{ marginTop: dsdSpace.sm, ...dsdTrustRegionStyle(strip) }}>
          <p style={{ margin: "0 0 " + dsdSpace.xs + "px", ...dsdType.body, fontWeight: 500 }}>
            {recoveryHeadline(shell.trust.panelConfidence)}
          </p>
          {demoMode ? (
            <p style={{ margin: 0, ...dsdType.caption }}>{demoPhase?.beat ?? recoveryHeadline(shell.trust.panelConfidence)}</p>
          ) : (
            <p style={{ margin: 0, ...dsdType.caption }}>{shell.trust.staleHierarchySummary}</p>
          )}
          {shell.trust.partialStalePatientIds.length > 0 && (
            <p style={{ margin: dsdSpace.sm + "px 0 0", ...dsdType.caption }}>
              {stalePatientsLabel}: {stalePatientLabels(shell.trust.partialStalePatientIds, shell.patients)}
              {shell.trust.hasMixedFreshness ? mixedFreshnessSuffix : ""}
            </p>
          )}
          {!demoMode && (
            <details style={{ marginTop: dsdSpace.sm }}>
              <summary className="dsd-surface-focus" style={{ ...dsdType.caption, cursor: "pointer" }}>
                {trustDetailsLabel}
              </summary>
              <p style={{ ...dsdType.caption, margin: dsdSpace.sm + "px 0 0" }}>{shell.trust.recoveryTimelineLabel}</p>
              <p style={{ ...dsdType.caption, margin: dsdSpace.xs + "px 0 0" }}>
                {shell.observability.operatorFacingSummary}
              </p>
            </details>
          )}
        </div>
      </div>

      <div role="region" aria-label={handoffStripTitle} style={{ marginBottom: dsdSpace.lg, ...dsdSurfacePanelStyle() }}>
        <div style={{ ...dsdType.section, marginBottom: dsdSpace.sm }}>{handoffStripTitle}</div>
        <ul style={{ margin: 0, paddingLeft: dsdSpace.lg, ...dsdType.bodySm, color: "var(--dsd-text-muted)" }}>
          <li>
            {openCriticalLabel}: {openCritical}
            {countUnitSuffix}
          </li>
          <li>
            {queueWaitLabel}: {queueLen}
            {countUnitSuffix}
          </li>
          <li>
            {staleChannelLabel}: {staleCount}
            {countUnitSuffix}
          </li>
        </ul>
      </div>

      {demoMode ? (
        <details style={{ marginBottom: dsdSpace.xl }}>
          <summary className="dsd-surface-focus" style={{ ...dsdType.caption, cursor: "pointer" }}>
            {debugDetailsSummary}
          </summary>
          <div role="region" aria-label={kpiRegionAriaLabel} className="dsd-kpi-grid" style={{ marginTop: dsdSpace.md }}>
            {kpiCards.map((k) => (
              <div key={k.label} style={dsdElevatedPanelStyle()}>
                <div style={{ ...dsdType.section, marginBottom: dsdSpace.xs }}>{k.label}</div>
                <div style={{ ...dsdType.kpi }}>{k.value}</div>
              </div>
            ))}
          </div>
        </details>
      ) : (
        <div role="region" aria-label={kpiRegionAriaLabel} className="dsd-kpi-grid" style={{ marginBottom: dsdSpace.xl }}>
          {kpiCards.map((k) => (
            <div key={k.label} style={dsdElevatedPanelStyle()}>
              <div style={{ ...dsdType.section, marginBottom: dsdSpace.xs }}>{k.label}</div>
              <div style={{ ...dsdType.kpi }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="dsd-main-grid">
        <div id="dsd-command-queue" style={{ minWidth: 0, scrollMarginTop: dsdSpace.xl }}>
          <OperatorQueuePanel
            variant="embedded"
            snapshot={shell}
            patients={shell.patients}
            selectedAlertId={selectedAlertId}
            onSelectAlert={setSelectedAlertId}
            onAcknowledgeAlert={onAcknowledgeAlert}
          />
        </div>
        <aside style={{ display: "flex", flexDirection: "column", gap: dsdSpace.lg, minWidth: 0 }}>
          <section aria-label={timelineSectionTitle} style={dsdSurfacePanelStyle()}>
            <h3 style={{ margin: "0 0 " + dsdSpace.sm + "px", ...dsdType.section }}>{timelineSectionTitle}</h3>
            {operatorTimeline.length === 0 ? (
              <p style={{ margin: 0, ...dsdType.caption }}>{timelineEmpty}</p>
            ) : (
              <ol
                style={{
                  margin: 0,
                  paddingLeft: dsdSpace.lg,
                  maxHeight: dsdDensity.maxQueueRowsVisible * 22,
                  overflow: "auto",
                  ...dsdType.caption,
                }}
              >
                {operatorTimeline.map((label, i) => (
                  <li key={`${label}-${i}`} style={{ marginBottom: dsdSpace.xs }}>
                    {label}
                  </li>
                ))}
              </ol>
            )}
            {shell.auditTailTypes.length > 0 && (
              <details style={{ marginTop: dsdSpace.sm }}>
                <summary style={{ ...dsdType.caption, cursor: "pointer" }}>{debugDetailsSummary}</summary>
                <ul style={{ ...dsdType.caption, margin: dsdSpace.xs + "px 0 0", paddingLeft: dsdSpace.lg }}>
                  {shell.auditTailTypes.map((t, i) => (
                    <li key={`raw-${t}-${i}`}>
                      {debugRawEventLabel}: {t}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>
          <section aria-label={detailSectionTitle}>
            <h3 style={{ margin: "0 0 " + dsdSpace.sm + "px", ...dsdType.section }}>{detailSectionTitle}</h3>
            <DetailCard shell={shell} alertId={selectedAlertId} />
          </section>
        </aside>
      </div>
    </section>
  );
}
