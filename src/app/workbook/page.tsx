/**
 * Workbook Page - Single Page Architecture
 *
 * The entire workbook is ONE page. Renders blocks 1..N+1
 * (completed + current) with hash navigation for bookmarking.
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getSessionData } from '@/lib/auth/session';
import { createDb } from '@/lib/db';
import { decryptPII } from '@/lib/auth/pii';
import { WorkbookClient } from './WorkbookClient';
import type { BlockWithResponse } from '@/components/workbook/types';
import type { BackgroundColorId, TextColorId, FontFamilyId } from '@/components/onboarding/types';

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

export default async function WorkbookPage() { // code_id:161
  // Get session from cookie
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('dt_session')?.value;

  if (!sessionId) {
    redirect('/login');
  }

  const { env } = await getCloudflareContext();
  const sessionData = await getSessionData(env.DB, sessionId);

  if (!sessionData) {
    redirect('/login');
  }

  const db = createDb(env.DB);
  const userId = sessionData.user.id;

  // Fetch user's theme settings and saved position (BUG-357)
  let theme = null;
  let savedSequence = 0;
  try {
    const settingsRow = await db.raw
      .prepare('SELECT background_color, text_color, font, current_sequence FROM user_settings WHERE user_id = ?')
      .bind(userId)
      .first<{ background_color: string; text_color: string; font: string; current_sequence: number | null }>();

    if (settingsRow) {
      theme = {
        backgroundColor: settingsRow.background_color as BackgroundColorId,
        textColor: settingsRow.text_color as TextColorId,
        font: settingsRow.font as FontFamilyId,
      };
      savedSequence = settingsRow.current_sequence || 0;
    }
  } catch (error) {
    console.error('Error fetching theme:', error);
  }

  // Find user's current progress (highest sequence with a response)
  // BUG-246 FIX: Add exercise_id match to prevent false matches when same tool appears multiple times
  // BUG-379 FIX: Add activity match to prevent false matches when same tool appears in different activities
  // Note: activity_id in user_responses is TEXT, s.activity in stem is INTEGER
  // Old responses have NULL activity_id - only match activity 1 for backwards compat (don't block 2/3)
  const progressResult = await db.raw
    .prepare(`
      SELECT MAX(s.sequence) as max_sequence
      FROM user_responses ur
      JOIN stem s ON (
        (ur.prompt_id IS NOT NULL AND s.block_type = 'prompt' AND s.content_id = ur.prompt_id)
        OR (ur.tool_id IS NOT NULL AND s.block_type = 'tool' AND s.content_id = ur.tool_id)
      )
      WHERE ur.user_id = ?
        AND ur.exercise_id = (s.part || '.' || s.module || '.' || s.exercise)
        AND (ur.activity_id = CAST(s.activity AS TEXT) OR (ur.activity_id IS NULL AND s.activity <= 1))
    `)
    .bind(userId)
    .first<{ max_sequence: number | null }>();

  const responseProgress = progressResult?.max_sequence || 0;

  // BUG-357: Use MAX of response progress and saved sequence position
  const progress = Math.max(responseProgress, savedSequence);

  // Get total blocks count
  const totalResult = await db.raw
    .prepare('SELECT MAX(sequence) as total FROM stem WHERE part <= 2')
    .first<{ total: number }>();
  const totalBlocks = totalResult?.total || 0;

  // Fetch blocks 1 through progress+1 (all completed + current)
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

  // Fetch all user responses
  // BUG-367 FIX: Include exercise_id in query to handle reused prompts/tools
  // BUG-379 FIX: Include activity_id for same tool in different activities
  const responses = await db.raw
    .prepare(`
      SELECT ur.id, ur.prompt_id, ur.tool_id, ur.exercise_id, ur.activity_id, ur.response_text
      FROM user_responses ur
      WHERE ur.user_id = ?
    `)
    .bind(userId)
    .all<{
      id: string;
      prompt_id: number | null;
      tool_id: number | null;
      exercise_id: string;
      activity_id: string | null;
      response_text: string;
    }>();

  // Build response maps with compound key (content_id + exercise_id + activity_id)
  // BUG-379 FIX: Include activity_id for same tool in different activities within same exercise
  // Old responses with NULL activity_id are mapped to activity "1" for backwards compatibility
  const promptResponses = new Map<string, { id: string; text: string }>();
  const toolResponses = new Map<string, { id: string; text: string }>();

  for (const r of responses.results || []) {
    // Old responses with NULL activity_id map to activity "1" (first activity)
    const activityKey = r.activity_id || '1';
    if (r.prompt_id) {
      const key = `${r.prompt_id}:${r.exercise_id}:${activityKey}`;
      promptResponses.set(key, { id: r.id, text: r.response_text });
    }
    if (r.tool_id) {
      const key = `${r.tool_id}:${r.exercise_id}:${activityKey}`;
      toolResponses.set(key, { id: r.id, text: r.response_text });
    }
  }

  // Transform and merge blocks with responses
  const blocks: BlockWithResponse[] = await Promise.all(
    (stemRows.results || []).map(async (row) => {
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
      // BUG-367 FIX: Use compound key (content_id + exercise_id) for lookup
      // BUG-379 FIX: Include activity for same tool in different activities
      if (row.block_type === 'prompt' && content.id) {
        const key = `${content.id}:${exerciseId}:${row.activity}`;
        const r = promptResponses.get(key);
        if (r) {
          response = r.text;
          responseId = r.id;
        }
      } else if (row.block_type === 'tool' && content.id) {
        const key = `${content.id}:${exerciseId}:${row.activity}`;
        const r = toolResponses.get(key);
        if (r) {
          response = r.text;
          responseId = r.id;
          // Decrypt PII if needed
          if (PII_TOOL_IDS.has(content.id)) {
            const decrypted = await decryptPII(env.DB, sessionId, r.text);
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

  return (
    <WorkbookClient
      initialBlocks={blocks}
      initialProgress={progress}
      theme={theme}
    />
  );
}
