import { GPU_RULES } from '../../data/compatibility/gpuDatabase';
import { CPU_RULES } from '../../data/compatibility/cpuDatabase';
import { CompatibilityRule } from '../../data/compatibility/types';

/**
 * Tokens de marca/comerciales que no aportan información del modelo
 * y rompen la coincidencia con los alias de la base de datos
 * (ej. "intel(r) uhd graphics" -> "intel uhd graphics").
 */
const TRADEMARK_TOKENS = new Set(['r', 'tm', 'inc', 'corp', 'ltd', 'co', 'gmbh', 'kg']);

/**
 * Desenvuelve el prefijo ANGLE (...) respetando paréntesis anidados.
 *
 * La implementación anterior usaba `\([^)]+\)` y cortaba en el primer ")"
 * que encontraba, por lo que cadenas reales como
 * `ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 ...)` se corrompían
 * y dejaban tokens sueltos ("intel intel r uhd graphics 630").
 */
function unwrapAngle(input: string): string {
  let result = input;
  // Máximo 4 envoltorios anidados (suficiente para cualquier cadena real).
  for (let guard = 0; guard < 4; guard++) {
    const lower = result.toLowerCase();
    const angleIndex = lower.indexOf('angle');
    if (angleIndex === -1) break;

    const openIndex = result.indexOf('(', angleIndex);
    if (openIndex === -1) break;

    let depth = 0;
    let closeIndex = -1;
    for (let i = openIndex; i < result.length; i++) {
      const char = result.charAt(i);
      if (char === '(') depth++;
      else if (char === ')') {
        depth--;
        if (depth === 0) {
          closeIndex = i;
          break;
        }
      }
    }
    if (closeIndex === -1) break;

    const inner = result.slice(openIndex + 1, closeIndex);
    result = `${result.slice(0, angleIndex)} ${inner} ${result.slice(closeIndex + 1)}`;
  }
  return result;
}

/**
 * Limpia y normaliza una cadena de texto eliminando caracteres superfluos,
 * prefijos de ANGLE, drivers DirectX/OpenGL, marcas registradas y espacios
 * redundantes. Se aplica por igual a las cadenas detectadas y a los alias
 * de la base de datos para que ambas partes se comparen en el mismo formato.
 */
export function normalizeHardwareString(raw: string): string {
  if (!raw) return '';

  let step = raw.toLowerCase();
  step = unwrapAngle(step);
  step = step.replace(/with\s+radeon.*$/gi, ' '); // Sufijos Windows ("with Radeon Vega Mobile Gfx")
  step = step.replace(/direct3d\d+|d3d\d+|vs_\d+_\d+|ps_\d+_\d+/gi, ' ');
  step = step.replace(/opengl|vulkan|metal|mesa|gallium/gi, ' ');
  step = step.replace(/\b0x[0-9a-f]{4,}\b/gi, ' '); // IDs de dispositivo hexadecimales
  step = step.replace(/series/gi, ' ');
  // Marcas registradas entre paréntesis: (R), (TM), (Inc.), (Corp.)...
  step = step.replace(/\((?:r|tm|inc|corp|ltd|co|gmbh|kg)\)/gi, ' ');
  step = step.replace(/[[\]]/g, ' '); // Corchetes de nombres de codificación (ej. "[UHD Graphics 630]")
  step = step.replace(/[(),]/g, ' ');
  step = step.replace(/\s+/g, ' ').trim();

  // Tokens de marca sueltos que hayan sobrevivido a la limpieza.
  step = step
    .split(' ')
    .filter((token) => token.length > 0 && !TRADEMARK_TOKENS.has(token))
    .join(' ');

  return step;
}

/** Normaliza todos los alias de una regla una sola vez por llamada. */
function normalizedAliases(rule: CompatibilityRule): string[] {
  return rule.aliases.map((alias) => normalizeHardwareString(alias)).filter(Boolean);
}

/**
 * Coincidencia por palabra completa: el alias debe estar delimitado por
 * espacios o por límites de palabra (para "rtx 4060/PCIe/SSE2").
 */
function matchesAlias(clean: string, alias: string): boolean {
  if (!alias) return false;
  const regex = new RegExp(`(^|\\b|\\s)${escapeRegExp(alias)}(\\b|\\s|$)`, 'i');
  return regex.test(clean);
}

