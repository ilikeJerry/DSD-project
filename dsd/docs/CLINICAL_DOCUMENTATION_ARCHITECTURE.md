# Clinical Documentation Architecture — DSD

**문서 유형:** Meta-architecture (documentation system)  
**상태:** Accepted

---

## 1. WHY

의료 운영 제품의 실패는 코드만이 아니라 **문서·증거·게이트의 부재**로 드러난다. 본 아키텍처는 문서를 **정책(policy)**, **설계(design)**, **운영(runbook)**, **검증(validation)**으로 분리해 **추적 가능한 변경**을 가능하게 한다.

---

## 2. Directory system (normative)

| Path | 클래스 | 내용 |
|------|--------|------|
| `docs/safety/` | Policy + safety-critical design | 불변식, envelope, 감사, degraded/stale, replay, dedupe |
| `docs/hf/` | Human factors validation | 체크리스트, 리뷰 트리거 |
| `docs/incidents/` | Operational/clinical incident | 런북, 사후 템플릿 |
| `docs/release/` | Release governance | 출하 게이트, 롤백 |

**개발 전용 세부** (선택): `docs/dev/` — 시뮬레이터 내부, 프로파일링. **안전 불변식은 `safety/`에만.**

---

## 3. Document types & required sections

### 3.1 Policy document (MUST)

- Purpose (WHY)  
- MUST/ MUST NOT  
- Exception-first scenarios  
- Rejected alternatives (minimum 1)

### 3.2 Design note (SHOULD)

- Data structures  
- Event types impacted  
- Implementation pointers (files)

### 3.3 Runbook (MUST for operations)

- Triage  
- Mitigation  
- Evidence bundle  
- Escalation

---

## 4. Traceability chain (documentation ↔ runtime)

1. Policy (`docs/safety/*.md`)  
2. Worksheet (`FEATURE_CHANGE_SAFETY_WORKSHEET.md`) per change  
3. Events (`03-event-envelope-standard.md`)  
4. Tests/scenarios (repo `features/scenarios` when implemented)  
5. Release record (`docs/release` append or ticketing system)

---

## 5. Rejected alternative

### “모든 것을 Confluence에만”

**거부:** 코드와 분리된 진실은 **드리프트**한다. 규범 문서는 **repo에 버전**되어야 한다.
