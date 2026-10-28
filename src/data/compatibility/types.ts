export type ComponentType = 'gpu' | 'cpu';

export type FormFactor = 'desktop' | 'laptop' | 'all';

export type RuleStatus = 
  | 'confirmed'         // Confirmado en nota oficial de Kuro Games
  | 'unconfirmed'       // No admitido oficialmente o por debajo del umbral
  | 'pending_review'    // Modelo nuevo o sin mención explícita
  | 'outdated';         // Regla superada por un parche posterior

export interface OfficialSource {
  id: string;
  title: string;
  shortLabel: string;
  url: string;
  publicationDate: string;
  gameVersion: string;
  type: 'patch_notes' | 'official_announcement' | 'system_requirements';
  notes: string;
}

export interface CompatibilityRule {
  id: string;
  version: string;
  componentType: ComponentType;
  manufacturer: 'NVIDIA' | 'AMD' | 'Intel' | 'Apple' | 'Other';
  family: string;
  model: string;
  normalizedName: string;
  aliases: string[];
  formFactor: FormFactor;
  status: RuleStatus;
  isCompatible120Fps: boolean;
  minRamGb?: number;
  sourceId: string;
  lastVerifiedDate: string;
  notes?: string;
  changeHistory?: string[];
}

export interface GeneralRequirements {
  minRamGb: number;
  recommendedRamGb: number;
  supportedOS: string[];
  minScreenRefreshRate: number; // 120Hz para apreciar físicamente la fluidez
}
