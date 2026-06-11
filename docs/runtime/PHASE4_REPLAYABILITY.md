# PHASE 4 — Operational Replayability

**구현:** `@dsd/replay-runtime`

| 기능 | API / 동작 |
|------|------------|
| Scenario replay loader | 초기 `bootstrapDemoPatient` + `kernel.audit.entries` (동일 seed) |
| Deterministic seed | `createRespiratoryScenarioContext(seed).nextId()` |
| Event timeline reconstruction | `replayFromInitialState(initial, entries)` |
| Audit replay | audit 배열 = timeline |
| Degraded replay | `DEGRADED_*` 이벤트 포함 시 reducer로 복원 |
| Stale replay | `STALE_*` 이벤트 |
| Queue ordering replay | `extractQueueHashesFromTimeline` |
| Mismatch detection | `assertReplaySameQueueHashes(a,b)` (두 실행의 hash 시퀀스 비교) |

**Forbidden:** `Date.now()` 기반 correlation을 재현에 의존 — 사용자 행동 correlation은 **호출자가 문자열로 고정** (`user-ack-1` 등).
