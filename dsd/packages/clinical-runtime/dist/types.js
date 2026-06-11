export function emptyClinicalState(degradedMode = "HEALTHY") {
    return {
        degradedMode,
        patients: new Map(),
        alerts: new Map(),
        queueOrderIds: [],
        staleByPatientId: new Map(),
    };
}
//# sourceMappingURL=types.js.map