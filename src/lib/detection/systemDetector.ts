import { DetectedOsInfo, DetectedCpuInfo, DetectedRamInfo } from './types';

export async function detectOs(): Promise<DetectedOsInfo> {
  let platform = 'Desconocido';
  let osName = 'Desconocido';
  let confidence: 'exact' | 'approximate' | 'inferred' | 'unknown' = 'unknown';

  if (typeof navigator !== 'undefined') {
    // 1. Probar Client Hints modernos (navigator.userAgentData)
    const uaData = (navigator as any).userAgentData;
    if (uaData) {
      platform = uaData.platform || 'Desconocido';
      osName = platform;
      confidence = 'approximate';

      try {
        if (typeof uaData.getHighEntropyValues === 'function') {
          const highEntropy = await uaData.getHighEntropyValues(['platform', 'platformVersion']);
          if (highEntropy.platform) {
            platform = highEntropy.platform;
            // Windows 11 suele reportar platformVersion >= 13.0.0
            const majorVersion = parseInt(highEntropy.platformVersion || '0', 10);
            if (platform.toLowerCase() === 'windows') {
              osName = majorVersion >= 13 ? 'Windows 11 (64-bit)' : 'Windows 10 / 11 (64-bit)';
              confidence = 'exact';
            }
          }
        }
      } catch (err) {
        // High entropy values bloqueados
      }
    }

    // 2. Fallback a navigator.userAgent y navigator.platform
    if (osName === 'Desconocido' && navigator.userAgent) {
      const ua = navigator.userAgent;
      if (/Windows NT 10.0/i.test(ua)) {
        osName = 'Windows 10 / 11 (64-bit)';
        platform = 'Windows';
        confidence = 'approximate';
      } else if (/Windows NT 6.3/i.test(ua)) {
        osName = 'Windows 8.1';
        platform = 'Windows';
        confidence = 'exact';
      } else if (/Windows NT 6.1/i.test(ua)) {
        osName = 'Windows 7';
        platform = 'Windows';
        confidence = 'exact';
      } else if (/Macintosh|Mac OS X/i.test(ua)) {
        osName = 'macOS';
        platform = 'macOS';
        confidence = 'exact';
      } else if (/Linux/i.test(ua)) {
        osName = 'Linux';
        platform = 'Linux';
        confidence = 'approximate';
      }
    }
  }

  return {
    platform: {
      value: platform,
      confidence,
      sourceApi: 'navigator.userAgentData / userAgent',
      isReliable: platform !== 'Desconocido',
      notes: 'Plataforma del sistema operativo informada por el navegador.'
    },
    osName: {
      value: osName,
      confidence,
      sourceApi: 'navigator.userAgentData / userAgent',
      isReliable: osName.includes('Windows'),
      notes: osName.includes('Windows')
        ? 'Wuthering Waves para PC requiere oficialmente Windows 10/11 de 64 bits.'
        : 'Sistema operativo no compatible directamente con el cliente nativo de Windows.'
    }
  };
}

export function detectRam(): DetectedRamInfo {
  let estimatedGb = 0;
  let isCapped = false;
  let confidence: 'approximate' | 'unknown' = 'unknown';

  if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
    const memory = (navigator as any).deviceMemory;
    if (typeof memory === 'number' && memory > 0) {
      estimatedGb = memory;
      isCapped = memory >= 8;
      confidence = 'approximate';
    }
  }

  return {
    estimatedGb: {
      value: estimatedGb,
      confidence,
      sourceApi: 'navigator.deviceMemory',
      isReliable: estimatedGb > 0,
      notes: isCapped
        ? 'El navegador limita deviceMemory a 8 GB por privacidad (fingerprinting). Tu equipo podría tener 16 GB o más.'
        : (estimatedGb > 0 ? `Aproximadamente ${estimatedGb} GB detectados.` : 'API deviceMemory no disponible en este navegador.')
    },
    isCappedByBrowser: isCapped
  };
}

export function detectCpu(): DetectedCpuInfo {
  let logicalCores = 0;
  let confidence: 'inferred' | 'unknown' = 'unknown';

  if (typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator) {
    logicalCores = navigator.hardwareConcurrency || 0;
    if (logicalCores > 0) {
      confidence = 'inferred';
    }
  }

  return {
    coresOrThreads: {
      value: logicalCores,
      confidence,
      sourceApi: 'navigator.hardwareConcurrency',
      isReliable: logicalCores > 0,
      notes: logicalCores > 0
        ? `${logicalCores} hilos lógicos reportados. Por razones de seguridad, las páginas web no pueden leer el modelo exacto de CPU.`
        : 'API hardwareConcurrency bloqueada o no soportada.'
    },
    architecture: {
      value: 'x86_64 / arm64',
      confidence: 'inferred',
      sourceApi: 'UserAgent / Navigator',
      isReliable: false,
      notes: 'Inferido de la plataforma del sistema.'
    },
    estimatedModel: {
      value: 'No detectable desde la web (requiere selección manual)',
      confidence: 'unknown',
      sourceApi: 'None',
      isReliable: false,
      notes: 'Ninguna API web estándar expone el modelo comercial del procesador. Por favor selecciónalo manualmente en el formulario.'
    }
  };
}
