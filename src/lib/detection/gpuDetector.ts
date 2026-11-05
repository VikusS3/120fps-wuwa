import { getGPUTier } from '@pmndrs/detect-gpu';
import { DetectedGpuInfo, GpuCandidate, GpuCandidateSource } from './types';
import { matchGpuRule, normalizeHardwareString } from './normalizer';

const VIRTUAL_RENDERERS = [
  'swiftshader',
  'llvmpipe',
  'basic render driver',
  'software rasterizer',
  'virtualbox',
  'vmware',
  'parallels',
  'softwarerasterizer',
  'mesa offscreen'
];

const INTEGRATED_KEYWORDS = [
  'intel hd graphics',
  'intel uhd graphics',
  'intel iris',
  'uhd graphics',
  'iris xe',
  'radeon graphics',
  'radeon vega',
  'vega graphics',
  'apple m1',
  'apple m2',
  'apple m3',
  'apple m4'
];

const BENCHMARKS_URL = '/gpu-benchmarks';

/** Detecta adaptadores por software o de máquina virtual. */
export function isSoftwareRenderer(name: string): boolean {
  const lower = (name || '').toLowerCase();
  return VIRTUAL_RENDERERS.some((v) => lower.includes(v));
}

/** Detecta gráficas integradas en el procesador (iGPU). */
export function isIntegratedRenderer(name: string): boolean {
  const lower = (name || '').toLowerCase();
  return INTEGRATED_KEYWORDS.some((k) => lower.includes(k));
}

/**
 * Detecta identificadores opacos de GPU (IDs hexadecimales o numéricos) que
 * algunos navegadores exponen en `GPUAdapterInfo.device` en lugar del modelo.
 */
export function isOpaqueGpuIdentifier(value: string): boolean {
  const trimmed = (value || '').trim();
  if (!trimmed) return true;
  if (/^\d+$/.test(trimmed)) return true;
  // Al menos un dígito y solo caracteres hexadecimales: 0x2684, 13d7, 73df...
  if (/^(?:0x)?[0-9a-f]*\d[0-9a-f]*$/i.test(trimmed) && trimmed.length >= 4) return true;
  return false;
}

/**
 * Elige la mejor candidata. Prioridad:
 * 1. GPU dedicada (no iGPU): en portátiles Optimus el juego usa la dedicada.
 * 2. Cadena que coincide con la whitelist oficial (es la que alimenta el veredicto).
 * 3. Adaptador físico (nunca software/virtual).
 * 4. Cadena con información de modelo (no solo el nombre del fabricante).
 */
export function pickBestGpuCandidate(candidates: GpuCandidate[]): GpuCandidate | null {
  const usable = candidates.filter((c) => c.cleanedString.length > 0);
  if (usable.length === 0) return null;

  const score = (c: GpuCandidate): number => {
    let value = 0;
    if (c.isVirtual) value -= 6000;
    else value += 100;
    if (!c.isIntegrated) value += 5000;
    if (c.matchedRuleId) value += 1000;
    if (c.cleanedString.length < 10) value -= 300;
    value += Math.min(c.cleanedString.length, 80);
    return value;
  };

  return [...usable].sort((a, b) => score(b) - score(a))[0];
}

/** `GPUAdapterInfo` antiguo expuesto como método en lugar de propiedad. */
interface LegacyAdapterInfo {
  vendor?: string;
  device?: string;
  description?: string;
  architecture?: string;
  isFallbackAdapter?: boolean;
}

interface WebGpuReading {
  vendor: string;
  models: string[];
  isFallback: boolean;
}

interface WebGlReading {
  vendor: string;
  renderer: string;
  gl: WebGLRenderingContext | null;
}

/** Lee WebGL con prioridad de alto rendimiento y su cadena sin enmascarar. */
function readWebGl(): WebGlReading | null {
  if (typeof document === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl', { powerPreference: 'high-performance' }) ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return null;

    let vendor = '';
    let renderer = '';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      vendor = (gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) as string) || '';
      renderer = (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string) || '';
    }
    if (!renderer) {
      vendor = vendor || (gl.getParameter(gl.VENDOR) as string) || '';
      renderer = (gl.getParameter(gl.RENDERER) as string) || '';
    }

    return { vendor, renderer, gl };
  } catch (err) {
    return null;
  }
}

/**
 * Solicita el adaptador WebGPU de alto rendimiento (la GPU dedicada en
 * portátiles con gráficos conmutables) y extrae todas las cadenas útiles.
 */
