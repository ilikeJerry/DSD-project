# Stale Data Policy — DSD

**문서 유형:** Operational safety policy  
**상태:** Accepted

---

## 1. WHY

stale 데이터는 “틀린 숫자”가 아니라 **시간축이 어긋난 임상 추론**이다. 정책 없이 표시하면 **과신** 또는 **불필요한 공포** 둘 다 발생한다.

---

## 2. Definitions

| Term | Definition |
|------|------------|
| `lastConfirmedAt` | 권위 있는 갱신 시각(소스별) |
| `stalenessMs` | now - lastConfirmedAt |
| `STALE_THRESHOLD_WARN` | 경고 (예: 구성값) |
| `STALE_THRESHOLD_BLOCK` | (선택) 특정 조치 제한 |

---

## 3. MUST UI

- 전역 **Last updated** + (가능하면) 필드별 age.  
- stale 초과 시 **배지 텍스트 고정**(색만 금지, HF 체크리스트 준수).

---

## 4. MUST prioritization interaction

**정책 선택지 (조직이 하나를 채택):**

- **A conservative:** stale이면 rank **하향**(“덜 확실한 urgent”)  
- **B conservative opposite:** stale이면 rank **상향**(“확인 필요”)  

**본 제품 기본 권장:** **B는 오탐 과잉**으로 이어질 수 있어, 기본은 **A + 명시적 ‘확인 필요’ 배지** 조합(운영 합의 필요).

선택 결과는 ADR에 기록한다.

---

## 5. MUST events

- `STALE_DETECTED`, `STALE_CLEARED` (스로틀링 가능)  
- `QUEUE_RECOMPUTED` 입력에 staleness 포함 (`05` 문서)

---

## 6. 예외 시나리오

- **부분 채널만 stale** (SpO2만 오래됨) → 환자 카드에 **필드 단위** 표시.  
- **clock skew** → `ts` 신뢰 한계를 문서화하고 서버 시각 권장.

---

## 7. Rejected alternative

### “stale이면 아예 Critical 표시 숨김”

**거부:** 놓침 위험. 가시성 보장과 충돌한다. **표시는 유지**, 신뢰 표시 및 정렬 가중만 조정한다.
