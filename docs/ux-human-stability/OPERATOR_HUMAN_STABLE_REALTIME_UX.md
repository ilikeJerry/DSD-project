# Operator Human-stable Realtime Clinical UX (PHASE 1–8)

**문서 유형:** Clinical UX + HF operational policy  
**상태:** Accepted  
**바인딩 코드:** `@dsd/ui-safety` (`temporalStability.ts`, `alertCalmness.ts`, `reconnectTrust.ts`, `scanContinuity.ts`)  
**금지:** 새 runtime governance 추상화; **진실 큐/감사**와 표시 계층 혼동 금지.

---

## 절대 금지 (UX / Realtime)

- queue reorder **thrashing** (무의미한 연속 재정렬)  
- rapid **severity oscillation** (깜빡임)  
- **flashing** critical UI  
- reconnect **silent** recovery (이벤트·배너 없이 “정상처럼”)  
- repeated **attention stealing** (비Critical가 Critical 포커스 탈취)  
- visual **interrupt storm**  
- stale visibility **flickering**  
- aggressive realtime **animation**  
- **toast flood**  
- unstable **temporal ordering** (동일 스트림인데 화면 순서가 시간에 따라 들쭉날쭉)

---

## PHASE 1 — Temporal Stability Architecture

**목표:** 상태 변화가 operator attention을 **흔들지 않음**.

| 전략 | 정의 |
|------|------|
| Queue stabilization window | 표시 큐는 `minHoldMs` 내 **최대 이동량 미만**이면 이전 순서 유지 (`dampenQueueOrderDisplay`) |
| Minimum visibility duration | 행/배지가 바뀐 후 최소 체류 시간(문서화된 ms) — Critical 상향은 **예외 즉시 반영** |
| Severity cooldown rules | Critical → 비Critical **시각적 강등**은 `minDemoteVisualMs` 지연 (데이터 진실과 분리) |
| Reorder dampening | 인접 1칸 왕복 억제: `minIndexMove` 미만이면 hold |
| Temporal hysteresis | 상향은 빠르게, 하향(덜 위험해 보임)은 느리게 |
| Escalation persistence | 동일 규칙 재발 시 **그룹 연속성** 유지 (`docs/safety/10` 정합) |
| Stale visibility persistence | stale 배너는 **깜빡임 금지** — 상태 전이 시에만 변경 (`degradedBanner` 동일) |
| Reconnect grace window | `RECONNECTING` 진입 후 최소 표시 시간 — 즉시 HEALTHY로 “사라짐” 금지 |

**8관점 (PHASE 1)**  
1. **Cognitive instability 방지:** 마이크로 재정렬·깜빡임 억제  
2. **Attention:** 시선이 쫓아다니지 않음  
3. **Temporal stability:** hold·hysteresis로 시간축 완만  
4. **Alert fatigue:** 무의미한 “새 알림” 체감 감소  
5. **Degraded/reconnect:** grace로 신뢰 회복 시간 확보  
6. **Operational readability:** “지금 이 화면이 얼마나 오래 유효한가” 예측 가능  
7. **Forbidden UX:** hold 없이 truth-order를 그대로 DOM에 꽂기만 함  
8. **의료 운영:** 장시간 관제 시 **눈·머리 피로** 및 오판 감소  

---

## PHASE 2 — Cognitive Jitter Reduction

| 전략 | 정의 |
|------|------|
| Reorder suppression | 표시층 `dampenQueueOrderDisplay` |
| Movement threshold | `minIndexMove` (기본 2) |
| Stable focus region | Primary·Ack 영역 **고정 슬롯** (HF) |
| Attention anchor | 상단 **고정 랜드마크**(병동·시각·연결 상태) |
| Persistent patient focus | 포커스 환자 헤더 **스티키** |
| Contextual continuity | 필터 변경 시에도 **Critical pin** 유지 (`CRITICAL_VISIBILITY`) |
| Gradual reprioritization | demote만 지연; **상향은 즉시** |
| Focus recovery after interruption | 방해 후 10초 내 미해결 Critical 재인지(HF 체크리스트) |

