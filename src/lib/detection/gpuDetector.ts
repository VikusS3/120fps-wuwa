import { DetectedGpuInfo } from './types';
import { matchGpuRule } from './normalizer';

const VIRTUAL_RENDERERS = [
  'swiftshader',
  'llvmpipe',
  'basic render driver',
  'software rasterizer',
  'virtualbox',
  'vmware',
  'parallels'
];

const INTEGRATED_KEYWORDS = [
  'intel hd graphics',
  'intel uhd graphics',
  'intel iris',
  'radeon graphics',
  'radeon(tm) graphics',
  'radeon vega',
  'apple m1',
  'apple m2',
  'apple m3',
  'apple m4'
];

export async function detectGpu(): Promise<DetectedGpuInfo> {
  let unmaskedVendor = '';
  let unmaskedRenderer = '';
  let apiUsed: 'WebGL' | 'WebGPU' | 'None' = 'None';

  // 1. Intentar WebGPU primero si está disponible
  try {
    if (typeof navigator !== 'undefined' && 'gpu' in navigator && (navigator as any).gpu?.requestAdapter) {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (adapter?.info) {
        unmaskedVendor = adapter.info.vendor || '';
        unmaskedRenderer = adapter.info.device || adapter.info.description || '';
        apiUsed = 'WebGPU';
      }
    }
  } catch (err) {
    // WebGPU no disponible o restringido por permisos
  }

  // 2. Si no se obtuvo con WebGPU, probar WebGL con WEBGL_debug_renderer_info
  if (!unmaskedRenderer && typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (gl) {
        apiUsed = 'WebGL';
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
          unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
        } else {
          // Fallback a los parámetros estándar
          unmaskedVendor = gl.getParameter(gl.VENDOR) || '';
          unmaskedRenderer = gl.getParameter(gl.RENDERER) || '';
        }
      }
    } catch (err) {
      // WebGL no disponible o bloqueado por el usuario
    }
  }

  const cleanRenderer = unmaskedRenderer.trim();
  const lowerRenderer = cleanRenderer.toLowerCase();

  // Detectar adaptador virtual / de software
  const isVirtualRenderer = VIRTUAL_RENDERERS.some(v => lowerRenderer.includes(v));

  // Detectar GPU integrada
  const isIntegratedGpu = INTEGRATED_KEYWORDS.some(i => lowerRenderer.includes(i));

  // Coincidencia con regla conocida
  const matchedRule = matchGpuRule(cleanRenderer);

  return {
    vendor: {
      value: unmaskedVendor || (matchedRule ? matchedRule.manufacturer : 'Desconocido'),
      rawString: unmaskedVendor,
      confidence: unmaskedVendor ? 'exact' : (matchedRule ? 'inferred' : 'unknown'),
      sourceApi: apiUsed,
      isReliable: !isVirtualRenderer && !!unmaskedVendor,
      notes: isVirtualRenderer 
        ? 'El navegador está utilizando un rasterizador por software o máquina virtual.'
        : 'Obtenido mediante API gráfica del navegador.'
    },
    model: {
      value: matchedRule ? matchedRule.model : (cleanRenderer || 'No detectada'),
      rawString: cleanRenderer,
      confidence: matchedRule ? 'exact' : (cleanRenderer ? 'approximate' : 'unknown'),
      sourceApi: apiUsed,
      isReliable: !isVirtualRenderer && !!cleanRenderer,
      notes: matchedRule 
        ? `Coincide con la familia ${matchedRule.family} registrada oficialmente.`
        : (cleanRenderer 
            ? 'Cadena gráfica sin coincidencia exacta en el catálogo de Kuro Games.' 
            : 'WebGL/WebGPU no expuso el nombre de la GPU física (posible protección de huella digital).')
    },
    rendererString: cleanRenderer || 'No disponible',
    isVirtualRenderer,
    isIntegratedGpu,
    apiUsed
  };
}
