/**
 * User Data Retrieval
 * GET /api/user/data
 * Returns user account, career data, and credentials
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseAuthHeader, isAuthSignatureValid } from '@/lib/wallet';

export async function GET(request: NextRequest) {
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

    // TODO: Verify wallet signature
    // TODO: Fetch from D1 database

    // For now, mock response
    const mockData = {
      account: {
        walletAddress: auth.walletAddress,
        credits: 15.0,
        modulesCompleted: [],
        currentModule: 1,
        exercisesCompleted: [],
      },
      careerData: null,
      credentials: [],
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('User data retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve user data' },
      { status: 500 }
    );
  }
}
