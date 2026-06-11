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

export function formatProfileDisplayLine(p: PatientProfile): string {
  return `${p.displayName} · ${p.age}세 · ${p.location}`;
}

/** 30 fictional profiles — departments and risk vary; no 1:1 concern binding. */
export const MOCK_PATIENT_PROFILES: readonly PatientProfile[] = [
  { patientId: "pt-demo-001", displayName: "이수진", age: 48, sex: "F", location: "ICU-12", department: "ICU", assignedClinician: "김간호사", baselineRisk: "high", baselineVitals: { hr: 92, spo2: 96, sbp: 118, temp: 36.8, rr: 18 } },
  { patientId: "pt-mock-002", displayName: "한지우", age: 67, sex: "M", location: "ICU-08", department: "ICU", assignedClinician: "박간호사", baselineRisk: "high", baselineVitals: { hr: 88, spo2: 94, sbp: 112, temp: 37.0, rr: 20 } },
  { patientId: "pt-mock-003", displayName: "오세라", age: 55, sex: "F", location: "ICU-03", department: "ICU", assignedClinician: "이간호사", baselineRisk: "moderate", baselineVitals: { hr: 96, spo2: 95, sbp: 122, temp: 36.7, rr: 19 } },
  { patientId: "pt-mock-004", displayName: "윤태호", age: 71, sex: "M", location: "ICU-15", department: "ICU", assignedClinician: "최간호사", baselineRisk: "high", baselineVitals: { hr: 102, spo2: 93, sbp: 108, temp: 36.9, rr: 22 } },
  { patientId: "pt-mock-005", displayName: "서하늘", age: 42, sex: "F", location: "ICU-06", department: "ICU", assignedClinician: "김간호사", baselineRisk: "moderate", baselineVitals: { hr: 84, spo2: 97, sbp: 120, temp: 36.6, rr: 17 } },
  { patientId: "pt-mock-006", displayName: "강민재", age: 59, sex: "M", location: "ICU-11", department: "ICU", assignedClinician: "정간호사", baselineRisk: "high", baselineVitals: { hr: 98, spo2: 92, sbp: 115, temp: 37.2, rr: 21 } },
  { patientId: "pt-mock-007", displayName: "임소연", age: 36, sex: "F", location: "ICU-02", department: "ICU", assignedClinician: "박간호사", baselineRisk: "moderate", baselineVitals: { hr: 90, spo2: 98, sbp: 116, temp: 36.5, rr: 16 } },
  { patientId: "pt-mock-008", displayName: "조현우", age: 63, sex: "M", location: "ICU-09", department: "ICU", assignedClinician: "이간호사", baselineRisk: "high", baselineVitals: { hr: 104, spo2: 91, sbp: 106, temp: 37.1, rr: 23 } },
  { patientId: "pt-mock-009", displayName: "배서연", age: 51, sex: "F", location: "ICU-14", department: "ICU", assignedClinician: "최간호사", baselineRisk: "moderate", baselineVitals: { hr: 86, spo2: 95, sbp: 119, temp: 36.8, rr: 18 } },
  { patientId: "pt-mock-010", displayName: "신동훈", age: 74, sex: "M", location: "ICU-01", department: "ICU", assignedClinician: "김간호사", baselineRisk: "high", baselineVitals: { hr: 100, spo2: 90, sbp: 104, temp: 37.0, rr: 24 } },
  { patientId: "pt-mock-011", displayName: "류지안", age: 29, sex: "F", location: "ER-04", department: "ER", assignedClinician: "문간호사", baselineRisk: "moderate", baselineVitals: { hr: 94, spo2: 97, sbp: 118, temp: 36.9, rr: 18 } },
  { patientId: "pt-mock-012", displayName: "홍준서", age: 45, sex: "M", location: "ER-02", department: "ER", assignedClinician: "양간호사", baselineRisk: "high", baselineVitals: { hr: 108, spo2: 94, sbp: 110, temp: 37.3, rr: 20 } },
  { patientId: "pt-mock-013", displayName: "권나래", age: 33, sex: "F", location: "ER-07", department: "ER", assignedClinician: "문간호사", baselineRisk: "moderate", baselineVitals: { hr: 92, spo2: 98, sbp: 114, temp: 36.7, rr: 17 } },
  { patientId: "pt-mock-014", displayName: "송재훈", age: 58, sex: "M", location: "ER-01", department: "ER", assignedClinician: "오간호사", baselineRisk: "high", baselineVitals: { hr: 112, spo2: 93, sbp: 102, temp: 37.4, rr: 22 } },
  { patientId: "pt-mock-015", displayName: "안유리", age: 41, sex: "F", location: "ER-05", department: "ER", assignedClinician: "양간호사", baselineRisk: "moderate", baselineVitals: { hr: 88, spo2: 96, sbp: 116, temp: 36.8, rr: 19 } },
  { patientId: "pt-mock-016", displayName: "전우진", age: 52, sex: "M", location: "ER-03", department: "ER", assignedClinician: "오간호사", baselineRisk: "high", baselineVitals: { hr: 106, spo2: 92, sbp: 108, temp: 37.2, rr: 21 } },
  { patientId: "pt-mock-017", displayName: "노채원", age: 27, sex: "F", location: "ER-06", department: "ER", assignedClinician: "문간호사", baselineRisk: "low", baselineVitals: { hr: 82, spo2: 99, sbp: 120, temp: 36.6, rr: 16 } },
  { patientId: "pt-mock-018", displayName: "하승민", age: 64, sex: "M", location: "ER-08", department: "ER", assignedClinician: "양간호사", baselineRisk: "moderate", baselineVitals: { hr: 96, spo2: 95, sbp: 114, temp: 37.0, rr: 20 } },
  { patientId: "pt-mock-019", displayName: "표지혜", age: 38, sex: "F", location: "5W-21", department: "WARD", assignedClinician: "유간호사", baselineRisk: "low", baselineVitals: { hr: 78, spo2: 98, sbp: 122, temp: 36.5, rr: 16 } },
  { patientId: "pt-mock-020", displayName: "남도현", age: 56, sex: "M", location: "5W-14", department: "WARD", assignedClinician: "장간호사", baselineRisk: "moderate", baselineVitals: { hr: 86, spo2: 97, sbp: 118, temp: 36.9, rr: 18 } },
  { patientId: "pt-mock-021", displayName: "곽서윤", age: 44, sex: "F", location: "6W-09", department: "WARD", assignedClinician: "유간호사", baselineRisk: "low", baselineVitals: { hr: 80, spo2: 99, sbp: 120, temp: 36.6, rr: 15 } },
  { patientId: "pt-mock-022", displayName: "설민호", age: 69, sex: "M", location: "6W-17", department: "WARD", assignedClinician: "장간호사", baselineRisk: "moderate", baselineVitals: { hr: 90, spo2: 96, sbp: 116, temp: 37.1, rr: 19 } },
  { patientId: "pt-mock-023", displayName: "진예은", age: 31, sex: "F", location: "5W-08", department: "WARD", assignedClinician: "유간호사", baselineRisk: "low", baselineVitals: { hr: 76, spo2: 99, sbp: 118, temp: 36.4, rr: 15 } },
  { patientId: "pt-mock-024", displayName: "도경수", age: 61, sex: "M", location: "6W-03", department: "WARD", assignedClinician: "장간호사", baselineRisk: "moderate", baselineVitals: { hr: 88, spo2: 97, sbp: 114, temp: 37.0, rr: 18 } },
  { patientId: "pt-mock-025", displayName: "석라온", age: 47, sex: "F", location: "5W-25", department: "WARD", assignedClinician: "유간호사", baselineRisk: "low", baselineVitals: { hr: 82, spo2: 98, sbp: 119, temp: 36.7, rr: 17 } },
  { patientId: "pt-mock-026", displayName: "탁준영", age: 53, sex: "M", location: "6W-12", department: "WARD", assignedClinician: "장간호사", baselineRisk: "moderate", baselineVitals: { hr: 92, spo2: 96, sbp: 117, temp: 36.9, rr: 18 } },
  { patientId: "pt-mock-027", displayName: "피하람", age: 35, sex: "F", location: "5W-11", department: "WARD", assignedClinician: "유간호사", baselineRisk: "low", baselineVitals: { hr: 74, spo2: 99, sbp: 121, temp: 36.5, rr: 16 } },
  { patientId: "pt-mock-028", displayName: "감시후", age: 72, sex: "M", location: "6W-20", department: "WARD", assignedClinician: "장간호사", baselineRisk: "moderate", baselineVitals: { hr: 94, spo2: 95, sbp: 112, temp: 37.2, rr: 20 } },
  { patientId: "pt-mock-029", displayName: "예다인", age: 26, sex: "F", location: "5W-06", department: "WARD", assignedClinician: "유간호사", baselineRisk: "low", baselineVitals: { hr: 72, spo2: 99, sbp: 118, temp: 36.4, rr: 15 } },
  { patientId: "pt-mock-030", displayName: "라현석", age: 57, sex: "M", location: "6W-15", department: "WARD", assignedClinician: "장간호사", baselineRisk: "moderate", baselineVitals: { hr: 86, spo2: 97, sbp: 116, temp: 36.8, rr: 17 } },
] as const;

export const MOCK_COHORT_SIZE = MOCK_PATIENT_PROFILES.length;

export function profileById(id: string): PatientProfile | undefined {
  return MOCK_PATIENT_PROFILES.find((p) => p.patientId === id);
}
