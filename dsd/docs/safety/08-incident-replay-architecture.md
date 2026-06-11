# Incident Replay Architecture — DSD

**문서 유형:** Operational incident + engineering architecture  
**상태:** Accepted

---

## 1. WHY

사고 대응의 중심 질문은 **재현 가능한가**이다. 재현이 없으면 “추측 수정”이 되고, 임상 운영 리스크는 증가한다.

---

## 2. Two-layer replay (필수 개념)

| Layer | 역할 | 산출물 |
|-------|------|--------|
| **Scenario replay** | 입력 시퀀스 재생(결정론) | 동일 tick 입력 |
| **Event log replay** | 실제 시스템이 낸 사실 재생 | 동일 envelope 시퀀스 |

**원칙:** 분쟁/감사에서는 **event log**가 우선 권위. 시나리오는 **기대치 비교**에 사용.

---

## 3. Minimum reproducible bundle

사고 티켓에 첨부 가능한 최소 묶음:

- `build` (SHA)  
- `schemaVersion`  
- `scenarioId` + `seed` (해당 시)  
- `correlationId` 범위 또는 시간창  
- `event export` (append-only)  
- 스크린 녹화(선택, PII 주의)

---

## 4. Workflow (운영)

1. **Triage:** 증상 분류 (가시성/정렬/stale/ack mismatch)  
2. **Mitigation:** 플래그 off / 이전 정책 버전 (`release` 문서)  
3. **Replay:** 로컬/스테이징에서 bundle 재생  
4. **Diff:** `QUEUE_RECOMPUTED` 입력 해시 vs 기대  
5. **Conclusion:** 코드/정책/HF 중 무엇을 바꿀지  
6. **Regression:** 시나리오 추가(재발 방지)

---

## 5. Security / privacy

**MUST NOT:** 운영 환자 데이터를 외부 티켓에 그대로 첨부.  
**MUST:** 내부 보안 저장소 + redaction.

---

## 6. Rejected alternative

### “프로덕션에서 바로 디버그 모드로 전체 상태 덤프”

**거부:** PII·성능·추가 위험. 덤프는 **격리 환경 + 최소 bundle**으로 제한한다.
