/**
 * Exercise Page
 * Individual exercise view with chat interface or form
 */

'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { ChatInterface } from '@/components/ChatInterface';
import { FormBuilder, type FormData } from '@/components/FormBuilder';
import { useProgressStore } from '@/store/useProgressStore';
import { useUserStore } from '@/store/useUserStore';
import { useUIStore } from '@/store/useUIStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { getModuleConfig, getExerciseConfig } from '@/config/modules';
import { saveAppState } from '@/lib/storage';
import { useTypewriter } from '@/hooks/useTypewriter';
import type { ModuleId } from '@/config/modules/types';

export default function ExercisePage({
  params,
}: {
  params: Promise<{ id: string; exerciseId: string }>;
}) {
  const { id, exerciseId } = use(params);
  const moduleId = parseInt(id) as ModuleId;

  const module = getModuleConfig(moduleId);
  const exercise = getExerciseConfig(moduleId, exerciseId);

  const {
    completeExercise,
    setCurrentExercise,
    startExerciseTimer,
    stopExerciseTimer,
  } = useProgressStore();
  const { walletAddress } = useUserStore();
  const { addNotification } = useUIStore();
  const { backgroundColor, fontFamily, textColor } = usePreferencesStore();

  const [showForm, setShowForm] = useState(false);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [exerciseData, setExerciseData] = useState<FormData>({});
  const [totalCost, setTotalCost] = useState(0);

  // Typewriter effect for instructions
  const instructionsText = exercise?.instructions || '';
  const { displayedText, isComplete } = useTypewriter(instructionsText, 20);

  // Apply user preferences
  const fontStyle =
    fontFamily === 'sans'
      ? 'system-ui, -apple-system, sans-serif'
      : fontFamily === 'serif'
        ? 'Georgia, serif'
        : fontFamily === 'courier'
          ? '"Courier New", monospace'
          : 'system-ui, sans-serif';

  // Start timer when component mounts
  useEffect(() => {
    setCurrentExercise(moduleId, exerciseId);
    startExerciseTimer();

    return () => {
      stopExerciseTimer();
    };
  }, [moduleId, exerciseId, setCurrentExercise, startExerciseTimer, stopExerciseTimer]);

  // For hybrid exercises, show form only after conversation
  const shouldShowChat =
    exercise?.type === 'conversational' ||
    (exercise?.type === 'hybrid' && !conversationComplete);

  const shouldShowForm =
    exercise?.type === 'form' ||
    (exercise?.type === 'hybrid' && conversationComplete) ||
    showForm;

  if (!module || !exercise) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor, color: textColor, fontFamily: fontStyle }}
      >
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-current/20 bg-current/5 p-6">
            <h1 className="text-2xl font-bold">
              Exercise Not Found
            </h1>
            <p className="mt-2 opacity-80">
              Exercise {exerciseId} in Module {id} is not available.
            </p>
            <Link
              href={`/modules/${id}`}
              className="mt-4 inline-block hover:opacity-70 transition-opacity"
            >
              ← Back to Module
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCostUpdate = (cost: number) => {
    setTotalCost((prev) => prev + cost);
  };

  const handleChatComplete = () => {
    if (exercise.type === 'hybrid') {
      setConversationComplete(true);
      addNotification({
        type: 'success',
        message: 'Conversation complete! Now fill out the form below.',
      });
    } else {
      // Pure conversational exercise
      handleExerciseComplete({});
    }
  };

  const handleFormSave = async (data: FormData) => {
    await handleExerciseComplete(data);
  };

  const handleFormAutoSave = async (data: FormData) => {
    setExerciseData(data);

    // Save to local storage for recovery
    try {
      await saveAppState(`exercise-${moduleId}-${exerciseId}`, {
        moduleId,
        exerciseId,
        data,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to auto-save:', error);
    }
  };

  const handleExerciseComplete = async (data: FormData) => {
    try {
      // Mark exercise as complete
      completeExercise(exerciseId);

      // Save final data to local storage
      await saveAppState(`exercise-${moduleId}-${exerciseId}`, {
        moduleId,
        exerciseId,
        data,
        completedAt: Date.now(),
        timestamp: Date.now(),
      });

      // TODO: Send to API for server-side encrypted storage
      // await api.saveExerciseData(moduleId, exerciseId, data);

      addNotification({
        type: 'success',
        message: 'Exercise completed!',
      });

      // Redirect back to module page after short delay
      setTimeout(() => {
        window.location.href = `/modules/${moduleId}`;
      }, 1500);
    } catch (error) {
      console.error('Failed to complete exercise:', error);
      addNotification({
        type: 'error',
        message: 'Failed to save exercise. Please try again.',
      });
    }
  };

  return (
    <>
      <Navigation />
      <div
        className="min-h-screen pt-16 transition-colors duration-300"
        style={{ backgroundColor, color: textColor, fontFamily: fontStyle }}
      >
        {/* Fixed Cost Tracker - Top Right */}
      <div className="fixed top-4 right-4 z-50 rounded-lg bg-current/10 backdrop-blur-sm px-4 py-2 shadow-lg">
        <div className="text-right">
          <p className="text-xs opacity-60">Session Cost</p>
          <p className="text-lg font-bold">
            ${totalCost.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Main Content - Notebook Style */}
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
        {/* Header - Typewriter */}
        <div className="mb-12">
          <Link
            href={`/modules/${moduleId}`}
            className="mb-6 inline-flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <span>←</span>
            <span>Back to Module {moduleId}</span>
          </Link>

          <div className="mb-6 flex items-center gap-3">
            <span className="inline-block rounded-full bg-current/10 px-4 py-1.5 text-sm font-semibold">
              {exercise.type === 'conversational'
                ? 'Conversation'
                : exercise.type === 'form'
                  ? 'Form'
                  : 'Conversation + Form'}
            </span>
            <span className="text-sm opacity-60">
              ~{exercise.estimatedTime} minutes
            </span>
          </div>

          <h1 className="mb-6 text-4xl font-bold">
            Exercise {exercise.id}
          </h1>
          <h2 className="mb-8 text-2xl opacity-90">
            {exercise.title}
          </h2>

          {/* Typewriter Instructions */}
          {exercise.instructions && (
            <div className="relative rounded-xl bg-current/5 p-8 shadow-sm border border-current/10">
              <div className="prose prose-lg max-w-none">
                <p className="whitespace-pre-line leading-relaxed">
                  {displayedText}
                  {!isComplete && (
                    <span className="inline-block w-0.5 h-6 bg-current ml-1 animate-pulse" />
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Goals */}
          {exercise.goals && exercise.goals.length > 0 && (
            <div className="mt-6 rounded-xl bg-current/5 p-6 border border-current/10">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-70">
                What you'll explore
              </p>
              <ul className="space-y-2">
                {exercise.goals.map((goal, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1">◆</span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-12 border-t-2 border-current/10"></div>

        {/* Exercise Content - Notebook Style */}
        <div className="space-y-8">
          {/* Conversational Interface */}
          {shouldShowChat && exercise.systemPrompt && isComplete && (
            <div className="rounded-xl bg-current/5 p-8 shadow-sm border border-current/10">
              <ChatInterface
                moduleId={moduleId}
                exerciseId={exerciseId}
                systemPrompt={exercise.systemPrompt}
                onComplete={handleChatComplete}
                onCostUpdate={handleCostUpdate}
              />

              {exercise.type === 'hybrid' && (
                <div className="mt-8 rounded-lg border-l-4 border-current bg-current/5 p-4">
                  <p className="text-sm">
                    💡 After our conversation, you'll document your insights in a structured form.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Form Interface */}
          {shouldShowForm && exercise.formSchema && (
            <div className="rounded-xl bg-current/5 p-8 shadow-sm border border-current/10">
              {exercise.type === 'hybrid' && conversationComplete && (
                <div className="mb-8">
                  <h2 className="mb-3 text-2xl font-bold">
                    Now, capture your insights
                  </h2>
                  <p className="opacity-80">
                    Based on our conversation, document what you've discovered.
                  </p>
                  <div className="my-6 border-t border-current/10"></div>
                </div>
              )}

              <FormBuilder
                schema={exercise.formSchema}
                initialData={exerciseData}
                onSave={handleFormSave}
                onAutoSave={handleFormAutoSave}
                autoSaveDelay={2000}
              />
            </div>
          )}

          {/* Pure Conversational - Manual Complete Button */}
          {exercise.type === 'conversational' && (
            <div className="mt-12 rounded-xl bg-current/5 p-8 shadow-sm border border-current/10 text-center">
              <p className="mb-6 opacity-80">
                When you feel you've fully explored this topic, you can complete the exercise.
              </p>
              <button
                onClick={handleChatComplete}
                className="rounded-lg bg-current/20 px-8 py-3 font-semibold hover:bg-current/30 transition-colors shadow-sm"
              >
                Mark as Complete
              </button>
            </div>
          )}
        </div>

        {/* Examples (if provided) */}
        {exercise.examples && exercise.examples.length > 0 && (
          <div className="mt-12 rounded-xl border border-current/10 bg-current/5 p-8 shadow-sm">
            <h3 className="mb-6 text-xl font-semibold">
              Examples for inspiration
            </h3>
            <div className="space-y-6">
              {exercise.examples.map((example, idx) => (
                <div key={idx} className="rounded-lg bg-current/10 p-6 border border-current/10">
                  <h4 className="mb-3 font-semibold">
                    {example.title}
                  </h4>
                  <p className="whitespace-pre-line leading-relaxed opacity-90">
                    {example.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
