/** Operator-facing strings — operational meaning over engineering terms. */

export const UNKNOWN_STATE_LABEL = "상태 확인 필요";

export const DEMO_PATIENT_CLINICAL_CONTEXT = "호흡 악화 관찰 중";

export const rowClinicianPrefix = "담당";

export type DemoScenarioPhase = {
  readonly title: string;
  readonly nextHint: string;
  readonly beat: string;
  readonly narrativeBundle: string;
};

/** 8-beat clinical narrative — aligns with tickIndex % 8 */
export const DEMO_SCENARIO_PHASES: readonly DemoScenarioPhase[] = [
  {
    title: "안정 감시",
    nextHint: "호흡 악화 감지",
    beat: "병실 채널이 안정적으로 동기화되어 있습니다. 루틴 감시를 유지하세요.",
    narrativeBundle: "병동 전반 안정 감시",
  },
  {
    title: "호흡 악화 감지",
    nextHint: "위급 알림 생성",
    beat: "SpO₂ 하락과 호흡수 변화가 관찰되었습니다. 환자 상태를 확인하세요.",
    narrativeBundle: "ICU 악화 집중",
  },
  {
    title: "위급 알림 생성",
    nextHint: "우선순위 상단 이동",
    beat: "위급 알림이 생성되었습니다. 즉시 임상 판단이 필요합니다.",
    narrativeBundle: "야간 교대 전 위험 재정렬",
  },
  {
    title: "우선순위 상단 이동",
    nextHint: "재연결 제한 모드",
    beat: "위급 알림이 우선순위 큐 최상단으로 올라갔습니다.",
    narrativeBundle: "야간 교대 전 위험 재정렬",
  },
  {
    title: "재연결 제한 모드",
    nextHint: "데이터 지연 확인",
    beat: "재연결 중입니다. 동기화가 끝나면 조작이 다시 허용됩니다.",
    narrativeBundle: "제한 모드 복구 중",
  },
  {
    title: "데이터 지연 확인",
    nextHint: "인지 및 조치 대기",
    beat: "일부 생체 채널이 지연되었습니다. SpO₂·호흡 맥락을 확인한 뒤 인지하세요.",
    narrativeBundle: "Ward 데이터 지연",
  },
  {
    title: "인지 및 조치 대기",
    nextHint: "회복 확인",
    beat: "제한 모드입니다. 인지 후 필요한 조치를 진행하세요.",
    narrativeBundle: "제한 모드 복구 중",
  },
  {
    title: "회복 확인",
    nextHint: "안정 감시",
    beat: "동기화가 회복되었습니다. 환자 상태를 재평가합니다.",
    narrativeBundle: "ER 회복 관찰",
  },
] as const;

export function demoScenarioPhase(tickIndex: number): DemoScenarioPhase {
  const i = ((tickIndex % DEMO_SCENARIO_PHASES.length) + DEMO_SCENARIO_PHASES.length) % DEMO_SCENARIO_PHASES.length;
  return DEMO_SCENARIO_PHASES[i]!;
}

export function demoPlayStatusLabel(playing: boolean): string {
  return playing ? "자동 시연 중" : "일시정지";
}

function safeLookup<T extends string>(map: Readonly<Record<string, T>>, key: string, fallback: T): T {
  return map[key] ?? fallback;
}

const AUDIT_EVENT_LABELS: Readonly<Record<string, string>> = {
  VITAL_UPDATED: "산소포화도 변화 감지",
  RULE_FIRED: "위급 기준 충족",
  ALERT_CREATED: "위급 알림 생성",
  QUEUE_RECOMPUTED: "우선순위 큐 갱신",
  STALE_DETECTED: "데이터 지연 감지",
  STALE_CLEARED: "데이터 지연 해제",
  DEGRADED_ENTER: "제한 모드 진입",
  DEGRADED_EXIT: "제한 모드 해제",
  ALERT_ACKED: "알림 인지 완료",
  ALERT_RESOLVE_REQUESTED: "조치 완료 요청",
  ALERT_RESOLVED: "조치 완료",
  ALERT_SUPPRESSED: "알림 억제",
};

