import { describe, it, expect } from 'vitest';
import { inferCpuFromGpu } from '../src/lib/detection/cpuInferencer';
import { matchCpuRule } from '../src/lib/detection/normalizer';
import { DetectedGpuInfo } from '../src/lib/detection/types';

/** Construye la mínima porción de GPU que consume el inferidor. */
function gpuInput(model: string, rendererString = model): Pick<DetectedGpuInfo, 'model' | 'rendererString'> {
  return {
    model: {
      value: model,
      rawString: rendererString,
      confidence: 'exact',
      sourceApi: 'WebGL',
      isReliable: true,
      notes: ''
    },
    rendererString
  };
}

describe('Inferencia de CPU desde iGPU (cpuInferencer)', () => {
  it('Radeon 780M -> Ryzen 7000/8000/9000 (decisivo) y sugerencia resoluble en la BD', () => {
    const inference = inferCpuFromGpu(gpuInput('AMD Radeon 780M'));
    expect(inference).not.toBeNull();
    expect(inference?.decisive).toBe(true);
    expect(inference?.suggestedModel).toBe('AMD Ryzen 7 7840HS / 8845HS');

    const rule = matchCpuRule(inference!.suggestedModel!);
    expect(rule).not.toBeNull();
    expect(rule?.isCompatible120Fps).toBe(true);
  });

  it('Radeon 680M -> Ryzen 6000 (decisivo) y sugerencia resoluble', () => {
    const inference = inferCpuFromGpu(gpuInput('AMD Radeon 680M'));
    expect(inference?.decisive).toBe(true);
    expect(inference?.suggestedModel).toBe('AMD Ryzen 7 6800H / 6900HX');

    const rule = matchCpuRule(inference!.suggestedModel!);
    expect(rule).not.toBeNull();
    expect(rule?.isCompatible120Fps).toBe(true);
  });

  it('"AMD Radeon Graphics" Vega genérico -> no decisivo (rango ambiguo)', () => {
    const inference = inferCpuFromGpu(gpuInput('AMD Radeon Graphics'));
    expect(inference).not.toBeNull();
    expect(inference?.decisive).toBe(false);
    expect(inference?.suggestedModel).toBeUndefined();
  });

  it('UHD Graphics 630 -> 10ª gen o anterior (decisivo, incompatible) con ANGLE anidado', () => {
    const raw = 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0), D3D11';
    const inference = inferCpuFromGpu(gpuInput('Intel Iris Xe / UHD Graphics', raw));
    expect(inference?.decisive).toBe(true);
    expect(inference?.suggestedModel).toBe('Intel Core i5-10400 / 10400F');

    const rule = matchCpuRule(inference!.suggestedModel!);
    expect(rule).not.toBeNull();
    expect(rule?.isCompatible120Fps).toBe(false);
  });

  it('UHD Graphics 770 -> 12ª-14ª gen de escritorio (decisivo, compatible)', () => {
    const inference = inferCpuFromGpu(gpuInput('Intel(R) UHD Graphics 770'));
    expect(inference?.decisive).toBe(true);
    expect(inference?.suggestedModel).toBe('Intel Core i5-12400 / 12400F');

    const rule = matchCpuRule(inference!.suggestedModel!);
    expect(rule).not.toBeNull();
    expect(rule?.isCompatible120Fps).toBe(true);
  });

  it('UHD Graphics 750 -> 11ª gen (decisivo, incompatible)', () => {
    const inference = inferCpuFromGpu(gpuInput('Intel UHD Graphics 750'));
    expect(inference?.decisive).toBe(true);
    expect(inference?.suggestedModel).toBe('Intel Core i5-11400 / 10400');

    const rule = matchCpuRule(inference!.suggestedModel!);
    expect(rule).not.toBeNull();
    expect(rule?.isCompatible120Fps).toBe(false);
  });

  it('Iris Xe -> 11ª-13ª gen (no decisivo: cruza el umbral de 12ª gen)', () => {
    const inference = inferCpuFromGpu(gpuInput('Intel Iris Xe Graphics'));
    expect(inference).not.toBeNull();
    expect(inference?.decisive).toBe(false);
    expect(inference?.suggestedModel).toBeUndefined();
  });

  it('Iris Plus -> 10ª gen o anterior (decisivo) con sugerencia resoluble', () => {
    const inference = inferCpuFromGpu(gpuInput('Intel Iris Plus Graphics'));
    expect(inference?.decisive).toBe(true);

    const rule = matchCpuRule(inference!.suggestedModel!);
    expect(rule).not.toBeNull();
    expect(rule?.isCompatible120Fps).toBe(false);
  });

  it('Apple M1 -> no decisivo (sin cliente nativo de Windows)', () => {
    const inference = inferCpuFromGpu(gpuInput('Apple M1'));
    expect(inference).not.toBeNull();
    expect(inference?.decisive).toBe(false);
  });

  it('GPU dedicada (RTX 3060) -> null: no aporta información de la CPU', () => {
    expect(inferCpuFromGpu(gpuInput('NVIDIA GeForce RTX 3060'))).toBeNull();
  });

  it('Vega discreta RX Vega 56 -> null: no se confunde con la iGPU Vega integrada', () => {
    expect(inferCpuFromGpu(gpuInput('AMD Radeon RX Vega 56'))).toBeNull();
  });

  it('GPU no detectada -> null', () => {
    expect(inferCpuFromGpu(gpuInput('No detectada', 'No disponible'))).toBeNull();
  });
});
