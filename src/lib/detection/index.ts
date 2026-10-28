import { DeviceHardwareProfile } from './types';
import { detectGpu } from './gpuDetector';
import { detectCpu, detectOs, detectRam } from './systemDetector';
import { detectScreen } from './screenDetector';

export * from './types';
export * from './normalizer';
export * from './gpuDetector';
export * from './systemDetector';
export * from './screenDetector';

export async function runFullHardwareInspection(): Promise<DeviceHardwareProfile> {
  const [gpu, os, screen] = await Promise.all([
    detectGpu(),
    detectOs(),
    detectScreen()
  ]);

  const cpu = detectCpu();
  const ram = detectRam();

  const webGlAvailable = gpu.apiUsed === 'WebGL' || (typeof document !== 'undefined' && !!document.createElement('canvas').getContext('webgl'));
  const webGpuAvailable = typeof navigator !== 'undefined' && 'gpu' in navigator;

  return {
    detectedAt: new Date().toISOString(),
    gpu,
    cpu,
    ram,
    os,
    screen,
    webGlAvailable,
    webGpuAvailable
  };
}
