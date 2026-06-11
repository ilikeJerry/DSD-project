# Operational Rollback Strategy — DSD

**문서 유형:** Operational strategy  
**상태:** Accepted

---

## 1. WHY

임상 운영 UI는 “다음 배포에서 수정”이 항상 허용되지 않는다. **빠른 안전 상태 복귀**가 우선이다.

---

## 2. Rollback tiers

| Tier | Mechanism | When |
|------|-----------|------|
| R0 | **Kill switch / feature flag** (P0 UI off) | SEV-1 suspected |
| R1 | **Traffic revert** to previous deployment | R0 불충분 |
| R2 | **Config revert** (policyVersion, thresholds) | 정책 오류 |

---

## 3. P0 rollback SLA (권장 목표)

- **Decision:** ≤ 15 minutes from page  
- **Execution:** ≤ 30 minutes total (조직 인프라에 종속)

---

## 4. Data considerations

- 감사 append-only는 **삭제 롤백 불가**. 롤백은 **코드/설정** 중심.  
- 잘못된 감사 폭주는 **수집 중지** + incident (`../incidents/`).

---

## 5. Post-rollback requirements

- [ ] incident ticket opened  
- [ ] replay bundle attached  
- [ ] evidence bundle / CI run id linked (`docs/release/VERIFICATION_GOVERNANCE.md`)  
- [ ] HF checklist reviewed if UI path changed

---

## 6. Rejected alternative

### “Git revert만이 롤백”

**거부:** 배포 파이프라인/캐시/플래그 없이는 **느리고 불완전**할 수 있다. **R0 플래그**가 1순위.