/** Operator timeline — never raw event type on main surface */
export function auditEventOperatorLabel(type: string): string {
  return safeLookup(AUDIT_EVENT_LABELS, type, UNKNOWN_STATE_LABEL);
}

const SEVERITY_LABELS: Readonly<Record<string, string>> = {
  critical: "위급",
  major: "주의",
  warning: "주의",
};

export function severityShort(severity: string): string {
  return safeLookup(SEVERITY_LABELS, severity, UNKNOWN_STATE_LABEL);
}

const LIFECYCLE_LABELS: Readonly<Record<string, string>> = {
  CREATED: "신규",
  ACKNOWLEDGED: "인지됨",
  RESOLVED: "종료",
  SUPPRESSED: "억제",
};

export function lifecycleShort(lifecycle: string): string {
  return safeLookup(LIFECYCLE_LABELS, lifecycle, UNKNOWN_STATE_LABEL);
}

const STALE_LABELS: Readonly<Record<string, string>> = {
  fresh: "최신",
  warn: "일부 지연",
  block: "지연",
};

export function staleLevelOperator(stale: string): string {
  return safeLookup(STALE_LABELS, stale, UNKNOWN_STATE_LABEL);
}

const DEGRADED_LABELS: Readonly<Record<string, string>> = {
  HEALTHY: "정상",
  RECONNECTING: "재연결 중",
  DEGRADED_REALTIME: "실시간 제한",
  OFFLINE: "오프라인",
  SIMULATION_LAG: "동기화 지연",
};

export function degradedModeOperator(mode: string): string {
  return safeLookup(DEGRADED_LABELS, mode, "제한 모드");
}

const PANEL_CONFIDENCE_LABELS: Readonly<Record<string, string>> = {
  HIGH: "신뢰도: 정상",
  PARTIAL_STALE: "신뢰도: 일부 지연 데이터",
  RECONNECTING: "신뢰도: 재연결 중",
  DEGRADED: "신뢰도: 제한 모드",
};

export function panelConfidenceLabel(code: string): string {
  return safeLookup(PANEL_CONFIDENCE_LABELS, code, `신뢰도: ${UNKNOWN_STATE_LABEL}`);
}

export function recoveryHeadline(panelConfidence: string): string {
  switch (panelConfidence) {
    case "RECONNECTING":
      return "재연결 중입니다. 동기화가 끝나면 조작이 다시 허용됩니다.";
    case "DEGRADED":
      return "제한 모드입니다. 안전한 동작만 허용됩니다.";
    case "PARTIAL_STALE":
      return "일부 환자 채널의 생체·알림이 지연되어 표시됩니다.";
    case "HIGH":
    default:
      return "운영 화면이 최신 상태와 일치합니다.";
  }
}

export function formatSeverityLifecycle(severity: string, lifecycle: string): string {
  return `${severityShort(severity)} \u00b7 ${lifecycleShort(lifecycle)}`;
}

export function formatPhaseHeading(phaseLabel: string, title: string): string {
  return `${phaseLabel} \u00b7 ${title}`;
}

export function formatPatientPrimaryLine(displayName: string): string {
  if (!displayName || displayName.trim().length === 0) return UNKNOWN_STATE_LABEL;
  if (displayName.includes("세")) return displayName;
  const paren = displayName.match(/^(.+?)\s*\((\d+)\)\s*·\s*(.+)$/);
  if (paren) return `${paren[1]!.trim()} · ${paren[2]!.trim()}세 · ${paren[3]!.trim()}`;
  return displayName;
}

export function patientClinicalStatusLine(dynamicStatus?: string): string {
  if (dynamicStatus && dynamicStatus.trim().length > 0) return dynamicStatus;
  return "현재: 임상 상태 확인 중";
}

