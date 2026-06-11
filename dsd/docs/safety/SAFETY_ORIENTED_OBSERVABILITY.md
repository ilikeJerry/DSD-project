# Safety-oriented Observability — DSD

**문서 유형:** Safety observability specification  
**상태:** Accepted

---

## 1. WHY

가용성 지표만으로는 **놓침·오표시·오조작**을 조기에 포착하기 어렵다. 본 문서는 **임상 안전 프록시 지표**를 정의한다.  
**주의:** 지표는 **임상 판단을 대체하지 않는다.** 알람은 운영 조사를 **시작**한다.

---

## 2. MUST metrics (initial set)

| Metric | Definition (operational) | Response |
|--------|--------------------------|----------|
| `visibility_failure_total` | Critical 존재 ∧ Primary empty | SEV-1 triage |
| `hidden_critical_by_filter_total` | 필터로 가려진 critical 존재 | HF + bug |
| `stale_critical_seconds` | Critical ∧ staleness 초과 | policy review |
| `ack_latency_seconds` | create→ack | capacity/HF |
| `resolve_without_ack_total` | 정책 위반 탐지 | block + incident |
| `queue_recompute_skew` | 입력 해시 동일인데 출력 상이 | incident |
| `degraded_mode_minutes` | 모드 체류 시간 | infra |
| `dedupe_suppressed_storm_rate` | 억제 과다 | tuning |

---

## 3. Logging fields (minimum)

모든 안전 알람에는 `correlationId`, `build`, `policyVersion` 포함.

---

## 4. Privacy

환자 식별자 최소화; raw vitals은 **내부 도구**에서만.

---

## 5. Rejected alternative

### “사용자 행동 전부 raw tracking”

**거부:** 법적·윤리 리스크. **집계·샘플링·임계**가 필요하다.
