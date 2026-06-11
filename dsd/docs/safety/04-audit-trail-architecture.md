# Audit Trail Architecture — Append-only Operational Timeline

**문서 유형:** Technical design + safety note  
**상태:** Accepted

---

## 1. WHY

임상 운영에서 “무슨 일이 있었는가”는 **법적·품질·교육**의 핵심 질문이다. 편집 가능한 로그는 **신뢰를 파괴**한다. 본 아키텍처는 **append-only**를 불변식으로 둔다.

---

## 2. Append-only timeline (불변식)

**MUST NOT:** 타임라인 레코드의 수정·삭제를 UI/클라이언트에서 수행한다.  
**MUST:** 잘못 기록 시 **정정 이벤트(CORRECTING_APPEND)**를 추가하는 패턴(내용은 정책으로 정의).

> MVP에서 정정 이벤트를 미구현할 경우: **운영 제한**으로 “잘못된 기록 불가” 쪽으로 설계(낙관 범위 축소).

---

## 3. Audit event vs domain event

| 종류 | 목적 | 예 |
|------|------|-----|
| **Domain event** | 시스템 내부 진실 재구성 | `RULE_FIRED` |
| **Audit event** | 책임·인지·조치 | `ALERT_ACKED`, `ALERT_RESOLVED` |

**정책:** Audit은 **사람 행위**와 **시스템이 사용자에게 한 공지**(예: degraded enter)를 포함할 수 있다.

---

## 4. Storage tiers (구현 참고)

| Tier | 내용 |
|------|------|
| **Runtime ring** | 최근 N분/ N건 (디버깅·모니터) |
| **Session export** | 데모/분석용 JSON 다운로드 (PII 최소화) |
| **Server authoritative** (future) | 불변 저장소 |

---

## 5. Payload minimization (PII)

**MUST:** 환자 전체 이름 대신 **내부 ID + 이니셜 정책** 등 조직 기준 준수.  
**MUST NOT:** 불필요한 진단명·자유서술을 감사에 남기기(목적 외 이용 위험).

---

## 6. Replay relationship

감사 타임라인은 **사고 스토리라인**이고, 기술 재현은 `08-incident-replay-architecture.md`의 **scenario + event stream**과 결합된다.

---

## 7. Rejected alternative

### “DB row update로 Ack 상태만 변경”

**거부 (추적성 관점):** 상태 변경이 **사건으로 남지 않으면** 운영 분석이 불가능하다. 최소한 **append audit** 또는 **immutable transition log**가 병행되어야 한다.
