# PHASE 2 — P0 Vertical Slice (Runtime 단위 정의)

**범위 고정:** respiratory deterioration → critical → queue → ack → resolve confirm → audit → replay. **확장 금지.**

각 단계: **Emitted event** | **Audit** | **Replay** | **Stale** | **Degraded** | **UI obligation** | **Forbidden transition**

---

## Step A — Critical alert 생성 (sim tick)

| 항목 | 내용 |
|------|------|
| Emitted | `VITAL_UPDATED` → `RULE_FIRED` → `ALERT_CREATED` → (`STALE_DETECTED` optional) → `QUEUE_RECOMPUTED` |
| Audit | 각각 append-only (동일 `correlationId` = `tick-{tickId}`) |
| Replay | `replayFromInitialState(bootstrap, entries)` → 동일 `queueOrderIds` / hashes |
| Stale | `forceStale` 시 `lastConfirmedAt` 과거 + `STALE_DETECTED` — **숨김 금지** (`07`) |
| Degraded | 없음 (healthy tick) |
| UI obligation | Primary에 critical 표시 준비, stale 배너 (`ui-safety`) |
| Forbidden | envelope 없이 alert 객체만 UI에 주입 |

---

## Step B — Operator Ack

| 항목 | 내용 |
|------|------|
| Emitted | `ALERT_ACKED` → `QUEUE_RECOMPUTED` |
| Audit | append |
| Replay | 동일 |
| Stale | 유지 |
| Degraded | `OFFLINE`이면 resolve 금지(다음 단계); Ack는 정책에 따라 제한 가능(현 구현: Ack 허용, resolve만 차단) |
| UI obligation | Ack는 **CREATED**만 (`09`) |
| Forbidden | `CREATED` 아닌데 Ack → **throw**, audit 없음 |

---

## Step C — Resolve (이중 확인 토큰)

| 항목 | 내용 |
|------|------|
| Emitted | `ALERT_RESOLVE_REQUESTED` → `ALERT_RESOLVED` → `QUEUE_RECOMPUTED` |
| Audit | append 순서 고정 (`causalParentId`) |
| Replay | 동일 |
| Stale | — |
| Degraded | `OFFLINE` → **throw** `RESOLVE_FORBIDDEN_OFFLINE` (`06`) |
| UI obligation | `ACKNOWLEDGED`만 resolve, confirmation 비어있음 금지 |
| Forbidden | Ack 생략 후 Resolve (`09`) |

---

## Step D — Reconnect (degraded 표시)

| 항목 | 내용 |
|------|------|
| Emitted | `DEGRADED_ENTER`(`RECONNECTING`) → `DEGRADED_EXIT` |
| Audit | append |
| Replay | degradedMode 최종 `HEALTHY` (단순 시퀀스) |
| Stale | — |
| Degraded | **silent fallback 금지** — 이벤트로만 전이 (`06`) |
| UI obligation | `degradedBannerRequired` true during transition (웹은 최종 HEALTHY면 배너 소멸 가능 — 시연 시 순서 조정 가능) |
| Forbidden | 네트워크 복구 시 이벤트 없이 상태만 변경 |

---

## Observability (문서 `SAFETY_ORIENTED_OBSERVABILITY.md`)

| Metric (구현 예정 훅) | 소스 |
|------------------------|------|
| `visibility_failure_total` | UI에서 `verifyCriticalVisibilityInvariant` false 샘플링 |

현재 스켈레톤: 상태 함수만 제공, 수집 파이프는 후속 PR.
