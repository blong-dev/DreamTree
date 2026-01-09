import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getSessionData } from '@/lib/auth';
import { createDb } from '@/lib/db';
import {
  DashboardPage,
  DailyDo,
  ProgressMetricData,
  TOCPartData,
  UserPreview,
  BackgroundColorId,
  FontFamilyId,
} from '@/components/dashboard';
import { LandingPage } from '@/components/landing';
import type { Env } from '@/types/database';

export const runtime = 'edge';

// Get user's current exercise (first uncompleted)
async function getCurrentExerciseId(db: ReturnType<typeof createDb>, userId: string): Promise<string> {
  try {
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

    if (allExercises.results) {
      for (const ex of allExercises.results) {
        if (!completedIds.has(ex.exercise_id)) {
          return ex.exercise_id;
        }
      }
    }
  } catch (error) {
    console.error('Error getting current exercise:', error);
  }

  return '1.1.1';
}

// Get progress metrics for dashboard
async function getProgressMetrics(db: ReturnType<typeof createDb>, userId: string): Promise<ProgressMetricData[]> {
  try {
    // Get total exercises and completed count
    const totalExercises = await db.raw
      .prepare(
        `SELECT COUNT(DISTINCT part || '.' || module || '.' || exercise) as count
         FROM stem WHERE part <= 2`
      )
      .first<{ count: number }>();

    const completedExercises = await db.raw
      .prepare(
        `SELECT COUNT(DISTINCT exercise_id) as count
         FROM user_responses WHERE user_id = ?`
      )
      .bind(userId)
      .first<{ count: number }>();

    const total = totalExercises?.count || 100;
    const completed = completedExercises?.count || 0;
    const percentage = Math.round((completed / total) * 100);

    // Get SOARED story count
    const soaredCount = await db.raw
      .prepare(
        `SELECT COUNT(*) as count FROM user_responses ur
         JOIN prompts p ON ur.prompt_id = p.id
         WHERE ur.user_id = ? AND p.input_type = 'textarea'`
      )
      .bind(userId)
      .first<{ count: number }>();

    return [
      { value: `${percentage}%`, label: 'Workbook Complete' },
      { value: soaredCount?.count || 0, label: 'SOARED Stories' },
      { value: completed, label: 'Exercises Done' },
      { value: 1, label: 'Day Streak' },
    ];
  } catch (error) {
    console.error('Error getting progress metrics:', error);
    return [
      { value: '0%', label: 'Workbook Complete' },
      { value: 0, label: 'SOARED Stories' },
      { value: 0, label: 'Exercises Done' },
      { value: 0, label: 'Day Streak' },
    ];
  }
}

// Get TOC data for dashboard
async function getTOCData(): Promise<TOCPartData[]> {
  // TODO: Fetch real TOC structure from database
  // For now, return minimal structure
  return [
    {
      id: '1',
      title: 'Part 1: Roots',
      progress: 0,
      status: 'in-progress',
      modules: [
        {
          id: '1.1',
          title: 'Module 1: Your Story',
          status: 'in-progress',
          exercises: [
            { id: '1.1.1', title: 'Introduction', status: 'available' },
            { id: '1.1.2', title: 'Life Timeline', status: 'locked' },
          ],
        },
      ],
    },
    {
      id: '2',
      title: 'Part 2: Trunk',
      progress: 0,
      status: 'locked',
      modules: [],
    },
  ];
}

// Get daily do items
function getDailyDos(): DailyDo[] {
  return [
    {
      id: '1',
      type: 'flow-tracking',
      title: 'Track Your Flow State',
      subtitle: 'Log an activity where you lost track of time',
      action: { label: 'Log Flow', href: '/tools/flow-tracker' },
    },
    {
      id: '2',
      type: 'soared-prompt',
      title: 'SOARED Story Prompt',
      subtitle: 'Think of a time you helped someone solve a problem',
      action: { label: 'Write Story', href: '/tools/soared-form' },
    },
  ];
}

export default async function HomePage() {
  // Get session from cookie
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('dt_session')?.value;

  // Show landing page for unauthenticated users
  if (!sessionId) {
    return <LandingPage />;
  }

  const { env } = getRequestContext() as unknown as { env: Env };
  const sessionData = await getSessionData(env.DB, sessionId);

  // Show landing page if session is invalid
  if (!sessionData) {
    return <LandingPage />;
  }

  // Check if user has completed onboarding (has display name)
  const profile = await env.DB
    .prepare('SELECT display_name FROM user_profile WHERE user_id = ?')
    .bind(sessionData.user.id)
    .first<{ display_name: string | null }>();

  if (!profile?.display_name) {
    redirect('/onboarding');
  }

  const db = createDb(env.DB);
  const userId = sessionData.user.id;

  // Fetch data in parallel
  const [currentExerciseId, progressMetrics, tocParts] = await Promise.all([
    getCurrentExerciseId(db, userId),
    getProgressMetrics(db, userId),
    getTOCData(),
  ]);

  // Build user preview
  const userPreview: UserPreview = {
    name: profile.display_name,
    topSkills: {
      transferable: null,
      selfManagement: null,
      knowledge: null,
    },
    backgroundColor: (sessionData.settings.background_color || 'ivory') as BackgroundColorId,
    fontFamily: (sessionData.settings.font || 'inter') as FontFamilyId,
  };

  return (
    <DashboardPage
      userName={profile.display_name}
      userPreview={userPreview}
      dailyDos={getDailyDos()}
      progressMetrics={progressMetrics}
      tocParts={tocParts}
      currentExerciseId={currentExerciseId}
    />
  );
}
