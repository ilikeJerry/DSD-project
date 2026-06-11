"use client";

import {
  ClinicalRuntimeKernel,
  MOCK_COHORT_SIZE,
  bootstrapDemoPatient,
  createRespiratoryScenarioContext,
} from "@dsd/clinical-runtime";
import {
  assertReplaySameQueueHashes,
  extractQueueHashesFromTimeline,
  replayFromInitialState,
} from "@dsd/replay-runtime";
import { degradedBannerRequired, staleBannerRequired, verifyCriticalVisibilityInvariant } from "@dsd/ui-safety";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  dsdElevatedPanelStyle,
  dsdHairlineBorder,
  dsdPillButtonStyle,
  dsdRadius,
  dsdSectionCardStyle,
  dsdSpace,
  dsdSurface,
  dsdTrust,
  dsdType,
} from "../../lib/clinicalSurfaceTokens";
import {
  DEFAULT_DEMO_INTERVAL_MS,
  DEFAULT_DEMO_SEED,
  createDemoKernel,
  demoDisplayMode,
  initialDemoContext,
  newDemoSeed,
  runDemoSimulationTick,
  shellFromKernel,
  type DemoSimContext,
} from "../../lib/clientDemoSimulation";
import {
  auditEventOperatorLabel,
  auditSummaryLines,
  auditViewTitle,
  currentPhaseLabel,
  demoControlsSummary,
  demoFootDegradedBody,
  demoFootDegradedTitle,
  demoFootStaleBody,
  demoFootStaleTitle,
  demoIntroLine,
  demoPlayStatusLabel,
  degradedModeOperator,
  nextChangeLabel,
  type PresentationMode,
} from "../../lib/operatorMicrocopy";
import { FailureSurvivableOperatorStack } from "./FailureSurvivableOperatorStack";

const ACTOR = "charge-nurse-demo";

function nowIso(): string {
  return new Date().toISOString();
}

const controlButton = { ...dsdPillButtonStyle, cursor: "pointer" } as const;

function bootSession(seed: string, nowIso: string): { kernel: ClinicalRuntimeKernel; ctx: DemoSimContext } {
  const kernel = createDemoKernel(seed, nowIso);
  const ctx = initialDemoContext(seed, kernel, nowIso);
  return { kernel, ctx };
}