export function patientEvidenceLine(stale: string, dynamicVitals?: string): string {
  const base =
    dynamicVitals && dynamicVitals.trim().length > 0 ? dynamicVitals : "생체 신호 갱신 중";
  if (stale === "block" || stale === "warn") return `${base} · 데이터 지연`;
  return base;
}

export function patientActionLine(recommendedAction?: string): string {
  if (recommendedAction && recommendedAction.trim().length > 0) return recommendedAction;
  return "경과 관찰";
}

export function patientVitalsHint(stale: string): string {
  if (stale === "block") return "데이터 지연";
  if (stale === "warn") return "일부 채널 지연";
  return "생체 신호 갱신 중";
}

export function detailRecommendedAction(lifecycle: string): string {
  if (lifecycle === "CREATED") return "즉시 확인 필요";
  if (lifecycle === "ACKNOWLEDGED") return "조치 완료 가능";
  if (lifecycle === "RESOLVED") return "회복 추세 확인";
  return "상세 확인";
}

export function resolveDetailPrimaryAction(input: {
  readonly recommendedAction?: string;
  readonly alertLifecycle: string;
  readonly patientStale: string;
  readonly alertSeverity: string;
  readonly degraded: boolean;
}): string {
  if (input.degraded) return "동기화 후 조치 가능";
  if (input.patientStale === "block") return "데이터 신뢰도 재확인";
  if (input.recommendedAction && input.recommendedAction.trim().length > 0) {
    const action = input.recommendedAction.trim();
    if (action.includes("즉시")) return "즉시 확인 필요";
    if (action.includes("데이터")) return "데이터 신뢰도 재확인";
    if (action.includes("회복") || action.includes("경과")) return "회복 추세 확인";
    if (action.includes("인지")) {
      return input.alertLifecycle === "CREATED" ? "즉시 확인 필요" : "담당자 인계 필요";
    }
    return action;
  }
  if (input.alertSeverity === "critical" && input.alertLifecycle === "CREATED") return "즉시 확인 필요";
  return detailRecommendedAction(input.alertLifecycle);
}

export const trustRegionAriaLabel = "신뢰 상태";
export const kpiRegionAriaLabel = "운영 부하 지표";
export const countUnitSuffix = "건";

export function repeatDetectionLabel(repeatCount: number): string {
  if (repeatCount <= 1) return "최근 반복 감지";
  return `반복 감지 ${repeatCount}회`;
}

export type QueueRowCta = {
  readonly actionLabel: string;
  readonly buttonLabel: string;
  readonly ariaLabel: string;
  readonly disabled: boolean;
  readonly showButton: boolean;
};

export function queueRowCta(input: {
  lifecycle: string;
  degraded: boolean;
  isPrimaryCritical: boolean;
}): QueueRowCta {
  if (input.degraded) {
    return {
      actionLabel: "동기화 후 조치 가능",
      buttonLabel: "동기화 대기",
      ariaLabel: "제한 모드 — 동기화 후 인지할 수 있습니다",
      disabled: true,
      showButton: false,
    };
  }
  if (input.lifecycle === "CREATED") {
    return {
      actionLabel: input.isPrimaryCritical ? "인지 필요" : "인지 검토",
      buttonLabel: "인지",
      ariaLabel: "알림 인지",
      disabled: false,
      showButton: true,
    };
  }
  if (input.lifecycle === "ACKNOWLEDGED") {
    return {
      actionLabel: "조치 완료 가능",
      buttonLabel: "조치 완료",
      ariaLabel: "조치 완료 처리",
      disabled: false,
      showButton: true,
    };
  }
  if (input.lifecycle === "RESOLVED") {
    return {
      actionLabel: "이미 조치됨",
      buttonLabel: "회복 확인",
      ariaLabel: "회복 확인",
      disabled: false,
      showButton: false,
    };
  }
  return {
    actionLabel: "상세 확인",
    buttonLabel: "상세 확인",
    ariaLabel: "환자 상세 확인",
    disabled: false,
    showButton: false,
  };
}

