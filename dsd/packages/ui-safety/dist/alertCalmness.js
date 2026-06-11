/**
 * Alert calmness — scoring for secondary emphasis / animation caps (display policy).
 * Binds: docs/ux-human-stability/OPERATOR_HUMAN_STABLE_REALTIME_UX.md PHASE 3
 */
/** 0 = high salience / “nervous”, 1 = calmer presentation allowed */
export function computeAlertCalmnessScore(a) {
    let s = 0.55;
    if (a.severity === "critical")
        s -= 0.25;
    if (a.lifecycle === "CREATED")
        s -= 0.1;
    if (a.repeatCount >= 2)
        s += 0.12 * Math.min(a.repeatCount, 6);
    return clamp01(s);
}
export function shouldDeferNonCriticalUiUpdate(calmness) {
    return calmness > 0.72;
}
function clamp01(n) {
    return Math.max(0, Math.min(1, n));
}
//# sourceMappingURL=alertCalmness.js.map