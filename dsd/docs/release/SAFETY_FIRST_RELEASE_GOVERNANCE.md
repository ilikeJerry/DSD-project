# Safety-first Release Governance — DSD

**문서 유형:** Release governance (clinical safety priority)  
**상태:** Accepted

---

## 1. WHY

릴리즈의 기본 목표는 “기능 배포”가 아니라 **운영 중 안전 상태를 악화시키지 않는 것**이다. 본 문서는 **안전이 속도에 지는 경우의 결정 규칙**을 정의한다.

---

## 2. Principles

1. **Safety > velocity** for P0 surfaces (`../safety/01-safety-critical-surface-map.md`).  
2. **Replayable evidence** is part of “done”.  
3. **Ambiguity resolves to:** traceability, reproducibility, safety, operability, accountability.

---

## 3. Safety-critical freeze

다음 기간/조건에서는 P0 변경 **금지** 또는 **임상 운영 승인 필수**:

- 대규모 현장 데모/교대 고위험 창  
- RC 후 **no-churn** 창(팀 정의)

---

## 4. Mandatory replay validation

- P0 출하: **scenario pack pinned version** 통과 필수 (`RELEASE_SAFETY_CHECKLIST.md`).  
- 실패 시: **no-go**.

---

## 5. Operational signoff

- Release captain: MUST  
- Clinical ops representative: SHOULD for P0 releases (조직에 따라 MUST 승격)

---

## 6. Degraded-mode signoff

degraded/stale 표현 변경은 **HF + safety** 동시 검토.

---

## 7. Post-release monitoring escalation

- `visibility_failure_total > 0` 같은 안전 지표는 **즉시 에스컬레이션** (`../incidents/INCIDENT_RESPONSE_RUNBOOK.md`).

---

## 8. Rejected alternative

### “테스트 통과면 출하, HF는 선택”

**거부 (P0):** HF는 P0 경로에서 **출하 조건**이다.