export const degradedReconnectLead =
  "연결이 불안정합니다. 동기화가 끝나면 조작이 다시 허용됩니다. 위급 알림은 계속 표시됩니다.";

export const ackDisabledReason = "제한 모드: 동기화가 끝나면 인지할 수 있습니다.";

export const handoffStripTitle = "교대·운영 요약";
export const trustDetailsLabel = "운영·동기화 세부";
export const unitLabel = "중환 감시 단위";
export const consoleTitle = "중환 운영 콘솔";
export const skipToQueueLabel = "우선순위 큐로 이동";
export const currentPhaseLabel = "현재 임상 단계";
export const nextChangeLabel = "다음 변화";

export type PresentationMode = "product" | "demo";

export const auditViewTitle = "검증·감사 보기";
export const demoControlsSummary = "시연 컨트롤";
export const wardFlowTitle = "현재 병동 흐름";
export const currentAttentionLabel = "현재 주의해야 할 변화";
export const nextOperationalActionLabel = "필요한 다음 행동";
export const detailRecommendedActionTitle = "권장 조치";

export const rowPatientPrefix = "환자";
export const rowStatusPrefix = "상태";
export const rowEvidencePrefix = "근거";
export const rowActionPrefix = "조치";

export const queueZoneTitle = "우선순위 큐";
export const queueTruthCaption = "권위 순서";
export const queueDisplayCaption = "화면 순서";
export const timelineSectionTitle = "운영 타임라인";
export const detailSectionTitle = "환자 상세";
export const detailCardTitle = "선택 환자";
export const detailEvidenceLabel = "임상 근거";
export const detailFreshnessLabel = "데이터 신선도";
export const detailAlertStateLabel = "알림 상태";
export const detailActionLabel = "권장 조치";

export const detailEmpty =
  "알림을 선택하면 환자 맥락·임상 근거·권장 조치가 표시됩니다.";
export const detailStaleSelection = "선택이 만료되었습니다. 큐에서 다시 선택하세요.";

export const demoIntroLine = "중환 운영 콘솔 · 30명 환자 실시간 감시";

export const demoFootDegradedTitle = "연결·제한 모드";
export const demoFootDegradedBody = (mode: string) =>
  `현재 ${degradedModeOperator(mode)}입니다. 위급 알림은 계속 표시되며, 조작은 동기화 후 허용됩니다.`;

export const demoFootStaleTitle = "데이터 지연";
export const demoFootStaleBody = "일부 생체 채널이 최신이 아닙니다. SpO₂·호흡 맥락을 확인한 뒤 인지하세요.";

export const timelineEmpty = "최근 운영 이벤트가 없습니다. 다음 갱신을 기다리는 중입니다.";

export const queueAckGroupTitle = "다음 조치";
export const queueAckHint = "선택한 알림을 인지하거나 상세에서 조치를 완료하세요.";

export const openCriticalLabel = "열린 위급 알림";
export const queueWaitLabel = "우선 대기";
export const staleChannelLabel = "지연 채널";
export const stalePatientsLabel = "지연 환자";
export const mixedFreshnessSuffix = " · 혼합 신선도";
export const unknownPatientLabel = "환자";

export const kpiQueueReconcile = "큐 재정렬";
export const kpiQueueSkip = "변경 없음 스킵";
export const kpiStaleDetect = "지연 감지 / 해제";

