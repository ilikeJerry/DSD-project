# Human-stable Realtime Clinical UX

**목표:** Runtime correctness(이벤트·큐·replay)에 더해, **장시간 운영에서 operator의 집중·상황 인지가 흔들리지 않는** realtime UX를 정의한다.

**절대 기준:** “실시간 변화가 operator 인지를 **불안정**하게 만들지 않는가?”

**구현 경계:** 진실(truth)은 기존 `@dsd/clinical-runtime` + append-only audit이 유지한다. 본 레이어는 **표시·애니메이션·재정렬 타이밍**만 완화한다 — **감사 이벤트·안전 불변식을 숨기거나 변경하지 않는다.**

| 문서 | 내용 |
|------|------|
| `OPERATOR_HUMAN_STABLE_REALTIME_UX.md` | PHASE 1–8 전체 (정책·금지·8관점) |
| `../hf/HF_VALIDATION_CHECKLIST.md` | §H Human-stable realtime (게이트) |

**코드 바인딩:** `@dsd/ui-safety` — `temporalStability.ts`, `alertCalmness.ts`, `reconnectTrust.ts`, `scanContinuity.ts` (순수 함수·상수만).
