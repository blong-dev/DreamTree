/**
 * Dashboard Page
 * User's main hub showing modules and progress
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProgressStore } from '@/store/useProgressStore';
import { getAllModules, getTotalExercises, isModuleComplete } from '@/config/modules';

export default function DashboardPage() {
  const { exercisesCompleted, modulesCompleted } = useProgressStore();
  const router = useRouter();

  // Check if onboarding is complete
  const hasCompletedOnboarding = exercisesCompleted.includes('onboarding');

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      router.push('/start');
    }
  }, [hasCompletedOnboarding, router]);

  const modules = getAllModules();
  const totalModules = 14; // Total planned modules (1-14)
  const availableModules = modules.length;

  // Calculate overall progress
  const totalExercises = modules.reduce(
    (sum, module) => sum + module.exercises.length,
    0
  );
  const completedExercisesCount = exercisesCompleted.length;
  const overallProgress = totalExercises > 0
    ? Math.round((completedExercisesCount / totalExercises) * 100)
    : 0;

  // Group modules by part
  const modulesByPart = {
    1: modules.filter((m) => m.part === 1),
    2: modules.filter((m) => m.part === 2),
    3: modules.filter((m) => m.part === 3),
  };

  const partTitles = {
    1: 'Roots',
    2: 'Trunk',
    3: 'Branches',
  };

  const partDescriptions = {
    1: 'Understanding Your Foundation',
    2: 'Building Your Core',
    3: 'Reaching Your Goals',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Your DreamTree Journey
          </h1>
          <p className="text-gray-600">
            Discover your authentic career path through 14 comprehensive modules
          </p>
        </div>

        {/* Overall Progress */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Overall Progress
              </span>
              <span className="text-sm font-medium text-gray-700">
                {overallProgress}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
          <div className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <span className="text-gray-600">Modules:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {modulesCompleted.length} / {totalModules}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Exercises:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {completedExercisesCount} / {totalExercises}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Available:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {availableModules} modules
              </span>
            </div>
          </div>
        </div>

        {/* Modules by Part */}
        {([1, 2, 3] as const).map((part) => (
          <div key={part} className="mb-12">
            {/* Part Header */}
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  Part {part}: {partTitles[part]}
                </h2>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                  {modulesByPart[part].length} modules
                </span>
              </div>
              <p className="text-gray-600">{partDescriptions[part]}</p>
            </div>

            {/* Module Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {modulesByPart[part].map((module) => {
                const moduleCompleted = isModuleComplete(
                  module.id as any,
                  exercisesCompleted
                );
                const moduleExercisesCompleted = exercisesCompleted.filter(
                  (exId) => module.exercises.some((ex) => ex.id === exId)
                ).length;
                const totalExercises = module.exercises.length;
                const progress = Math.round(
                  (moduleExercisesCompleted / totalExercises) * 100
                );

                return (
                  <Link
                    key={module.id}
                    href={`/modules/${module.id}`}
                    className="group relative overflow-hidden rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
                  >
                    {/* Module Header */}
                    <div className="mb-4">
                      <div className="mb-2 flex items-start justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Module {module.id}
                        </span>
                        {moduleCompleted && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                            ✓ Complete
                          </span>
                        )}
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                        {module.title}
                      </h3>
                      <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                        {module.overview}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    {progress > 0 && (
                      <div className="mb-3">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium text-gray-700">
                            {moduleExercisesCompleted}/{totalExercises} exercises
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-1.5 transition-all duration-300 ${
                              moduleCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>~{module.estimatedTime} min</span>
                      <span>•</span>
                      <span>{module.exercises.length} exercises</span>
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute bottom-6 right-6 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600">
                      →
                    </div>
                  </Link>
                );
              })}

              {/* Coming Soon Cards for unavailable modules */}
              {part === 1 && modulesByPart[part].length < 5 && (
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6">
                  <div className="text-center">
                    <div className="mb-2 text-2xl">🔒</div>
                    <p className="text-sm font-medium text-gray-500">
                      More modules coming soon
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Help Section */}
        <div className="mt-12 rounded-lg bg-blue-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-blue-900">
            💡 How It Works
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              • <strong>Part 1 (Roots):</strong> Discover your skills, values,
              and core interests
            </li>
            <li>
              • <strong>Part 2 (Trunk):</strong> Research careers and build
              your strategy
            </li>
            <li>
              • <strong>Part 3 (Branches):</strong> Take action and launch your
              new career
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
