import { OfficialSource, FormFactor } from '../../data/compatibility/types';

export type RequirementStatus = 
  | 'confirmed_compatible'
  | 'confirmed_incompatible'
  | 'unknown'
  | 'not_applicable'
  | 'outdated_rule';

export type OverallVerdict = 
  | 'compatible'           // Cumple la lista oficial de 120 FPS
  | 'incompatible'         // No cumple la lista oficial de 120 FPS
  | 'cannot_determine';    // Faltan datos o requiere verificación manual

export interface RequirementEvaluation {
  id: string;
  name: string;
  status: RequirementStatus;
  userValue: string;
  isMandatory: boolean;
  message: string;
  officialSource?: OfficialSource;
  notes?: string;
}

export interface UserHardwareInput {
  gpuModel: string;
  gpuFormFactor: FormFactor;
  cpuModel: string;
  cpuFormFactor: FormFactor;
  ramGb: number;
  osName: string;
  screenRefreshRateHz: number;
}

export interface EvaluationResult {
  verdict: OverallVerdict;
  verdictTitle: string;
  verdictDescription: string;
  performanceDisclaimer: string;
  requirements: RequirementEvaluation[];
  consultedSources: OfficialSource[];
  evaluatedAt: string;
  canCopyReport: boolean;
}
