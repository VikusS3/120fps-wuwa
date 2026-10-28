export type ConfidenceLevel = 'exact' | 'approximate' | 'inferred' | 'unknown' | 'manual';

export interface DetectedField<T> {
  value: T;
  rawString?: string;
  confidence: ConfidenceLevel;
  sourceApi: string;
  isReliable: boolean;
  notes: string;
}

export interface DetectedGpuInfo {
  vendor: DetectedField<string>;
  model: DetectedField<string>;
  rendererString: string;
  isVirtualRenderer: boolean;
  isIntegratedGpu: boolean;
  apiUsed: 'WebGL' | 'WebGPU' | 'None';
}

export interface DetectedCpuInfo {
  coresOrThreads: DetectedField<number>;
  architecture: DetectedField<string>;
  estimatedModel: DetectedField<string>;
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
}