export function ClientDemoSimulation() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bootstrapNowRef = useRef(nowIso());

  const presentationMode: PresentationMode = "product";
  const [demoSeed, setDemoSeed] = useState(DEFAULT_DEMO_SEED);
  const [sessionKey, setSessionKey] = useState(0);
  const kernelRef = useRef<ClinicalRuntimeKernel | null>(null);
  const simCtxRef = useRef<DemoSimContext | null>(null);

  const initSession = useCallback((seed: string) => {
    const { kernel, ctx } = bootSession(seed, bootstrapNowRef.current);
    kernelRef.current = kernel;
    simCtxRef.current = ctx;
    return { kernel, ctx };
  }, []);

  const [{ kernel, ctx: initialCtx }] = useState(() => initSession(DEFAULT_DEMO_SEED));
  if (!simCtxRef.current) simCtxRef.current = initialCtx;

  const ensureKernel = useCallback((): ClinicalRuntimeKernel => {
    if (!kernelRef.current) {
      const booted = initSession(demoSeed);
      return booted.kernel;
    }
    return kernelRef.current;
  }, [demoSeed, initSession]);

  const [shell, setShell] = useState(() =>
    shellFromKernel(kernel, simCtxRef.current!.patientDynamics),
  );
  const [playing, setPlaying] = useState(true);
  const [scenarioPhase, setScenarioPhase] = useState(() => simCtxRef.current!.scenarioPhase);
  const [mode, setMode] = useState(() => demoDisplayMode(kernel.state));

  const syncFromKernel = useCallback((k: ClinicalRuntimeKernel, ctx: DemoSimContext) => {
    setShell(shellFromKernel(k, ctx.patientDynamics));
    setScenarioPhase(ctx.scenarioPhase);
    setMode(demoDisplayMode(k.state));
  }, []);

  const advanceTick = useCallback(() => {
    const k = ensureKernel();
    const nextCtx = runDemoSimulationTick(k, simCtxRef.current!, nowIso());
    simCtxRef.current = nextCtx;
    syncFromKernel(k, nextCtx);
  }, [ensureKernel, syncFromKernel]);

  const resetSimulation = useCallback(
    (seed: string = demoSeed) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      bootstrapNowRef.current = nowIso();
      const booted = initSession(seed);
      syncFromKernel(booted.kernel, booted.ctx);
      setSessionKey((n) => n + 1);
      setPlaying(true);
    },
    [demoSeed, initSession, syncFromKernel],
  );

  const regenerateSeed = useCallback(() => {
    const next = newDemoSeed();
    setDemoSeed(next);
    resetSimulation(next);
  }, [resetSimulation]);

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(advanceTick, DEFAULT_DEMO_INTERVAL_MS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [playing, advanceTick, sessionKey]);

  const onAcknowledgeAlert = useCallback(
    (alertId: string) => {
      const k = ensureKernel();
      const alert = k.state.alerts.get(alertId);
      if (!alert || alert.lifecycle !== "CREATED") return;
      k.acknowledgeAlert({
        alertId,
        actor: ACTOR,
        correlationId: `queue-ack-${simCtxRef.current!.tickIndex}`,
        nowIso: nowIso(),
      });
      syncFromKernel(k, simCtxRef.current!);
    },
    [ensureKernel, syncFromKernel],
  );

  const k = ensureKernel();
  const vis = verifyCriticalVisibilityInvariant(k.state);
  const seedCtx = createRespiratoryScenarioContext(demoSeed);
  const initial = bootstrapDemoPatient(seedCtx, bootstrapNowRef.current);
  const replay = replayFromInitialState(initial, k.audit.entries);
  const hashes = extractQueueHashesFromTimeline(k.audit.entries);
  const replayHashes = extractQueueHashesFromTimeline(replay.parsed);
  const replayHashesMatch = assertReplaySameQueueHashes(hashes, replayHashes);
  const queueParity = JSON.stringify(k.state.queueOrderIds) === JSON.stringify(replay.state.queueOrderIds);
  const tickIndex = simCtxRef.current?.tickIndex ?? 0;
  const phaseIndex = tickIndex % 8;
  const openCritical = [...k.state.alerts.values()].filter(
    (a) => a.severity === "critical" && (a.lifecycle === "CREATED" || a.lifecycle === "ACKNOWLEDGED"),
  ).length;
  const auditSummary = auditSummaryLines({
    auditCount: k.audit.entries.length,
    replayMatch: replayHashesMatch && queueParity,
    openCritical,
  });

  const footCard = { marginTop: dsdSpace.xl, ...dsdSectionCardStyle };

  return (
    <>
      <p style={{ ...dsdType.caption, margin: "0 0 " + dsdSpace.md + "px" }}>{demoIntroLine}</p>

      <div
        role="toolbar"
        aria-label="운영 시연 상태"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: dsdSpace.sm,
          alignItems: "center",
          marginBottom: dsdSpace.lg,
          padding: `${dsdSpace.xs}px ${dsdSpace.md}px`,
          borderRadius: dsdRadius.sm,
          backgroundColor: "var(--dsd-elevated)",
          ...dsdHairlineBorder("var(--dsd-border)"),
        }}
      >
        <span style={{ ...dsdType.caption, fontWeight: 600 }}>{demoPlayStatusLabel(playing)}</span>
        <button
          type="button"
          className="dsd-surface-focus"
          style={{ ...controlButton, fontSize: 12, padding: "2px 10px" }}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? "일시정지" : "시작"}
        </button>
        <details style={{ marginLeft: "auto" }}>
          <summary
            className="dsd-surface-focus"
            style={{ ...dsdType.caption, cursor: "pointer", listStylePosition: "inside" }}
          >
            {demoControlsSummary}
          </summary>
          <div style={{ marginTop: dsdSpace.sm, ...dsdElevatedPanelStyle(), minWidth: 280 }}>
            <p style={{ ...dsdType.caption, margin: 0 }}>
              tick {tickIndex} · phase {phaseIndex} · 간격 {DEFAULT_DEMO_INTERVAL_MS}ms
            </p>
            <p style={{ ...dsdType.caption, margin: dsdSpace.xs + "px 0 0" }}>
              {nextChangeLabel}: {scenarioPhase.nextHint}
            </p>
            <p style={{ ...dsdType.caption, margin: dsdSpace.xs + "px 0 0" }}>
              {currentPhaseLabel}: {scenarioPhase.title} · {scenarioPhase.beat}
            </p>
            <p style={{ ...dsdType.caption, margin: dsdSpace.xs + "px 0 0" }}>
              시드 {demoSeed} · 세션 {sessionKey} · 환자 {k.state.patients.size}/{MOCK_COHORT_SIZE}
            </p>
            <p style={{ ...dsdType.caption, margin: dsdSpace.xs + "px 0 0" }}>
              연결 {degradedModeOperator(k.state.degradedMode)} · 표시 {mode} · narrative {scenarioPhase.narrativeBundle}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: dsdSpace.sm, marginTop: dsdSpace.sm }}>
              <button type="button" className="dsd-surface-focus" style={controlButton} onClick={advanceTick}>
                한 단계 진행
              </button>
              <button type="button" className="dsd-surface-focus" style={controlButton} onClick={() => resetSimulation()}>
                재설정
              </button>
              <button type="button" className="dsd-surface-focus" style={controlButton} onClick={regenerateSeed}>
                시드 재생성
              </button>
            </div>
          </div>
        </details>
      </div>

      <FailureSurvivableOperatorStack
        shell={shell}
        onAcknowledgeAlert={onAcknowledgeAlert}
        demoPhase={scenarioPhase}
        presentationMode={presentationMode}
        degradedMode={k.state.degradedMode}
      />

      {degradedBannerRequired(k.state) && (
        <section
          role="status"
          style={{
            ...footCard,
            borderColor: dsdTrust.reconnecting.borderColor,
            backgroundColor: dsdTrust.reconnecting.backgroundColor,
          }}
        >
          <strong style={dsdType.bodySm}>{demoFootDegradedTitle}</strong>
          <p style={{ ...dsdType.caption, margin: "8px 0 0" }}>{demoFootDegradedBody(k.state.degradedMode)}</p>
        </section>
      )}

      {staleBannerRequired(k.state) && (
        <section
          role="status"
          style={{
            ...footCard,
            marginTop: dsdSpace.md,
            borderColor: dsdTrust.stale.borderColor,
            backgroundColor: dsdTrust.stale.backgroundColor,
          }}
        >
          <strong style={dsdType.bodySm}>{demoFootStaleTitle}</strong>
          <p style={{ ...dsdType.caption, margin: "8px 0 0" }}>{demoFootStaleBody}</p>
        </section>
      )}

      <details style={{ ...footCard, marginTop: dsdSpace.xxl }}>
        <summary style={{ ...dsdType.caption, cursor: "pointer", fontWeight: 600 }}>{auditViewTitle}</summary>
        <ul style={{ ...dsdType.caption, margin: dsdSpace.md + "px 0 0", paddingLeft: dsdSpace.lg, lineHeight: 1.6 }}>
          {auditSummary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <details style={{ marginTop: dsdSpace.md }}>
          <summary style={{ ...dsdType.caption, cursor: "pointer" }}>감사 로그 (raw)</summary>
          <p style={{ ...dsdType.caption, margin: dsdSpace.sm + "px 0 0" }}>총 {k.audit.entries.length}건</p>
          <ol style={{ ...dsdType.caption, lineHeight: 1.5, paddingLeft: dsdSpace.lg }}>
            {k.audit.entries.slice(-12).map((e) => (
              <li key={e.eventId}>
                {auditEventOperatorLabel(e.type)} · {e.correlationId}
              </li>
            ))}
          </ol>
        </details>
        <details style={{ marginTop: dsdSpace.md }}>
          <summary style={{ ...dsdType.caption, cursor: "pointer" }}>리플레이</summary>
          <p style={{ ...dsdType.caption, margin: dsdSpace.sm + "px 0 0" }}>
            해시 일치: {String(replayHashesMatch)} · 불일치: {replay.mismatches.join(", ") || "없음"} · 큐 동일:{" "}
            {String(queueParity)}
          </p>
          <p style={{ ...dsdType.caption, margin: dsdSpace.xs + "px 0 0" }}>
            위급 가시성: {vis.ok ? "정상" : "위반"} · 열린 위급 {vis.openCriticalCount}
          </p>
        </details>
        <details style={{ marginTop: dsdSpace.md }}>
          <summary style={{ ...dsdType.caption, cursor: "pointer" }}>텔레메트리</summary>
          <pre
            style={{
              ...dsdType.caption,
              overflow: "auto",
              margin: dsdSpace.sm + "px 0 0",
              padding: dsdSpace.md,
              borderRadius: dsdRadius.sm,
              backgroundColor: dsdSurface.detailCardBackground,
              ...dsdHairlineBorder(dsdSurface.detailCardBorder),
            }}
          >
            {JSON.stringify(k.telemetry.snapshot(), null, 2)}
          </pre>
        </details>
      </details>
    </>
  );
}
