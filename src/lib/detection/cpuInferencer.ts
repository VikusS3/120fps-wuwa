import { CpuInference, DetectedGpuInfo } from './types';
import { normalizeHardwareString } from './normalizer';

/**
 * Ninguna API web expone el modelo comercial de la CPU (por diseño de los
 * navegadores). Sin embargo, las gráficas integradas son exclusivas de un
 * rango concreto de procesadores, lo que permite inferir la familia con
 * un nivel de certeza documentable.
 *
 * `decisive: true`  -> el rango de generación es cerrado y permite completar
 *                      la comparación (siempre marcado como inferido).
 * `decisive: false` -> el rango es ambiguo; solo se ofrece como guía y el
 *                      usuario debe elegir su modelo exacto.
 *
 * Los patrones se evalúan sobre la cadena ya normalizada (minúsculas, sin
 * ANGLE, sin "(R)"/"(TM)").
 */
interface CpuInferenceRule {
  pattern: RegExp;
  decisive: boolean;
  family: string;
  suggestedModel?: string;
  notes: string;
}

const IGPU_CPU_RULES: CpuInferenceRule[] = [
  // ---------------- AMD ----------------
  {
    // Radeon 760M/780M (Zen 4) y 880M/890M (Zen 5): solo en Ryzen 7040/8040/9040.
    pattern: /\bradeon\s+(?:760m|780m|880m|890m)\b/,
    decisive: true,
    family: 'AMD Ryzen 7000/8000/9000 (iGPU RDNA 3)',
    suggestedModel: 'AMD Ryzen 7 7840HS / 8845HS',
    notes:
      'La iGPU detectada solo existe en los procesadores AMD Ryzen de serie 7000/8000/9000 (Zen 4 / Zen 5), dentro del rango admitido por Kuro Games.'
  },
  {
    // Radeon 660M/680M: exclusivas de Ryzen serie 6000 (Zen 3+).
    pattern: /\bradeon\s+(?:660m|680m)\b/,
    decisive: true,
    family: 'AMD Ryzen 6000 Series (iGPU RDNA 2)',
    suggestedModel: 'AMD Ryzen 7 6800H / 6900HX',
    notes:
      'La iGPU detectada solo existe en los procesadores AMD Ryzen serie 6000 (Zen 3+), dentro del rango admitido por Kuro Games.'
  },
  {
    // Radeon 740M: exclusiva de Phoenix (Zen 4): Ryzen 7000/8000 en versiones
    // U (portátil) y G (escritorio, p. ej. 8500G). No decisiva porque las U no
    // figuran en la whitelist mientras que la generación Zen 4 sí está admitida:
    // se pide al usuario que elija su modelo exacto.
    // (610M se omite deliberadamente: existe en Mendocino Zen 2 y en Dragon
    // Range-H Zen 4, ambigüedad que impide concluir la generación.)
    pattern: /\bradeon\s+740m\b/,
    decisive: false,
    family: 'AMD Ryzen 7000/8000 Phoenix (Zen 4, versiones U / G)',
    notes:
      'Tu iGPU indica un AMD Ryzen Zen 4 (Phoenix). Selecciona tu modelo exacto (U de portátil o G de escritorio) para completar la comparación.'
  },
  {
    // Radeon 840M/860M: exclusivas de Krackan Point (Zen 5): Ryzen AI 300.
    pattern: /\bradeon\s+(?:840m|860m)\b/,
    decisive: false,
    family: 'AMD Ryzen AI 300 Krackan (Zen 5)',
    notes:
      'Tu iGPU indica un AMD Ryzen AI 300 (Zen 5). Selecciona tu modelo exacto para completar la comparación.'
  },
  {
    // Vega integrada o "Radeon Graphics" genérico: abarca desde Ryzen 2000 hasta
    // Ryzen 5000 en versiones U y G, así que no permite concluir la generación.
    // Se excluyen las Vega discretas (RX Vega 56/64) mediante el ancla "10 | 3-9".
    pattern: /\bvega\s*(?:10|[3-9])\b|\bradeon\s+vega\b|\bradeon\s+graphics\b/,
    decisive: false,
    family: 'AMD Ryzen con gráfica integrada Vega (serie U / generación anterior)',
    notes:
      'Tu iGPU indica un AMD Ryzen con gráfica integrada Vega, presente tanto en portátiles de bajo consumo como en APU de escritorio. Selecciona tu modelo exacto para completar la comparación.'
  },

  // ---------------- Intel ----------------
  {
    // iGPU Intel Arc (Meteor Lake / Lunar Lake / Arrow Lake): solo existe en
    // Core Ultra. Las Arc discretas (A770/B580) no coinciden con el patrón.
    pattern: /\barc\s+(?:graphics|1[34]0v)\b/,
    decisive: true,
    family: 'Intel Core Ultra (Meteor Lake / Lunar Lake / Arrow Lake)',
    suggestedModel: 'Intel Core Ultra 5 125H',
    notes:
      'La iGPU detectada solo existe en procesadores Intel Core Ultra (equivalentes a 12ª generación o superior), dentro del rango admitido por Kuro Games.'
  },
  {
    // UHD 730/770: exclusivas de escritorio 12ª-14ª generación.
    pattern: /\buhd\s+graphics\s+(?:730|770)\b/,
    decisive: true,
    family: 'Intel Core 12ª-14ª generación',
    suggestedModel: 'Intel Core i5-12400 / 12400F',
    notes:
      'La iGPU detectada solo existe en Intel Core de escritorio de 12ª a 14ª generación, dentro del rango admitido por Kuro Games.'
  },
  {
    // UHD 750: exclusiva de 11ª generación de escritorio (por debajo del umbral).
    pattern: /\buhd\s+graphics\s+750\b/,
    decisive: true,
    family: 'Intel Core 11ª generación',
    suggestedModel: 'Intel Core i5-11400 / 10400',
    notes:
      'La iGPU detectada solo existe en Intel Core de 11ª generación, por debajo del umbral de 12ª generación exigido por Kuro Games.'
  },
  {
    // UHD 600/605/615: Pentium Silver / Celeron (sin regla en la base).
    pattern: /\buhd\s+graphics\s+(?:600|605|615)\b/,
    decisive: false,
    family: 'Intel Pentium / Celeron',
    notes:
      'Tu iGPU corresponde a un Intel Pentium o Celeron. Selecciona tu modelo exacto para completar la comparación.'
  },
  {
    // UHD 610/620/630 y HD 4xx-6xx: 2ª a 10ª generación (por debajo del umbral).
    pattern: /\buhd\s+graphics\s+6[123]0\b|\bhd\s+graphics\s+(?:[4-6]\d{2})\b/,
    decisive: true,
    family: 'Intel Core (10ª generación o anterior)',
    suggestedModel: 'Intel Core i5-10400 / 10400F',
    notes:
      'La iGPU detectada solo existe en Intel Core de 10ª generación o anterior, por debajo del umbral de 12ª generación exigido por Kuro Games.'
  },
  {
    // Iris Plus / Iris Pro: 5ª a 10ª generación.
    pattern: /\biris\s+(?:plus|pro)\b/,
    decisive: true,
    family: 'Intel Core (10ª generación o anterior)',
    suggestedModel: 'Intel Core i5-1035G1',
    notes:
      'La iGPU detectada solo existe en Intel Core de 10ª generación o anterior, por debajo del umbral de 12ª generación exigido por Kuro Games.'
  },
  {
    // Iris Xe: 11ª, 12ª y 13ª generación -> rango ambiguo.
    pattern: /\biris\s+xe\b/,
    decisive: false,
    family: 'Intel Core 11ª-13ª generación (Iris Xe)',
    notes:
      'Tu iGPU indica un Intel Core de 11ª a 13ª generación. Como el umbral oficial es la 12ª generación, selecciona tu modelo exacto para completar la comparación.'
  },

  // ---------------- Apple ----------------
  {
    pattern: /\bapple\s+m[1-9]\b/,
    decisive: false,
    family: 'Apple Silicon (M1-M4)',
    notes:
      'Apple Silicon no dispone de cliente nativo de Windows para Wuthering Waves. Selecciona manualmente si utilizas otro equipo.'
  }
];

