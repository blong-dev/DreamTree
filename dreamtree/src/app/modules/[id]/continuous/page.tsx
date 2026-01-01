/**
 * Continuous Module Page
 * All exercises in a module flow on one long scrollable page
 */

'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { ChatInterface } from '@/components/ChatInterface';
import { useProgressStore } from '@/store/useProgressStore';
import { useUserStore } from '@/store/useUserStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { getModuleConfig } from '@/config/modules';
import { getConversation, saveConversation } from '@/lib/storage';
import type { ModuleId } from '@/config/modules/types';

interface ExerciseSeparator {
  exerciseId: string;
  title: string;
  timestamp: number;
}

export default function ContinuousModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const moduleId = parseInt(id) as ModuleId;

  const module = getModuleConfig(moduleId);
  const exercises = module?.exercises || [];

  const {
    completeExercise,
    setCurrentExercise,
    startExerciseTimer,
    stopExerciseTimer,
  } = useProgressStore();
  const { walletAddress } = useUserStore();
  const { backgroundColor, fontFamily, textColor } = usePreferencesStore();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [exerciseSeparators, setExerciseSeparators] = useState<ExerciseSeparator[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentExercise = exercises[currentExerciseIndex];

  // Apply user preferences
  const fontStyle =
    fontFamily === 'sans'
      ? 'system-ui, -apple-system, sans-serif'
      : fontFamily === 'serif'
        ? 'Georgia, serif'
        : fontFamily === 'courier'
          ? '"Courier New", monospace'
          : 'system-ui, sans-serif';

  // Load saved progress from progress store
  useEffect(() => {
    // For now, start fresh each time
    // TODO: Implement module progress persistence
    setIsLoadingProgress(false);
  }, [moduleId, exercises.length]);

  // Start timer when component mounts
  useEffect(() => {
    if (currentExercise) {
      setCurrentExercise(moduleId, currentExercise.id);
      startExerciseTimer();
    }

    return () => {
      stopExerciseTimer();
    };
  }, [moduleId, currentExercise, setCurrentExercise, startExerciseTimer, stopExerciseTimer]);

  // Handle exercise completion
  const handleExerciseComplete = async (exerciseId: string) => {
    console.log(`Exercise ${exerciseId} complete!`);

    // Mark this exercise as complete
    const updatedCompleted = [...completedExercises, exerciseId];
    setCompletedExercises(updatedCompleted);

    // Complete in progress store
    completeExercise(exerciseId);

    // Add separator
    const currentExerciseData = exercises.find(ex => ex.id === exerciseId);
    if (currentExerciseData) {
      const separator: ExerciseSeparator = {
        exerciseId,
        title: currentExerciseData.title,
        timestamp: Date.now(),
      };
      const updatedSeparators = [...exerciseSeparators, separator];
      setExerciseSeparators(updatedSeparators);

      // TODO: Save progress to custom store
      // For now, progress is tracked in state only
      // await saveModuleProgress(moduleId, {
      //   completedExercises: updatedCompleted,
      //   separators: updatedSeparators,
      // });
    }

    // Move to next exercise
    const nextIndex = currentExerciseIndex + 1;
    if (nextIndex < exercises.length) {
      setTimeout(() => {
        setCurrentExerciseIndex(nextIndex);
        // Smooth scroll to bottom for new exercise
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 1500);
    } else {
      // All exercises complete!
      console.log('Module complete!');
      // TODO: Handle module completion
    }
  };

  const handleCostUpdate = (cost: number) => {
    setTotalCost((prev) => prev + cost);
  };

  if (!module) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor, color: textColor, fontFamily: fontStyle }}
      >
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-current/20 bg-current/5 p-6">
            <h1 className="text-2xl font-bold">
              Module Not Found
            </h1>
            <p className="mt-2 opacity-80">
              Module {id} is not available.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block hover:opacity-70 transition-opacity"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingProgress) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor, color: textColor, fontFamily: fontStyle }}
      >
        <div className="text-center">
          <p className="text-lg opacity-60">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor, color: textColor, fontFamily: fontStyle }}
    >
      <Navigation />

      {/* Fixed Cost Tracker - Top Right */}
      <div className="fixed top-4 right-4 z-50 rounded-lg bg-black/10 backdrop-blur-sm px-4 py-2 shadow-lg">
        <div className="text-right">
          <p className="text-xs opacity-60">Session Cost</p>
          <p className="text-lg font-bold">${totalCost.toFixed(4)}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
        {/* Module Header */}
        <div className="mb-12 text-center">
          <div className="mb-4">
            <span className="text-sm font-semibold uppercase tracking-wide opacity-60">
              Part {module.part}: {module.partTitle}
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-3">{module.title}</h1>
          <p className="text-lg opacity-80">{module.overview}</p>
        </div>

        {/* Continuous Exercise Flow */}
        <div className="space-y-12">
          {/* Render exercise separators */}
          {exerciseSeparators.map((separator) => (
            <div key={separator.exerciseId} className="py-6">
              <div className="flex items-center gap-4 opacity-40">
                <div className="flex-1 h-px bg-current"></div>
                <p className="text-sm font-semibold uppercase tracking-wider">
                  Exercise {separator.exerciseId}: {separator.title} ✓
                </p>
                <div className="flex-1 h-px bg-current"></div>
              </div>
            </div>
          ))}

          {/* Current Exercise Chat Interface */}
          {currentExercise && (
            <div>
              {currentExerciseIndex > 0 && (
                <div className="mb-8 py-6">
                  <div className="flex items-center gap-4 opacity-60">
                    <div className="flex-1 h-px bg-current"></div>
                    <p className="text-sm font-semibold uppercase tracking-wider">
                      Exercise {currentExercise.id}: {currentExercise.title}
                    </p>
                    <div className="flex-1 h-px bg-current"></div>
                  </div>
                </div>
              )}

              <ChatInterface
                moduleId={moduleId}
                exerciseId={currentExercise.id}
                systemPrompt={currentExercise.systemPrompt}
                onCostUpdate={handleCostUpdate}
                onExerciseComplete={handleExerciseComplete}
              />
            </div>
          )}

          {/* All exercises complete */}
          {currentExerciseIndex >= exercises.length && (
            <div className="text-center py-12">
              <div className="mb-8">
                <span className="text-6xl">🎉</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">Module Complete!</h2>
              <p className="text-lg opacity-80 mb-8">
                You've completed all {exercises.length} exercises in {module.title}.
              </p>
              <Link
                href="/dashboard"
                className="inline-block px-8 py-4 bg-current/10 hover:bg-current/20 rounded-lg font-semibold transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
