import { DeviceHardwareProfile } from './types';
import { detectGpu } from './gpuDetector';
import { detectCpu, detectOs, detectRam, detectBrave } from './systemDetector';
import { detectScreen } from './screenDetector';
import { inferCpuFromGpu } from './cpuInferencer';

export * from './types';
export * from './normalizer';
export * from './gpuDetector';
export * from './systemDetector';
export * from './screenDetector';
export * from './cpuInferencer';

export async function runFullHardwareInspection(): Promise<DeviceHardwareProfile> {
  const [gpu, os, screen, braveInfo] = await Promise.all([
    detectGpu(),
    detectOs(),
    detectScreen(),
    detectBrave()
  ]);

  // La CPU no es legible desde el navegador: se infiere desde la iGPU cuando
  // ésta pertenece a un rango cerrado de procesadores.
  const cpuInference = inferCpuFromGpu(gpu);
  const cpu = detectCpu(cpuInference);
  const ram = detectRam();

  const usedGpuSources = new Set(gpu.candidates.map((candidate) => candidate.sourceApi));
  const webGlAvailable = usedGpuSources.has('WebGL') || usedGpuSources.has('detect-gpu');
  const webGpuAvailable =
    usedGpuSources.has('WebGPU') ||
    (typeof navigator !== 'undefined' && 'gpu' in navigator);

  // Brave bloquea WebGL/WebGPU mediante protección contra huella digital.
  const isShieldsBlocking =
    braveInfo.isBrave &&
    (gpu.model.confidence === 'unknown' ||
      gpu.isVirtualRenderer ||
      gpu.rendererString === 'No disponible' ||
      gpu.candidates.length === 0);

  return {
    detectedAt: new Date().toISOString(),
    gpu,
    cpu,
    ram,
    os,
    screen,
    webGlAvailable,
    webGpuAvailable,
    isBrave: braveInfo.isBrave,
    isShieldsBlocking
  };
}
