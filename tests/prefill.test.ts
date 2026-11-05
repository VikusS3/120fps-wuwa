import { describe, it, expect } from 'vitest';
import { buildHardwareInput, isRamUnconfirmed } from '../src/lib/detection/prefill';
import {
  DeviceHardwareProfile,
  DetectedField,
  CpuInference
} from '../src/lib/detection/types';

function field<T>(value: T, confidence: DetectedField<T>['confidence'] = 'approximate'): DetectedField<T> {
  return {
    value,
    confidence,
    sourceApi: 'test',
    isReliable: true,
    notes: ''
  };
}

function makeProfile(overrides: Partial<DeviceHardwareProfile> = {}): DeviceHardwareProfile {
  return {
    detectedAt: new Date().toISOString(),
    gpu: {
      vendor: field('NVIDIA'),
      model: field('GeForce RTX 4060', 'exact'),
      rendererString: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11)',
      isVirtualRenderer: false,
      isIntegratedGpu: false,
      apiUsed: 'WebGL',
      candidates: []
    },
    cpu: {
      coresOrThreads: field(16, 'inferred'),
      architecture: field('x86_64 / arm64', 'inferred'),
      estimatedModel: field('No detectable desde la web (requiere selección manual)', 'unknown')
    },
    ram: {
      estimatedGb: field(8),
      isCappedByBrowser: true
    },
    os: {
      platform: field('Windows'),
      osName: field('Windows 11 (64-bit)', 'exact')
    },
    screen: {
      width: 1920,
      height: 1080,
      pixelRatio: 1,
      estimatedRefreshRate: field(144, 'approximate')
    },
    webGlAvailable: true,
    webGpuAvailable: false,
    isBrave: false,
    isShieldsBlocking: false,
    ...overrides
  };
}

const inference: CpuInference = {
  decisive: true,
  family: 'AMD Ryzen 7000/8000/9000 (iGPU RDNA 3)',
  suggestedModel: 'AMD Ryzen 7 7840HS / 8845HS',
  sourceGpu: 'AMD Radeon 780M',
  notes: ''
};

describe('Prefill del formulario desde el perfil inspeccionado', () => {
  it('deviceMemory capado a 8 GB NO se convierte en 16 GB (sin adivinanzas)', () => {
    const input = buildHardwareInput(makeProfile());
    expect(input.ramGb).toBe(8);
    expect(isRamUnconfirmed(makeProfile().ram)).toBe(true);
  });

  it('deviceMemory ausente (0) queda como no confirmado', () => {
    const profile = makeProfile({
      ram: { estimatedGb: field(0, 'unknown'), isCappedByBrowser: false }
    });
    expect(buildHardwareInput(profile).ramGb).toBe(0);
    expect(isRamUnconfirmed(profile.ram)).toBe(true);
  });

  it('lectura por debajo del cap (4 GB) se toma como real y confirmada', () => {
    const profile = makeProfile({
      ram: { estimatedGb: field(4), isCappedByBrowser: false }
    });
    expect(buildHardwareInput(profile).ramGb).toBe(4);
    expect(isRamUnconfirmed(profile.ram)).toBe(false);
  });

  it('pre-rellena la CPU solo cuando la inferencia es decisiva', () => {
    const input = buildHardwareInput(
      makeProfile({
        cpu: {
          coresOrThreads: field(16, 'inferred'),
          architecture: field('x86_64 / arm64', 'inferred'),
          estimatedModel: field('AMD Ryzen 7 7840HS / 8845HS', 'inferred'),
          inference
        }
      })
    );
    expect(input.cpuModel).toBe('AMD Ryzen 7 7840HS / 8845HS');
    expect(input.cpuFormFactor).toBe('all');
  });

  it('inferencia no decisiva -> CPU vacía para que el usuario elija', () => {
    const input = buildHardwareInput(
      makeProfile({
        cpu: {
          coresOrThreads: field(16, 'inferred'),
          architecture: field('x86_64 / arm64', 'inferred'),
          estimatedModel: field('AMD Ryzen 7000/8000 Phoenix', 'inferred'),
          inference: { ...inference, decisive: false, suggestedModel: undefined }
        }
      })
    );
    expect(input.cpuModel).toBe('');
    expect(input.cpuFormFactor).toBe('desktop');
  });

  it('detecta factor de forma de laptop a partir del modelo de GPU', () => {
    const profile = makeProfile();
    profile.gpu.model = field('GeForce RTX 4060 Laptop GPU', 'exact');
    const input = buildHardwareInput(profile);
    expect(input.gpuFormFactor).toBe('laptop');
    expect(input.cpuFormFactor).toBe('laptop');
  });

  it('los valores de SO y pantalla se conservan del perfil', () => {
    const input = buildHardwareInput(makeProfile());
    expect(input.osName).toBe('Windows 11 (64-bit)');
    expect(input.screenRefreshRateHz).toBe(144);
    expect(input.gpuModel).toContain('RTX 4060');
  });
});
