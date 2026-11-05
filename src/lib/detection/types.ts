export type ConfidenceLevel = 'exact' | 'approximate' | 'inferred' | 'unknown' | 'manual';

export interface DetectedField<T> {
  value: T;
  rawString?: string;
  confidence: ConfidenceLevel;
  sourceApi: string;
  isReliable: boolean;
  notes: string;
}

/** Fuente de cada candidato a GPU recopilado durante la inspección. */
export type GpuCandidateSource = 'WebGL' | 'WebGPU' | 'detect-gpu';

/**
 * Cada cadena expuesta por el navegador (WebGL, WebGPU o detect-gpu) se
 * evalúa por separado y después se elige la mejor candidata.
 */
export interface GpuCandidate {
  sourceApi: GpuCandidateSource;
  rawString: string;
  cleanedString: string;
  isVirtual: boolean;
  isIntegrated: boolean;
  matchedRuleId?: string;
}

export interface DetectedGpuInfo {
  vendor: DetectedField<string>;
  model: DetectedField<string>;
  rendererString: string;
  isVirtualRenderer: boolean;
  isIntegratedGpu: boolean;
  apiUsed: 'WebGL' | 'WebGPU' | 'None';
  /** Todas las cadenas observadas, en orden de preferencia. */
  candidates: GpuCandidate[];
  /** Segunda gráfica detectada (p. ej. iGPU + dedicada en portátiles Optimus). */
  secondaryGpu?: string;
}

/**
 * Inferencia de familia de CPU a partir de la iGPU detectada.
 * Nunca es una lectura exacta: `decisive` indica si el rango de generación
 * es lo bastante cerrado como para completar la comparación.
 */
export interface CpuInference {
  decisive: boolean;
  family: string;
  suggestedModel?: string;
  sourceGpu: string;
  notes: string;
}

export interface DetectedCpuInfo {
  coresOrThreads: DetectedField<number>;
  architecture: DetectedField<string>;
  estimatedModel: DetectedField<string>;
  inference?: CpuInference;
}

export interface DetectedRamInfo {
  estimatedGb: DetectedField<number>;
  isCappedByBrowser: boolean;
}

export interface DetectedOsInfo {
  platform: DetectedField<string>;
  osName: DetectedField<string>;
}

export interface DetectedScreenInfo {
  width: number;
  height: number;
  pixelRatio: number;
  estimatedRefreshRate: DetectedField<number>;
}

export interface DeviceHardwareProfile {
  detectedAt: string;
  gpu: DetectedGpuInfo;
  cpu: DetectedCpuInfo;
  ram: DetectedRamInfo;
  os: DetectedOsInfo;
  screen: DetectedScreenInfo;
  webGlAvailable: boolean;
  webGpuAvailable: boolean;
  isBrave?: boolean;
  isShieldsBlocking?: boolean;
}
