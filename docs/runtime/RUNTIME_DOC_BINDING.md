# Runtime ↔ Governance Binding (Single Source of Truth)

**상태:** Normative for implementation  
**목적:** `docs/safety/*`, `docs/hf/*`, `docs/release/*`, `docs/incidents/*`에 정의된 불변식을 **코드 경로에 1:1로 고정**한다. 새 철학·추상 governance 금지.

---

## Package 책임 (PHASE 1)

| Package | 구현하는 문서/불변식 | 금지 |
|---------|----------------------|------|
| `@dsd/event-schema` | `03-event-envelope-standard.md` | 임의 `type` 문자열, envelope 미검증 emit |
| `@dsd/audit-runtime` | `04-audit-trail-architecture.md` append-only | 감사 bypass, parse 생략 |
| `@dsd/runtime-sync` | `03` §3 `correlationId` / deterministic id | 추가 정책 레이어 |
| `@dsd/clinical-runtime` | `05` queue trace, `06` degraded, `07` stale, `09` ack/resolve, `10` dedupe key, respiratory slice, **OPERATIONAL_STABILITY** (queue 지문 skip, vital batch, telemetry) | feature store 직접 mutate, audit 우회 |
| `@dsd/replay-runtime` | `08`, **duplicate QUEUE sig detection**, `verifyDeterministicDoubleReplay` | 비결정적 비교 |
| `@dsd/ui-safety` | `CRITICAL_VISIBILITY_GUARANTEE.md` (상태 투영), stale/degraded 배너 의무 | UI 장식만으로 대체 |
| `apps/web` | HF 배너 의무, P0 slice 시연 | silent degraded, stale 숨김 |

---

## Transaction order (모든 변이)

`ClinicalRuntimeKernel` (`packages/clinical-runtime/src/kernel.ts`):

1. **선행 조건 검증** (illegal transition → throw, **audit append 없음**)  
2. `AppendOnlyAuditWriter.append` (Zod parse)  
3. `reduceClinical` (pure replay reducer)

→ **auditability + replayability** 동시 만족 (`04`, `08`, `09`).

운영 안정화 전체: **`OPERATIONAL_STABILITY_PHASES.md`**  
Operator 인지 안정화: **`../ux-human-stability/OPERATOR_HUMAN_STABLE_REALTIME_UX.md`**

---

## PHASE 2 — P0 vertical slice 이벤트 체인

상세 표: `PHASE2_P0_VERTICAL_SLICE.md`

---

## 검증

- `npm run build` (루트): 패키지 순차 빌드  
- `npm run build -w @dsd/web`: Next 빌드  
- HF: `docs/hf/HF_VALIDATION_CHECKLIST.md` (UI 결합 시)
