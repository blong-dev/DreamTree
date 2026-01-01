/**
 * Save Exercise Data
 * POST /api/user/save
 * Saves encrypted exercise response
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseAuthHeader, isAuthSignatureValid } from '@/lib/wallet';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth = parseAuthHeader(authHeader);
    if (!auth || !isAuthSignatureValid(auth.timestamp)) {
      return NextResponse.json(
        { error: 'Invalid or expired signature' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { moduleId, exerciseId, data, metadata } = body;

    if (!moduleId || !exerciseId || !data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Fetch existing career data
    // TODO: Merge new exercise data
    // TODO: Encrypt updated blob
    // TODO: Update user_career_data in D1
    // TODO: Update exercises_completed
    // TODO: Log analytics event

    console.log('Exercise data saved:', {
      wallet: auth.walletAddress,
      moduleId,
      exerciseId,
      timeSpent: metadata.timeSpent,
    });

    return NextResponse.json({
      success: true,
      exerciseId,
      creditsRemaining: 14.87, // Mock value
    });
  } catch (error) {
    console.error('Save exercise error:', error);
    return NextResponse.json(
      { error: 'Failed to save exercise data' },
      { status: 500 }
    );
  }
}
