import { dsdSpace } from "../lib/clinicalSurfaceTokens";
import { loadingLead, loadingSub } from "../lib/operatorMicrocopy";

/** Calm route skeleton — no motion, no fake metrics */
export default function Loading() {
  return (
    <main
      className="dsd-page-shell dsd-loading-root"
      style={{ maxWidth: 1180, margin: "0 auto", paddingTop: dsdSpace.xl, paddingBottom: dsdSpace.xl }}
      aria-busy="true"
      aria-live="polite"
    >
      <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, opacity: 0.88 }}>{loadingLead}</p>
      <p style={{ margin: "0 0 20px", fontSize: 12, opacity: 0.72 }}>{loadingSub}</p>
      <div className="dsd-skeleton-block" aria-hidden>
        <div className="dsd-skeleton-bar dsd-skeleton-bar--long" />
        <div className="dsd-skeleton-bar dsd-skeleton-bar--medium" />
        <div className="dsd-skeleton-bar dsd-skeleton-bar--short" />
      </div>
      <div className="dsd-skeleton-grid" aria-hidden>
        <div className="dsd-skeleton-card" />
        <div className="dsd-skeleton-card" />
        <div className="dsd-skeleton-card" />
      </div>
    </main>
  );
}
