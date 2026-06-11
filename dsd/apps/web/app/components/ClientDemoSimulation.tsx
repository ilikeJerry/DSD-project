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
  currentPhaseLabel,
  debugDetailsSummary,
  debugRawEventLabel,
  demoFootDegradedBody,
  demoFootDegradedTitle,
  demoFootStaleBody,
  demoFootStaleTitle,
  demoIntroLine,
  demoPlayStatusLabel,
  degradedModeOperator,
  nextChangeLabel,
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
  const patientCount = k.state.patients.size;

  const footCard = { marginTop: dsdSpace.xl, ...dsdSectionCardStyle };

  return (
    <>
      <p style={{ ...dsdType.caption, margin: "0 0 " + dsdSpace.md + "px" }}>{demoIntroLine}</p>

      <div
        role="toolbar"
        aria-label="데모 시뮬레이션 제어"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: dsdSpace.sm,
          alignItems: "center",
          marginBottom: dsdSpace.lg,
          ...dsdElevatedPanelStyle(),
        }}
      >
        <span style={{ ...dsdType.bodySm, fontWeight: 600, marginRight: dsdSpace.sm }}>
          {demoPlayStatusLabel(playing)}
        </span>
        <button type="button" className="dsd-surface-focus" style={controlButton} onClick={() => setPlaying((p) => !p)}>
          {playing ? "일시정지" : "시작"}
        </button>
        <button type="button" className="dsd-surface-focus" style={controlButton} onClick={advanceTick}>
          한 단계 진행
        </button>
        <button type="button" className="dsd-surface-focus" style={controlButton} onClick={() => resetSimulation()}>
          재설정
        </button>
        <span style={{ ...dsdType.caption, color: "var(--dsd-text-muted)" }}>
          seed: <code>{demoSeed}</code>
        </span>
        <button type="button" className="dsd-surface-focus" style={controlButton} onClick={regenerateSeed}>
          seed 변경
        </button>
        <span style={{ ...dsdType.bodySm, flex: "1 1 auto", minWidth: 200 }}>
          {currentPhaseLabel}: <strong>{scenarioPhase.title}</strong>
        </span>
        <span style={{ ...dsdType.caption, color: "var(--dsd-text-muted)" }}>
          {nextChangeLabel}: {scenarioPhase.nextHint}
        </span>
        <details style={{ flex: "1 1 100%" }}>
          <summary style={{ ...dsdType.caption, cursor: "pointer" }}>{debugDetailsSummary}</summary>
          <p style={{ ...dsdType.caption, margin: dsdSpace.xs + "px 0 0" }}>
            tick {simCtxRef.current?.tickIndex ?? 0} · 간격 {DEFAULT_DEMO_INTERVAL_MS}ms · 세션 {sessionKey} · 환자{" "}
            {patientCount}/{MOCK_COHORT_SIZE}
          </p>
          <p style={{ ...dsdType.caption, margin: dsdSpace.xs + "px 0 0" }}>
            연결 모드: {degradedModeOperator(k.state.degradedMode)} · 표시 모드 {mode}
          </p>
        </details>
      </div>

      <FailureSurvivableOperatorStack
        shell={shell}
        onAcknowledgeAlert={onAcknowledgeAlert}
        demoPhase={scenarioPhase}
        demoMode
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

      <details style={{ ...footCard, marginTop: dsdSpace.lg }}>
        <summary style={{ ...dsdType.section, cursor: "pointer" }}>{debugDetailsSummary}</summary>
        <section style={{ marginTop: dsdSpace.md }}>
          <h3 style={dsdType.section}>위급 가시성</h3>
          <p style={dsdType.caption}>
            상태: {vis.ok ? "정상" : "위반"} · 열린 위급 {vis.openCriticalCount}
            {vis.violations.length > 0 ? ` · ${vis.violations.join(", ")}` : ""}
          </p>
        </section>
        <section style={{ marginTop: dsdSpace.md }}>
          <h3 style={dsdType.section}>감사 로그 (raw)</h3>
          <p style={dsdType.caption}>총 {k.audit.entries.length}건</p>
          <ol style={{ ...dsdType.caption, lineHeight: 1.5, paddingLeft: dsdSpace.lg }}>
            {k.audit.entries.slice(-12).map((e) => (
              <li key={e.eventId}>
                {auditEventOperatorLabel(e.type)} · {debugRawEventLabel}: {e.type} · {e.correlationId}
              </li>
            ))}
          </ol>
        </section>
        <section style={{ marginTop: dsdSpace.md }}>
          <h3 style={dsdType.section}>리플레이</h3>
          <p style={dsdType.caption}>
            해시 일치: {String(replayHashesMatch)} · 불일치: {replay.mismatches.join(", ") || "없음"} · 큐 동일:{" "}
            {String(queueParity)}
          </p>
        </section>
        <section style={{ marginTop: dsdSpace.md }}>
          <h3 style={dsdType.section}>텔레메트리</h3>
          <pre
            style={{
              ...dsdType.caption,
              overflow: "auto",
              padding: dsdSpace.md,
              borderRadius: dsdRadius.sm,
              backgroundColor: dsdSurface.detailCardBackground,
              ...dsdHairlineBorder(dsdSurface.detailCardBorder),
            }}
          >
            {JSON.stringify(k.telemetry.snapshot(), null, 2)}
          </pre>
        </section>
      </details>
    </>
  );
}
