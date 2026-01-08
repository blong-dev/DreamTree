import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getSessionIdFromCookie, getSessionData, createAnonymousSession, createSessionCookie } from '@/lib/auth/session';
import { createDb } from '@/lib/db';
import { WorkbookView } from '@/components/workbook';
import type { ExerciseContent, SavedResponse } from '@/components/workbook/types';
import type { Env } from '@/types/database';

export const runtime = 'edge';

interface PageProps {
  params: Promise<{ exerciseId: string }>;
}

interface StemRow {
  id: number;
  part: number;
  module: number;
  exercise: number;
  activity: number;
  sequence: number;
  block_type: string;
  content_id: number;
  connection_id: number | null;
  content_json: string;
}

async function fetchExercise(exerciseId: string): Promise<ExerciseContent | null> {
  const { env } = getRequestContext() as unknown as { env: Env };
  const db = createDb(env.DB);

  // Parse exercise ID
  const parts = exerciseId.split('.');
  if (parts.length < 3) return null;

  const [partStr, moduleStr, exerciseStr] = parts;
  const part = parseInt(partStr, 10);
  const moduleNum = parseInt(moduleStr, 10);
  const exercise = parseInt(exerciseStr, 10);

  if (isNaN(part) || isNaN(moduleNum) || isNaN(exercise)) return null;

  // Fetch stem rows with content
  const stemRows = await db.raw
    .prepare(`
      SELECT
        s.id,
        s.part,
        s.module,
        s.exercise,
        s.activity,
        s.sequence,
        s.block_type,
        s.content_id,
        s.connection_id,
        CASE s.block_type
          WHEN 'content' THEN json_object(
            'id', cb.id,
            'type', cb.content_type,
            'text', cb.content
          )
          WHEN 'prompt' THEN json_object(
            'id', p.id,
            'promptText', p.prompt_text,
            'inputType', p.input_type,
            'inputConfig', p.input_config
          )
          WHEN 'tool' THEN json_object(
            'id', t.id,
            'name', t.name,
            'description', t.description,
            'instructions', t.instructions
          )
        END as content_json
      FROM stem s
      LEFT JOIN content_blocks cb ON s.block_type = 'content' AND s.content_id = cb.id AND cb.is_active = 1
      LEFT JOIN prompts p ON s.block_type = 'prompt' AND s.content_id = p.id AND p.is_active = 1
      LEFT JOIN tools t ON s.block_type = 'tool' AND s.content_id = t.id AND t.is_active = 1
      WHERE s.part = ? AND s.module = ? AND s.exercise = ?
      ORDER BY s.sequence
    `)
    .bind(part, moduleNum, exercise)
    .all<StemRow>();

  if (!stemRows.results || stemRows.results.length === 0) {
    return null;
  }

  // Get title from first content block (usually a heading)
  let title = `Exercise ${exerciseId}`;
  const firstContent = stemRows.results.find(r => r.block_type === 'content');
  if (firstContent) {
    try {
      const content = JSON.parse(firstContent.content_json);
      if (content.type === 'heading') {
        title = content.text;
      }
    } catch {
      // Keep default title
    }
  }

  // Transform rows to blocks
  const blocks = stemRows.results.map((row) => {
    let content = {};
    try {
      content = JSON.parse(row.content_json);
      // Parse nested inputConfig if it's a string
      if (typeof (content as { inputConfig?: string }).inputConfig === 'string') {
        (content as { inputConfig: object }).inputConfig = JSON.parse((content as { inputConfig: string }).inputConfig);
      }
    } catch {
      content = {};
    }

    return {
      id: row.id,
      sequence: row.sequence,
      blockType: row.block_type as 'content' | 'prompt' | 'tool',
      activityId: row.activity,
      connectionId: row.connection_id,
      content,
    };
  });

  // Get next and previous exercise IDs
  const nextExercise = await db.raw
    .prepare(`
      SELECT DISTINCT part || '.' || module || '.' || exercise as exercise_id
      FROM stem
      WHERE (part > ? OR (part = ? AND module > ?) OR (part = ? AND module = ? AND exercise > ?))
        AND part <= 2
      ORDER BY part, module, exercise
      LIMIT 1
    `)
    .bind(part, part, moduleNum, part, moduleNum, exercise)
    .first<{ exercise_id: string }>();

  const prevExercise = await db.raw
    .prepare(`
      SELECT DISTINCT part || '.' || module || '.' || exercise as exercise_id
      FROM stem
      WHERE (part < ? OR (part = ? AND module < ?) OR (part = ? AND module = ? AND exercise < ?))
        AND part >= 1
      ORDER BY part DESC, module DESC, exercise DESC
      LIMIT 1
    `)
    .bind(part, part, moduleNum, part, moduleNum, exercise)
    .first<{ exercise_id: string }>();

  return {
    exerciseId,
    part,
    module: moduleNum,
    exercise,
    title,
    blocks,
    nextExerciseId: nextExercise?.exercise_id || null,
    prevExerciseId: prevExercise?.exercise_id || null,
  };
}

async function fetchSavedResponses(userId: string, exerciseId: string): Promise<SavedResponse[]> {
  const { env } = getRequestContext() as unknown as { env: Env };
  const db = createDb(env.DB);

  const responses = await db.raw
    .prepare(
      `SELECT id, prompt_id, exercise_id, activity_id, response_text, created_at, updated_at
       FROM user_responses
       WHERE user_id = ? AND exercise_id = ?
       ORDER BY created_at`
    )
    .bind(userId, exerciseId)
    .all<SavedResponse>();

  return responses.results || [];
}

export default async function WorkbookExercisePage({ params }: PageProps) {
  const { exerciseId } = await params;
  const { env } = getRequestContext() as unknown as { env: Env };

  // Get or create session
  const cookieStore = await cookies();
  const sessionId = getSessionIdFromCookie(cookieStore.toString());
  let sessionData = sessionId ? await getSessionData(env.DB, sessionId) : null;
  const headers = new Headers();

  // Create anonymous session if needed
  if (!sessionData) {
    sessionData = await createAnonymousSession(env.DB);
    headers.set('Set-Cookie', createSessionCookie(sessionData.session.id));
  }

  // Fetch exercise content
  const exercise = await fetchExercise(exerciseId);

  if (!exercise) {
    notFound();
  }

  // Fetch user's saved responses for this exercise
  const savedResponses = await fetchSavedResponses(sessionData.user.id, exerciseId);

  return <WorkbookView exercise={exercise} savedResponses={savedResponses} />;
}