**8관점 (PHASE 2)**  
1. **Jitter:** 작은 점수 변화로 줄 서기 흔들림 방지  
2. **Attention:** anchor로 복귀 비용↓  
3. **Temporal:** 점진적 재우선순위  
4. **Fatigue:** “또 바뀌었네” 소음↓  
5. **Degraded/reconnect:** 포커스 복구 경로 문서화  
6. **Readability:** 스캔 리듬 유지  
7. **Forbidden:** 매 tick DOM 전체 재배열  
8. **의료 운영:** multitasking 시 **맥락 상실** 감소  

---

## PHASE 3 — Alert Calmness System

| 전략 | 정의 |
|------|------|
| Alert calmness scoring | `computeAlertCalmnessScore` — 반복·억제·심각도 가중 |
| Duplicate visibility suppression | 동일 dedupe 그룹은 **한 행 확장**으로만 |
| Repeated escalation dampening | 동일 규칙 연속 시 **카운트 증가**가 주 신호, 행 추가 최소화 |
| Alert persistence rules | Critical 미처리는 **시각적 지속**(깜빡임 아님) |
| Operator acknowledgment memory | Ack 후에도 조건 지속 시 **재표현 규칙**(`09`와 정합) |
| Fatigue-aware visibility | calmness 낮으면 **secondary**로 밀기(가시성 보장 위반 없음) |
| Interrupt prioritization | Critical-only가 포커스 탈취 |
| Alert grouping continuity | 그룹 헤더·카운트 유지 |

**8관점 (PHASE 3)**  
1. **Instability:** noisy critical 방지  
2. **Attention:** 중요한 것만 “크게”  
3. **Temporal:** persistence로 리듬  
4. **Fatigue:** 핵심  
5. **Degraded/reconnect:** calmness와 배너 병행  
6. **Readability:** 한 줄 요약 우선  
7. **Forbidden:** Critical 숨김·색만 깜빡임  
8. **의료 운영:** 알림 스트림 **신뢰** 유지  

---

## PHASE 4 — Realtime Attention Preservation

| 전략 | 정의 |
|------|------|
| Stable visual zones | Primary / Secondary / Peripheral **고정** |
| Non-disruptive updates | in-place 수치 갱신, **레이아웃 점프 최소** |
| Deferred non-critical updates | `requestIdleCallback`/다음 프레임으로 secondary |
| Critical-only interruption | 모달·토스트 **한 겹** 제한 |
| Queue movement animation policy | FLIP 또는 **duration cap**; reduced-motion 준수 |
| Sticky operational focus | 스크롤 시 Primary 축약 모드 |
| Persistent degraded awareness | HEALTHY 복귀 후에도 **“최근 재연결”** 한 줄(선택) |
| Safe visual rhythm | 애니메이션 **2단**만 (`instant` / `smooth`) |

**8관점 (PHASE 4)**  
1. **Instability:** 시각 폭풍 방지  
2. **Attention:** 보호  
3. **Temporal:** 부드러운 갱신  
4. **Fatigue:** 토스트 폭주 금지  
5. **Degraded:** 지속 인지  
6. **Readability:** 구역 예측 가능  
7. **Forbidden:** 전역 confetti·과도 모션  
8. **의료 운영:** 장시간 패널 응시 가능  

---

## PHASE 5 — Reconnect Trust UX

| 전략 | 정의 |
|------|------|
| Reconnect confidence indicator | `RECONNECTING` + 경과 시간 + “동기화 중” 카피 |
| Stale reconciliation visibility | 복구 후 **last confirmed** 대비 diff 한 줄 |
| Reconnect recovery timeline | (선택) 타임라인에 `DEGRADED_*` 이벤트 노출 |
| Synchronization confidence | “스냅샷 적용 완료” 명시적 상태 |
| Replay recovery notice | 개발/운영 도구: “재생 모드” 라벨 |
| Degraded persistence UX | 배너가 **한 프레임**도 없이 사라지지 않음(최소 체류) |
| Trust restoration flow | HEALTHY 전 **한 단계 확인** 카피 |

