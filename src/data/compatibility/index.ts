export * from './types';
export * from './sources';
export * from './gpuDatabase';
export * from './cpuDatabase';

import { GPU_RULES } from './gpuDatabase';
import { CPU_RULES } from './cpuDatabase';
import { CompatibilityRule, ComponentType } from './types';

export function getAllRules(): CompatibilityRule[] {
  return [...GPU_RULES, ...CPU_RULES];
}

export function getRulesByType(type: ComponentType): CompatibilityRule[] {
  return type === 'gpu' ? GPU_RULES : CPU_RULES;
}

export function findRuleById(id: string): CompatibilityRule | undefined {
  return getAllRules().find(r => r.id === id);
}
