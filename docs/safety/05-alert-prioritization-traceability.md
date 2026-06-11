# Alert Prioritization Traceability — DSD

**문서 유형:** Safety + traceability design  
**상태:** Accepted

---

## 1. WHY

“왜 이 환자가 위에 있는가?”에 답하지 못하면 **운영 분쟁·사고 분석·교육**이 불가능하다. 정렬은 감각이 아니라 **정책의 함수**이며, 함수 입력은 기록되어야 한다.

---

## 2. Prioritization model (정책)

**함수 개념:** `rank = f(inputs; policyVersion)`

**입력 (예시 — 제품이 채택하는 최소 집합):**

- `severity` (ordinal)  
- `acknowledged` (bool)  
- `unresolvedDuration`  
- `dataConfidence` / `staleness`  
- `deteriorationSignal` (optional)  
- `dedupeSuppressedCount` (fatigue policy의 부작용 관측)

**출력:**

- `sortKey` (number 또는 복합 키)  
- `reasonCodes[]` (기계 판독 가능한 코드)

---

## 3. MUST event: `QUEUE_RECOMPUTED`

**발생 시점:** 큐/리스트가 사용자에게 보여지기 직전의 **권위 정렬**이 완료될 때마다(배치당 1회 권장).

**payload (최소):**

- `policyVersion`  
- `inputSnapshotRef` (해시 또는 참조 ID)  
- `topK` 환자/알ert ID 순서  
- `correlationId` (tick 또는 사용자 행동)  
- `build`

---

## 4. UI obligation

**MUST:** 운영자가 **한 줄 설명**으로 이유를 볼 수 있어야 한다(예: “미처리·심각도·지연 데이터 페널티”).  
**MUST NOT:** “점수 83”만 표시하고 근거 없음.

---

## 5. 예외 우선 케이스

1. **동일 sortKey 동률** → tie-break는 **명시적** (`unresolvedDuration` 등)이며 이벤트에 기록.  
2. **stale + critical** → 정책에 따라 상향/하향 가능하나 **어느 쪽이든 문서화 필수** (`07-stale-data-policy.md`).  
3. **dedupe로 억제** → UI에 “억제됨”이 아니라 **운영적으로 오해 없는 표현**(카운트/expand).

---

## 6. Rejected alternative

### “정렬은 화면마다 약간 다르게”

**거부:** 오판 및 교육 실패. 정렬은 **단일 정책**과 **단일 trace 이벤트**를 가진다.
