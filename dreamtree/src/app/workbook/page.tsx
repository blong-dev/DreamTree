import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getSessionIdFromCookie, getSessionData } from '@/lib/auth/session';
import { createDb } from '@/lib/db';
import type { Env } from '@/types/database';
export const runtime = 'edge';


export default async function WorkbookPage() {
  // Get user's current progress and redirect to appropriate exercise
  const cookieStore = await cookies();
  const sessionId = getSessionIdFromCookie(cookieStore.toString());

  let currentExerciseId = '1.1.1'; // Default to first exercise

  if (sessionId) {
    try {
      const { env } = getRequestContext() as unknown as { env: Env };
      const sessionData = await getSessionData(env.DB, sessionId);

      if (sessionData) {
        const db = createDb(env.DB);
        const userId = sessionData.user.id;

        // Get all exercises and find first uncompleted
        const allExercises = await db.raw
          .prepare(
            `SELECT DISTINCT part || '.' || module || '.' || exercise as exercise_id
             FROM stem
             WHERE part <= 2
             ORDER BY part, module, exercise`
          )
          .all<{ exercise_id: string }>();

        const completedExercises = await db.raw
          .prepare(
            `SELECT DISTINCT exercise_id
             FROM user_responses
             WHERE user_id = ?`
          )
          .bind(userId)
          .all<{ exercise_id: string }>();

        const completedIds = new Set(
          completedExercises.results?.map(r => r.exercise_id) || []
        );

        // Find first uncompleted exercise
        if (allExercises.results) {
          for (const ex of allExercises.results) {
            if (!completedIds.has(ex.exercise_id)) {
              currentExerciseId = ex.exercise_id;
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error determining current exercise:', error);
      // Fall back to first exercise
    }
  }

  redirect(`/workbook/${currentExerciseId}`);
}
