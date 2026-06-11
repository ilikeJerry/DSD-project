# DSD — Clinical Operations Platform Documentation Map

**제품명:** DSD (Decision Support Dashboard)  
**문서 성격:** Clinical safety, human factors, traceability, and operational release governance for a **clinical operations** frontend (not a general-purpose ERP).

**판단 기준 (비가역):** 사고 발생 시 **방어·추적·재현·완화·회귀 방지**가 가능한가.

| 영역 | 경로 | 목적 |
|------|------|------|
| Safety governance & policies | `docs/safety/` | 위험 등급, 이벤트·감사, degraded/stale, replay |
| Human factors | `docs/hf/` | 검증 가능한 HFE 게이트 및 체크리스트 |
| Clinical / operational incidents | `docs/incidents/` | 사고 대응, 분석, 템플릿 |
| Release & rollback | `docs/release/` | 출하 게이트, RC, 롤백 |
| Documentation system meta | `docs/CLINICAL_DOCUMENTATION_ARCHITECTURE.md` | policy/runbook/dev 분리 원칙 |
| **Human-stable operator UX** | `docs/ux-human-stability/` | temporal·calmness·scan·reconnect trust |

**정책 vs 구현:** 각 문서는 `Policy` (운영·임상 의도)와 `Implementation notes` (코드 매핑)를 분리한다. 정책 변경은 **임상/안전 검토** 없이 진행하지 않는다.

**현재 저장소 상태:** 애플리케이션 소스가 본 경로에 없을 수 있다. 본 문서는 **구현 전제 아키텍처**이며, 코드 도입 시 `docs/safety/01-safety-critical-surface-map.md`에 실제 파일 경로를 반영한다.
