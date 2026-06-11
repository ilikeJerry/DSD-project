# HF Validation Checklist — DSD (Release / PR Gate)

**문서 유형:** Validation checklist  
**상태:** Accepted  
**사용:** P0 변경은 전체, P1은 해당 섹션, P2는 생략 가능.

각 항목: `[ ]` 미통과 시 **출하 불가(P0)** 또는 **조건부 출하(P1, 문서화 필요)**.

---

## A. Perception & attention

- [ ] **3-second scan:** 미교육 관찰자가 “가장 위급한 대상”을 Primary에서 식별 가능  
- [ ] **Attention hierarchy:** Primary에 정보 청크 ≤ 5 (운영 정의 준수)  
- [ ] **Eye-travel:** 주요 행동(Ack)까지 시선 이동이 고정 패턴 내인가

---

## B. Color / sensory independence

- [ ] **Color independence:** 흑백/색약 시뮬에서 심각도 구분 가능  
- [ ] **Motion safety:** `prefers-reduced-motion`에서도 위험 신호가 색+텍스트+패턴으로 전달되는가

---

## C. Interruption & multitasking

- [ ] **Interruption recovery:** 방해 후 10초 내 미해결 Critical 재인지 가능  
- [ ] **Interruption-safe modals:** 새 Critical이 입력 중 모달을 **무분별하게 파괴**하지 않는가(정책대로인가)

---

## D. Keyboard & accessibility

- [ ] **Keyboard-only critical path:** Tab 순서가 논리적이며 **Ack까지 도달**  
- [ ] **Focus visible:** 포커스 링이 모든 컨트롤에서 확인됨  
- [ ] **Screen reader smoke (best effort):** Critical 영역에 적절한 이름/설명

---

## E. Alert fatigue

- [ ] **Fatigue-aware dedupe:** 반복이 “소음 폭주”로 이어지지 않는가 (`../safety/10-fatigue-aware-alert-dedupe-policy.md`)  
- [ ] **Suppress transparency:** 억제/병합이 사용자에게 **이해되는가**

---

## F. Cognitive overload

- [ ] **Empty/loading/error/degraded:** dead-end 없음, 다음 행동 명시  
- [ ] **Storm mode:** UI가 붕괴(프레이즈 불가)하지 않는가

---

## G. Handoff & teamwork

- [ ] **Handoff summary:** 미처리 critical / 최근 악화 / 대기 조치가 **누락 없이** 구조화되는가

---

## H. Clinical terminology consistency

- [ ] Ack/Resolve/escalation/stale 용어가 **화면 간 일치**하는가

---

## I. Human-stable realtime clinical UX

**근거 문서:** `docs/ux-human-stability/OPERATOR_HUMAN_STABLE_REALTIME_UX.md`

- [ ] **Queue thrash:** 표시 큐가 `dampenQueueOrderDisplay` 정책을 적용하는가 (또는 동등한 hold 규칙)  
- [ ] **Severity oscillation:** Critical 시각 강등에 **지연(hysteresis)**이 있는가  
- [ ] **Reconnect:** silent recovery 없음 — 배너·phase 카피·grace  
- [ ] **Stale flicker:** stale 배너가 짧은 간격으로 on/off 반복하지 않는가  
- [ ] **Toast / interrupt storm:** 비Critical 토스트가 Critical 경로를 가리지 않는가  
- [ ] **Motion:** `prefers-reduced-motion` 및 **duration 2단** 준수  
- [ ] **Scan continuity:** `SCAN_ANCHOR_ORDER` 위반(열 순서 임의 변경) 없음  
- [ ] **Alert calmness:** 반복 알림에 **그룹/점수** 기반 완화가 있는가  

---

## Sign-off

| Role | Name | Date | Result (Pass / Fail) |
|------|------|------|----------------------|
| HF Owner | | | |
| Engineering | | | |
| Clinical UX (optional) | | | |
