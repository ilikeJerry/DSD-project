# Safety Classification Framework — P0 / P1 / P2

**문서 유형:** Policy + release gating rules  
**상태:** Accepted

---

## 1. WHY

동일한 “기능 추가”라도 **임상·운영 리스크**는 다르다. 분류 없이 동일한 리뷰·QA·릴리즈 절차를 적용하면 **(a)** P0가 충분히 보호되지 않거나 **(b)** P2에 과도한 비용이 소모된다.

---

## 2. Definitions

| Class | 정의 | 대표 실패 영향 |
|-------|------|----------------|
| **P0** | 잘못되면 **즉각적 임상 운영 위험**(놓침·오판·오조작·추적 불능) | Critical 미가시, 큐 오류, 잘못된 resolve |
| **P1** | 잘못되면 **운영 효율·맥락 오류** 가능, P0로 전파 가능 | 필터 오해, 트렌드 왜곡(단독으론 치명적이지 않을 수 있음) |
| **P2** | 잘못되어도 **임상 결정 경로에서 분리** 가능 | 테마, 비임상 통계 |

---

## 3. Required gates (요약)

| Gate | P0 | P1 | P2 |
|------|----|----|-----|
| Peer review count | **2** | 1 | 1 |
| Clinical UX / HF trigger | **필수** | 조건부 | 선택 |
| Scenario replay (deterministic) | **필수** | 영향 범위만 | 스모크 |
| Realtime regression suite | **필수** | 선택 | 선택 |
| Rollback SLA | **분 단위 목표** | 시간 단위 | 다음 릴리즈 |
| Observability | **필수 지표** | 권장 | 선택 |

세부 체크리스트: `../release/RELEASE_SAFETY_CHECKLIST.md`

---

## 4. Classification rules (기계적으로 적용 가능하게)

**P0로 강등 불가 조항:** 아래 키워드가 변경에 포함되면 기본 P0.

- `critical`, `severity`, `ack`, `resolve`, `queue`, `sort`, `priorit`, `handoff`, `timeline`, `audit`, `stale`, `degraded`, `replay`

**P2 승격 조건:** P2라도 **P0 화면에 노출**되면 P1 이상.

---

## 5. Tradeoffs

- **엄격 분류:** 비용 증가 vs 사고 비용 감소  
- **선택:** P0 비용을 **자동화·시나리오 팩**으로 상쇄

---

## 6. Rejected alternative

### “팀 합의로 사후 등급 조정”

**거부:** 출하 시점 등급이 흔들리면 게이트가 무의미하다. 등급은 **PR 라벨 + 변경 파일 경로 규칙**으로 고정한다.
