# Failure-survivable clinical operational UX

**Binding:** `06-degraded-mode-policy.md`, `07-stale-data-policy.md`, `08-incident-replay-architecture.md`, `REACT_RUNTIME_INTEGRATION.md`  
**Code:** `@dsd/ui-safety` — `projectOperationalTrustSurface`, `projectTrustObservability`; `apps/web` — `operationalShellSnapshot.ts`, `FailureSurvivableOperatorStack.tsx`

**North star:** In real operational failures, the operator must **keep a coherent mental model** — not only “data arrived again”.

**Constraint:** No new **runtime governance** abstractions. Trust and recovery are **pure projections** plus **one shared shell snapshot** across panels.

---

## Evaluation dimensions (use for every design / code review)

| # | Dimension |
|---|-----------|
| 1 | **Operational trust failure prevented** — which cliff or silent failure is ruled out |
| 2 | **Operator mental model** — what they can infer without guessing |
| 3 | **Cross-panel consistency** — queue vs detail vs banners stay one temporal reality |
| 4 | **Stale / degraded** — partial and mixed states are explicit, not hidden |
| 5 | **Recovery clarity** — what recovered, what is still partial, what to wait for |
| 6 | **Long-session usability** — fatigue, rhythm, scan continuity after storms |
| 7 | **Forbidden UX pattern** — explicit anti-patterns |
| 8 | **Clinical survivability** — safe continuation of operations under uncertainty |

---

## PHASE 1 — Recovery clarity architecture

**Design**

- **Recovery timeline visibility:** `recoveryTimelineLabel` from degraded mode + policy text (extend with real phase machine when events exist).
- **Stale → fresh transition:** `staleHierarchySummary` + per-patient stale in shell `patients.*.stale` (no silent downgrade).
- **Replay reconciliation indication:** `replayReconciliationHint` + **audit tail types** on the shell so operators see recent envelope classes without opening raw logs.
- **Synchronization completeness:** `panelConfidence` + `operatorFacingSummary` (telemetry-backed counts).
- **Partial recovery disclosure:** `partialStalePatientIds` always listed when non-empty.
- **Queue recovery explanation:** `queueRecoveryNarrative` (reconnect vs healthy paths).
- **Reconciliation confidence:** `syncVersionKey` — one token all panels echo; if detail and queue disagree, keys cannot match by construction when fed from the same shell.
- **Recovery stabilization:** Use `completedDegradedCycles` (min enter/exit) as a coarse “storms weathered” signal until richer timelines exist.

**Evaluation (PHASE 1)**

1. Prevents “recovered but I don’t know what” and hidden partial recovery.  
2. Operator can name mode, stale scope, and where to look next (audit tail).  
3. Single shell version key aligns panels.  
4. Stale is enumerated, not implied by absence of banner only.  
5. Narratives distinguish reconnect vs steady-state recompute.  
6. Stable copy blocks reduce re-learning after each incident.  
7. Forbidden: banner that clears without stating what is still stale.  
8. Continued triage possible under ambiguous connectivity.

---

## PHASE 2 — Cross-panel consistency

**Rules**

- **Queue / detail synchronization:** Detail selection is **truth-queue anchored** (`onSelectAlert` only on truth column). Display-damped order never drives patient identity for detail.
- **Timeline ordering:** Audit tail is append-only order from the same kernel as the shell.
- **Stale propagation:** Same `patients.*.stale` map projection everywhere.
- **Degraded visibility:** `degradedMode` in snapshot → queue lock + banner + confidence strip.
- **Temporal alignment policy:** `crossPanelConsistencyRule: single_sync_version_all_panels` + `syncVersionKey`.
- **Patient identity anchoring:** `patientId` on alert + `patients` record — selection invalidation when alert missing from shell.

**Evaluation (PHASE 2)**

1. Prevents queue/detail showing incompatible worlds.  
2. One mental map: truth selection, display is explicitly secondary.  
3. All panels consume one `OperationalShellSnapshot`.  
4. Stale visible in detail card and strip.  
5. Recovery copy consistent with queue policy text.  
6. Selection reset on `syncVersionKey` change reduces “stuck on ghost patient”.  
7. Forbidden: detail fed from a different subscription than queue.  
8. Reduces wrong-patient context reads after reconnect.

---

## PHASE 3 — Partial trust UX

**Design**

- **Panel-level confidence:** `PanelConfidence` — `HIGH` | `PARTIAL_STALE` | `DEGRADED` | `RECONNECTING`.
- **Trust segmentation:** Confidence strip + degraded interaction lock (existing queue panel behavior).
- **Mixed freshness:** `hasMixedFreshness` when some patients fresh and some not.
- **Confidence-aware lock:** Actions disabled when degraded (existing); extend later per confidence tier if policy allows.

**Evaluation (PHASE 3)**

1. Prevents “everything is fine” while a slice is stale.  
2. Operator answers “what may I trust?” from one enum + lists.  
3. Detail shows same stale level as strip.  
4. Partial stale is first-class, not a footnote.  
5. Recovery messaging admits partial paths.  
6. Enum + short copy survives hours on console.  
7. Forbidden: single global “fresh” badge when map is mixed.  
8. Safer deferral of high-risk actions on non-HIGH confidence.