/**
 * Infiere la familia de CPU a partir de la GPU detectada.
 *
 * Se evalúan todas las fuentes disponibles en orden: la GPU elegida (mejor
 * candidata), el resto de candidatas —priorizando las integradas— y la segunda
 * GPU. Esto es esencial en portátiles Optimus: la dedicada gana la elección y,
 * sin este barrido, la iGPU (única que informa de la CPU) se ignoraba.
 *
 * Devuelve `null` cuando ninguna fuente aporta información de la CPU
 * (p. ej. escritorio con tarjeta dedicada sin iGPU expuesta).
 */
export function inferCpuFromGpu(
  gpu: Pick<DetectedGpuInfo, 'model' | 'rendererString'> &
    Partial<Pick<DetectedGpuInfo, 'candidates' | 'secondaryGpu'>>
): CpuInference | null {
  const sources: Array<{ text: string; label: string }> = [];
  const seen = new Set<string>();
  const add = (value: string | undefined, label: string) => {
    const text = (value || '').trim();
    const key = text.toLowerCase();
    if (text && !seen.has(key)) {
      seen.add(key);
      sources.push({ text, label });
    }
  };

  // 1. GPU elegida como cadena combinada (modelo + renderer crudo).
  add(`${gpu.model.value} ${gpu.rendererString}`, gpu.rendererString || gpu.model.value);

  // 2. Resto de candidatas, priorizando las iGPU (son las que informan de la CPU).
  const rest = [...(gpu.candidates ?? [])].sort(
    (a, b) => Number(b.isIntegrated) - Number(a.isIntegrated)
  );
  for (const candidate of rest) add(candidate.rawString, candidate.rawString);

  // 3. Segunda GPU detectada (iGPU + dedicada en portátiles conmutables).
  add(gpu.secondaryGpu, gpu.secondaryGpu ?? '');

  for (const source of sources) {
    const haystack = normalizeHardwareString(source.text);
    if (!haystack || haystack === 'no detectada' || haystack === 'no disponible') continue;

    for (const rule of IGPU_CPU_RULES) {
      if (rule.pattern.test(haystack)) {
        return {
          decisive: rule.decisive,
          family: rule.family,
          suggestedModel: rule.suggestedModel,
          sourceGpu: source.label,
          notes: rule.notes
        };
      }
    }
  }

  return null;
}
