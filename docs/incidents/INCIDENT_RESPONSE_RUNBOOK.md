# Incident Response Runbook — DSD Frontend / Operations UI

**문서 유형:** Operational runbook  
**상태:** Accepted

---

## 0. Severity (운영)

| Level | 예시 | 즉시 조치 |
|-------|------|-----------|
| SEV-1 | Critical 미가시, 잘못된 resolve 유도 | **롤백/플래그 off** + comms |
| SEV-2 | 정렬 오류 지속 | 플래그 + replay |
| SEV-3 | 성능 저하 | throttle + 관측 |

---

## 1. Triage (5분 이내)

1. 증상 분류: **가시성 / 정렬 / stale / ack / 성능**  
2. 영향 범위: 병동/테넌트/버전  
3. `correlationId` 확보(가능 시)

---

## 2. Immediate mitigation (완화 우선)

- **가시성 SEV-1:** 기능 플래그로 문제 UI 경로 비활성화 또는 이전 빌드  
- **데이터 신뢰:** `DEGRADED_ENTER` 공지 + 조치 제한(정책)  
- **comms:** 임상 운영에 “수동 확인” 지시(조직 프로세스)

---

## 3. Reproduction bundle

`../safety/08-incident-replay-architecture.md`의 최소 번들 수집.

---

## 4. Replay analysis

1. scenario replay (expected)  
2. event log replay (actual)  
3. diff: `QUEUE_RECOMPUTED` 입력/출력

---

## 5. Fix / regression

- 코드 수정 + **새 시나리오** 추가  
- HF checklist 재실행(P0)

---

## 6. Post-incident

`INCIDENT_REVIEW_TEMPLATE.md` 완료 + (정책 변경 시) safety 문서 개정 PR

---

## 7. Rejected alternative

### “핫픽스만 올리고 문서는 나중”

**거부:** 동일 실패 재발. **최소 사후 문서**는 24–48시간 SLA 권장.