---

## PHASE 4 — Long-session cognitive stability

**Design (document + existing primitives)**

- Reuse **alert calmness** and **scan continuity** anchors from `@dsd/ui-safety`.
- **Low-fatigue motion:** `prefers-reduced-motion` + minimal opacity transitions (queue panel).
- **Cognitive reset minimization:** Avoid recovery banner flicker — grace constants in `reconnectTrust.ts`; do not oscillate copy on minor telemetry ticks.

**Evaluation (PHASE 4)**

1. Prevents death-by-toast and motion fatigue.  
2. Predictable rhythm preserves situational awareness.  
3. Same anchors across hours.  
4. Stale escalation is gradual (warn/block), not binary noise.  
5. Post-recovery copy stable enough to not trigger re-read loops.  
6. Operators maintain scan paths.  
7. Forbidden: flashing “synced” without stable backing state.  
8. Sustainable night-shift use.

---

## PHASE 5 — Operational recovery ergonomics

**Design**

- **Post-storm stabilization:** `completedDegradedCycles` + queue recompute / skip counts in `operatorFacingSummary`.
- **Backlog / queue stabilization:** `queueReconciliationBursts` vs `queueReconcileSkipsUnchanged` — high skip ratio means stable truth under noise.
- **Replay recovery summary:** Replay section on main page + hint in stack.
- **Degraded exit confirmation:** When kernel returns `HEALTHY`, confidence becomes `HIGH` unless stale remains — no silent normalization.

**Evaluation (PHASE 5)**

1. Prevents false “all clear” after partial recovery.  
2. Operator judges normalization from counts + mode.  
3. Replay and live queue parity remain the authority cross-check.  
4. Stale clears vs detections exposed in observability strip.  
5. Milestone language tied to mode transitions.  
6. Long incident tail readable without log diving.  
7. Forbidden: hiding skip counter when skips dominate.  
8. Charge team can declare “safe to routine” with evidence.

---

## PHASE 6 — Failure-mode React integration QA

| Test | Intent |
|------|--------|
| Partial stale hydration | Shell serializes stale map; client detail matches server projection |
| Reconnect reconciliation race | `syncVersionKey` change invalidates selection / interaction gen |
| Cross-panel drift | Changing shell without bumping key is impossible if builder is single source |
| Stale/fresh mismatch | `hasMixedFreshness` + explicit ids |
| Recovery flicker | Copy driven by mode, not by every render’s `Date.now()` in client |
| Replay visibility | Audit tail types present |
| Long-session stability | Manual: reduced motion + calmness policies |
| Degraded persistence | `RECONNECTING` stuck shows sustained banner + lock |

**Implemented today:** Vitest for `projectOperationalTrustSurface` / `projectTrustObservability`. **Next:** Playwright / RTL for shell hydration + selection.

**Evaluation (PHASE 6)**

1–8. Same dimension table applied to QA gates — failures block release when trust-critical.

---

## PHASE 7 — Operator trust observability

**Signals (current)**

| Signal | Source |
|--------|--------|
| Queue reconciliation bursts | `telemetry.queueRecomputeEmitted` |
| Stabilization / dedupe | `queueRecomputeSkippedUnchanged` |
| Degraded cycles | `min(degradedEnter, degradedExit)` |
| Stale episodes | `staleDetectedCount` / `staleClearedCount` |
| Narrative | `projectTrustObservability` |

**Future (no new runtime abstraction):** timestamps for “last stale warn” require existing events only — derive from audit in RSC if needed.

**Evaluation (PHASE 7)**

1. Prevents blind trust when counters show storm behavior.  
2. Operators read health from ops-shaped metrics, not developer logs.  
3. Same telemetry object backs any future second panel.  
4. Stale lifecycle visible in counts.  
5. Recovery latency approximated until explicit timeline events exist.  
6. Counters stable enough for trend glance.  
7. Forbidden: pretty dashboard with no stale / degraded dimensions.  
8. Supports post-incident narrative and RCA.

---

## PHASE 8 — Operational trust hardening (priority order)

1. Recovery clarity  
2. Cross-panel consistency  
3. Partial trust visibility  
4. Long-session stability  
5. Recovery ergonomics  
6. Trust observability  
7. Failure-mode QA  

**Reference UI:** `FailureSurvivableOperatorStack` + extended `OperatorQueuePanel` selection.

---

## Appendix — Forbidden patterns (global)

- Panel-level temporal inconsistency without a version token.  
- Hidden partial stale.  
- Reconnect copy that does not state what is still authoritative.  
- Replay reconciliation invisible in operator UI.  
- Trust cliff: instant jump from OFFLINE to silent HEALTHY with no audit tail movement.  
- Silent cross-panel divergence.  
- Recovery-state flicker from unstable props.  
- Unexplained queue jump after recovery without audit-visible `QUEUE_RECOMPUTED`.
