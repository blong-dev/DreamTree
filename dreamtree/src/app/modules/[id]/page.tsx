/**
 * Module View Page
 * Displays module overview and exercises
 */

'use client';

import { use } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { useProgressStore } from '@/store/useProgressStore';
import { getModuleConfig } from '@/config/modules';
import type { ModuleId } from '@/config/modules/types';

export default function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const moduleId = parseInt(id) as ModuleId;

  const module = getModuleConfig(moduleId);
  const { exercisesCompleted } = useProgressStore();

  // Filter completed exercises for this module
  const completedExercises = module
    ? exercisesCompleted.filter((exId) =>
        module.exercises.some((ex) => ex.id === exId)
      )
    : [];

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h1 className="text-2xl font-bold text-red-900">
              Module Not Found
            </h1>
            <p className="mt-2 text-red-700">
              Module {id} is not available yet.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-red-600 hover:text-red-800"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const completionPercentage = Math.round(
    (completedExercises.length / module.exercises.length) * 100
  );

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="mb-4 inline-block text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </Link>

          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
              Part {module.part}: {module.partTitle}
            </span>
            <span className="text-sm text-gray-500">
              ~{module.estimatedTime} minutes
            </span>
          </div>

          <h1 className="mb-3 text-3xl font-bold text-gray-900">
            Module {module.id}: {module.title}
          </h1>

          <p className="text-lg text-gray-600">{module.overview}</p>

          {/* Progress Bar */}
          {completedExercises.length > 0 && (
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Progress</span>
                <span className="text-gray-600">
                  {completedExercises.length} / {module.exercises.length} exercises
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Exercises List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Exercises</h2>

          {module.exercises.map((exercise) => {
            const isComplete = completedExercises.includes(exercise.id);
            const exerciseTypeLabel = {
              conversational: 'Conversation',
              form: 'Form',
              hybrid: 'Conversation + Form',
            }[exercise.type];

            return (
              <div
                key={exercise.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        Exercise {exercise.id}: {exercise.title}
                      </h3>
                      {isComplete && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                          ✓ Complete
                        </span>
                      )}
                    </div>

                    <div className="mb-2 flex items-center gap-3 text-sm text-gray-500">
                      <span>{exerciseTypeLabel}</span>
                      <span>•</span>
                      <span>~{exercise.estimatedTime} min</span>
                    </div>

                    {exercise.instructions && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {exercise.instructions.split('\n')[0]}
                      </p>
                    )}
                  </div>
                </div>

                {exercise.goals && exercise.goals.length > 0 && (
                  <div className="mb-4 rounded-lg bg-gray-50 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                      Goals
                    </p>
                    <ul className="space-y-1">
                      {exercise.goals.slice(0, 3).map((goal, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          • {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link
                  href={`/modules/${moduleId}/${exercise.id}`}
                  className={`inline-block rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    isComplete
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isComplete ? 'Review Exercise' : 'Start Exercise'}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {completionPercentage === 100 && (
          <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-6">
            <h3 className="mb-2 text-xl font-bold text-green-900">
              Module Complete!
            </h3>
            <p className="text-green-700">
              You've completed all exercises in this module.
              {module.characterAnalysisTrigger && (
                <> Your progress will be analyzed to provide personalized insights.</>
              )}
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
