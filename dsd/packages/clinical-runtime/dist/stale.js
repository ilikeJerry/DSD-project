/**
 * Binds: docs/safety/07-stale-data-policy.md
 * Does not hide stale — returns explicit levels for UI obligation
 */
import { STALE_THRESHOLD_BLOCK_MS, STALE_THRESHOLD_WARN_MS } from "./constants.js";
export function staleLevelForAgeMs(ageMs) {
    if (ageMs >= STALE_THRESHOLD_BLOCK_MS)
        return "block";
    if (ageMs >= STALE_THRESHOLD_WARN_MS)
        return "warn";
    return "fresh";
}
//# sourceMappingURL=stale.js.map