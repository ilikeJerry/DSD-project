# Safety-critical Surface Map — DSD

**문서 유형:** Safety identification (ISO 14971 “identification of hazards” 사고의 **UI/운영** 대응물; 법적 산출물 대체 아님)  
**전제:** 본 저장소에 애플리케이션 소스가 없을 수 있다. 코드 도입 시 본 표의 **Implemented location** 열을 채운다.

---

## 1. WHY

안전 조치는 “전체 코드”가 아니라 **표면적 임계 경로**에 집중될 때 운영에서 생존한다. 본 문서는 **P0 안전 표면**을 식별하여 리뷰·QA·릴리즈 게이트의 대상을 고정한다.

---

## 2. Safety-critical surfaces (초기 분류)

| Surface | Safety role | Default class | Implemented location (TBD) |
|---------|-------------|-----------------|---------------------------|
| Primary Critical region | 미처리 Critical **항상 가시** | **P0** | `features/dashboard` / `widgets/command-center` |
| Alert queue ordering | 잘못된 우선순위 → 오판 | **P0** | `features/alerts` |
| Patient prioritization list | “누구 먼저” | **P0** | `features/patients` |
| Ack control | 인지 기록 | **P0** | `features/alerts` |
| Resolve control | 조기 종료 방지 | **P0** | `features/alerts` |
| Patient context header | 환자 불일치 방지 | **P0** | `widgets/` + `features/patients` |
| Handoff summary panel | 교대 단절 | **P0** | `features/handoff` |
| Append-only timeline | 사후 재구성 | **P0** | `features/audit` |
| Degraded / stale banners | 신뢰 오류 방지 | **P0** (표시), **P1** (세부) | `features/operations` |
| Simulation / replay controls | 재현성 | **P0** (운영 검증), **P1** (개발 편의) | `features/simulation`, `features/scenarios` |
| Trend charts | 맥락 | **P1** | `shared/ui` + feature |
| Cosmetic theme | 낮음 | **P2** | `shared/design-system` |

---

## 3. Coupling hazards (반드시 문서화되는 결합)

| 결합 | 위험 | 완화 |
|------|------|------|
| Alert UI → patient mutation 직접 | 상태 불일치 | **단일 use-case** 경로만 허용 |
| 정렬 로직 분산 | 재현 불가 | **단일 recompute 함수** + trace 이벤트 |
| 감사 없는 낙관 UI | “한 것처럼 보임” | 낙관은 **이벤트 + rollback 이벤트** 쌍 |

---

## 4. 예외 우선 시나리오 (필수 검증 대상)

1. **Critical 존재 + 필터로 가림 시도** → 가시성 보장 위반 여부  
2. **stale 중 Critical** → 배지·정렬·resolve 가드  
3. **storm + degraded 동시** → UI 붕괴· starvation  
4. **interruption 후 복귀** → 미해결 Critical 재인지  
5. **keyboard-only** → Ack까지 도달

---

## 5. Rejected alternative

### “모든 화면을 P0으로 취급”

**거부:** 게이트 비용이 폭증하여 **실제 P0가 약화**된다. 등급은 `02-safety-classification-framework.md`를 따른다.