export const loadingLead = "운영 화면을 준비하는 중입니다.";
export const loadingSub = "잠시만 기다려 주세요.";
export const errorTitle = "화면을 불러오지 못했습니다";
export const errorBody = "일시적인 문제일 수 있습니다. 연결을 확인한 뒤 다시 시도해 주세요.";
export const errorRetryLabel = "다시 불러오기";
export const errorDetailsLabel = "기술 참고 (개발)";
export const debugDetailsSummary = "기술·검증 세부";
export const debugPatientIdLabel = "환자 ID";
export const debugSyncKeyLabel = "동기화 키";
export const debugRawEventLabel = "raw 이벤트";

export type QueueDisplayTier = "p0" | "critical" | "warning" | "recovery" | "stable" | "stale";

const QUEUE_TIER_LABELS: Readonly<Record<QueueDisplayTier, string>> = {
  p0: "P0 즉시 조치",
  critical: "Critical 인지 필요",
  warning: "Warning 확인 필요",
  recovery: "Recovery 관찰",
  stable: "Stable 감시 중",
  stale: "데이터 지연",
};

export function queueTierLabel(tier: QueueDisplayTier): string {
  return QUEUE_TIER_LABELS[tier];
}

export const priorityReasonPrefix = "우선순위 이유";
export const wardSituationTitle = "현재 병동 상황";
/** @deprecated Use wardFlowTitle on product surfaces */
export const wardNarrativePrefix = "현재 병동 흐름";
export const monitoringSummaryLabel = "감시 중";
/** @deprecated Use auditViewTitle */
export const auditSectionTitle = "검증·감사 보기";
export const timelineRecentTitle = "최근 중요 변화";
export const timelineMoreLabel = "전체 운영 이벤트";

export type WardCensus = {
  readonly critical: number;
  readonly warning: number;
  readonly recovery: number;
  readonly stale: number;
  readonly stable: number;
};

export type AuditTimelineEntry = {
  readonly type: string;
  readonly patientShortName?: string;
};

function patientShortName(displayName: string): string {
  const line = formatPatientPrimaryLine(displayName);
  return line.split("·")[0]!.trim();
}

export function classifyQueueDisplayTier(input: {
  alertSeverity: string;
  alertLifecycle: string;
  patientStale: string;
  dynamicStatus: string;
  isPrimaryCritical: boolean;
}): QueueDisplayTier {
  if (input.patientStale === "block" || input.patientStale === "warn") return "stale";
  if (input.isPrimaryCritical && input.alertSeverity === "critical" && input.alertLifecycle === "CREATED") {
    return "p0";
  }
  if (input.alertSeverity === "critical" && (input.alertLifecycle === "CREATED" || input.alertLifecycle === "ACKNOWLEDGED")) {
    return "critical";
  }
  if (input.dynamicStatus.includes("회복")) return "recovery";
  if (input.alertSeverity === "warning" || input.dynamicStatus.includes("주의") || input.dynamicStatus.includes("악화")) {
    return "warning";
  }
  if (input.dynamicStatus.includes("안정")) return "stable";
  return "warning";
}

export function priorityReasonLine(input: {
  tier: QueueDisplayTier;
  alertSeverity: string;
  alertLifecycle: string;
  patientStale: string;
  dynamicVitals?: string;
  dynamicStatus?: string;
  isRepeat?: boolean;
  repeatCount?: number;
}): string {
  if (input.isRepeat && input.repeatCount && input.repeatCount > 1) {
    return `반복 감지 ${input.repeatCount}회 · 동일 환자`;
  }
  if (input.patientStale === "block" || input.patientStale === "warn") {
    const vital = extractVitalHint(input.dynamicVitals ?? "");
    if (vital.includes("SpO") && input.dynamicStatus?.includes("저혈압")) {
      return "혈압 하락 + 데이터 지연";
    }
    if (vital.includes("SpO")) return `${vital} · 데이터 지연`;
    if (input.dynamicStatus?.includes("저혈압")) return "혈압 하락 + 데이터 지연";
    return "데이터 지연 · 신뢰 경계";
  }
  if (input.tier === "p0" || (input.alertSeverity === "critical" && input.alertLifecycle === "CREATED")) {
    const vital = extractVitalHint(input.dynamicVitals ?? "");
    if (vital.includes("SpO")) return `${vital} · 미인지 위급`;
    return "위급 기준 충족 · 미인지 위급";
  }
  if (input.tier === "critical" && input.alertLifecycle === "ACKNOWLEDGED") {
    return "위급 인지됨 · 조치 대기";
  }
  if (input.tier === "recovery" || input.dynamicStatus?.includes("회복")) {
    return "회복 관찰로 강도 낮춤";
  }
  if (input.dynamicStatus?.includes("다중") || input.dynamicStatus?.includes("급격")) {
    return "다중 위험 2건";
  }
  if (input.tier === "warning") {
    const vital = extractVitalHint(input.dynamicVitals ?? "");
    if (vital.length > 0 && vital !== "생체 신호 갱신 중") return `${vital} · 확인 필요`;
    return "주의 기준 충족 · 확인 필요";
  }
  return "안정 감시 유지";
}

