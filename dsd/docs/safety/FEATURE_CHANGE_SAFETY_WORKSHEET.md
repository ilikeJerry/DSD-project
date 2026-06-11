# Feature Change — Safety & Traceability Worksheet (필수)

**적용:** 모든 기능 추가/변경 PR (P0/P1/P2 공통; 깊이만 다름)

---

## 메타

- **Ticket:**  
- **Owner:**  
- **Release risk class:** P0 / P1 / P2  
- **Related ADR / policy docs:**

---

## 1. 기능 목적 (WHY)

(운영 가치 한 문장)

---

## 2. 임상 안전 영향

- 놓침 / 오판 / 오조작 / 신뢰 오류 중 무엇을 바꾸는가?

---

## 3. 실패 시 리스크

(최악 사례 2개 이상, happy path 금지)

---

## 4. HFE 고려사항

- scanability, interruption, color independence, keyboard, fatigue

---

## 5. 이벤트 로그 구조

- 추가/변경되는 `type` 목록  
- `correlationId` 규칙  
- `causalParentId` 연결

---

## 6. 상태 전이 정의

- 상태 다이어그램 또는 표

---

## 7. degraded mode 동작

- 각 degraded 모드에서 UI/행동이 어떻게 달라지는가

---

## 8. replay 가능 여부

- 어떤 bundle로 재현하는가 (scenarioId/seed/event export)

---

## 9. observability metric

- 신호 이름, 임계, 대응

---

## 10. rollback 전략

- 플래그 / 버전 / 데이터 마이그레이션 유무

---

## 11. release risk level

- P0/P1/P2 및 게이트 링크 (`../release/RELEASE_SAFETY_CHECKLIST.md`)

---

## 12. validation checklist

- HF checklist 항목 중 적용되는 것 체크  
- 시나리오 ID 목록
