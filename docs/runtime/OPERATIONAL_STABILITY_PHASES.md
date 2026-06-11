# Operational Stability — Clinical Runtime (PHASE 1–8)

**문서 성격:** Runtime operational stability (no new governance philosophy).  
**바인딩:** 기존 `docs/safety/*`, `docs/runtime/RUNTIME_DOC_BINDING.md`.  
**코드 구현:** `@dsd/clinical-runtime` (`kernel.ts`, `telemetry.ts`, `queueFingerprint.ts`, `ingestVitalBatch`), `@dsd/replay-runtime` (duplicate sig detection), `tests/pressure.test.ts`.

---

## PHASE 1 — Runtime Pressure Testing

각 시나리오에 대해: **failure mode | render | queue | replay | audit | mitigation** (요약).

| 시나리오 | Runtime failure mode | Render impact | Queue impact | Replay impact | Audit impact | Mitigation (구현/정책) |
|----------|----------------------|---------------|----------------|---------------|--------------|------------------------|
| **Alert storm** | 이벤트 폭주, UI 프레임 드랍 | 리스트 전체 리렌더 위험 | 순서 흔들림 | 로그 대형화 | append 폭증 | **배치 + dedupe 정책(문서 10)**; 큐 지문 동일 시 `QUEUE_RECOMPUTED` **emit 생략** (`kernel.flushQueueRecompute`) |
| **Reconnect flood** | 모드 전이 레이스 | 배너 깜빡임 | — | 이벤트 순서 민감 | DEGRADED 이벤트 증가 | **이벤트만으로 전이**; silent fallback 금지 (`06`) |
| **WS reconnect loop** | 동일 구간 반복 이벤트 | 과도 리렌더 | — | 중복 시그니처 | 감사 노이즈 | 루프당 **상관 ID 분리** + (향후) 루프율 메트릭 알람 |
| **Stale burst** | STALE_DETECTED 연속 | 배너/행 스타일 갱신 | 정렬 가중 변동 | 해시 변동 정당 | 이벤트 증가 | **stale collapse는 정책 문서(07)**; 런타임은 이벤트 기록 유지 |
| **Queue churn** | 순서 불안정 체감 | 리스트 재배열 | UX 피로 | 해시 시퀀스 길이 증가 | QUEUE 이벤트 증가 | **동일 지문 `queueResultFingerprint` 시 emit 생략** |
| **Replay mismatch injection** | payload≠reduce 결과 | — | 잘못된 신뢰 | `replay-runtime` mismatch | 위조 가능성 | **`queue_payload_state_mismatch` 검출** (`replay-runtime`) |
| **Rapid patient switching** | 잘못된 컨텍스트 ack | 포커스 혼란 | — | correlation 혼선 | 잘못된 actor 기록 | UI: **환자 헤더 고정**; 런타임: **금지 전이 throw** (`09`) |
| **Degraded transition loop** | 모드 깜빡임 | 시야 분산 | resolve 가드 | replay 일관성 | 이벤트 폭증 | 전이 최소화 + 텔레메트리 `degradedEnterCount` |
| **High-frequency VITAL_UPDATED** | N배 큐 재계산 | N배 리렌더 유발 | **실패 조건: N QUEUE** | 감사 폭증 | append 폭증 | **`ingestVitalBatch` → 단일 `flushQueueRecompute`** |
| **Replay hash divergence** | 사후 분석 불일치 | — | 신뢰 상실 | 재현 실패 | — | **단일 `recomputeQueue` 결과로 envelope 생성**; 이중 계산 제거 |

---

## PHASE 2 — Rendering Isolation Architecture (React/Next)

| 전략 | 내용 |
|------|------|
| Selector granularity | `queueOrderIds`만 구독하는 selector; 환자 전체 맵 구독 금지 |
| Rerender boundary | P0: `CriticalStrip`, `AlertQueue`, `AckPanel` **파일 분리** + `React.memo` on row (`eventId` stable key) |
| Queue row isolation | 행 = `alertId` + `payload.inputSnapshotHash` 조각만 props |
| Virtualization safety | P0 primary는 **가상화 금지**(문서 `CRITICAL_VISIBILITY`); 긴 스트림만 window |
| Render batching | rAF/50ms 단일 배치 (UI 레이어; 런타임은 이미 vital batch) |
| Transition throttling | Critical 강조 transition **동시 최대 N** (HF) |
| Stale banner isolation | 배너는 layout 상단 **고정 슬롯** (critical 가리지 않음) |
| Replay-safe memo | memo 비교는 **지문/순서 문자열** 기반 |
| Subscription scope | 전역 구독 1회(shell); 나머지 props drill |
| P0 rendering priority | Critical 영역 `startTransition` **비적용**(입력·경고 우선) |

