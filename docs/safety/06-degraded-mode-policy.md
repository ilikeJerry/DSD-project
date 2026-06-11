# Degraded Mode Policy — DSD

**문서 유형:** Operational safety policy  
**상태:** Accepted

---

## 1. WHY

실시간 임상 UI의 사고는 “기능이 꺼졌다”보다 **“꺼진 줄 알았는데 살아있는 것처럼 보였다”**에서 온다. degraded mode는 **신뢰 표현**과 **행동 제한**의 결합이다.

---

## 2. Modes (정의)

| Mode | 의미 | 사용자가 알아야 할 것 |
|------|------|----------------------|
| `HEALTHY` | 정상 수신/처리 | 없음 |
| `DEGRADED_REALTIME` | 지연/부분 갱신 | “최신이 아닐 수 있음” |
| `RECONNECTING` | 세션 복구 중 | 조치가 큐잉/지연될 수 있음 |
| `OFFLINE` | 연결 불가 | 읽기 전용 또는 조치 불가 |
| `SIMULATION_LAG` | 시뮬 백프레셔 | tick 대비 wall 지연 |

---

## 3. MUST behaviors

1. **모드는 항상 가시** (global banner 또는 고정 chip).  
2. **모드 전이는 이벤트** (`DEGRADED_ENTER`, `DEGRADED_EXIT`) + `correlationId`.  
3. `OFFLINE`에서 **Resolve 금지**(정책 기본) 또는 **queued intent** 명시.

---

## 4. UI safety rules

- degraded 중에도 **Critical 존재는 숨기지 않는다** — 단, **데이터 신뢰 표시**를 강제한다.  
- “자동으로 최신” 문구 금지.

---

## 5. 예외 시나리오

- **reconnect 직후 snapshot 불일치** → 단일 `REPLACE_STATE` 이벤트(또는 동등)로 재구성, 이중 패치 금지.  
- **degraded + storm** → 렌더 배치 우선순위는 `01-safety-critical-surface-map.md`의 P0 영역.

---

## 6. Rejected alternative

### “연결 끊김도 UI는 그대로, 백그라운드만 재시도”

**거부:** 침묵 실패(silent failure) 위험. 사용자는 **즉시** 모드를 인지해야 한다.
