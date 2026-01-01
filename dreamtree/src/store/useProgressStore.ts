/**
 * Progress State Store
 * Manages module and exercise completion progress
 */

import { create } from 'zustand';

interface ProgressState {
  // Progress data
  modulesCompleted: number[];
  currentModule: number;
  exercisesCompleted: string[];

  // Current exercise state
  currentExercise: {
    moduleId: number;
    exerciseId: string;
  } | null;

  // Time tracking
  exerciseStartTime: number | null;
  totalTimeSpent: Record<string, number>; // exerciseId -> seconds

  // Actions
  setModulesCompleted: (modules: number[]) => void;
  setCurrentModule: (moduleId: number) => void;
  setExercisesCompleted: (exercises: string[]) => void;
  completeExercise: (exerciseId: string) => void;
  completeModule: (moduleId: number) => void;
  setCurrentExercise: (moduleId: number, exerciseId: string) => void;
  startExerciseTimer: () => void;
  stopExerciseTimer: () => number; // Returns time spent in seconds
  getExerciseTimeSpent: (exerciseId: string) => number;
  reset: () => void;
}

const initialState = {
  modulesCompleted: [],
  currentModule: 1,
  exercisesCompleted: [],
  currentExercise: null,
  exerciseStartTime: null,
  totalTimeSpent: {},
};

export const useProgressStore = create<ProgressState>()((set, get) => ({
  ...initialState,

  setModulesCompleted: (modules) => set({ modulesCompleted: modules }),

  setCurrentModule: (moduleId) => set({ currentModule: moduleId }),

  setExercisesCompleted: (exercises) => set({ exercisesCompleted: exercises }),

  completeExercise: (exerciseId) =>
    set((state) => ({
      exercisesCompleted: [...new Set([...state.exercisesCompleted, exerciseId])],
    })),

  completeModule: (moduleId) =>
    set((state) => ({
      modulesCompleted: [...new Set([...state.modulesCompleted, moduleId])],
      currentModule: moduleId + 1,
    })),

  setCurrentExercise: (moduleId, exerciseId) =>
    set({
      currentExercise: { moduleId, exerciseId },
    }),

  startExerciseTimer: () =>
    set({
      exerciseStartTime: Date.now(),
    }),

  stopExerciseTimer: () => {
    const state = get();
    const { exerciseStartTime, currentExercise } = state;

    if (!exerciseStartTime || !currentExercise) return 0;

    const timeSpent = Math.floor((Date.now() - exerciseStartTime) / 1000);
    const exerciseId = currentExercise.exerciseId;

    // Accumulate time for this exercise
    set((state) => ({
      totalTimeSpent: {
        ...state.totalTimeSpent,
        [exerciseId]: (state.totalTimeSpent[exerciseId] || 0) + timeSpent,
      },
      exerciseStartTime: null,
    }));

    return timeSpent;
  },

  getExerciseTimeSpent: (exerciseId) => {
    return get().totalTimeSpent[exerciseId] || 0;
  },

  reset: () => set({ ...initialState }),
}));
