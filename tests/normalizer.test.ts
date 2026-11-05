import { describe, it, expect } from 'vitest';
import { 
  normalizeHardwareString, 
  matchGpuRule, 
  matchCpuRule,
  inferFormFactor
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

  // ==========================================
  // Paréntesis anidados (R)/(TM) — causa raíz del fallo histórico
  // ==========================================
  it('debe desenvolver ANGLE con paréntesis anidados (R) sin corromper la cadena', () => {
    const raw = 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0), D3D11';
    const clean = normalizeHardwareString(raw);
    expect(clean).toContain('uhd graphics 630');
    expect(clean).not.toContain('(r)');
    expect(clean.split(' ')).not.toContain('r');
  });

  it('debe emparejar la iGPU Intel UHD 630 expuesta por WebGL con ANGLE anidado', () => {
    const raw = 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0), D3D11';
    const matched = matchGpuRule(raw);
    expect(matched).not.toBeNull();
    expect(matched?.id).toBe('gpu-integrated-generic');
    expect(matched?.isCompatible120Fps).toBe(false);
  });

  it('debe emparejar AMD Radeon (TM) Graphics con la regla de iGPU AMD', () => {
    const matched = matchGpuRule('AMD Radeon (TM) Graphics');
    expect(matched).not.toBeNull();
    expect(matched?.id).toBe('gpu-amd-integrated-generic');
  });

  it('debe emparejar Radeon (TM) RX 580 con la regla de RX 580', () => {
    const matched = matchGpuRule('AMD Radeon (TM) RX 580 Series Graphics');
    expect(matched).not.toBeNull();
    expect(matched?.model).toBe('Radeon RX 580');
    expect(matched?.isCompatible120Fps).toBe(false);
  });

  it('debe normalizar por igual los alias de la base de datos (R)/(TM)', () => {
    // El alias de la BD contiene "(tm)" explícitamente: debe compararse limpio.
    const matched = matchGpuRule('Radeon(TM) Graphics');
    expect(matched).not.toBeNull();
    expect(matched?.id).toBe('gpu-amd-integrated-generic');
  });

  it('debe eliminar corchetes de nombres de codificación ([UHD Graphics 630])', () => {
    const clean = normalizeHardwareString('Intel CometLake-S GT2 [UHD Graphics 630]');
    expect(clean).toBe('intel cometlake-s gt2 uhd graphics 630');
  });

  // ==========================================
  // Inferencia de CPU para modelos ausentes de la base
  // ==========================================
  it('debe inferir compatibilidad para Ryzen 5000 de escritorio ausente de la base (5600X)', () => {
    const matched = matchCpuRule('AMD Ryzen 5 5600X 6-Core Processor');
    expect(matched).not.toBeNull();
    expect(matched?.isCompatible120Fps).toBe(true);
    expect(matched?.status).toBe('confirmed');
  });

  it('debe inferir compatibilidad para Ryzen 7000 moderno ausente de la base (7600)', () => {
    const matched = matchCpuRule('AMD Ryzen 5 7600');
    expect(matched).not.toBeNull();
    expect(matched?.isCompatible120Fps).toBe(true);
  });

  // ==========================================
  // inferFormFactor — sin falsos positivos por "13th"
  // ==========================================
  it('inferFormFactor debe detectar sufijos reales de portátil', () => {
    expect(inferFormFactor('intel core i7 8250u')).toBe('laptop');
    expect(inferFormFactor('amd ryzen 7 7840hs')).toBe('laptop');
    expect(inferFormFactor('intel core i7 13700hx')).toBe('laptop');
    expect(inferFormFactor('intel core i5 1135g7')).toBe('laptop');
  });

  it('inferFormFactor no debe confundir "13th Gen" con portátil', () => {
    expect(inferFormFactor('13th gen intel core i7 13700k')).toBe('desktop');
    expect(inferFormFactor('intel core i5 12400')).toBe('desktop');
    expect(inferFormFactor('amd ryzen 7 5800x')).toBe('desktop');
  });
});
