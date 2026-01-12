/**
 * Workbook API - Single page architecture
 *
 * GET: Fetch blocks 1..N+1 (completed + current) with responses merged
 * Returns incremental data for the single-page workbook
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { decryptPII } from '@/lib/auth/pii';

// Tool IDs that contain PII and should be decrypted
const PII_TOOL_IDS = new Set([
  100005, // budget_calculator
  100017, // company_tracker
  100020, // contact_tracker
]);

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

interface BlockWithResponse {
  id: number;
  sequence: number;
  exerciseId: string;
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
  response?: string | null;
  responseId?: string | null;
}

export const GET = withAuth(async (_request, { userId, db: rawDb, sessionId }) => {
  try {
    const db = createDb(rawDb);

    // Step 1: Find user's current progress (highest sequence with a response)
    const progressResult = await db.raw
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

    // Progress is the highest answered sequence, or 0 if no responses yet
    const progress = progressResult?.max_sequence || 0;

    // Step 2: Get total blocks count
    const totalResult = await db.raw
      .prepare('SELECT MAX(sequence) as total FROM stem WHERE part <= 2')
      .first<{ total: number }>();
    const totalBlocks = totalResult?.total || 0;

    // Step 3: Fetch blocks 1 through progress+1 (all completed + current)
    const targetSequence = Math.min(progress + 1, totalBlocks);

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
        WHERE s.sequence <= ? AND s.part <= 2
        ORDER BY s.sequence
      `)
      .bind(targetSequence)
      .all<StemRow>();

    if (!stemRows.results) {
      return NextResponse.json({ blocks: [], progress: 0, hasMore: false });
    }

    // Step 4: Fetch all user responses for these blocks
    const responses = await db.raw
      .prepare(`
        SELECT ur.id, ur.prompt_id, ur.tool_id, ur.response_text
        FROM user_responses ur
        WHERE ur.user_id = ?
      `)
      .bind(userId)
      .all<{
        id: string;
        prompt_id: number | null;
        tool_id: number | null;
        response_text: string;
      }>();

    // Build response maps
    const promptResponses = new Map<number, { id: string; text: string }>();
    const toolResponses = new Map<number, { id: string; text: string }>();

    for (const r of responses.results || []) {
      if (r.prompt_id) {
        promptResponses.set(r.prompt_id, { id: r.id, text: r.response_text });
      }
      if (r.tool_id) {
        toolResponses.set(r.tool_id, { id: r.id, text: r.response_text });
      }
    }

    // Step 5: Transform and merge blocks with responses
    const blocks: BlockWithResponse[] = await Promise.all(
      stemRows.results.map(async (row) => {
        let content: BlockWithResponse['content'] = {};
        try {
          content = JSON.parse(row.content_json);
          // Parse nested inputConfig if it's a string (from SQLite JSON)
          const contentAny = content as Record<string, unknown>;
          if (typeof contentAny.inputConfig === 'string') {
            contentAny.inputConfig = JSON.parse(contentAny.inputConfig);
          }
        } catch {
          content = {};
        }

        const exerciseId = `${row.part}.${row.module}.${row.exercise}`;
        let response: string | null = null;
        let responseId: string | null = null;

        // Get response based on block type
        if (row.block_type === 'prompt' && content.id) {
          const r = promptResponses.get(content.id);
          if (r) {
            response = r.text;
            responseId = r.id;
          }
        } else if (row.block_type === 'tool' && content.id) {
          const r = toolResponses.get(content.id);
          if (r) {
            response = r.text;
            responseId = r.id;
            // Decrypt PII if needed
            if (PII_TOOL_IDS.has(content.id)) {
              const decrypted = await decryptPII(rawDb, sessionId, r.text);
              if (decrypted) response = decrypted;
            }
          }
        }

        return {
          id: row.id,
          sequence: row.sequence,
          exerciseId,
          blockType: row.block_type as 'content' | 'prompt' | 'tool',
          activityId: row.activity,
          connectionId: row.connection_id,
          content,
          response,
          responseId,
        };
      })
    );

    return NextResponse.json({
      blocks,
      progress,
      hasMore: targetSequence < totalBlocks,
    });
  } catch (error) {
    console.error('Error fetching workbook:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workbook' },
      { status: 500 }
    );
  }
});
