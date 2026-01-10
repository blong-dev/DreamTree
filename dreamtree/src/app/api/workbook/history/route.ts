/**
 * B2: Standardized to use withAuth pattern (AUDIT-001)
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import '@/types/database';

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
  exercise_id: string;
}

interface UserResponse {
  prompt_id: number | null;
  tool_id: number | null;
  response_text: string;
  updated_at: string;
}

interface HistoryBlock {
  id: number;
  sequence: number;
  blockType: 'content' | 'prompt' | 'tool';
  activityId: number;
  connectionId: number | null;
  exerciseId: string;
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
  userResponse?: string;
}

interface HistoryResponse {
  blocks: HistoryBlock[];
  pagination: {
    fromSequence: number;
    toSequence: number;
    hasMore: boolean;
    hasPrevious: boolean;
    totalBlocks: number;
  };
  exerciseBoundaries: Array<{
    exerciseId: string;
    startSequence: number;
    title: string;
  }>;
}

/**
 * GET /api/workbook/history
 *
 * Fetches paginated workbook content history with user responses.
 * Used for infinite scroll through completed exercises.
 *
 * Query params:
 * - fromSequence: Start sequence number (default: 1)
 * - toSequence: End sequence number (default: fromSequence + 50)
 * - direction: 'forward' | 'backward' (for bidirectional loading)
 */
export const GET = withAuth(async (request, { userId, db: rawDb }) => {
  try {
    const db = createDb(rawDb);

    // Parse query params
    const { searchParams } = new URL(request.url);
    const fromSequence = parseInt(searchParams.get('fromSequence') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100); // Max 100 blocks
    const toSequence = parseInt(searchParams.get('toSequence') || String(fromSequence + limit - 1), 10);

    // Get user's max completed sequence (for limiting what we return)
    const maxProgress = await db.raw
      .prepare(`
        SELECT MAX(s.sequence) as max_sequence
        FROM user_responses ur
        JOIN stem s ON (
          (ur.prompt_id IS NOT NULL AND s.block_type = 'prompt' AND s.content_id = ur.prompt_id)
          OR (ur.tool_id IS NOT NULL AND s.block_type = 'tool' AND s.content_id = ur.tool_id)
        )
        WHERE ur.user_id = ?
      `)
      .bind(userId)
      .first<{ max_sequence: number | null }>();

    // Get total block count up to user's progress
    const totalCount = await db.raw
      .prepare(`
        SELECT COUNT(*) as count
        FROM stem
        WHERE sequence <= ?
      `)
      .bind(maxProgress?.max_sequence || 0)
      .first<{ count: number }>();

    // Fetch stem rows with content for the requested range
    // Only return blocks up to user's progress
    const effectiveToSequence = Math.min(
      toSequence,
      (maxProgress?.max_sequence || 0) + 10 // Allow a few blocks ahead for current exercise
    );

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
          s.part || '.' || s.module || '.' || s.exercise as exercise_id,
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
        WHERE s.sequence >= ? AND s.sequence <= ?
        ORDER BY s.sequence
      `)
      .bind(fromSequence, effectiveToSequence)
      .all<StemRow>();

    if (!stemRows.results) {
      return NextResponse.json({
        blocks: [],
        pagination: {
          fromSequence,
          toSequence: effectiveToSequence,
          hasMore: false,
          hasPrevious: fromSequence > 1,
          totalBlocks: totalCount?.count || 0,
        },
        exerciseBoundaries: [],
      });
    }

    // Get exercise IDs in this range for fetching responses
    const exerciseIds = [...new Set(stemRows.results.map(r => r.exercise_id))];

    // Fetch user responses for these exercises
    const responsePlaceholders = exerciseIds.map(() => '?').join(',');
    const responses = exerciseIds.length > 0
      ? await db.raw
          .prepare(`
            SELECT prompt_id, tool_id, exercise_id, response_text, updated_at
            FROM user_responses
            WHERE user_id = ? AND exercise_id IN (${responsePlaceholders})
          `)
          .bind(userId, ...exerciseIds)
          .all<UserResponse & { exercise_id: string }>()
      : { results: [] };

    // Create response lookup map
    const responseMap = new Map<string, string>();
    if (responses.results) {
      for (const r of responses.results) {
        if (r.prompt_id) {
          responseMap.set(`prompt-${r.prompt_id}-${r.exercise_id}`, r.response_text);
        }
        if (r.tool_id) {
          responseMap.set(`tool-${r.tool_id}-${r.exercise_id}`, r.response_text);
        }
      }
    }

    // Transform to blocks with responses
    const blocks: HistoryBlock[] = stemRows.results.map((row) => {
      let content = {};
      try {
        content = JSON.parse(row.content_json);
        if (typeof (content as { inputConfig?: string }).inputConfig === 'string') {
          (content as { inputConfig: object }).inputConfig = JSON.parse(
            (content as { inputConfig: string }).inputConfig
          );
        }
      } catch {
        content = {};
      }

      // Look up user response
      let userResponse: string | undefined;
      if (row.block_type === 'prompt') {
        userResponse = responseMap.get(`prompt-${row.content_id}-${row.exercise_id}`);
      } else if (row.block_type === 'tool') {
        userResponse = responseMap.get(`tool-${row.content_id}-${row.exercise_id}`);
      }

      return {
        id: row.id,
        sequence: row.sequence,
        blockType: row.block_type as 'content' | 'prompt' | 'tool',
        activityId: row.activity,
        connectionId: row.connection_id,
        exerciseId: row.exercise_id,
        content,
        userResponse,
      };
    });

    // Extract exercise boundaries (first block of each exercise)
    const seenExercises = new Set<string>();
    const exerciseBoundaries: Array<{ exerciseId: string; startSequence: number; title: string }> = [];

    for (const block of blocks) {
      if (!seenExercises.has(block.exerciseId)) {
        seenExercises.add(block.exerciseId);
        // Try to get title from first content block
        let title = `Exercise ${block.exerciseId}`;
        if (block.blockType === 'content' && block.content.type === 'heading') {
          title = block.content.text || title;
        }
        exerciseBoundaries.push({
          exerciseId: block.exerciseId,
          startSequence: block.sequence,
          title,
        });
      }
    }

    // Check if there are more blocks
    const lastSequence = blocks.length > 0 ? blocks[blocks.length - 1].sequence : effectiveToSequence;
    const hasMore = lastSequence < (maxProgress?.max_sequence || 0);
    const hasPrevious = fromSequence > 1;

    const response: HistoryResponse = {
      blocks,
      pagination: {
        fromSequence,
        toSequence: lastSequence,
        hasMore,
        hasPrevious,
        totalBlocks: totalCount?.count || 0,
      },
      exerciseBoundaries,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
});
