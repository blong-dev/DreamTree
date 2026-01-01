/**
 * Module Configuration Types
 * Defines the structure for all module configurations
 */

import type { FormSchema } from '@/components/FormBuilder';

// ============================================
// MODULE TYPES
// ============================================

export interface ModuleConfig {
  id: number;
  title: string;
  part: 1 | 2 | 3; // Roots, Trunk, Branches
  partTitle: 'Roots' | 'Trunk' | 'Branches';
  overview: string;
  estimatedTime: number; // minutes
  exercises: ExerciseConfig[];
  completionCriteria: {
    allExercisesComplete: boolean;
    minimumQualityScore?: number;
  };
  characterAnalysisTrigger: boolean; // Run managing bot after completion
}

export interface ExerciseConfig {
  id: string; // e.g., "1.1", "1.2"
  title: string;
  type: 'conversational' | 'form' | 'hybrid';
  estimatedTime: number; // minutes

  // For conversational exercises
  systemPrompt?: string;
  conversationalGuidelines?: string;
  goals?: string[];

  // For form exercises
  formSchema?: FormSchema;

  // For hybrid exercises (conversation then form)
  transitionLogic?: {
    minExchanges: number;
    triggerPhrase?: string;
    extractionPrompt?: string;
  };

  // Instructions shown to user
  instructions?: string;

  // Examples or templates
  examples?: Array<{
    title: string;
    content: string;
  }>;
}

// ============================================
// HELPER TYPES
// ============================================

export type ModuleId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface ModuleProgress {
  moduleId: number;
  exercisesCompleted: string[];
  isComplete: boolean;
  timeSpent: number; // seconds
  qualityScore?: number;
}

export interface ExerciseData {
  exerciseId: string;
  moduleId: number;
  data: Record<string, unknown>;
  completedAt?: number;
  timeSpent?: number;
}
