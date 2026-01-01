/**
 * DreamTree Landing Page
 * Main entry point for the application
 */

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen flex-col items-center justify-center text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Discover Your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Dream Career
            </span>
          </h1>

          <p className="mb-8 max-w-2xl text-xl text-gray-600">
            AI-powered career development framework that helps you understand
            your skills, values, and aspirations to find work that truly fulfills you.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Start Your Journey - $25
            </Link>
            <Link
              href="#features"
              className="rounded-lg border-2 border-gray-300 px-8 py-3 font-semibold text-gray-700 transition hover:border-gray-400"
            >
              Learn More
            </Link>
          </div>

          <div className="mt-12 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 text-4xl">🌱</div>
              <h3 className="mb-2 font-semibold">Part 1: Roots</h3>
              <p className="text-sm text-gray-600">
                Understand your foundation: skills, values, and past experiences
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 text-4xl">🌳</div>
              <h3 className="mb-2 font-semibold">Part 2: Trunk</h3>
              <p className="text-sm text-gray-600">
                Connect your past to your future with values alignment
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 text-4xl">🌿</div>
              <h3 className="mb-2 font-semibold">Part 3: Branches</h3>
              <p className="text-sm text-gray-600">
                Reach outward: networking, research, and taking action
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          <p>© 2025 DreamTree. Your data is encrypted and you own it.</p>
        </div>
      </footer>
    </div>
  );
}
