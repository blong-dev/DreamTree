import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDb } from '@/lib/db';
import type { Env } from '@/types/database';

export const runtime = 'edge';

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

interface ExerciseBlock {
  id: number;
  sequence: number;
  blockType: 'content' | 'prompt' | 'tool';
  activityId: number;
  connectionId: number | null;
  content: {
    id?: number;
    type?: string;
    text?: string;
    promptText?: string;
    inputType?: string;
    inputConfig?: object;
    name?: string;
    description?: string;
    instructions?: string;
  };
}

interface ExerciseContent {
  exerciseId: string;
  part: number;
  module: number;
  exercise: number;
  title: string;
  blocks: ExerciseBlock[];
  nextExerciseId: string | null;
  prevExerciseId: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  try {
    const { exerciseId } = await params;

    // Parse exercise ID (format: "1.1.1" or "1.1.1.v1")
    const parts = exerciseId.split('.');
    if (parts.length < 3) {
      return NextResponse.json(
        { error: 'Invalid exercise ID format. Expected: part.module.exercise (e.g., 1.1.1)' },
        { status: 400 }
      );
    }

    const [partStr, moduleStr, exerciseStr] = parts;
    const part = parseInt(partStr, 10);
    const module = parseInt(moduleStr, 10);
    const exercise = parseInt(exerciseStr, 10);

    if (isNaN(part) || isNaN(module) || isNaN(exercise)) {
      return NextResponse.json(
        { error: 'Invalid exercise ID. All parts must be numbers.' },
        { status: 400 }
      );
    }

    // Get D1 database
    const { env } = getRequestContext() as unknown as { env: Env };
    const db = createDb(env.DB);

    // Fetch all stem rows for this exercise with content joined
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
      .bind(part, module, exercise)
      .all<StemRow>();

    if (!stemRows.results || stemRows.results.length === 0) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    // Get exercise title from first content block (usually a heading)
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

    // Transform stem rows to blocks
    const blocks: ExerciseBlock[] = stemRows.results.map((row) => {
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
      .bind(part, part, module, part, module, exercise)
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
      .bind(part, part, module, part, module, exercise)
      .first<{ exercise_id: string }>();

    const response: ExerciseContent = {
      exerciseId,
      part,
      module,
      exercise,
      title,
      blocks,
      nextExerciseId: nextExercise?.exercise_id || null,
      prevExerciseId: prevExercise?.exercise_id || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercise content' },
      { status: 500 }
    );
  }
}
