# PHASE 5 — First Implementable Vertical Slice (고정 범위)

**포함:** respiratory deterioration scenario, critical queue, acknowledge, resolve+confirm, audit timeline, replay reconstruction, stale banner, degraded reconnect (이벤트 시퀀스).

**제외:** handoff UI, storm handling, KPI, 추가 governance 추상화.

**진입점:** `apps/web/app/page.tsx` (시연용 서버 컴포넌트), 코어 로직 `ClinicalRuntimeKernel`.
