import { describe, it, expect } from 'vitest';
import { 
  normalizeHardwareString, 
  matchGpuRule, 
  matchCpuRule 
} from '../src/lib/detection/normalizer';

describe('Normalizador y Coincidencia de Hardware', () => {
  it('debe limpiar cadenas de ANGLE y DirectX provenientes de WebGL', () => {
    const raw = 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0), D3D11';
    const clean = normalizeHardwareString(raw);
    expect(clean).toContain('nvidia geforce rtx 3070');
    expect(clean).not.toContain('angle');
    expect(clean).not.toContain('vs_5_0');
  });

  it('debe emparejar correctamente una cadena ANGLE con la regla de RTX 3070', () => {
    const raw = 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0), D3D11';
    const matched = matchGpuRule(raw);
    expect(matched).not.toBeNull();
    expect(matched?.model).toBe('GeForce RTX 3070');
    expect(matched?.isCompatible120Fps).toBe(true);
  });

  it('debe emparejar AMD Radeon con ID hexadecimal (RX 6700 XT)', () => {
    const raw = 'AMD Radeon RX 6700 XT (0x000073DF)';
    const matched = matchGpuRule(raw);
    expect(matched).not.toBeNull();
    expect(matched?.model).toBe('Radeon RX 6700 XT');
  });

  it('debe diferenciar variantes Ti de no-Ti (RTX 3060 Ti vs RTX 3060)', () => {
    const matchedTi = matchGpuRule('NVIDIA GeForce RTX 3060 Ti');
    expect(matchedTi?.model).toBe('GeForce RTX 3060 Ti');

    const matchedNonTi = matchGpuRule('NVIDIA GeForce RTX 3060');
    expect(matchedNonTi?.model).toBe('GeForce RTX 3060');
  });

  it('debe diferenciar variantes SUPER (RTX 4070 SUPER vs RTX 4070)', () => {
    const matchedSuper = matchGpuRule('GeForce RTX 4070 SUPER');
    expect(matchedSuper?.model).toBe('GeForce RTX 4070 SUPER');

    const matchedBase = matchGpuRule('GeForce RTX 4070');
    expect(matchedBase?.model).toBe('GeForce RTX 4070');
  });

  it('debe reconocer procesadores Ryzen X3D (7800X3D)', () => {
    const matchedCpu = matchCpuRule('AMD Ryzen 7 7800X3D 8-Core Processor');
    expect(matchedCpu).not.toBeNull();
    expect(matchedCpu?.model).toBe('AMD Ryzen 7 7800X3D');
    expect(matchedCpu?.isCompatible120Fps).toBe(true);
  });

  it('debe reconocer procesadores Intel Core de 13ª/14ª generación', () => {
    const matched13700 = matchCpuRule('13th Gen Intel(R) Core(TM) i7-13700K');
    expect(matched13700).not.toBeNull();
    expect(matched13700?.model).toBe('Intel Core i7-13700K / 13700KF');
  });

  it('debe manejar entradas vacías o nulas sin lanzar errores', () => {
    expect(normalizeHardwareString('')).toBe('');
    expect(matchGpuRule('')).toBeNull();
    expect(matchCpuRule('')).toBeNull();
  });
});
