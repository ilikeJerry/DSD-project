# Human Factors Engineering Review Workflow — DSD

**문서 유형:** Process + safety gate  
**상태:** Accepted

---

## 1. WHY

HF는 “디자인 취향”이 아니라 **사용 실패 모드**를 줄이는 공학이다. 리뷰가 프로세스에 고정되지 않으면 릴리즈마다 붕괴된다.

---

## 2. Triggers (MUST review)

다음 변경은 HF 리뷰 **필수**:

- Critical 가시성/정렬/필터  
- Ack/Resolve 플로우  
- Handoff 요약  
- degraded/stale 표현  
- alert storm UI  
- 키보드 경로 변경

---

## 3. Roles

- **HF Owner:** (팀 내 1인 지정) 체크리스트 책임  
- **Clinical UX reviewer:** (가능 시) 용어·밀도  
- **Engineering:** 구현 부합 증거(녹화/Playwright)

---

## 4. Artifacts (MUST)

- `HF_VALIDATION_CHECKLIST.md` 완료 기록 (티켓 링크)  
- 시나리오 녹화(PII 최소) 또는 자동 스크린 캡처

---

## 5. Rejected alternative

### “HF는 출시 후 사용자 피드백으로”

**거부:** 임상 운영 UI는 출시 후 비용이 과도하다. **사전 최소 검증**은 P0 게이트다.
