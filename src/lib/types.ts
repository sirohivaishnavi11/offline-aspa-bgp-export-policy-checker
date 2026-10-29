// Core types for ExportGuard — kept separate from the UI.

export type Relationship = 'customer' | 'peer' | 'provider' | 'unknown';

export type ValidationResult =
  | 'PASS'
  | 'FAIL'
  | 'WARNING'
  | 'UNKNOWN';

export interface AspaRecord {
  customerASN: number;
  providerASNs: number[];
  source: string;
  note?: string;
}

export interface RouteInput {
  asPath: number[];
  originAS: number;
  neighborAS: number;
  relationship: Relationship;
}

export interface ValidationStep {
  rule: string;
  status: ValidationResult | 'INFO';
  detail: string;
}

export interface ValidationReport {
  id: string;
  timestamp: string;
  input: RouteInput;
  result: ValidationResult;
  summary: string;
  steps: ValidationStep[];
}

export interface HistoryEntry extends ValidationReport {}

export interface SampleCase {
  id: string;
  title: string;
  description: string;
  expected: ValidationResult;
  input: RouteInput;
}
