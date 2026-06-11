# Fatigue-aware Alert Dedupe Policy — DSD

**문서 유형:** Safety + HFE policy  
**상태:** Accepted

---

## 1. WHY

중복 알림은 **인지 자원을 소모**시키고, 결국 **중요 신호까지 무시**하게 만든다. dedupe는 “조용히 삭제”가 아니라 **피로를 줄이되 추적 가능하게** 설계해야 한다.

---

## 2. Definitions

| Term | Meaning |
|------|---------|
| `dedupeKey` | 규칙+환자+채널 등으로 정의되는 키 |
| `suppressionWindow` | 반복 억제 시간창 |
| `escalationWindow` | “같은 문제가 지속”을 드러내기 위한 창 |

---

## 3. Policy (권장 기본)

1. 동일 `dedupeKey`가 `suppressionWindow` 내 재발하면 **새 UI row 폭주 대신**:  
   - 기존 row의 `repeatCount++`  
   - `lastFiredAt` 갱신  
   - `ALERT_SUPPRESSED` 또는 `ALERT_MERGED` 이벤트 기록  
2. `escalationWindow` 내 반복이 임계 초과하면 **fatigue 억제를 완화**하여 다시 두드리기(단, INV-1과 충돌 금지).

---

## 4. MUST traceability

- dedupe 결과는 **사용자가 펼쳐서** 근거를 볼 수 있어야 한다(최소: 최근 발화 시각 + rule id).  
- 감사에는 **억제/병합**이 남아야 한다.

---

## 5. 예외 우선

- storm 시 dedupe가 과하면 **중요한 신호까지 병합**될 수 있다 → `QUEUE_RECOMPUTED`와 연계해 “병합된 critical 묶음” 표기.

---

## 6. Rejected alternative

### “백엔드에서 조용히 드롭”

**거부:** 추적 불가. 최소한 이벤트로 **드롭/억제 사실**이 남아야 한다.
