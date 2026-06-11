/**
 * Fixed mock cohort (30) — fictional identities only.
 * Clinical behavior is NOT fixed per patient; see patientDynamicState.ts.
 */
export type Department = "ICU" | "ER" | "WARD";
export type BaselineRisk = "low" | "moderate" | "high";
export type Sex = "M" | "F";
export interface BaselineVitals {
    readonly hr: number;
    readonly spo2: number;
    readonly sbp: number;
    readonly temp: number;
    readonly rr: number;
}
export interface PatientProfile {
    readonly patientId: string;
    readonly displayName: string;
    readonly age: number;
    readonly sex: Sex;
    readonly location: string;
    readonly department: Department;
    readonly assignedClinician: string;
    readonly baselineRisk: BaselineRisk;
    readonly baselineVitals: BaselineVitals;
}
export declare function formatProfileDisplayLine(p: PatientProfile): string;
/** 30 fictional profiles — departments and risk vary; no 1:1 concern binding. */
export declare const MOCK_PATIENT_PROFILES: readonly PatientProfile[];
export declare const MOCK_COHORT_SIZE: number;
export declare function profileById(id: string): PatientProfile | undefined;
//# sourceMappingURL=mockPatientProfiles.d.ts.map