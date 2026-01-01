/**
 * Stripe Client Utilities
 * Frontend helpers for Stripe integration
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Get Stripe instance (singleton)
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(
  walletAddress: string,
  amount: number = 25,
  type: 'initial' | 'add_credits' = 'initial'
): Promise<{ error?: string }> {
  try {
    // Create checkout session
    const response = await fetch('/api/payment/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        amount,
        type,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { url } = await response.json();

    // Redirect to Stripe Checkout
    if (url) {
      window.location.href = url;
      return {};
    }

    throw new Error('No checkout URL returned');
  } catch (error) {
    console.error('Checkout error:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
