# Release Safety Checklist — DSD (RC / GA)

**문서 유형:** Gate checklist  
**상태:** Accepted

**사용:** RC 빌드 태깅 전후, GA 전 최종 확인.

---

## A. Evidence & versioning

- [ ] `build` SHA 기록됨  
- [ ] `schemaVersion` (event envelope) 호환성 확인 (`../safety/03-event-envelope-standard.md`)  
- [ ] Scenario pack version pinned

---

## B. P0 functional invariants

- [ ] **Critical visibility:** `../safety/CRITICAL_VISIBILITY_GUARANTEE.md` 시나리오 통과  
- [ ] **Ack/Resolve semantics:** 분리 위반 없음 (`../safety/09-ack-resolve-state-machine.md`)  
- [ ] **Append-only timeline:** 감사 삽입 검증  
- [ ] **QUEUE_RECOMPUTE trace:** 이벤트 존재/필드 검증 (`../safety/05-alert-prioritization-traceability.md`)

---

## C. Degraded / stale

- [ ] `06-degraded-mode-policy.md` 시나리오: 배너/전이 이벤트  
- [ ] `07-stale-data-policy.md` 시나리오: 배지 + 정렬 정책 일치

---

## D. Fatigue / storm

- [ ] dedupe 정책 이벤트 추적 (`../safety/10-fatigue-aware-alert-dedupe-policy.md`)  
- [ ] storm UI: 붕괴/ starvation 없음

---

## E. HF gate (P0)

- [ ] `../hf/HF_VALIDATION_CHECKLIST.md` completed + sign-off

---

## F. Security / privacy

- [ ] 로그/녹화 PII 최소화 확인

---

## G. Rollback readiness

- [ ] `ROLLBACK_STRATEGY.md` 조건 충족 (플래그/버전/담당)

---

## Final decision

| Role | Name | Go / No-Go | Time |
|------|------|------------|------|
| Release captain | | | |
| HF owner | | | |
| Clinical ops (optional) | | | |
