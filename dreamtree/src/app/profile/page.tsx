/**
 * Profile Page
 * User account information, data management, credentials
 */

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Your Profile
        </h1>

        <div className="space-y-6">
          {/* Account Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Account Information</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Wallet: Not connected</p>
              <p>Credits: $0.00</p>
              <p>Modules Completed: 0</p>
            </div>
          </div>

          {/* Data Management */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Your Data</h2>
            <div className="flex gap-4">
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Download Data
              </button>
              <button className="rounded-lg border-2 border-red-600 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                Delete Account
              </button>
            </div>
          </div>

          {/* Credentials */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Credentials</h2>
            <p className="text-sm text-gray-600">
              No credentials earned yet. Complete modules to earn credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
