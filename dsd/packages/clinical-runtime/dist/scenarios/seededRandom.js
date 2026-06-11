/** Deterministic PRNG — no Math.random() for demo replay. */
function hashSeed(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
export function createSeededRng(seed) {
    let state = hashSeed(seed) || 1;
    const next = () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
        next,
        int(min, max) {
            const lo = Math.ceil(min);
            const hi = Math.floor(max);
            return Math.floor(next() * (hi - lo + 1)) + lo;
        },
        pick(items) {
            if (items.length === 0)
                throw new Error("seededRandom.pick: empty");
            return items[Math.floor(next() * items.length)];
        },
        chance(p) {
            return next() < p;
        },
    };
}
export function tickRng(seed, tickIndex) {
    return createSeededRng(`${seed}:tick:${tickIndex}`);
}
//# sourceMappingURL=seededRandom.js.map