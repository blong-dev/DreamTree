import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getSessionData } from '@/lib/auth/session';
import { createDb } from '@/lib/db';


export default async function WorkbookPage() {
  // Get session from cookie (middleware ensures user is authenticated)
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('dt_session')?.value;

  if (!sessionId) {
    redirect('/login');
  }

  const { env } = getCloudflareContext();
  const sessionData = await getSessionData(env.DB, sessionId);

  if (!sessionData) {
    redirect('/login');
  }

  let currentExerciseId = '1.1.1'; // Default to first exercise

  try {
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
  } catch (error) {
    console.error('Error determining current exercise:', error);
    // Fall back to first exercise
  }

  redirect(`/workbook/${currentExerciseId}`);
}
