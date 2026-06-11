# Verification governance — merge / release / rollback

**상태:** Normative for CI and release process  
**목적:** trust invariant 위반이 **advisory가 아니라** merge·release·promotion을 물리적으로 차단하고, months-later에도 **build → evidence → approver → rollback** 체인을 재구성한다.

저장소 루트가 `ERP`이면 워크플로는 `/.github/workflows/`에 있으며 `working-directory: dsd`를 사용한다. **`dsd`만 단독 저장소**인 경우 동일 YAML을 `dsd/.github/workflows/`로 옮기고 `paths`·`cache-dependency-path`에서 `dsd/` 접두어를 제거한다.

---

## PHASE 2 — Branch protection (필수 status checks)

GitHub **Settings → Branches → Branch protection** 에서 `main` (및 `release/*`) 에 적용:

| Required check (workflow / job) | 역할 |
|----------------------------------|------|
| `replay-consistency / replay-consistency (P0)` | 리플레이·타임라인 해시 일치 |
| `cross-panel-consistency / cross-panel-consistency (P0/P1)` | `syncVersionKey`·패널 일관 |
| `stale-degraded-gates / stale-degraded-gates (P0)` | stale·degraded·P0 visibility |
| `hydration-runtime-gates / hydration-runtime-gates (P0)` | 결정론 투영 + `next build` |
| `long-session-regression / long-session-regression (P1)` | 큐 안정화 + 장세션 루프 |

**P0 required gates:** 위 표에서 `(P0)` 가 포함된 job 전부.  
**Release branch policy:** `release/*` 에는 동일 + **optional** `release-evidence` 산출물이 프로모션 단계에서 필수(아래 PHASE 5).  
**Hotfix override:** invariant 면제 금지. 최소 증거 = P0 전부 green + `evidence-bundle` + incident 링크. 2인 승인 + 24h 내 사후 검토.  
**Emergency merge:** merge는 가능하도록 별도 정책이 아니라 **branch protection 예외 그룹 없음**을 권장; 긴급 시에도 **동일 gate를 다른 브랜치에서 통과 후 fast-forward**만 허용.  
**Freeze:** 조직 정책으로 merge freeze 시 required checks 유지.  
**Flaky escalation:** P0 gate flake → merge freeze; **재시도로 green 처리 금지**(워크플로에 `retry` 없음). Owner가 결정론·테스트 안정화 후 해제.

---

## PHASE 4 — Artifact persistence & traceability

| 항목 | 정책 |
|------|------|
| **Immutable evidence** | `evidence-bundle.json` + `.integrity.txt` (SHA-256 of canonical JSON line). CI에서 생성 후 **수정 금지**; 재현은 동일 `GITHUB_SHA`에서 `npm run evidence:bundle`. |
| **Retention** | evidence artifact **90d**; gate 실패 업로드 **30d** (워크플로 정의). |
| **Release-to-evidence** | 프로덕션 배포 태그(또는 build id)에 `ciRunId` + `buildSha` + artifact name `dsd-evidence-bundle-{run_id}` 기록. |
| **Rollback-to-evidence** | `ROLLBACK_STRATEGY.md` — incident에 **replay bundle / evidence 링크** 첨부. |
| **CI-to-build** | `GITHUB_RUN_ID` + `GITHUB_SHA`가 번들 본문에 포함. |
| **Integrity** | 프로모션 전 `sha256sum -c` 스타일로 `.integrity.txt` 검증(또는 스크립트). |

---

## PHASE 5 — Release promotion governance

| 단계 | 게이트 |
|------|--------|
| **Staging promotion** | 모든 P0 workflow green + `long-session-regression` green. |
| **Production promotion** | staging 배포에 연결된 **동일 `buildSha`** + **failure-mode 증거**: 번들의 `failureModeReplayEvidence`·`staleDegradedEvidence`·`hydrationParityEvidence`가 스키마 및 정책( const true 등 )을 만족. **Failure-mode evidence 없는 promotion 금지** — 번들 생성 스크립트가 degraded·replay·hydration 필드를 채우며, 스키마로 형식 검증. |
| **Operational signoff** | 운영/임상 역할 분리(조직 RACI). |
| **Release freeze** | 새 promotion만 중단; 이미 통과한 artifact는 읽기 전용 유지. |
| **Rollback-ready** | R0/R1 경로가 활성화되어 있고, 이전 알려진 good 빌드의 evidence artifact가 지정되어 있어야 함. |

---

## PHASE 6 — Telemetry enforcement (자동 연결)

프로덕션 메트릭이 아래를 넘으면 **alert → (정책) freeze / release block / rollback review** 파이프라인을 연결한다(구현은 관측 스택별).

| Threshold 초과 | 조치 |
|------------------|------|
| invariant violation | freeze + release block |
| replay divergence | freeze + rollback review |
| stale inconsistency | escalation + release block |
| reconnect instability | escalation |
| queue drift | release block |
| hydration mismatch | escalation + staging freeze |

---

## PHASE 7 — Incident traceability (재구성 체인)

1. **build SHA** → Git tag / commit  
2. **commit** → 해당 SHA의 `dsd-evidence-bundle-*` artifact (GitHub Actions API로 `run_id` 검색)  
3. **CI run** → 각 gate workflow run 목록  
4. **invariant summary** → `evidence-bundle.json` → `invariantVerificationSummary`  
5. **approver** → 외부 시스템(예: change ticket)에 `ciRunId` 기록  
6. **rollback action** → `ROLLBACK_STRATEGY.md` tier + incident에 evidence URL

---

## PHASE 8 — Hardening 우선순위

1. merge-blocking P0 gates (본 repo 워크플로)  
2. immutable evidence bundles  
3. replay artifact persistence (해시·번들)  
4. release traceability (SHA ↔ artifact)  
5. telemetry-driven freeze  
6. rollback traceability  
7. CI 안정화 (P0 재시도 금지 유지)

---

## 8축 (본 문서가 강제하는 범위)

1. **Invariant:** P0 visibility, replay/UI, cross-panel, stale/degraded, hydration compile, 장세션 결정론.  
2. **Release risk:** 미검증 promotion, 증거 없는 hotfix, mutable artifact.  
3. **Replay evidence:** `replayHash`·`invariantVerificationSummary`·실패 시 CI 실패.  
4. **Stale/degraded:** 번들·gate에서 배너 필수 조건 반영.  
5. **CI/release:** workflow 실패 = merge 차단(브랜치 보호 연동 시).  
6. **Rollback:** evidence·SHA 체인으로 사고 분석.  
7. **Forbidden gap:** advisory CI, P0 retry-pass, replay artifact 누락, branch protection 없이 P0만 문서화.  
8. **의료 운영:** 재현 가능한 “왜 이 빌드를 신뢰했는가”와 빠른 안전 복귀.
