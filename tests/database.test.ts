import { describe, it, expect } from 'vitest';
import { GPU_RULES } from '../src/data/compatibility/gpuDatabase';
import { CPU_RULES } from '../src/data/compatibility/cpuDatabase';
import { OFFICIAL_SOURCES } from '../src/data/compatibility/sources';

describe('Integridad de la Base de Datos de Compatibilidad', () => {
  it('todas las reglas de GPU deben tener fuentes oficiales registradas válidas', () => {
    GPU_RULES.forEach((rule) => {
      const source = OFFICIAL_SOURCES[rule.sourceId];
      expect(source, `La regla de GPU ${rule.id} referencia la fuente inexistente ${rule.sourceId}`).toBeDefined();
      expect(source.url.startsWith('https://'), `La fuente ${rule.sourceId} debe tener una URL https válida`).toBe(true);
    });
  });

  it('todas las reglas de CPU deben tener fuentes oficiales registradas válidas', () => {
    CPU_RULES.forEach((rule) => {
      const source = OFFICIAL_SOURCES[rule.sourceId];
      expect(source, `La regla de CPU ${rule.id} referencia la fuente inexistente ${rule.sourceId}`).toBeDefined();
      expect(source.url.startsWith('https://')).toBe(true);
    });
  });

  it('no deben existir identificadores de regla duplicados', () => {
    const allIds = [...GPU_RULES.map(r => r.id), ...CPU_RULES.map(r => r.id)];
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('todas las reglas deben tener formato de normalización y campos obligatorios', () => {
    [...GPU_RULES, ...CPU_RULES].forEach((rule) => {
      expect(rule.id).toBeTruthy();
      expect(rule.model).toBeTruthy();
      expect(rule.normalizedName).toBe(rule.normalizedName.toLowerCase());
      expect(rule.lastVerifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
