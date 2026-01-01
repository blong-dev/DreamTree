/**
 * Navigation Component
 * Site-wide navigation with progress tracking
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProgressStore } from '@/store/useProgressStore';
import { getAllModules } from '@/config/modules';

export function Navigation() {
  const pathname = usePathname();
  const { exercisesCompleted, modulesCompleted } = useProgressStore();

  const modules = getAllModules();
  const totalExercises = modules.reduce(
    (sum, module) => sum + module.exercises.length,
    0
  );
  const overallProgress =
    totalExercises > 0
      ? Math.round((exercisesCompleted.length / totalExercises) * 100)
      : 0;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-serif text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <span className="text-2xl">🌳</span>
            <span>DreamTree</span>
          </Link>

          {/* Progress Indicator */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">Overall Progress</p>
              <p className="text-sm font-semibold text-gray-900">
                {modulesCompleted.length}/14 modules • {overallProgress}%
              </p>
            </div>
            <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive('/profile')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
