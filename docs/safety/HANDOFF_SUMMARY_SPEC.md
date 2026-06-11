# Clinical Handoff Summary — UI & Data Specification (P0)

**문서 유형:** Safety-critical UI/data spec  
**상태:** Accepted

---

## 1. WHY

교대는 **정보 손실 사고**가 집중되는 구간이다. Handoff summary는 “보고서”가 아니라 **운영 연속성 장치**다.

---

## 2. MUST blocks (누락 시 게이트 실패)

1. **Unresolved critical summary** — 환자 식별자(정책), 규칙, 경과 시간, owner  
2. **Recent deterioration** — 시간창 내 악화 이벤트(최소: rule id + 시각)  
3. **Pending actions** — 미완료 조치(제품 범위 내)  
4. **Unacknowledged alerts** — 건수 + 상위 N + “more”  
5. **Structured notes** — 최소 필드: Situation / Concerns / Actions / If worsens (자유서술만 금지는 아님, **구조는 필수**)

---

## 3. Events (MUST)

- `HANDOFF_OPENED`, `HANDOFF_NOTE_SAVED`, `HANDOFF_ACCEPTED`  
- 각 이벤트는 `correlationId`를 포함하고 감사 타임라인에 반영된다.

---

## 4. Safety rules

- Accept 전 incoming의 제한 가능(정책)  
- Critical owner 공백은 **배너 SEV** 취급

---

## 5. 예외 우선

- 교대 중 storm: summary는 **요약 유지**, 상세는 drill-down

---

## 6. Rejected alternative

### “자유 텍스트 한 줄 handoff”

**거부:** 구조화 없이는 **누락이 재현 불가**하다. 최소 블록은 강제한다.
