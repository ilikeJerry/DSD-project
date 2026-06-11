# Safety Governance Overview — DSD

**문서 유형:** Safety governance + engineering policy  
**상태:** Accepted (MVP baseline)  
**범위:** Clinical operations **frontend** 및 **mock/simulation** 운영까지. 실제 SaMD 분류·SOUP·V&V는 제품 법규 매트릭스에 종속되며, 본 문서는 **설계·운영 방어층**을 정의한다.

---

## 1. 목적 (WHY)

DSD는 **정보 표시 도구**가 아니라, 다환자·다이벤트 환경에서 **위험 인지·우선순위·조치 기록**을 지원한다. 본 제품군의 사고는 대개 다음 형태로 나타난다.

- **놓침 (missed recognition):** Critical이 “존재하지만 보이지 않음”  
- **오판 (wrong prioritization):** 덜 위급한 환자에게 주의가 쏠림  
- **오조작 (wrong action on wrong context):** 환자 불일치, 조기 resolve  
- **신뢰 오류 (trust error):** stale/partial 데이터를 최신·완전으로 오인  
- **추적 불능 (non-auditability):** “왜 그렇게 보였는가”를 사후에 재구성할 수 없음  

본 거버넌스는 위 실패 모드를 **예외 우선**으로 설계하여 방어한다.

---

## 2. Safety-critical workflow identification

아래는 **안전 관련 임계 경로 (safety-critical paths)** 로 간주한다.

| 경로 | 실패 모드 | 방어 요구 |
|------|-----------|-----------|
| Critical 가시성 | 놓침 | `Critical visibility guarantee` (별도 문서화된 불변식) |
| Alert 큐 재계산 | 잘못된 순서 | `queue recompute trace` + 검증 가능한 입력 스냅샷 |
| Ack | “읽음”이 기록되지 않음 | 이벤트 기록 + UI 낙관 롤백 규칙 |
| Resolve | 조기 종료, 오환자 | 의미 분리 + 확인 + 환자 맥락 고정 |
| Handoff summary | 교대 정보 단절 | 구조화 요약 + 누락 강조 |
| Degraded / stale | 잘못된 신뢰 | 정책 기반 배지·정렬·(선택) 조치 제한 |

---

## 3. 운영 원칙

1. **모든 Critical workflow는 replay / audit / rollback 가능해야 한다** (사용자 요구사항 채택).  
2. **모든 상태 전이는 이벤트로 기록 가능해야 한다.** UI 내부 숨은 상태 전이 금지(예외는 ADR에 명시).  
3. **Happy path 중심 문서/테스트 금지.** 예외·동시성·지연·부분 데이터가 1급 시민이다.  
4. **애매하면:** 추적 가능성, 재현 가능성, 안전성, 운영 가능성, 책임성 순으로 우선한다.

---

## 4. Policy vs Implementation

| Policy (규범) | Implementation (참고) |
|---------------|------------------------|
| 이벤트 envelope 필드 | `03-event-envelope-standard.md` |
| 감사 append-only | `04-audit-trail-architecture.md` |
| Ack/Resolve 의미 | `09-ack-resolve-state-machine.md` |
| P0 게이트 | `../release/RELEASE_SAFETY_CHECKLIST.md` |

---

## 5. Rejected alternatives

### A. “감사는 콘솔 로그로 충분”

**거부 이유:** 콘솔 로그는 **구조·보존·상관관계**가 불충분하며, 사고 분석에서 **증거능력**이 약하다.

### B. “정렬은 UI에서 알아서”

**거부 이유:** 정렬은 임상 우선순위 판단의 일부이다. **입력·버전·결과**를 추적 가능하게 남겨야 한다 (`05-alert-prioritization-traceability.md`).

---

## 6. 관련 문서

- `../hf/HF_VALIDATION_CHECKLIST.md`  
- `../incidents/INCIDENT_RESPONSE_RUNBOOK.md`  
- `../release/RELEASE_SAFETY_CHECKLIST.md`
