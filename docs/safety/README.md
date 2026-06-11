# Safety Documentation (`docs/safety/`)

본 디렉터리는 **Clinical Safety Governance**의 규범적 근거(Normative references for engineering)이다.

**읽는 순서 (권장):**

1. `00-safety-governance-overview.md`  
2. `01-safety-critical-surface-map.md`  
3. `02-safety-classification-framework.md`  
4. `03-event-envelope-standard.md`  
5. `04-audit-trail-architecture.md`  
6. `09-ack-resolve-state-machine.md`  
7. `05-alert-prioritization-traceability.md`  
8. `06-degraded-mode-policy.md`  
9. `07-stale-data-policy.md`  
10. `08-incident-replay-architecture.md`  
11. `CRITICAL_VISIBILITY_GUARANTEE.md` (**P0 invariant**)  
12. `10-fatigue-aware-alert-dedupe-policy.md`  
13. `FEATURE_CHANGE_SAFETY_WORKSHEET.md` (변경 PR 필수)  
14. `SAFETY_ORIENTED_OBSERVABILITY.md`  
15. `HANDOFF_SUMMARY_SPEC.md`

**거부된 접근 (Rejected alternatives 요약):**

- **“UI만으로 안전을 증명”**: 거부. 가시성은 필요조건이며, **상태 전이·감사·재현**이 필요충분조건에 가깝다.  
- **“동일 심각도를 색만으로 구분”**: 거부 (HFE 및 접근성 위반).  
- **“Critical dismiss 단일 클릭”**: 거부. 의미 분리 및 확인 단계는 `09-ack-resolve-state-machine.md`를 따른다.
