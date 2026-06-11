# React / Next.js runtime integration — human-stable realtime UX

**Binding:** `OPERATOR_HUMAN_STABLE_REALTIME_UX.md`, `CRITICAL_VISIBILITY_GUARANTEE.md`, `06-degraded-mode-policy.md`  
**Code:** `@dsd/ui-safety` (`resolveDisplayQueueForOperator`, `dampenQueueOrderDisplay`, reconnect constants), `apps/web` (`OperatorQueuePanel`, `queueSnapshot.ts`)

This document maps **PHASE 1–8** to concrete React behaviors. Each phase ends with an **evaluation block** covering the eight dimensions required for production clinical UX.

**Dimensions (per phase):**

1. **React runtime instability prevented** — what failure mode is ruled out  
2. **Operator interaction** — click / keyboard / focus consequences  
3. **Temporal stability** — perceived ordering and timing of updates  
4. **Truth / display consistency** — authority, drift bounds, replay alignment  
5. **Reconnect / degraded** — trust, locks, messaging  
6. **Rerender surface** — what re-renders and what must not  
7. **Forbidden React pattern** — explicit anti-patterns to avoid  
8. **Operator usability** — clinical ops outcome

---

## PHASE 1 — Truth vs display queue integration

**Ownership**

- **Truth queue:** `ClinicalRuntimeKernel` / reducer output (`queueOrderIds`). Single writer path; UI never mutates truth from display logic.
- **Display queue:** React state derived only through `resolveDisplayQueueForOperator` (or initial aligned copy). Optional demo-only local perturbations must never write back to the kernel.
- **Synchronization boundary:** RSC (or server action) passes a **JSON snapshot** (`QueuePanelSnapshot`) across the boundary; Maps are serialized to `Record`. Client reconciles in `useLayoutEffect` before paint.

**Behaviors**

- **Hold expiration:** `lastDisplayCommitMs` ref + `minHoldMs` / `minIndexMove` in pure function; React only supplies monotonic `performance.now()` at reconcile pulses.
- **Immediate critical promotion (P0):** `openCriticalCount > 0` ⇒ `displayIds === truthIds`, reason `p0_open_critical` — dampening cannot delay critical truth.
- **Interaction-safe reconciliation:** Functional `setDisplayIds(prev => …)` so reconciliation always reads latest display, not a stale render closure.
- **Display drift prevention:** Drift is bounded to dampening policy or eliminated while P0 is open.
- **Replay-safe rendering:** Display is a projection; audit/replay continues to use truth timeline only.

**Evaluation (PHASE 1)**

1. Prevents inconsistent truth/display from a single stale `displayedIds` closure during rapid `QUEUE_RECOMPUTED`.  
2. Operators see order changes only through governed display commits, reducing wrong-row targeting between server ticks.  
3. Micro-reorders can be visually held without lying about critical presence (P0 path).  
4. Truth remains authoritative; display is explicitly labeled and derived.  
5. Snapshot includes `degradedMode` for downstream trust UI.  
6. Reconcile effect touches display list state, not the whole app; memoized rows isolate row props.  
7. Forbidden: `useEffect` + stale `displayIds` from render scope; forbidden: truth mutation from dampener.  
8. Reduces “queue jumped under my cursor” without hiding life-threatening truth.

---

## PHASE 2 — Interaction safety during reorder

**Mechanisms**

- **Stable interaction target:** Row `key={alertId}` (identity), not index.
- **Patient identity pinning:** Actions carry `alertId` + server correlation tokens (production); demo uses **reconcile generation** captured at paint vs ref at click.
- **Click-after-reorder:** `reconcileGenRef.current !== genAtPaint` ⇒ block with explicit feedback.
- **Focus preservation:** Avoid list remount keys that change on reorder; prefer stable ids (virtualization must key by id).
- **Keyboard:** Roving tabindex / RovingTabIndex patterns should follow stable ids; document in app-level a11y spec.
- **Stale interaction invalidation:** Bump generation when `truthOrderKey` changes.

