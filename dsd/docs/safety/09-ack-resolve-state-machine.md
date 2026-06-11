# Ack / Resolve — Meaning Separation & State Machine

**문서 유형:** Safety-critical workflow specification  
**상태:** Accepted

---

## 1. WHY (의미 분리)

| Action | 의미 (운영 정의) | 임상 안전 목적 |
|--------|------------------|----------------|
| **Acknowledge (Ack)** | “이 알림을 **인지**했고, 책임 경로에 올렸다” | 놓침 방지·책임 시작 |
| **Resolve** | “알림이 지시한 **운영 조건을 해소**했거나, 임상적으로 종료 근거가 있다” | 조기 종료 방지 |

**금지:** Ack가 Resolve를 암시하거나, Resolve가 Ack를 대체하는 UI 카피.

---

## 2. State machine (알림 단위)

```
CREATED
  └─(user Ack)→ ACKNOWLEDGED
       └─(user Resolve + confirmation)→ RESOLVED

CREATED
  └─(auto suppress / dedupe policy)→ SUPPRESSED (정책 이벤트 필수)

Any
  └─(clinical condition persists / re-fire rules)→ CREATED (새 alertId 또는 동일 dedupe 정책에 따름)
```

**정책:** `SUPPRESS`는 **fatigue-aware dedupe** 문서의 규칙을 따른다.

---

## 3. Critical restrictions

- **Critical dismiss 단일 클릭 금지.**  
- **Resolve:** 이중 확인 + **환자 헤더 고정 표시** + (선택) 자유텍스트 사유.

---

## 4. Events (MUST)

- `ALERT_CREATED`  
- `ALERT_ACKED` { `actor`, `correlationId` }  
- `ALERT_RESOLVE_REQUESTED` (optional intermediate)  
- `ALERT_RESOLVED` { `actor`, `correlationId`, `confirmationToken` }  
- `ALERT_REOPENED` / `ALERT_SUPERSEDED` (정책에 따름)

---

## 5. Rollback / failure

- 낙관 UI 실패 시: `ALERT_ACK_ROLLBACK` 이벤트(append-only) 또는 동등 표현.

---

## 6. 예외 우선

1. **Ack 후 조건 지속** → 새 이벤트/알림 정책은 fatigue 문서와 충돌 검토.  
2. **offline resolve 시도** → 거부 + 큐잉 이벤트.

---

## 7. Rejected alternative

### “원클릭으로 Ack+Resolve”

**거부:** 의미 분리 붕괴, 조기 종료 위험.