async function readWebGpu(): Promise<WebGpuReading | null> {
  if (typeof navigator === 'undefined') return null;
  try {
    const gpu = (navigator as unknown as { gpu?: { requestAdapter?: (opts?: unknown) => Promise<unknown> } }).gpu;
    if (!gpu?.requestAdapter) return null;

    const adapter = (await gpu.requestAdapter({ powerPreference: 'high-performance' }) as
      | {
          info?: LegacyAdapterInfo;
          requestAdapterInfo?: () => Promise<LegacyAdapterInfo>;
        }
      | null
      | undefined);
    if (!adapter) return null;

    let info = adapter.info;
    if (!info && typeof adapter.requestAdapterInfo === 'function') {
      info = await adapter.requestAdapterInfo();
    }
    if (!info) return null;

    const models: string[] = [];
    const push = (value?: string) => {
      const candidate = (value || '').trim();
      if (candidate && !isOpaqueGpuIdentifier(candidate) && !models.includes(candidate)) {
        models.push(candidate);
      }
    };
    // `description` es la cadena legible según la especificación; `device` es
    // un identificador específico del fabricante y puede ser opaco.
    push(info.description);
    push(info.device);

    return {
      vendor: (info.vendor || '').trim(),
      models,
      isFallback: !!info.isFallbackAdapter
    };
  } catch (err) {
    return null;
  }
}

/**
 * Clasifica la GPU con @pmndrs/detect-gpu: limpia la cadena ANGLE, desofusca
 * renderers enmascarados (Firefox/Safari) y consulta su base de benchmarks
 * alojada localmente en /gpu-benchmarks.
 */
async function classifyWithDetectGpu(gl: WebGLRenderingContext | null): Promise<{
  gpu?: string;
  type?: string;
} | null> {
  if (typeof window === 'undefined') return null;
  try {
    const result = await getGPUTier({
      ...(gl ? { glContext: gl } : {}),
      benchmarksURL: BENCHMARKS_URL
    });
    return { gpu: result.gpu, type: result.type };
  } catch (err) {
    return null;
  }
}

/** `FALLBACK`/`BENCHMARK_FETCH_FAILED` devuelven "nombre (crudo)". */
function stripTierWrapper(value: string): string {
  const parenIndex = value.indexOf(' (');
  return (parenIndex > 0 ? value.slice(0, parenIndex) : value).trim();
}

const VENDOR_KEYWORDS: Array<[RegExp, string]> = [
  [/\bnvidia\b|\bgeforce\b/, 'NVIDIA'],
  [/\bamd\b|\bradeon\b/, 'AMD'],
  [/\bintel\b/, 'Intel'],
  [/\bapple\b/, 'Apple'],
  [/\bqualcomm\b|\badreno\b/, 'Qualcomm'],
  [/\bsamsung\b|\bxclipse\b/, 'Samsung']
];

function extractVendorName(...sources: string[]): string {
  const haystack = sources.join(' ').toLowerCase();
  for (const [pattern, name] of VENDOR_KEYWORDS) {
    if (pattern.test(haystack)) return name;
  }
  return '';
}