**Evaluation (PHASE 2)**

1. Prevents wrong-patient ack from stale handler closure after truth reorder.  
2. Blocks dangerous confirms; forces re-aim.  
3. Reorder does not silently retarget the same physical click slot to a different patient.  
4. Server still validates ACK; UI adds defense-in-depth.  
5. Degraded lock (PHASE 5) stacks with generation guard.  
6. Buttons re-render on gen change only; not full app.  
7. Forbidden: `onClick={() => ack(id)}` without generation or server idempotency key.  
8. Charge nurse trusts that the button label matches the row identity.

---

## PHASE 3 — React subscription stability

**Strategy**

- **Selector granularity:** Pass minimal `QueuePanelSnapshot`, not entire kernel.
- **Stable selector identity:** `useMemo` for `truthOrderKey`, `openCritical`, `truthCrit`; avoid inline object selectors to store.
- **Rerender isolation:** `QueueRow` wrapped in `React.memo` keyed by alert id.
- **Virtualization:** If added, row component and fixed keying by `alertId` remain mandatory; windowing must not swap identity.
- **Replay-safe derived state:** Derived flags computed from snapshot only.
- **Transition batching:** Optional `startTransition` for non-critical chrome only — **never** for P0 visibility or truth promotion.

**Evaluation (PHASE 3)**

1. Avoids subscription explosion and full-tree updates on each `QUEUE_RECOMPUTED`.  
2. Keeps interaction targets stable under selective re-renders.  
3. Batching non-queue UI does not delay critical promotion (handled in pure layer + layout reconcile).  
4. Truth snapshot frequency matches server; client does not invent queue members.  
5. N/A unless snapshot includes degraded/reconnect fields.  
6. `QUEUE_RECOMPUTED` should not rerender entire app — isolate queue panel / row memo boundary.  
7. Forbidden: unstable inline `useSelector(() => ({...}))` identity; forbidden: full queue rerender without memo.  
8. Smooth scanning under load.

---

## PHASE 4 — Realtime animation governance

**Rules**

- Motion **explains** deltas; it does not **capture** attention.
- **Queue movement:** Prefer none or opacity-only micro transitions; respect `prefers-reduced-motion`.
- **Critical promotion:** No celebratory motion; immediate layout truth for P0.
- **Stale fade:** Optional low-contrast treatment with reduced-motion off; static badge if reduced.
- **Reconnect:** No looping shimmer; static banner + `aria-busy`.
- **Interrupt-safe:** No focus-trapping animations.
- **Priority:** P0 visibility > decorative motion.

**Evaluation (PHASE 4)**

1. Prevents animation-driven layout thrash and hydration mismatch from CSS-in-JS randomness.  
2. No focus-stealing transitions.  
3. Temporal dampening is not implemented as distracting motion.  
4. Animation must never imply resolved clinical state.  
5. Reconnect uses copy + grace constants, not spinner arms race.  
6. CSS scoped to `.dsd-operator-queue` to limit repaint surface.  
7. Forbidden: layout animation on every reorder; forbidden: parallax on clinical lists.  
8. Operators can read the queue during motion.

---

## PHASE 5 — Reconnect trust UX integration

**Integration**

- Overlay / banner when `degradedMode !== "HEALTHY"` with `RECONNECT_TRUST_PHASES`, `RECONNECT_GRACE_MIN_MS`, `TRUST_RESTORATION_NUDGE_MS`.
- **Interaction lock:** Demo disables queue ack while degraded.
- **Progress / trust restoration:** Copy from constants; future: bind to actual sync timeline events.
- **Stale reconciliation:** Continue to use `staleBannerRequired` at page level.

**Evaluation (PHASE 5)**

1. Avoids “silent healthy” UI while socket is half-dead.  
2. Locks high-risk actions when trust is undefined.  
3. Grace minimum prevents banner flicker that reads as flakiness.  
4. Truth snapshot reflects degraded flag from kernel.  
5. Central to reconnect narrative.  
6. Banner is a small subtree.  
7. Forbidden: hiding degraded state; forbidden: auto-click resume.  
8. Operator answers “can I trust this screen?”

