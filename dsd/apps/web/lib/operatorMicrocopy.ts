/** Operator-facing strings — operational meaning over engineering terms. */

export const UNKNOWN_STATE_LABEL = "상태 확인 필요";

export const DEMO_PATIENT_CLINICAL_CONTEXT = "호흡 악화 관찰 중";

export const rowClinicianPrefix = "담당";

export type DemoScenarioPhase = {
  readonly title: string;
  readonly nextHint: string;
  readonly beat: string;
};

/** 8-beat clinical narrative — aligns with tickIndex % 8 */
export const DEMO_SCENARIO_PHASES: readonly DemoScenarioPhase[] = [
  {
    title: "안정 감시",
    nextHint: "호흡 악화 감지",
    beat: "병실 채널이 안정적으로 동기화되어 있습니다. 루틴 감시를 유지하세요.",
  },
  {
    title: "호흡 악화 감지",
    nextHint: "위급 알림 생성",
    beat: "SpO₂ 하락과 호흡수 변화가 관찰되었습니다. 환자 상태를 확인하세요.",
  },
  {
    title: "위급 알림 생성",
    nextHint: "우선순위 상단 이동",
    beat: "위급 알림이 생성되었습니다. 즉시 임상 판단이 필요합니다.",
  },
  {
    title: "우선순위 상단 이동",
    nextHint: "재연결 제한 모드",
    beat: "위급 알림이 우선순위 큐 최상단으로 올라갔습니다.",
  },
  {
    title: "재연결 제한 모드",
    nextHint: "데이터 지연 확인",
    beat: "재연결 중입니다. 동기화가 끝나면 조작이 다시 허용됩니다.",
  },
  {
    title: "데이터 지연 확인",
    nextHint: "인지 및 조치 대기",
    beat: "일부 생체 채널이 지연되었습니다. SpO₂·호흡 맥락을 확인한 뒤 인지하세요.",
  },
  {
    title: "인지 및 조치 대기",
    nextHint: "회복 확인",
    beat: "제한 모드입니다. 인지 후 필요한 조치를 진행하세요.",
  },
  {
    title: "회복 확인",
    nextHint: "안정 감시",
    beat: "동기화가 회복되었습니다. 환자 상태를 재평가합니다.",
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
  if (lifecycle === "CREATED") return "인지 필요";
  if (lifecycle === "ACKNOWLEDGED") return "조치 완료 가능";
  if (lifecycle === "RESOLVED") return "회복 확인";
  return "상세 확인";
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

export const demoIntroLine =
  "실시간 시연: 30명 환자 프로필은 고정되며, tick마다 2–5명의 임상 상태가 controlled randomness로 변화합니다.";

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