export async function detectGpu(): Promise<DetectedGpuInfo> {
  const webGl = readWebGl();

  const [webGpu, tier] = await Promise.all([
    readWebGpu(),
    classifyWithDetectGpu(webGl?.gl ?? null)
  ]);

  const candidates: GpuCandidate[] = [];
  const addCandidate = (raw: string, source: GpuCandidateSource) => {
    const value = (raw || '').trim();
    if (!value) return;
    if (candidates.some((c) => c.sourceApi === source && c.rawString === value)) return;

    const cleaned = normalizeHardwareString(value);
    if (!cleaned) return;

    const rule = matchGpuRule(value);
    candidates.push({
      sourceApi: source,
      rawString: value,
      cleanedString: cleaned,
      isVirtual: isSoftwareRenderer(value) || isSoftwareRenderer(cleaned),
      isIntegrated: isIntegratedRenderer(value) || isIntegratedRenderer(cleaned),
      matchedRuleId: rule?.id
    });
  };

  // 1. Nombre clasificado/limpio por detect-gpu
  if (tier?.gpu) {
    addCandidate(stripTierWrapper(tier.gpu), 'detect-gpu');
    if (tier.type === 'BLOCKLISTED') {
      const last = candidates[candidates.length - 1];
      if (last && last.sourceApi === 'detect-gpu') last.isVirtual = true;
    }
  }

  // 2. Cadena cruda de WebGL (la que mejor coincide con la whitelist en la mayoría de casos)
  if (webGl?.renderer) addCandidate(webGl.renderer, 'WebGL');

  // 3. Cadenas expuestas por el adaptador WebGPU
  for (const model of webGpu?.models ?? []) addCandidate(model, 'WebGPU');

  const chosen = pickBestGpuCandidate(candidates);
  const matchedRule = chosen ? matchGpuRule(chosen.rawString) : null;

  // Segunda gráfica: iGPU + dedicada en portátiles, o dos modelos distintos.
  let secondaryGpu: string | undefined;
  if (chosen) {
    const secondary = candidates
      .filter((c) => c !== chosen && c.cleanedString !== chosen.cleanedString)
      .filter((c) => {
        if (chosen.matchedRuleId && c.matchedRuleId) {
          return c.matchedRuleId !== chosen.matchedRuleId;
        }
        return c.isIntegrated !== chosen.isIntegrated;
      })
      .sort((a, b) => (b.matchedRuleId ? 1 : 0) - (a.matchedRuleId ? 1 : 0))[0];

    if (secondary) {
      const secondaryRule = matchGpuRule(secondary.rawString);
      secondaryGpu = secondaryRule ? secondaryRule.model : secondary.rawString;
    }
  }

  const rawVendor =
    (webGpu?.vendor && !isOpaqueGpuIdentifier(webGpu.vendor) ? webGpu.vendor : '') ||
    webGl?.vendor ||
    '';
  const vendorValue =
    (matchedRule ? matchedRule.manufacturer : '') ||
    extractVendorName(rawVendor, chosen?.rawString ?? '', chosen?.cleanedString ?? '') ||
    'Desconocido';

  const isVirtualRenderer = chosen ? chosen.isVirtual : candidates.some((c) => c.isVirtual);
  const isIntegratedGpu = chosen ? chosen.isIntegrated : false;
  const modelValue = matchedRule
    ? matchedRule.model
    : chosen?.rawString || 'No detectada';
  const sourceLabel = chosen
    ? chosen.sourceApi === 'WebGPU'
      ? 'Obtenido mediante WebGPU (adaptador de alto rendimiento).'
      : chosen.sourceApi === 'detect-gpu'
        ? 'Identificado con la base de benchmarks de detect-gpu a partir de WebGL.'
        : 'Obtenido mediante WebGL (WEBGL_debug_renderer_info).'
    : 'No se expuso ninguna cadena de GPU.';

  const apiUsed: DetectedGpuInfo['apiUsed'] = chosen
    ? chosen.sourceApi === 'WebGPU'
      ? 'WebGPU'
      : 'WebGL'
    : webGl
      ? 'WebGL'
      : webGpu
        ? 'WebGPU'
        : 'None';

  return {
    vendor: {
      value: vendorValue,
      rawString: rawVendor,
      confidence: rawVendor ? 'exact' : matchedRule ? 'inferred' : 'unknown',
      sourceApi: apiUsed,
      isReliable: vendorValue !== 'Desconocido' && !isVirtualRenderer,
      notes: rawVendor
        ? 'Fabricante informado por la API gráfica del navegador.'
        : matchedRule
          ? 'Fabricante inferido a partir del modelo identificado.'
          : 'El navegador no expuso el fabricante de la GPU.'
    },
    model: {
      value: modelValue,
      rawString: chosen?.rawString || '',
      confidence: matchedRule ? 'exact' : chosen && modelValue !== 'No detectada' ? 'approximate' : 'unknown',
      sourceApi: apiUsed,
      isReliable: !isVirtualRenderer && modelValue !== 'No detectada',
      notes: isVirtualRenderer
        ? 'El navegador está utilizando un rasterizador por software o máquina virtual.'
        : matchedRule
          ? `Coincide con la familia ${matchedRule.family} registrada oficialmente.`
          : modelValue !== 'No detectada'
            ? `${sourceLabel} El modelo no figura de forma explícita en la whitelist de Kuro Games.`
            : 'WebGL/WebGPU no expusieron el nombre de la GPU (posible protección de huella digital).'
    },
    rendererString: chosen?.rawString || 'No disponible',
    isVirtualRenderer,
    isIntegratedGpu,
    apiUsed,
    candidates,
    secondaryGpu
  };
}
