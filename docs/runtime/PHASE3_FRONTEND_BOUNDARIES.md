# PHASE 3 — Frontend Runtime Boundaries (React / Next)

**바인딩 문서:** `CRITICAL_VISIBILITY_GUARANTEE.md`, `06`, `07`, `09`, React Query/Zustand 기존 팀 규약(코드 도입 시).

| 관심사 | 규칙 |
|--------|------|
| P0 component isolation | Critical primary / alert queue / ack-resolve는 **별도 클라이언트 컴포넌트** 파일로 분리; 비P0가 P0 props를 오염시키지 않음 |
| Rendering priority | 서버 렌더 시 **degraded/stale 배너**가 critical 영역을 가리지 않는 z-index 정책 (HF) |
| State ownership | **임상 진실**은 kernel+audit 스냅샷에서만; UI zustand는 선택·패널만 |
| Selector policy | 리스트는 `queueOrderIds` 순서만 구독 |
| Optimistic rollback | 낙관 사용 시 **실패하면** `ALERT_ACK_ROLLBACK` emit + append (문서 `09`) — 미구현 시 낙관 금지 |
| WebSocket fallback | 끊김 시 `DEGRADED_ENTER`/`RECONNECTING` emit (본 레포는 시뮬 `simulateReconnect`로 동일 계약 검증) |
| Stale propagation | 서버/시뮬에서 `STALE_*` 이벤트 또는 `deriveStaleMap` 결과를 배너에 연결 |
| Suspense fallback | suspense 경계는 **“데이터 없음”을 stale/offline과 혼동 불가**한 카피 |
| Replay-safe rendering | UI는 **동일 audit entries** 재생 시 동일 순서 렌더(키=eventId 금지 난수) |
| Deterministic recompute | 큐 해시는 `QUEUE_RECOMPUTED.payload.inputSnapshotHash` 단일 출처 |

**Forbidden:** 페이지에서 `reduceClinical` 직접 호출 + audit 생략.