function extractVitalHint(vitals: string): string {
  if (!vitals || vitals.trim().length === 0) return "";
  const spo = vitals.match(/SpO₂\s*(\d+)%/);
  if (spo) {
    const n = Number(spo[1]);
    const arrow = vitals.includes("↓") ? "↓" : vitals.includes("↑") ? "↑" : "";
    return `SpO₂ ${n}%${arrow ? ` ${arrow}` : ""}`.trim();
  }
  const first = vitals.split("·")[0]!.trim();
  return first.length > 0 ? first : "";
}

export function computeWardCensus(
  patients: Readonly<Record<string, { readonly dynamicStatus: string; readonly stale: string }>>,
  alerts: Readonly<Record<string, { readonly severity: string; readonly lifecycle: string; readonly patientId: string }>>,
): WardCensus {
  let critical = 0;
  let warning = 0;
  let recovery = 0;
  let stale = 0;
  let stable = 0;
  const openCriticalPatients = new Set<string>();
  for (const a of Object.values(alerts)) {
    if (a.severity === "critical" && (a.lifecycle === "CREATED" || a.lifecycle === "ACKNOWLEDGED")) {
      openCriticalPatients.add(a.patientId);
    }
  }
  for (const p of Object.values(patients)) {
    if (p.stale === "block" || p.stale === "warn") {
      stale++;
      continue;
    }
    if (p.dynamicStatus.includes("회복")) {
      recovery++;
      continue;
    }
    if (p.dynamicStatus.includes("악화") || p.dynamicStatus.includes("위급") || p.dynamicStatus.includes("주의")) {
      warning++;
      continue;
    }
    stable++;
  }
  critical = openCriticalPatients.size;
  return { critical, warning, recovery, stale, stable };
}

export function formatWardSituationLine(census: WardCensus): string {
  const parts: string[] = [];
  if (census.critical > 0) parts.push(`위급 ${census.critical}명`);
  if (census.warning > 0) parts.push(`주의 ${census.warning}명`);
  if (census.recovery > 0) parts.push(`회복 관찰 ${census.recovery}명`);
  if (census.stale > 0) parts.push(`데이터 지연 ${census.stale}명`);
  if (census.stable > 0) parts.push(`안정 감시 ${census.stable}명`);
  return parts.join(" · ");
}

export function formatMonitoringCompact(count: number): string {
  return `${monitoringSummaryLabel} ${count}명`;
}

export type CohortMonitoringSummary = {
  readonly monitoringCount: number;
  readonly icu: number;
  readonly er: number;
  readonly ward: number;
  readonly recovery: number;
  readonly dataNormal: number;
};

