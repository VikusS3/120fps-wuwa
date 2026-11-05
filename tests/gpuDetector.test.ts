import { describe, it, expect } from 'vitest';
import {
  isSoftwareRenderer,
  isIntegratedRenderer,
  isOpaqueGpuIdentifier,
  pickBestGpuCandidate
} from '../src/lib/detection/gpuDetector';
import { GpuCandidate } from '../src/lib/detection/types';

function candidate(overrides: Partial<GpuCandidate>): GpuCandidate {
  return {
    sourceApi: 'WebGL',
    rawString: '',
    cleanedString: '',
    isVirtual: false,
    isIntegrated: false,
    ...overrides
  };
}

describe('Clasificación de identificadores de GPU (gpuDetector)', () => {
  it('isSoftwareRenderer detecta rasterizadores por software y máquinas virtuales', () => {
    expect(isSoftwareRenderer('Google SwiftShader')).toBe(true);
    expect(isSoftwareRenderer('llvmpipe (LLVM 15)')).toBe(true);
    expect(isSoftwareRenderer('VMware SVGA II')).toBe(true);
    expect(isSoftwareRenderer('ANGLE (NVIDIA, NVIDIA GeForce RTX 3070)')).toBe(false);
  });

  it('isIntegratedRenderer detecta iGPU Intel/AMD/Apple', () => {
    expect(isIntegratedRenderer('Intel(R) UHD Graphics 630')).toBe(true);
    expect(isIntegratedRenderer('Intel Iris Xe Graphics')).toBe(true);
    expect(isIntegratedRenderer('AMD Radeon Graphics')).toBe(true);
    expect(isIntegratedRenderer('Apple M2')).toBe(true);
    expect(isIntegratedRenderer('NVIDIA GeForce RTX 4070')).toBe(false);
  });

  it('isOpaqueGpuIdentifier detecta IDs hexadecimales/opacos', () => {
    expect(isOpaqueGpuIdentifier('')).toBe(true);
    expect(isOpaqueGpuIdentifier('2684')).toBe(true);
    expect(isOpaqueGpuIdentifier('0x73DF')).toBe(true);
    expect(isOpaqueGpuIdentifier('73df')).toBe(true);
    expect(isOpaqueGpuIdentifier('NVIDIA GeForce RTX 3060')).toBe(false);
    expect(isOpaqueGpuIdentifier('13th Gen Intel')).toBe(false);
  });

  it('pickBestGpuCandidate prefiere la GPU dedicada sobre la iGPU', () => {
    const chosen = pickBestGpuCandidate([
      candidate({
        rawString: 'AMD Radeon Graphics',
        cleanedString: 'amd radeon graphics',
        isIntegrated: true,
        matchedRuleId: 'gpu-amd-integrated-generic'
      }),
      candidate({
        rawString: 'NVIDIA GeForce RTX 3060',
        cleanedString: 'nvidia geforce rtx 3060'
      })
    ]);
    expect(chosen?.rawString).toBe('NVIDIA GeForce RTX 3060');
  });

  it('pickBestGpuCandidate descarta adaptadores por software (virtual)', () => {
    const chosen = pickBestGpuCandidate([
      candidate({
        rawString: 'Google SwiftShader',
        cleanedString: 'google swiftshader',
        isVirtual: true
      }),
      candidate({
        rawString: 'Intel UHD Graphics 630',
        cleanedString: 'intel uhd graphics 630',
        isIntegrated: true,
        matchedRuleId: 'gpu-integrated-generic'
      })
    ]);
    expect(chosen?.rawString).toBe('Intel UHD Graphics 630');
  });

  it('pickBestGpuCandidate prefiere la cadena que coincide con la whitelist', () => {
    const chosen = pickBestGpuCandidate([
      candidate({
        sourceApi: 'detect-gpu',
        rawString: 'intel uhd graphics 630 (raw)',
        cleanedString: 'intel uhd graphics 630 raw',
        isIntegrated: true
      }),
      candidate({
        sourceApi: 'WebGL',
        rawString: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11)',
        cleanedString: 'intel intel uhd graphics 630',
        isIntegrated: true,
        matchedRuleId: 'gpu-integrated-generic'
      })
    ]);
    expect(chosen?.matchedRuleId).toBe('gpu-integrated-generic');
  });

  it('pickBestGpuCandidate devuelve null sin candidatas utilizables', () => {
    expect(pickBestGpuCandidate([])).toBeNull();
    expect(pickBestGpuCandidate([candidate({ rawString: '', cleanedString: '' })])).toBeNull();
  });
});
