/** Deterministic PRNG — no Math.random() for demo replay. */
export type SeededRng = {
    readonly next: () => number;
    readonly int: (min: number, max: number) => number;
    readonly pick: <T>(items: readonly T[]) => T;
    readonly chance: (p: number) => boolean;
};
export declare function createSeededRng(seed: string): SeededRng;
export declare function tickRng(seed: string, tickIndex: number): SeededRng;
//# sourceMappingURL=seededRandom.d.ts.map