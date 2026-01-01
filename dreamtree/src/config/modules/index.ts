/**
 * Module Configuration Registry
 * Central export for all module configurations
 */

import type { ModuleConfig, ModuleId } from './types';
import { module1 } from './module-1';

// ============================================
// MODULE REGISTRY
// ============================================

const modules: Record<ModuleId, ModuleConfig> = {
  1: module1,
  // Modules 2-14 will be added here
  2: null as any, // Placeholder
  3: null as any,
  4: null as any,
  5: null as any,
  6: null as any,
  7: null as any,
  8: null as any,
  9: null as any,
  10: null as any,
  11: null as any,
  12: null as any,
  13: null as any,
  14: null as any,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get module configuration by ID
 */
export function getModuleConfig(moduleId: ModuleId): ModuleConfig | null {
  return modules[moduleId] || null;
}

/**
 * Get all available modules
 */
export function getAllModules(): ModuleConfig[] {
  return Object.values(modules).filter((m) => m !== null);
}

/**
 * Get exercise configuration
 */
export function getExerciseConfig(moduleId: ModuleId, exerciseId: string) {
  const module = getModuleConfig(moduleId);
  if (!module) return null;

  return module.exercises.find((ex) => ex.id === exerciseId) || null;
}

/**
 * Get modules by part
 */
export function getModulesByPart(part: 1 | 2 | 3): ModuleConfig[] {
  return getAllModules().filter((m) => m.part === part);
}

/**
 * Calculate total exercises in a module
 */
export function getTotalExercises(moduleId: ModuleId): number {
  const module = getModuleConfig(moduleId);
  return module?.exercises.length || 0;
}

/**
 * Check if module is complete
 */
export function isModuleComplete(
  moduleId: ModuleId,
  completedExercises: string[]
): boolean {
  const module = getModuleConfig(moduleId);
  if (!module) return false;

  const requiredExercises = module.exercises.map((ex) => ex.id);
  return requiredExercises.every((id) => completedExercises.includes(id));
}

// ============================================
// EXPORTS
// ============================================

export { module1 };
export type { ModuleConfig, ModuleId } from './types';