/**
 * Busca si una cadena de texto coincide con alguna regla de GPU en la base de datos.
 * Los alias se ordenan de mayor a menor longitud para que las variantes
 * (RTX 4070 Ti SUPER) ganen siempre sobre la base (RTX 4070).
 */
export function matchGpuRule(input: string): CompatibilityRule | null {
  if (!input) return null;
  const clean = normalizeHardwareString(input);
  if (!clean) return null;

  return findRule(GPU_RULES, clean);
}

/**
 * Busca si una cadena de texto coincide con alguna regla de CPU en la base de datos.
 */
export function matchCpuRule(input: string): CompatibilityRule | null {
  if (!input) return null;
  const clean = normalizeHardwareString(input);
  if (!clean) return null;

  const matched = findRule(CPU_RULES, clean);
  if (matched) return matched;

  // ==========================================
  // 3. Inferencia de arquitectura / generación para modelos no listados individualmente
  // ==========================================

  // Detección para AMD Ryzen
  if (/ryzen|\br[3579]\b/i.test(clean)) {
    const isUSeries =
      /\b\d{4}u\b/i.test(clean) ||
      /\b(3500|3200|3700|2500|4500|5500|5700)u\b/i.test(clean);

    // Gama de bajo consumo (U-Series): siempre por debajo del umbral de 120 FPS.
    if (isUSeries) {
      return buildInferredCpuRule(clean, input, {
        id: 'cpu-amd-legacy-inferred',
        family: 'AMD Ryzen (Generación Previa / Serie U)',
        status: 'unconfirmed',
        isCompatible120Fps: false,
        sourceId: 'kuro-system-reqs',
        notes:
          'Procesador de generación anterior o gama de bajo consumo (U-Series). No alcanza el umbral de potencia exigido por Kuro Games para el perfil de 120 FPS.'
      });
    }

    // Modelos Ryzen anteriores: serie 1000, 2000, 3000 o 4000 de escritorio.
    if (/\b[1234]\d{3}[a-z]*\b/i.test(clean)) {
      return buildInferredCpuRule(clean, input, {
        id: 'cpu-amd-legacy-inferred',
        family: 'AMD Ryzen (Generación Previa)',
        status: 'unconfirmed',
        isCompatible120Fps: false,
        sourceId: 'kuro-system-reqs',
        notes:
          'Procesador de generación anterior. No alcanza el umbral de potencia exigido por Kuro Games para el perfil de 120 FPS.'
      });
    }

    // Ryzen 5000 y 6000 de escritorio/móvil de gama media-alta (Zen 3 / Zen 3+).
    // Cubre modelos populares ausentes de la base, p. ej. Ryzen 5 5600X, 5700X o 6800H.
    if (/\b[56]\d{3}[a-z]*\b/i.test(clean)) {
      return buildInferredCpuRule(clean, input, {
        id: 'cpu-amd-ryzen-5000-inferred',
        family: 'AMD Ryzen 5000/6000 Series',
        status: 'confirmed',
        isCompatible120Fps: true,
        sourceId: 'kuro-v1-2',
        notes:
          'Arquitectura Zen 3 / Zen 3+ (serie 5000/6000) dentro del rango admitido por Kuro Games para 120 FPS.'
      });
    }

    // Modelos Ryzen modernos: serie 7000, 8000, 9000.
    if (/\b[789]\d{3}[a-z]*\b/i.test(clean)) {
      return buildInferredCpuRule(clean, input, {
        id: 'cpu-amd-modern-inferred',
        family: 'AMD Ryzen 7000/8000/9000 Series',
        status: 'confirmed',
        isCompatible120Fps: true,
        sourceId: 'kuro-v1-2',
        notes: 'Arquitectura Zen 4 / Zen 5 moderna compatible con el perfil de 120 FPS.'
      });
    }
  }

  // Detección para Intel Core
  if (/intel|core|i[3579]/i.test(clean)) {
    // Intel 12ª, 13ª, 14ª gen o Core Ultra
    if (/\b(12|13|14)\d{3}[a-z]*\b/i.test(clean) || /ultra\s*[579]/i.test(clean)) {
      return buildInferredCpuRule(clean, input, {
        id: 'cpu-intel-modern-inferred',
        family: 'Intel Core 12th-14th Gen / Ultra',
        status: 'confirmed',
        isCompatible120Fps: true,
        sourceId: 'kuro-v1-2',
        notes: 'Generación moderna compatible con el perfil de 120 FPS.'
      });
    }
    // Intel de generaciones anteriores (2ª a 11ª gen, ej. i5-10400, i7-9700, i5-8250U)
    if (/\b([2-9]|10|11)\d{3}[a-z]*\b/i.test(clean) || /\b\d{4}u\b/i.test(clean) || /\b\d{4}g\d\b/i.test(clean)) {
      return buildInferredCpuRule(clean, input, {
        id: 'cpu-intel-legacy-inferred',
        family: 'Intel Core (11th Gen o anterior)',
        status: 'unconfirmed',
        isCompatible120Fps: false,
        sourceId: 'kuro-system-reqs',
        notes:
          'Generación previa al umbral base oficial de Kuro Games (requiere Intel Core 12ª generación o superior).'
      });
    }
  }

  return null;
}

