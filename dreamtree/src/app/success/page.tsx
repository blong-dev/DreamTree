/**
 * Payment Success Page
 * Shows after successful Stripe payment
 * Prompts user to connect wallet
 */

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-6 text-6xl">✅</div>
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Payment Successful!
        </h1>
        <p className="mb-6 text-gray-600">
          Your payment has been processed. Connect your wallet to save your
          progress and begin your journey.
        </p>
        <button className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
          Connect Wallet
        </button>
      </div>
    </div>
  );
}
