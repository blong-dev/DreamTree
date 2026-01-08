import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDb } from '@/lib/db';
import { getSessionIdFromCookie, getSessionData } from '@/lib/auth/session';
import type { Env } from '@/types/database';
export const runtime = 'edge';


interface ProgressData {
  currentExerciseId: string;
  completedExercises: string[];
  totalExercises: number;
  percentComplete: number;
}

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const sessionId = getSessionIdFromCookie(cookieHeader);

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { env } = getRequestContext() as unknown as { env: Env };
    const sessionData = await getSessionData(env.DB, sessionId);

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const userId = sessionData.user.id;
    const db = createDb(env.DB);

    // Get all unique exercises from stem
    const allExercises = await db.raw
      .prepare(
        `SELECT DISTINCT part || '.' || module || '.' || exercise as exercise_id
         FROM stem
         WHERE part <= 2
         ORDER BY part, module, exercise`
      )
      .all<{ exercise_id: string }>();

    const totalExercises = allExercises.results?.length || 0;

    // Get exercises with at least one user response
    const completedExercises = await db.raw
      .prepare(
        `SELECT DISTINCT exercise_id
         FROM user_responses
         WHERE user_id = ?
         ORDER BY exercise_id`
      )
      .bind(userId)
      .all<{ exercise_id: string }>();

    const completedIds = completedExercises.results?.map(r => r.exercise_id) || [];

    // Determine current exercise (first uncompleted, or last completed + 1)
    let currentExerciseId = '1.1.1'; // Default to first exercise

    if (allExercises.results && allExercises.results.length > 0) {
      // Find first exercise that's not in completed list
      for (const ex of allExercises.results) {
        if (!completedIds.includes(ex.exercise_id)) {
          currentExerciseId = ex.exercise_id;
          break;
        }
      }

      // If all are completed, set to last one
      if (completedIds.length >= totalExercises) {
        currentExerciseId = allExercises.results[allExercises.results.length - 1].exercise_id;
      }
    }

    const percentComplete = totalExercises > 0
      ? Math.round((completedIds.length / totalExercises) * 100)
      : 0;

    const response: ProgressData = {
      currentExerciseId,
      completedExercises: completedIds,
      totalExercises,
      percentComplete,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