interface InferredCpuMeta {
  id: string;
  family: string;
  status: CompatibilityRule['status'];
  isCompatible120Fps: boolean;
  sourceId: string;
  notes?: string;
}

/** Construye una regla de CPU inferida con el factor de forma corregido. */
function buildInferredCpuRule(clean: string, raw: string, meta: InferredCpuMeta): CompatibilityRule {
  return {
    id: meta.id,
    version: '1.2.0',
    componentType: 'cpu',
    manufacturer: clean.includes('ryzen') || /\br[3579]\b/i.test(clean) ? 'AMD' : 'Intel',
    family: meta.family,
    model: raw.trim(),
    normalizedName: clean,
    aliases: [clean],
    formFactor: inferFormFactor(clean),
    status: meta.status,
    isCompatible120Fps: meta.isCompatible120Fps,
    sourceId: meta.sourceId,
    lastVerifiedDate: '2026-10-28',
    notes: meta.notes
  };
}

/**
 * Detecta el factor de forma a partir de los sufijos reales de los modelos:
 * U/G (ulabook), H/HS/HX (gama alta móvil). Evita el falso positivo anterior
 * que detectaba la "h" de "13th Gen" como portátil.
 */
export function inferFormFactor(clean: string): 'laptop' | 'desktop' {
  if (/\blaptop\b|\bmobile\b/i.test(clean)) return 'laptop';
  if (/\b\d{3,5}u\b/i.test(clean)) return 'laptop'; // 8250u, 10510u, 5500u
  if (/\b\d{3,5}g\d\b/i.test(clean)) return 'laptop'; // 1135g7, 1165g7
  if (/\b\d{3,5}h[skxfq]?\b/i.test(clean)) return 'laptop'; // 5800h, 7840hs, 13700hx, 6700hq
  if (/\b\d{3,5}m[qk]\b/i.test(clean)) return 'laptop'; // 4810mq
  if (/\b(?:hs|hx)\b/i.test(clean)) return 'laptop';
  return 'desktop';
}

/** Coincidencia compartida: exacta primero, luego por alias ordenado por longitud. */
function findRule(rules: CompatibilityRule[], clean: string): CompatibilityRule | null {
  for (const rule of rules) {
    if (clean === rule.normalizedName) return rule;
    if (clean === normalizeHardwareString(rule.normalizedName)) return rule;
  }

  const candidates: Array<{ rule: CompatibilityRule; alias: string }> = [];
  for (const rule of rules) {
    for (const alias of normalizedAliases(rule)) {
      candidates.push({ rule, alias });
    }
  }
  candidates.sort((a, b) => b.alias.length - a.alias.length);

  for (const { rule, alias } of candidates) {
    if (matchesAlias(clean, alias)) return rule;
  }

  // 3. Último recurso: coincidencia por tokens en orden. Cubre cadenas donde
  // el modelo aparece separado por ruido de codificación, p. ej.
  // "intel corporation cometlake-s gt2 uhd graphics 630".
  for (const { rule, alias } of candidates) {
    if (matchesAliasOrdered(clean, alias)) return rule;
  }

  return null;
}

/** Comprueba que todos los tokens del alias aparezcan, en orden, en la entrada. */
function matchesAliasOrdered(clean: string, alias: string): boolean {
  const aliasTokens = alias.split(' ');
  if (aliasTokens.length === 0) return false;
  const cleanTokens = clean.split(' ');
  let index = 0;
  for (const token of cleanTokens) {
    if (token === aliasTokens[index]) index++;
    if (index === aliasTokens.length) return true;
  }
  return false;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