**8관점 (PHASE 5)**  
1. **Instability:** “믿어도 되나?” 불안 제거  
2. **Attention:** 신뢰 회복에 인지 자원 할당  
3. **Temporal:** grace window  
4. **Fatigue:** 불필요 경고 반복 금지  
5. **Degraded/reconnect:** 핵심  
6. **Readability:** 한눈에 동기화 상태  
7. **Forbidden:** silent 복구  
8. **의료 운영:** 데이터 신뢰와 직결  

---

## PHASE 6 — Operational Scan Continuity

| 전략 | 정의 |
|------|------|
| Scan rhythm preservation | 열 순서·행 높이 **고정** |
| Stable severity landmarks | 좌측 스트립·아이콘 위치 고정 |
| Visual scanning anchors | 이름 열·심각도 열 **동일 x** |
| Predictable queue zones | “미Ack / Ack됨” 구역 고정 |
| Reduced eye reorientation | 스크롤 위치 보존 옵션 |
| Temporal grouping | 동일 tick 배치는 **한 번에** 그리기 |
| Persistent operational context | 상단 바: 시각·병동·모드 **항상** |

**8관점 (PHASE 6)**  
1. **Instability:** 스캔 경로 깨짐 방지  
2. **Attention:** F-패턴 유지  
3. **Temporal:** 그룹핑  
4. **Fatigue:** 재학습 최소  
5. **Degraded/reconnect:** 맥락 바 유지  
6. **Readability:**  
7. **Forbidden:** 열 순서 무작위 변경  
8. **의료 운영:** 병동 순찰 속도  

---

## PHASE 7 — Human Factors Runtime QA

| 시뮬레이션 | 목적 |
|------------|------|
| Queue thrash | dampen 파라미터 검증 |
| Severity oscillation | `shouldDelaySeverityDemotion` |
| Reconnect interruption | 배너 grace |
| Stale flicker | 배너 토글 최소화 정책 |
| Alert fatigue replay | calmness 점수 추세 |
| Rapid escalation replay | 상향 즉시 vs 하향 지연 |
| Operator distraction recovery | HF §C |
| Scan continuity validation | 열 고정 체크리스트 |

**실행:** `@dsd/ui-safety` `npm run test` + HF 체크리스트 §H.

**8관점 (PHASE 7)**  
1. **Instability:** 회귀 조기 발견  
2. **Attention:** 측정 가능한 스캔 테스트  
3. **Temporal:** 시뮬로 hold 검증  
4. **Fatigue:** 시나리오 기반  
5. **Degraded:** reconnect 스크립트  
6. **Readability:**  
7. **Forbidden:** UI만 손보고 HF 미검증  
8. **의료 운영:** 출하 전 **사람** 검증 보조  

---

## PHASE 8 — Operator-facing Hardening Pass (우선순위)

1. Queue temporal stabilization — **코드: `dampenQueueOrderDisplay`**  
2. Alert calmness — **`computeAlertCalmnessScore`**  
3. Reconnect trust UX — **`RECONNECT_TRUST_CHECKLIST`** 상수  
4. Scan continuity — **`SCAN_ZONE_*`**  
5. Interruption resilience — HF 문서 + 모달 정책  
6. Cognitive jitter reduction — dampen + demotion delay  
7. Realtime visual consistency — DS motion 2단 준수  

**새 runtime abstraction 추가 금지** — 표시·정책 상수·순수 함수만.

**8관점 (PHASE 8)**  
1. **Instability:** 운영 하드닝 순서 고정  
2. **Attention:** 1·2번 우선  
3. **Temporal:** 큐 우선  
4. **Fatigue:** 알림 차분  
5. **Degraded:** 신뢰 UX  
6. **Readability:** 스캔  
7. **Forbidden:** 추상 프레임워크  
8. **의료 운영:** 장시간 사용성  

---

## 관련 문서

- `docs/runtime/OPERATIONAL_STABILITY_PHASES.md`  
- `docs/safety/CRITICAL_VISIBILITY_GUARANTEE.md`  
- `docs/hf/HF_VALIDATION_CHECKLIST.md` §H  
