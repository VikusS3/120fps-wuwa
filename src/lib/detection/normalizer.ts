import { GPU_RULES } from '../../data/compatibility/gpuDatabase';
import { CPU_RULES } from '../../data/compatibility/cpuDatabase';
import { CompatibilityRule } from '../../data/compatibility/types';

/**
 * Limpia y normaliza una cadena de texto eliminando caracteres superfluos,
 * prefijos de ANGLE, drivers DirectX/OpenGL y espacios redundantes.
 */
export function normalizeHardwareString(raw: string): string {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .replace(/angle\s*\([^)]+\)/gi, (match) => {
      // Extrae el contenido dentro de ANGLE (...)
      return match.replace(/^angle\s*\(/i, '').replace(/\)$/, '');
    })
    .replace(/with\s+radeon.*$/gi, '') // Quita sufijos de Windows como "with Radeon Vega Mobile Gfx"
    .replace(/direct3d\d+|d3d\d+|vs_\d+_\d+|ps_\d+_\d+/gi, '')
    .replace(/opengl|vulkan|metal|mesa|gallium/gi, '')
    .replace(/\b0x[0-9a-f]{4,}\b/gi, '') // Quita IDs de dispositivo hexadecimales (ej. 0x000073df)
    .replace(/series/gi, '')
    .replace(/[(),]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Busca si una cadena de texto coincide con alguna regla de GPU en la base de datos.
 */
export function matchGpuRule(input: string): CompatibilityRule | null {
  if (!input) return null;
  const clean = normalizeHardwareString(input);

  // 1. Coincidencia directa por normalizedName o aliases
  for (const rule of GPU_RULES) {
    if (clean === rule.normalizedName) return rule;
    if (rule.aliases.some(alias => clean === alias.toLowerCase())) return rule;
  }

  // 2. Coincidencia por palabra completa con límites de palabra (\b)
  const sortedRules = [...GPU_RULES].sort((a, b) => b.normalizedName.length - a.normalizedName.length);
  for (const rule of sortedRules) {
    for (const alias of rule.aliases) {
      const aliasLower = alias.toLowerCase();
      const regex = new RegExp(`(^|\\b|\\s)${escapeRegExp(aliasLower)}(\\b|\\s|$)`, 'i');
      if (regex.test(clean)) {
        return rule;
      }
    }
  }

  return null;
}

/**
 * Busca si una cadena de texto coincide con alguna regla de CPU en la base de datos.
 */
export function matchCpuRule(input: string): CompatibilityRule | null {
  if (!input) return null;
  const clean = normalizeHardwareString(input);

  // 1. Coincidencia directa por normalizedName o aliases exactos
  for (const rule of CPU_RULES) {
    if (clean === rule.normalizedName) return rule;
    if (rule.aliases.some(alias => clean === alias.toLowerCase())) return rule;
  }

  // 2. Coincidencia por palabra completa con límites de palabra (\b)
  const sortedRules = [...CPU_RULES].sort((a, b) => b.normalizedName.length - a.normalizedName.length);
  for (const rule of sortedRules) {
    for (const alias of rule.aliases) {
      const aliasLower = alias.toLowerCase();
      const regex = new RegExp(`(^|\\b|\\s)${escapeRegExp(aliasLower)}(\\b|\\s|$)`, 'i');
      if (regex.test(clean)) {
        return rule;
      }
    }
  }

  // 3. Inferencia de arquitectura / generación para modelos no listados individualmente
  // Detección para AMD Ryzen
  if (/ryzen|\br[3579]\b/i.test(clean)) {
    // Modelos Ryzen anteriores: serie 1000, 2000, 3000, 4000 o sufijos U
    if (/\b[1234]\d{3}[a-z]*\b/i.test(clean) || /\b\d{4}u\b/i.test(clean) || /\b(3500|3200|3700|2500|4500|5500|5700)u\b/i.test(clean)) {
      return {
        id: 'cpu-amd-legacy-inferred',
        version: '1.2.0',
        componentType: 'cpu',
        manufacturer: 'AMD',
        family: 'AMD Ryzen (Generación Previa / Serie U)',
        model: input.trim(),
        normalizedName: clean,
        aliases: [clean],
        formFactor: clean.includes('u') || clean.includes('laptop') || clean.includes('mobile') ? 'laptop' : 'desktop',
        status: 'unconfirmed',
        isCompatible120Fps: false,
        sourceId: 'kuro-system-reqs',
        lastVerifiedDate: '2026-10-28',
        notes: 'Procesador de generación anterior o gama de bajo consumo (U-Series). No alcanza el umbral de potencia exigido por Kuro Games para el perfil de 120 FPS.'
      };
    }
    // Modelos Ryzen modernos: serie 7000, 8000, 9000
    if (/\b[789]\d{3}[a-z]*\b/i.test(clean)) {
      return {
        id: 'cpu-amd-modern-inferred',
        version: '1.2.0',
        componentType: 'cpu',
        manufacturer: 'AMD',
        family: 'AMD Ryzen 7000/8000/9000 Series',
        model: input.trim(),
        normalizedName: clean,
        aliases: [clean],
        formFactor: clean.includes('hs') || clean.includes('hx') || clean.includes('laptop') ? 'laptop' : 'desktop',
        status: 'confirmed',
        isCompatible120Fps: true,
        sourceId: 'kuro-v1-2',
        lastVerifiedDate: '2026-10-28',
        notes: 'Arquitectura Zen 4 / Zen 5 moderna compatible con el perfil de 120 FPS.'
      };
    }
  }

  // Detección para Intel Core
  if (/intel|core|i[3579]/i.test(clean)) {
    // Intel 12ª, 13ª, 14ª gen o Core Ultra
    if (/\b(12|13|14)\d{3}[a-z]*\b/i.test(clean) || /ultra\s*[579]/i.test(clean)) {
      return {
        id: 'cpu-intel-modern-inferred',
        version: '1.2.0',
        componentType: 'cpu',
        manufacturer: 'Intel',
        family: 'Intel Core 12th-14th Gen / Ultra',
        model: input.trim(),
        normalizedName: clean,
        aliases: [clean],
        formFactor: clean.includes('h') || clean.includes('hx') || clean.includes('laptop') ? 'laptop' : 'desktop',
        status: 'confirmed',
        isCompatible120Fps: true,
        sourceId: 'kuro-v1-2',
        lastVerifiedDate: '2026-10-28'
      };
    }
    // Intel de generaciones anteriores (2ª a 11ª gen, ej. i5-10400, i7-9700, i5-8250U, etc.)
    if (/\b([2-9]|10|11)\d{3}[a-z]*\b/i.test(clean) || /\b\d{4}u\b/i.test(clean) || /\b\d{4}g\d\b/i.test(clean)) {
      return {
        id: 'cpu-intel-legacy-inferred',
        version: '1.2.0',
        componentType: 'cpu',
        manufacturer: 'Intel',
        family: 'Intel Core (11th Gen o anterior)',
        model: input.trim(),
        normalizedName: clean,
        aliases: [clean],
        formFactor: clean.includes('u') || clean.includes('g') || clean.includes('laptop') ? 'laptop' : 'desktop',
        status: 'unconfirmed',
        isCompatible120Fps: false,
        sourceId: 'kuro-system-reqs',
        lastVerifiedDate: '2026-10-28',
        notes: 'Generación previa al umbral base oficial de Kuro Games (requiere Intel Core 12ª generación o superior).'
      };
    }
  }

  return null;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