---

## PHASE 3 — Event Amplification Control

| 제어 | 구현 상태 |
|------|-----------|
| Recompute batching | `ingestVitalBatch` → 단일 flush |
| Duplicate suppression | `flushQueueRecompute` 지문 동일 시 skip |
| Recompute debounce | (향후) 동일 tick 창 내 coalesce — 현재는 **배치 API로 대체** |
| Stale recompute collapse | 정책 `07`; 코드는 STALE 이벤트 유지 |
| Alert grouping | 문서 `10`; 런타임 dedupeKey 필드 유지 |
| Queue stabilization window | 지문 캐시 `_lastQueueFingerprint` |
| Replay-safe batching | skip 시 **감사 미기록** = 상태도 변하지 않음 → replay 일치 |
| Event fan-out 제한 | QUEUE emit **단일 관문** (`flushQueueRecompute`) |
| Derived event 최소화 | 파생은 reducer; 별도 synthetic 이벤트 금지 |

---

## PHASE 4 — Runtime Observability

`RuntimeTelemetry` (`telemetry.ts`):

| 지표 | 의미 |
|------|------|
| `eventAppendedTotal` | 감사 append 총량 |
| `queueRecomputeEmitted` | 실제 `QUEUE_RECOMPUTED` 기록 횟수 |
| `queueRecomputeSkippedUnchanged` | 증폭 방지 스킵 횟수 |
| `vitalUpdatedIngested` | VITAL_UPDATED 처리 수 |
| `degradedEnterCount` / `degradedExitCount` | 모드 전이 빈도 |
| `staleDetectedCount` / `staleClearedCount` | stale 이벤트 |
| `lastQueueInputSnapshotHash` / `lastQueueOrderKey` | 마지막 큐 지문 |

---

## PHASE 5 — Deterministic Runtime Verification

| 검증 | 구현 |
|------|------|
| Double replay | `verifyDeterministicDoubleReplay` (`@dsd/replay-runtime`) |
| Queue hash stability | 동일 스트림 → `extractQueueHashesFromTimeline` 동일 |
| Event ordering | causal chain 수동 검토 + (선택) CI |
| Reducer determinism | `reduceClinical` 순수 |
| Duplicate QUEUE sig | `queue_duplicate_recompute_sig` mismatch |

---

## PHASE 6 — Operational Runtime Ergonomics

| 항목 | 원칙 |
|------|------|
| Rapid ack | 금지 전이는 **즉시 throw** (조용한 실패 금지) |
| Queue stabilization UX | 순서 변동 최소화 = **불필요한 QUEUE emit 제거** |
| Degraded smoothness | 이벤트 기반 배너; 애니메이션 최소 |
| Stale persistence | stale 맵은 reducer 상태로 유지 |
| Interruption-safe | (UI) 모달 vs critical — HF 문서 |
| Patient switching | (UI) 헤더 고정 |
| Scan continuity | P0 영역 sticky |

---

## PHASE 7 — Runtime Safety QA

| 테스트 | 위치 |
|--------|------|
| Event amplification | `tests/pressure.test.ts` (100 vital → 1 queue) |
| Queue stabilization | 동 파일 (duplicate skip) |
| Deterministic replay | 동 파일 (double replay) |
| Replay drift / saturation | CI 확장 시 playwright + 시나리오 팩 |

실행: `npm run test -w @dsd/clinical-runtime`

---

## PHASE 8 — First Runtime Hardening Pass (완료 순서)

1. **Queue stabilization** — `_lastQueueFingerprint` + skip  
2. **Render isolation** — 문서 PHASE 2 (UI 적용 시)  
3. **Event amplification reduction** — `ingestVitalBatch` + skip  
4. **Replay determinism** — 단일 recompute 경로 + `verifyDeterministicDoubleReplay`  
5. **Reconnect resilience** — 기존 `simulateReconnect` 유지  
6. **Runtime observability** — `RuntimeTelemetry`  
7. **Degraded UX consistency** — 배너 의무는 `@dsd/ui-safety` + 웹 페이지 샘플

**금지 준수:** 새 governance 추상화 없음, audit 우회 없음, replay 불가능 최적화 없음.
