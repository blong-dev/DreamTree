/**
 * Admin Dashboard Page
 * Analytics, insights, scholarship management
 * Protected by admin authentication
 */

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stats Cards */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Revenue</h3>
            <p className="text-3xl font-bold text-gray-900">$0</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Completions</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Active Today</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>
        </div>

        {/* Scholarship Applications */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Scholarship Applications</h2>
          <p className="text-sm text-gray-600">
            No pending applications
          </p>
        </div>
      </div>
    </div>
  );
}