export function computeCohortMonitoringSummary(
  patients: Readonly<Record<string, { readonly department: string; readonly dynamicStatus: string; readonly stale: string }>>,
  monitoringCount: number,
): CohortMonitoringSummary {
  let icu = 0;
  let er = 0;
  let ward = 0;
  let recovery = 0;
  let dataNormal = 0;
  for (const p of Object.values(patients)) {
    if (p.department === "ICU") icu++;
    else if (p.department === "ER") er++;
    else ward++;
    if (p.dynamicStatus.includes("회복")) recovery++;
    if (p.stale === "fresh" && !p.dynamicStatus.includes("악화") && !p.dynamicStatus.includes("위급") && !p.dynamicStatus.includes("주의")) {
      dataNormal++;
    }
  }
  return { monitoringCount, icu, er, ward, recovery, dataNormal };
}

export function formatCohortMonitoringLines(summary: CohortMonitoringSummary): readonly string[] {
  return [
    `${monitoringSummaryLabel} ${summary.monitoringCount}명`,
    `ICU ${summary.icu}명`,
    `ER ${summary.er}명`,
    `Ward ${summary.ward}명`,
    `회복 관찰 ${summary.recovery}명`,
    `데이터 정상 ${summary.dataNormal}명`,
  ];
}

export type WardFlowInput = {
  readonly patients: Readonly<
    Record<string, { readonly department: string; readonly dynamicStatus: string; readonly stale: string }>
  >;
  readonly alerts: Readonly<Record<string, { readonly severity: string; readonly lifecycle: string; readonly patientId: string }>>;
  readonly panelConfidence: string;
  readonly degradedMode: string;
};

export function buildWardFlowNarrative(input: WardFlowInput): string {
  let icuWorsening = 0;
  let erRecovery = 0;
  let wardStale = 0;
  let unackedCritical = 0;

  for (const p of Object.values(input.patients)) {
    const worsening =
      p.dynamicStatus.includes("악화") ||
      p.dynamicStatus.includes("하락") ||
      p.dynamicStatus.includes("위급") ||
      p.dynamicStatus.includes("저혈압") ||
      p.dynamicStatus.includes("빈맥") ||
      p.dynamicStatus.includes("급격") ||
      p.dynamicStatus.includes("발열");
    if (p.department === "ICU" && worsening) icuWorsening++;
    if (p.department === "ER" && p.dynamicStatus.includes("회복")) erRecovery++;
    if (p.department === "WARD" && (p.stale === "block" || p.stale === "warn")) wardStale++;
  }

  for (const a of Object.values(input.alerts)) {
    if (a.severity === "critical" && a.lifecycle === "CREATED") unackedCritical++;
  }

  const sentences: string[] = [];

  if (icuWorsening >= 2) {
    sentences.push(`ICU 환자 ${icuWorsening}명이 동시에 악화되어 우선순위를 재정렬했습니다.`);
  } else if (icuWorsening === 1) {
    sentences.push("ICU 환자 1명의 상태 악화로 우선순위를 조정했습니다.");
  }

  if (erRecovery > 0 && wardStale > 0) {
    sentences.push(
      `ER 환자 ${erRecovery}명은 회복 관찰로 전환됐고, Ward 환자 ${wardStale}명은 데이터 지연 상태입니다.`,
    );
  } else if (erRecovery > 0) {
    sentences.push(`ER 환자 ${erRecovery}명이 회복 관찰로 전환됐습니다.`);
  } else if (wardStale > 0) {
    sentences.push(`Ward 환자 ${wardStale}명의 데이터 지연을 확인 중입니다.`);
  }

  if (unackedCritical >= 2) {
    sentences.push("야간 교대 전 미인지 위급 알림을 우선 정리하고 있습니다.");
  } else if (unackedCritical === 1) {
    sentences.push("미인지 위급 알림 1건을 우선 확인하세요.");
  }

  if (input.panelConfidence === "RECONNECTING" || input.degradedMode === "RECONNECTING") {
    sentences.push("재연결 후 일부 환자 데이터 신뢰도를 재확인 중입니다.");
  } else if (input.panelConfidence === "PARTIAL_STALE" || input.panelConfidence === "DEGRADED") {
    sentences.push("일부 환자 채널의 신뢰도를 재확인한 뒤 조치를 진행하세요.");
  }

  if (sentences.length === 0) {
    const census = computeWardCensus(input.patients, input.alerts);
    if (census.stable >= 20) {
      return "병동 전반 안정 감시를 유지하고 있습니다. 변화 감지 시 우선순위가 자동 갱신됩니다.";
    }
    return `${formatWardSituationLine(census)}. 우선순위 큐를 기준으로 조치 순서를 유지하세요.`;
  }

  return sentences.slice(0, 2).join(" ");
}

