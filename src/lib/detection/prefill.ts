import { DeviceHardwareProfile, DetectedRamInfo } from './types';
import { UserHardwareInput } from '../evaluation/types';

/**
 * Convierte el perfil inspeccionado en los valores iniciales del formulario.
 *
 * Se usa tanto en el escaneo inicial como en "restaurar detectado", para que
 * ambos caminos produzcan exactamente el mismo resultado (antes divergían:
 * el escaneo pre-rellenaba 16 GB de RAM mientras que el reset devolvía 8).
 *
 * Reglas de honestidad:
 * - CPU: solo se pre-rellena si la inferencia desde la iGPU es decisiva.
 * - RAM: se conserva el valor tal cual lo reporta el navegador (deviceMemory
 *   está capado a 8 GB por privacidad). Nunca se inventa un número mayor;
 *   la confirmación recae en `isRamUnconfirmed` + banner en la UI.
 */
export function buildHardwareInput(profile: DeviceHardwareProfile): UserHardwareInput {
  const isLaptopGpu =
    profile.gpu.model.value.toLowerCase().includes('laptop') ||
    profile.gpu.rendererString.toLowerCase().includes('mobile');

  const inference = profile.cpu.inference;
  const canPrefillCpu = !!inference?.decisive && !!inference.suggestedModel;

  return {
    gpuModel: profile.gpu.model.value !== 'No detectada' ? profile.gpu.model.value : '',
    gpuFormFactor: isLaptopGpu ? 'laptop' : 'desktop',
    // El factor de forma de una CPU inferida desde la iGPU es desconocido.
    cpuModel: canPrefillCpu ? (inference?.suggestedModel ?? '') : '',
    cpuFormFactor: canPrefillCpu ? 'all' : isLaptopGpu ? 'laptop' : 'desktop',
    ramGb: profile.ram.estimatedGb.value,
    osName:
      profile.os.osName.value !== 'Desconocido'
        ? profile.os.osName.value
        : 'Windows 10 / 11 (64-bit)',
    screenRefreshRateHz: profile.screen.estimatedRefreshRate.value || 60
  };
}

/**
 * `true` cuando la RAM real no es legible desde la web: deviceMemory está
 * capado a 8 GB (valores >= 8 son "8 o más") o la API no está disponible.
 * En ese caso la UI debe pedir confirmación al usuario en lugar de adivinar.
 */
export function isRamUnconfirmed(ram: DetectedRamInfo): boolean {
  return ram.isCappedByBrowser || ram.estimatedGb.value === 0;
}
