import { describe, it, expect } from 'vitest';
import { evaluateHardware } from '../src/lib/evaluation/evaluator';
import { UserHardwareInput } from '../src/lib/evaluation/types';

describe('Motor de Evaluación de Compatibilidad (Wuthering Waves 120 FPS)', () => {
  it('debe otorgar veredicto "compatible" con GPU y CPU soportados oficialmente (RTX 4070 + i7-13700K)', () => {
    const input: UserHardwareInput = {
      gpuModel: 'NVIDIA GeForce RTX 4070',
      gpuFormFactor: 'desktop',
      cpuModel: 'Intel Core i7-13700K',
      cpuFormFactor: 'desktop',
      ramGb: 32,
      osName: 'Windows 11 (64-bit)',
      screenRefreshRateHz: 144
    };

    const result = evaluateHardware(input);
    expect(result.verdict).toBe('compatible');
    expect(result.verdictTitle).toContain('Compatible según la lista oficial');

    const gpuReq = result.requirements.find(r => r.id === 'gpu');
    expect(gpuReq?.status).toBe('confirmed_compatible');

    const cpuReq = result.requirements.find(r => r.id === 'cpu');
    expect(cpuReq?.status).toBe('confirmed_compatible');

    // Debe incluir aviso de rendimiento
    expect(result.performanceDisclaimer).toContain('NO garantiza mantener 120 FPS estables');
  });

  it('debe otorgar veredicto "incompatible" con GPU que no cumple la lista oficial (GTX 1060)', () => {
    const input: UserHardwareInput = {
      gpuModel: 'NVIDIA GeForce GTX 1060 6GB',
      gpuFormFactor: 'desktop',
      cpuModel: 'Intel Core i7-13700K',
      cpuFormFactor: 'desktop',
      ramGb: 16,
      osName: 'Windows 11 (64-bit)',
      screenRefreshRateHz: 120
    };

    const result = evaluateHardware(input);
    expect(result.verdict).toBe('incompatible');
    const gpuReq = result.requirements.find(r => r.id === 'gpu');
    expect(gpuReq?.status).toBe('confirmed_incompatible');
    expect(result.verdictDescription).toContain('Tarjeta Gráfica');
  });

  it('debe otorgar veredicto "incompatible" con CPU incompatible según regla documentada (Ryzen 5 2600)', () => {
    const input: UserHardwareInput = {
      gpuModel: 'NVIDIA GeForce RTX 4080',
      gpuFormFactor: 'desktop',
      cpuModel: 'AMD Ryzen 5 2600',
      cpuFormFactor: 'desktop',
      ramGb: 16,
      osName: 'Windows 10 (64-bit)',
      screenRefreshRateHz: 144
    };

    const result = evaluateHardware(input);
    expect(result.verdict).toBe('incompatible');
    const cpuReq = result.requirements.find(r => r.id === 'cpu');
    expect(cpuReq?.status).toBe('confirmed_incompatible');
  });

  it('debe otorgar veredicto "cannot_determine" si la CPU es desconocida pero la GPU es conocida', () => {
    const input: UserHardwareInput = {
      gpuModel: 'GeForce RTX 3070',
      gpuFormFactor: 'desktop',
      cpuModel: 'No detectable desde la web (requiere selección manual)',
      cpuFormFactor: 'desktop',
      ramGb: 16,
      osName: 'Windows 11 (64-bit)',
      screenRefreshRateHz: 144
    };

    const result = evaluateHardware(input);
    expect(result.verdict).toBe('cannot_determine');
    const cpuReq = result.requirements.find(r => r.id === 'cpu');
    expect(cpuReq?.status).toBe('unknown');
  });

  it('debe otorgar veredicto "cannot_determine" si la GPU es desconocida pero la CPU es conocida', () => {
    const input: UserHardwareInput = {
      gpuModel: 'No detectada',
      gpuFormFactor: 'desktop',
      cpuModel: 'AMD Ryzen 7 7800X3D',
      cpuFormFactor: 'desktop',
      ramGb: 32,
      osName: 'Windows 11 (64-bit)',
      screenRefreshRateHz: 240
    };

    const result = evaluateHardware(input);
    expect(result.verdict).toBe('cannot_determine');
    const gpuReq = result.requirements.find(r => r.id === 'gpu');
    expect(gpuReq?.status).toBe('unknown');
  });

  it('debe soportar variantes de laptop oficialmente reconocidas (RTX 4060 Laptop GPU + 13700H)', () => {
    const input: UserHardwareInput = {
      gpuModel: 'NVIDIA GeForce RTX 4060 Laptop GPU',
      gpuFormFactor: 'laptop',
      cpuModel: '13700H',
      cpuFormFactor: 'laptop',
      ramGb: 16,
      osName: 'Windows 11 (64-bit)',
      screenRefreshRateHz: 144
    };

    const result = evaluateHardware(input);
    expect(result.verdict).toBe('compatible');
  });

  it('debe detectar gráfica integrada y marcarla como incompatible para 120 FPS', () => {
    const input: UserHardwareInput = {
      gpuModel: 'Intel Iris Xe Graphics',
      gpuFormFactor: 'laptop',
      cpuModel: 'i7 12700H',
      cpuFormFactor: 'laptop',
      ramGb: 16,
      osName: 'Windows 11 (64-bit)',
      screenRefreshRateHz: 60
    };

    const result = evaluateHardware(input);
    expect(result.verdict).toBe('incompatible');
    const gpuReq = result.requirements.find(r => r.id === 'gpu');
    expect(gpuReq?.status).toBe('confirmed_incompatible');
  });

  it('debe manejar monitor de 60 Hz sin invalidar la compatibilidad del juego, pero advirtiendo del límite físico', () => {
    const input: UserHardwareInput = {
      gpuModel: 'Radeon RX 7900 XTX',
      gpuFormFactor: 'desktop',
      cpuModel: 'AMD Ryzen 7 7800X3D',
      cpuFormFactor: 'desktop',
      ramGb: 32,
      osName: 'Windows 11 (64-bit)',
      screenRefreshRateHz: 60
    };

    const result = evaluateHardware(input);
    // El juego sí desbloquea 120 FPS
    expect(result.verdict).toBe('compatible');
    const screenReq = result.requirements.find(r => r.id === 'screen');
    expect(screenReq?.status).toBe('not_applicable');
    expect(screenReq?.message).toContain('60 cuadros por segundo');
  });

  it('debe distinguir adecuadamente entre modelos similares (RTX 3060 vs RTX 3050)', () => {
    // RTX 3060 es compatible
    const res3060 = evaluateHardware({
      gpuModel: 'RTX 3060',
      gpuFormFactor: 'desktop',
      cpuModel: 'Intel Core i5-12600K',
      cpuFormFactor: 'desktop',
      ramGb: 16,
      osName: 'Windows 11',
      screenRefreshRateHz: 120
    });
    expect(res3060.verdict).toBe('compatible');

    // RTX 3050 no fue incluida en la lista oficial de 120 FPS
    const res3050 = evaluateHardware({
      gpuModel: 'RTX 3050',
      gpuFormFactor: 'desktop',
      cpuModel: 'Intel Core i5-12600K',
      cpuFormFactor: 'desktop',
      ramGb: 16,
      osName: 'Windows 11',
      screenRefreshRateHz: 120
    });
    expect(res3050.verdict).toBe('incompatible');
  });

  it('debe distinguir entre series AMD compatibles e incompatibles (RX 6700 XT vs RX 6600)', () => {
    // RX 6700 XT es el umbral base admitido
    const res6700 = evaluateHardware({
      gpuModel: 'AMD Radeon RX 6700 XT',
      gpuFormFactor: 'desktop',
      cpuModel: 'AMD Ryzen 7 5800X',
      cpuFormFactor: 'desktop',
      ramGb: 16,
      osName: 'Windows 10 (64-bit)',
      screenRefreshRateHz: 144
    });
    expect(res6700.verdict).toBe('compatible');

    // RX 6600 está por debajo del umbral oficial de la serie 6000
    const res6600 = evaluateHardware({
      gpuModel: 'AMD Radeon RX 6600',
      gpuFormFactor: 'desktop',
      cpuModel: 'AMD Ryzen 7 5800X',
      cpuFormFactor: 'desktop',
      ramGb: 16,
      osName: 'Windows 10 (64-bit)',
      screenRefreshRateHz: 144
    });
    expect(res6600.verdict).toBe('incompatible');
  });

  it('debe reconocer y evaluar correctamente AMD Ryzen 5 3500U en laptop', () => {
    const input: UserHardwareInput = {
      gpuModel: 'AMD Radeon Vega 8',
      gpuFormFactor: 'laptop',
      cpuModel: 'AMD Ryzen 5 3500U',
      cpuFormFactor: 'laptop',
      ramGb: 8,
      osName: 'Windows 10 (64-bit)',
      screenRefreshRateHz: 60
    };

    const result = evaluateHardware(input);
    expect(result.verdict).toBe('incompatible');

    const cpuReq = result.requirements.find(r => r.id === 'cpu');
    expect(cpuReq).toBeDefined();
    expect(cpuReq?.status).toBe('confirmed_incompatible');
    expect(cpuReq?.message).toContain('umbral de CPU');
  });
});
