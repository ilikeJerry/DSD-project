# Event Envelope Standard — DSD

**문서 유형:** Normative technical standard (implementation MUST conform)  
**상태:** Accepted

---

## 1. WHY

사고 분석·감사·재현의 공통 실패는 **이벤트가 서로 상관관계 없이 흩어진 것**이다. 본 표준은 **상관관계(correlation)**·**인과(causality)**·**출처(source)**를 한 필드 세트로 고정한다.

---

## 2. Envelope fields (필수 / 권장)

### 2.1 필수 (MUST)

| Field | Type | 설명 |
|-------|------|------|
| `eventId` | string (ULID 권장) | 전역 고유 |
| `ts` | string (RFC3339) | 관측 시각(클라이언트 시계 기준일 수 있음 — 정책 참고) |
| `schemaVersion` | semver | 스키마 진화 |
| `type` | string | 예: `ALERT_CREATED`, `ALERT_ACKED`, `QUEUE_RECOMPUTED`, `VITAL_UPDATED` |
| `source` | enum | `simulation` \| `live` \| `system` |
| `correlationId` | string | **단일 사용자 행동 또는 단일 tick 배치**의 상관 키 |
| `build` | string | git SHA 또는 버전 |

### 2.2 조건부 필수 (SHOULD, 특정 type에서 MUST)

| Field | When required |
|-------|----------------|
| `causalParentId` | 원인 이벤트가 존재할 때 (예: RULE_FIRED → ALERT_CREATED) |
| `patientId` | 환자 맥락이 있을 때 |
| `alertId` | 알림 도메인 이벤트 |
| `actor` | 인적 행위(ack/resolve/note) |
| `payloadHash` | 큰 payload 대신 해시(재현 시 payload는 별도 저장소) |

### 2.3 권장 (MAY)

| Field | 설명 |
|-------|------|
| `scenarioId` | 결정론 재생 |
| `tickId` | 시뮬레이션 배치 경계 |
| `dedupeKey` | fatigue-aware dedupe 정책 추적 |
| `confidence` | 데이터 신뢰도(정책은 `07-stale-data-policy.md`) |

---

## 3. correlationId 규칙

**발급:**

- 사용자 단일 행동(예: Ack 클릭): 클릭 세션에서 `correlationId` 1개 생성, 관련 이벤트 전부에 부착.  
- 시뮬레이션 tick: `tick-{tickId}` 또는 ULID 1개를 배치에 부착.

**금지:**

- 페이지 로드 단위로만 correlation을 두는 것(너무 거침)  
- 이벤트마다 새 correlation만 생성하는 것(상관 불가)

---

## 4. Causality chain (예시)

`VITAL_UPDATED` → `RULE_FIRED` → `ALERT_CREATED` → `QUEUE_RECOMPUTED` → (user) `ALERT_ACKED`

각 단계는 `causalParentId`로 연결 가능해야 한다.

---

## 5. Policy: clock trust

클라이언트 `ts`는 조작 가능하다. **운영 정책:**

- `live` 모드에서는 서버 수신 시각을 권위로 삼는 것이 이상적(구현 시).  
- `simulation` 모드에서는 `tickId`와 상대 순서가 권위.

---

## 6. Rejected alternatives

### A. “콘솔 JSON stringify만”

**거부:** 스키마·상관·인과가 없어 사고 분석 불가.

### B. “모든 상태를 이벤트 sourcing으로”

**거부 (MVP):** 운영 복잡도 과다. **핵심 전이만** envelope로 충분하다는 절추—증거가 필요하면 ADR로 확장.