---

## PHASE 6 — P0 visibility protection

**Guarantees**

- `resolveDisplayQueueForOperator` short-circuits to truth when `openCriticalCount > 0`.
- Critical rows remain in **truth** column; display column tracks truth under P0.
- Layout: reserve **top zone** for critical banners in real apps (HF checklist).

**Evaluation (PHASE 6)**

1. Prevents dampener from masking open critical.  
2. No delayed critical visibility due to hold window.  
3. Stability policy explicitly subordinated when P0 active.  
4. Display === truth under P0; no drift.  
5. Degraded does not remove critical from snapshot.  
6. Single reconcile path; no competing dampener hooks.  
7. Forbidden: client-only “hide critical” optimization.  
8. Life-safety visibility preserved.

---

## PHASE 7 — Human-stable React QA

| Test | Intent |
|------|--------|
| Reorder–click race | Truth order changes between pointerdown and click → action blocked or idempotent server-side |
| Hydration | Client initial display aligns with server snapshot; no `Date.now()` in render |
| Subscription explosion | Stress `QUEUE_RECOMPUTED`; assert isolated rerender counts (RTL profiler or manual) |
| Queue snap | After pulse, display matches expected pure `resolveDisplayQueueForOperator` output |
| Focus continuity | Reorder preserves focus id where possible |
| Stale interaction replay | Generation / token mismatch paths covered |
| Reconnect reconciliation | Degraded → healthy transition restores actions |
| Critical override | `openCriticalCount > 0` forces truth display |

**Implemented today:** Vitest unit tests for `resolveDisplayQueueForOperator` in `@dsd/ui-safety`. **Recommended:** Playwright or RTL + profiler for race and rerender budgets.

**Evaluation (PHASE 7)**

1. Catches effect races and SSR/CSR split bugs before prod.  
2. Validates wrong-patient ack defenses.  
3. Validates dampening vs P0 timing.  
4. Cross-checks display projection vs replay truth.  
5. Validates reconnect locks and recovery.  
6. Sets budgets on rerenders per event.  
7. Forbidden: only testing pure functions without React integration.  
8. Regression gates for clinical UX.

---

## PHASE 8 — Production hardening priority

1. Truth/display reconciliation  
2. Interaction safety  
3. Subscription stability  
4. Reconnect trust UX  
5. P0 visibility protection  
6. Animation governance  
7. Focus continuity  

**Constraint:** No new **runtime governance** abstractions — extend existing kernel, audit, `@dsd/ui-safety`, and thin React glue (`OperatorQueuePanel`, snapshot serializer) only.

**Evaluation (PHASE 8)**

1. Orders work so cognitive safety is never traded for convenience.  
2–8. Same as above, applied as a release gate ordering.

---

## Reference implementation

| Artifact | Role |
|----------|------|
| `apps/web/lib/queueSnapshot.ts` | Serialization boundary |
| `apps/web/app/components/OperatorQueuePanel.tsx` | Client reconcile, memo rows, reconnect banner, interaction generation |
| `packages/ui-safety/src/temporalStability.ts` | `resolveDisplayQueueForOperator`, dampening |
| `apps/web/app/page.tsx` | RSC builds kernel + passes snapshot |

---

## Appendix — Eight-dimension quick matrix (summary)

| Dimension | Primary mitigation |
|-----------|---------------------|
| React instability | Functional updates, layout reconcile, stable keys |
| Interaction | Generation / correlation tokens, degraded lock |
| Temporal stability | Pure dampening + P0 override |
| Truth/display | Truth in kernel; display via `resolveDisplayQueueForOperator` |
| Reconnect | Degraded snapshot + trust copy + interaction lock |
| Rerender | Memo rows, narrow props, no app-wide queue subscriptions |
| Forbidden patterns | Stale closures, index keys, full-list churn, motion hijack |
| Usability | Scan continuity, trust messaging, no silent recovery |
