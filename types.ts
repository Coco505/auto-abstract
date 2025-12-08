
// Default "Injury Surveillance" specific interface (kept for backward compatibility/specialized rendering)
export interface InjurySurveillanceData {
  visitDate: string;
  visitTime: string;
  patientAge: string;
  patientGender: string;
  incidentLocation: string;
  injuryMechanism: string;
  intent: string;
  diagnoses: string[];
  disposition: string;
  briefSummary: string;
  missingInformation: string[];
}

// Generic type for any extracted data
export type ExtractedData = Record<string, any>;

export enum ProcessingStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ClinicalNotePreset {
  name: string;
  content: string;
}

export type FieldType = 'string' | 'array' | 'boolean' | 'date';

export interface SchemaField {
  id: string;
  key: string;
  description: string;
  type: FieldType;
}

export interface ExtractionConfig {
  id: string;
  name: string;
  isCustom: boolean;
  fields: SchemaField[];
}
