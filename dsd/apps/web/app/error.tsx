"use client";

import { dsdRadius, dsdSpace, dsdType } from "../lib/clinicalSurfaceTokens";
import { errorBody, errorDetailsLabel, errorRetryLabel, errorTitle } from "../lib/operatorMicrocopy";

export default function Error({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  return (
    <main
      className="dsd-page-shell"
      style={{
        maxWidth: 560,
        margin: "0 auto",
        paddingTop: dsdSpace.xl,
        paddingBottom: dsdSpace.xl,
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <h1 style={{ ...dsdType.title, fontSize: 18, margin: "0 0 " + dsdSpace.sm + "px" }}>{errorTitle}</h1>
      <p style={{ ...dsdType.body, margin: "0 0 " + dsdSpace.lg + "px", color: "var(--dsd-text-muted)" }}>{errorBody}</p>
      <button
        type="button"
        className="dsd-surface-focus"
        onClick={() => reset()}
        style={{
          alignSelf: "flex-start",
          padding: `${dsdSpace.sm}px ${dsdSpace.lg}px`,
          borderRadius: dsdRadius.md,
          border: "1px solid var(--dsd-border)",
          background: "var(--dsd-elevated)",
          color: "var(--dsd-text)",
          font: "inherit",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {errorRetryLabel}
      </button>
      <details style={{ marginTop: dsdSpace.xl }}>
        <summary className="dsd-surface-focus" style={{ ...dsdType.caption, cursor: "pointer" }}>
          {errorDetailsLabel}
        </summary>
        <p style={{ ...dsdType.caption, marginTop: dsdSpace.sm, wordBreak: "break-word" }}>{error.message}</p>
        {error.digest ? (
          <p style={{ ...dsdType.caption, marginTop: dsdSpace.xs }}>digest: {error.digest}</p>
        ) : null}
      </details>
    </main>
  );
}
