# Critical Alert Visibility Guarantee — Normative

**문서 유형:** Safety invariant (P0)  
**상태:** Accepted

---

## 1. WHY

Critical 알림이 존재하는데 UI가 “조용히” 사라지는 것은 **가장 비용이 큰 실패**이다. 본 문서는 **가시성 불변식**을 정의한다.

---

## 2. Invariants (MUST)

### INV-1 존재성

시스템이 `OPEN_CRITICAL_COUNT > 0`로 판단하는 한:

- Primary safety region은 **비어 있지 않아야 한다** (empty state 금지).  
- 최소 1건의 Critical 표현(식별자 + 근거 1줄 + 심각도 인코딩)이 **뷰포트에 노출**되어야 한다.

### INV-2 필터 불가침

사용자 필터/검색이 Critical를 **완전히 제거**할 수 없다.

**허용 패턴:**

- 필터 적용 시 상단에 **“미표시 Critical N건”** 고정 배너 + 원클릭으로 필터 해제 또는 “Critical만 보기”.

### INV-3 색 독립

Critical 가시성은 **색에만 의존하지 않는다** (아이콘+텍스트+패턴/스트립).

### INV-4 키보드

Critical 목록 첫 항목으로 포커스 이동 가능해야 하며, **Ack는 키보드로 도달 가능**해야 한다 (`../hf/HF_VALIDATION_CHECKLIST.md`).

---

## 3. Observability (MUST metrics)

- `visibility_failure_total` (정의: Critical 존재 + Primary empty 감지) — **0이어야 정상**  
- `hidden_critical_by_filter_total`

---

## 4. 예외 우선 검증 시나리오

1. 필터 최대치 + storm 동시  
2. 작은 뷰포트(노트북) + sticky 축약  
3. degraded 모드 배너가 Primary를 가리는 레이아웃 실수(금지)

---

## 5. Rollback / release

이 불변식을 깨는 변경은 **P0 롤백 SLA** 대상 (`../release/ROLLBACK_STRATEGY.md`).

---

## 6. Rejected alternative

### “사용자가 알아서 필터”

**거부:** 운영 피로로 놓침. 필터는 있되 **불가침 규칙**이 필요하다.
