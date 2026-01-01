/**
 * Stripe Webhook Handler
 * POST /api/payment/webhook
 * Handles payment events from Stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-12-15.clover',
  });
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // TODO: Store payment info temporarily (in KV store or database)
        // This will be used when user connects wallet on success page
        // For now, log the event
        console.log('Payment completed:', {
          sessionId: session.id,
          walletAddress: session.metadata?.walletAddress,
          amount: session.amount_total,
          type: session.metadata?.type,
        });

        // TODO: Implement actual user account creation
        // This would normally:
        // 1. Create user account in D1
        // 2. Allocate credits
        // 3. Send confirmation email (if applicable)

        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;

        console.log('Charge refunded:', {
          chargeId: charge.id,
          amount: charge.amount_refunded,
        });

        // TODO: Handle refund
        // 1. Mark account status
        // 2. Log transaction
        // 3. Revoke credits if applicable

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
