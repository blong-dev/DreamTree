/**
 * Test Page - For testing core features
 * Visit: http://localhost:3000/test
 */

'use client';

import { useState } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { WalletConnect } from '@/components/WalletConnect';
import { ChatInterface } from '@/components/ChatInterface';
import { redirectToCheckout } from '@/lib/stripe';
import { requestMasterKeySignature } from '@/lib/wallet';
import { useWalletClient } from 'wagmi';
import { useUserStore } from '@/store/useUserStore';
import { encryptAES256, decryptAES256, testEncryption } from '@/lib/encryption';

export default function TestPage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { disconnect } = useDisconnect();
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  const {
    walletAddress,
    masterKeySignature,
    setWalletAddress,
    setMasterKeySignature
  } = useUserStore();

  // Test encryption
  const handleTestEncryption = async () => {
    try {
      const testData = { message: 'Hello, DreamTree!' };
      const key = 'test-key-123';

      const encrypted = await encryptAES256(JSON.stringify(testData), key);
      const decrypted = await decryptAES256(encrypted, key);

      const success = decrypted === JSON.stringify(testData);
      setTestResults(prev => ({
        ...prev,
        encryption: success ? '✅ Encryption working!' : '❌ Encryption failed'
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        encryption: `❌ Error: ${error}`
      }));
    }
  };

  // Request master key signature
  const handleGetMasterKey = async () => {
    if (!walletClient || !address) {
      setTestResults(prev => ({
        ...prev,
        masterKey: '❌ Wallet not connected'
      }));
      return;
    }

    try {
      const signature = await requestMasterKeySignature(walletClient, address);
      setMasterKeySignature(signature);
      setWalletAddress(address);

      setTestResults(prev => ({
        ...prev,
        masterKey: `✅ Master key signature obtained: ${signature.slice(0, 20)}...`
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        masterKey: `❌ Error: ${error}`
      }));
    }
  };

  // Test Stripe payment
  const handleTestPayment = async () => {
    if (!address) {
      alert('Please connect wallet first');
      return;
    }

    try {
      setTestResults(prev => ({
        ...prev,
        payment: '⏳ Redirecting to Stripe...'
      }));

      await redirectToCheckout(address, 25, 'initial');
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        payment: `❌ Error: ${error}`
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            🧪 DreamTree Test Page
          </h1>
          <p className="text-gray-600">
            Test all the core features before building the full application.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Wallet Connection Test */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">1. Wallet Connection</h2>
            <div className="space-y-4">
              <WalletConnect />

              {isConnected && (
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-900">
                    ✅ Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
              )}

              {isConnected && (
                <div className="space-y-2">
                  <button
                    onClick={handleGetMasterKey}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Get Master Key Signature
                  </button>
                  {testResults.masterKey && (
                    <p className="text-sm text-gray-600">{testResults.masterKey}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Encryption Test */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">2. Encryption System</h2>
            <div className="space-y-4">
              <button
                onClick={handleTestEncryption}
                className="w-full rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
              >
                Test AES-256-GCM Encryption
              </button>

              {testResults.encryption && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm">{testResults.encryption}</p>
                </div>
              )}

              <div className="text-sm text-gray-600">
                <p>Tests:</p>
                <ul className="ml-4 list-disc">
                  <li>Encrypt data</li>
                  <li>Decrypt data</li>
                  <li>Verify roundtrip works</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Test */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">3. Stripe Payment</h2>
            <div className="space-y-4">
              <button
                onClick={handleTestPayment}
                disabled={!isConnected}
                className="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-300"
              >
                Test Checkout ($25)
              </button>

              {testResults.payment && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm">{testResults.payment}</p>
                </div>
              )}

              <div className="text-sm text-gray-600">
                <p>Test card: 4242 4242 4242 4242</p>
                <p>Expiry: Any future date</p>
                <p>CVC: Any 3 digits</p>
              </div>
            </div>
          </div>

          {/* API Status */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">4. Environment Check</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Anthropic API Key:</span>
                <span className={process.env.ANTHROPIC_API_KEY ? 'text-green-600' : 'text-red-600'}>
                  {process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Stripe Secret Key:</span>
                <span className={process.env.STRIPE_SECRET_KEY ? 'text-green-600' : 'text-red-600'}>
                  {process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Stripe Public Key:</span>
                <span className={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'text-green-600' : 'text-red-600'}>
                  {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Encryption Key:</span>
                <span className={process.env.PLATFORM_ENCRYPTION_KEY ? 'text-green-600' : 'text-red-600'}>
                  {process.env.PLATFORM_ENCRYPTION_KEY ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
              <p>📝 Note: Environment variables checked at build time.</p>
              <p>If you just added them, restart the dev server.</p>
            </div>
          </div>
        </div>

        {/* AI Chat Test */}
        {isConnected && masterKeySignature && (
          <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">5. AI Chat Interface</h2>
            <ChatInterface
              moduleId={1}
              exerciseId="test-1"
              systemPrompt="You are a helpful career coach. Keep responses brief and friendly."
            />
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 rounded-lg bg-yellow-50 p-6">
          <h3 className="mb-2 font-semibold text-yellow-900">📋 Setup Instructions</h3>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-yellow-800">
            <li>Add API keys to <code className="rounded bg-yellow-200 px-1">.env.local</code></li>
            <li>Restart the dev server: <code className="rounded bg-yellow-200 px-1">npm run dev</code></li>
            <li>Test each feature above</li>
            <li>Check browser console for any errors</li>
            <li>For Stripe webhooks, run: <code className="rounded bg-yellow-200 px-1">stripe listen --forward-to localhost:3000/api/payment/webhook</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}
