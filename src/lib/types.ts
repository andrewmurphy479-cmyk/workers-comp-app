export type Severity = "minor" | "moderate" | "severe";
export type IncidentStatus = "new" | "in_progress" | "completed";

export type InjuryType =
  | "slip_fall"
  | "strain_sprain"
  | "cut_laceration"
  | "burn"
  | "repetitive_motion"
  | "struck_by_object"
  | "vehicle_accident"
  | "chemical_exposure"
  | "machinery"
  | "other";

export const INJURY_TYPE_LABELS: Record<InjuryType, string> = {
  slip_fall: "Slip, Trip, or Fall",
  strain_sprain: "Strain or Sprain",
  cut_laceration: "Cut or Laceration",
  burn: "Burn",
  repetitive_motion: "Repetitive Motion Injury",
  struck_by_object: "Struck by Object",
  vehicle_accident: "Vehicle Accident",
  chemical_exposure: "Chemical Exposure",
  machinery: "Machinery / Equipment Injury",
  other: "Other",
};

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  whyItMatters: string;
  timing: string;
  officialLink?: { label: string; url: string };
  completed: boolean;
  completedAt: string | null;
}

export interface Incident {
  id: string;
  employeeName: string;
  dateOfInjury: string;
  injuryType: InjuryType;
  severity: Severity;
  description: string;
  steps: WorkflowStep[];
  status: IncidentStatus;
  createdAt: string;
}