export function auditSummaryLines(input: {
  readonly auditCount: number;
  readonly replayMatch: boolean;
  readonly openCritical: number;
}): readonly [string, string, string] {
  return [
    `감사 이벤트 ${input.auditCount}건 기록됨`,
    input.replayMatch ? "리플레이 해시 일치 · 큐 순서 검증 통과" : "리플레이 검증 필요 · 세부에서 확인",
    `열린 위급 알림 ${input.openCritical}건`,
  ];
}

const TIMELINE_EVENT_SCORE: Readonly<Record<string, number>> = {
  ALERT_CREATED: 100,
  STALE_DETECTED: 90,
  DEGRADED_ENTER: 85,
  DEGRADED_EXIT: 80,
  RULE_FIRED: 70,
  QUEUE_RECOMPUTED: 50,
  VITAL_UPDATED: 40,
  ALERT_ACKED: 35,
  ALERT_RESOLVED: 30,
  STALE_CLEARED: 25,
};

function formatTimelineEntry(entry: AuditTimelineEntry): string {
  const name = entry.patientShortName ?? "환자";
  switch (entry.type) {
    case "ALERT_CREATED":
      return `${name}: SpO₂ 하락으로 즉시 확인 필요`;
    case "STALE_DETECTED":
      return `${name}: 데이터 지연 감지`;
    case "DEGRADED_ENTER":
      return "제한 모드 진입";
    case "DEGRADED_EXIT":
      return "제한 모드 해제";
    case "QUEUE_RECOMPUTED":
      return `${name}: 우선순위 상단 이동`;
    case "ALERT_RESOLVED":
      return `${name}: 회복 관찰로 전환`;
    case "RULE_FIRED":
      return `${name}: 다중 위험으로 상단 이동`;
    case "VITAL_UPDATED":
      return `${name}: 생체 변화 감지`;
    default:
      return `${name}: ${auditEventOperatorLabel(entry.type)}`;
  }
}

export function summarizeOperatorTimeline(entries: readonly AuditTimelineEntry[], maxItems = 5): string[] {
  const scored = entries
    .map((e, idx) => ({
      e,
      score: (TIMELINE_EVENT_SCORE[e.type] ?? 10) + idx * 0.01,
    }))
    .sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const { e } of scored) {
    const line = formatTimelineEntry(e);
    if (seen.has(line)) continue;
    seen.add(line);
    out.push(line);
    if (out.length >= maxItems) break;
  }
  return out;
}

export function buildAuditTimelineEntries(
  auditEntries: ReadonlyArray<{ readonly type: string; readonly patientId?: string }>,
  patients: Readonly<Record<string, { readonly displayName: string }>>,
  tailMax = 20,
): readonly AuditTimelineEntry[] {
  return auditEntries.slice(-tailMax).map((e) => {
    const p = e.patientId ? patients[e.patientId] : undefined;
    return {
      type: e.type,
      patientShortName: p ? patientShortName(p.displayName) : undefined,
    };
  });
}

export function tierSortPriority(tier: QueueDisplayTier): number {
  const order: Record<QueueDisplayTier, number> = {
    p0: 600,
    critical: 500,
    stale: 450,
    warning: 300,
    recovery: 200,
    stable: 100,
  };
  return order[tier];
}
