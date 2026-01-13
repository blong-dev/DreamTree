/**
 * Workbook response API routes
 *
 * B2: Standardized to use withAuth pattern (AUDIT-001)
 * Single Page Architecture: POST returns next block after save
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { encryptPII, decryptPII } from '@/lib/auth/pii';
import { validateToolData } from '@/lib/validation';
import { nanoid } from 'nanoid';
import '@/types/database'; // CloudflareEnv augmentation

// Tool IDs that contain PII and should be encrypted (IMP-048 Phase 2)
const PII_TOOL_IDS = new Set([
  100005, // budget_calculator (monthly_expenses, annual_needs, hourly_batna)
  100017, // company_tracker (company details)
  100020, // contact_tracker (name, email, phone, etc.)
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

interface SaveResponseRequest {
  promptId?: number;
  toolId?: number;
  exerciseId: string;
  activityId?: string;
  responseText: string;
}

export const POST = withAuth(async (request, { userId, db: rawDb, sessionId }) => {
  try {
    const db = createDb(rawDb);

    // Parse request body
    const body: SaveResponseRequest = await request.json();
    const { promptId, toolId, exerciseId, activityId, responseText } = body;

    // Validate: must have exactly one of promptId or toolId
    if ((!promptId && !toolId) || (promptId && toolId)) {
      return NextResponse.json(
        { error: 'Must provide exactly one of promptId or toolId' },
        { status: 400 }
      );
    }

    if (!exerciseId || responseText === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: exerciseId, responseText' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const responseId = nanoid();

    // Determine which column to use for lookup and insert
    const isToolResponse = !!toolId;
    const contentId = toolId || promptId;
    const idColumn = isToolResponse ? 'tool_id' : 'prompt_id';

    // Validate tool response data (IMP-043)
    if (isToolResponse && toolId) {
      // Look up tool name
      const toolRow = await db.raw
        .prepare('SELECT name FROM tools WHERE id = ?')
        .bind(toolId)
        .first<{ name: string }>();

      if (toolRow?.name) {
        try {
          const parsedData = JSON.parse(responseText);
          const validation = validateToolData(toolRow.name, parsedData);
          if (!validation.valid) {
            return NextResponse.json(
              { error: `Invalid tool data: ${validation.error}` },
              { status: 400 }
            );
          }
        } catch {
          return NextResponse.json(
            { error: 'Invalid JSON in responseText' },
            { status: 400 }
          );
        }
      }
    }

    // Encrypt response for PII tools (IMP-048 Phase 2)
    let textToStore = responseText;
    if (isToolResponse && toolId && PII_TOOL_IDS.has(toolId)) {
      const encrypted = await encryptPII(rawDb, sessionId, responseText);
      if (encrypted) {
        textToStore = encrypted;
      }
    }

    // BUG-379 FIX: Include activity_id in check to differentiate same tool in different activities
    // Check if response already exists for this user/content/exercise/activity
    const existing = await db.raw
      .prepare(
        `SELECT id FROM user_responses
         WHERE user_id = ? AND ${idColumn} = ? AND exercise_id = ?
         AND (activity_id = ? OR (activity_id IS NULL AND ? IS NULL))`
      )
      .bind(userId, contentId, exerciseId, activityId || null, activityId || null)
      .first<{ id: string }>();

    let finalResponseId: string;

    if (existing) {
      // Update existing response
      await db.raw
        .prepare(
          `UPDATE user_responses
           SET response_text = ?, updated_at = ?
           WHERE id = ?`
        )
        .bind(textToStore, now, existing.id)
        .run();

      finalResponseId = existing.id;
    } else {
      // Insert new response with correct column
      if (isToolResponse) {
        await db.raw
          .prepare(
            `INSERT INTO user_responses (id, user_id, prompt_id, tool_id, exercise_id, activity_id, response_text, created_at, updated_at)
             VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?)`
          )
          .bind(responseId, userId, toolId, exerciseId, activityId || null, textToStore, now, now)
          .run();
      } else {
        await db.raw
          .prepare(
            `INSERT INTO user_responses (id, user_id, prompt_id, tool_id, exercise_id, activity_id, response_text, created_at, updated_at)
             VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?)`
          )
          .bind(responseId, userId, promptId, exerciseId, activityId || null, textToStore, now, now)
          .run();
      }

      finalResponseId = responseId;
    }

    // Find the sequence of the block that was just answered
    // BUG-367 FIX: Include exercise_id match to handle reused prompts/tools
    // BUG-379 FIX: Include activity match for same tool in different activities
    const [partStr, moduleStr, exerciseStr] = exerciseId.split('.');
    const activityNum = activityId ? parseInt(activityId, 10) : null;
    const currentBlockResult = await db.raw
      .prepare(`
        SELECT sequence FROM stem
        WHERE block_type = ? AND content_id = ?
          AND part = ? AND module = ? AND exercise = ?
          ${activityNum !== null ? 'AND activity = ?' : ''}
          AND part <= 2
        LIMIT 1
      `)
      .bind(
        ...[
          isToolResponse ? 'tool' : 'prompt',
          contentId,
          parseInt(partStr, 10),
          parseInt(moduleStr, 10),
          parseInt(exerciseStr, 10),
          ...(activityNum !== null ? [activityNum] : []),
        ]
      )
      .first<{ sequence: number }>();

    const currentSequence = currentBlockResult?.sequence || 0;

    // Get total blocks count
    const totalResult = await db.raw
      .prepare('SELECT MAX(sequence) as total FROM stem WHERE part <= 2')
      .first<{ total: number }>();
    const totalBlocks = totalResult?.total || 0;

    // If there's a next block, fetch it
    let nextBlock: BlockWithResponse | null = null;
    const nextSequence = currentSequence + 1;

    if (nextSequence <= totalBlocks) {
      const nextStemRow = await db.raw
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
          WHERE s.sequence = ? AND s.part <= 2
        `)
        .bind(nextSequence)
        .first<StemRow>();

      if (nextStemRow) {
        let content: BlockWithResponse['content'] = {};
        try {
          content = JSON.parse(nextStemRow.content_json);
          // Parse nested inputConfig if it's a string (from SQLite JSON)
          const contentAny = content as Record<string, unknown>;
          if (typeof contentAny.inputConfig === 'string') {
            contentAny.inputConfig = JSON.parse(contentAny.inputConfig);
          }
        } catch {
          content = {};
        }

        const nextExerciseId = `${nextStemRow.part}.${nextStemRow.module}.${nextStemRow.exercise}`;

        nextBlock = {
          id: nextStemRow.id,
          sequence: nextStemRow.sequence,
          exerciseId: nextExerciseId,
          blockType: nextStemRow.block_type as 'content' | 'prompt' | 'tool',
          activityId: nextStemRow.activity,
          connectionId: nextStemRow.connection_id,
          content,
          response: null,
          responseId: null,
        };
      }
    }

    return NextResponse.json({
      id: finalResponseId,
      updated: !!existing,
      newProgress: currentSequence,
      nextBlock,
      hasMore: nextSequence < totalBlocks,
    });
  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json(
      { error: 'Failed to save response' },
      { status: 500 }
    );
  }
});

// PUT endpoint to update an existing response
// BUG-404: Extended to support toolId for tool editing
export const PUT = withAuth(async (request, { userId, db: rawDb, sessionId }) => {
  try {
    const db = createDb(rawDb);

    // Parse request body
    const body: SaveResponseRequest = await request.json();
    const { promptId, toolId, exerciseId, activityId, responseText } = body;

    // Validate: must have exactly one of promptId or toolId
    if ((!promptId && !toolId) || (promptId && toolId)) {
      return NextResponse.json(
        { error: 'Must provide exactly one of promptId or toolId' },
        { status: 400 }
      );
    }

    if (!exerciseId || responseText === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: exerciseId, responseText' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const isToolResponse = !!toolId;
    const contentId = toolId || promptId;
    const idColumn = isToolResponse ? 'tool_id' : 'prompt_id';

    // Validate tool response data (IMP-043)
    if (isToolResponse && toolId) {
      const toolRow = await db.raw
        .prepare('SELECT name FROM tools WHERE id = ?')
        .bind(toolId)
        .first<{ name: string }>();

      if (toolRow?.name) {
        try {
          const parsedData = JSON.parse(responseText);
          const validation = validateToolData(toolRow.name, parsedData);
          if (!validation.valid) {
            return NextResponse.json(
              { error: `Invalid tool data: ${validation.error}` },
              { status: 400 }
            );
          }
        } catch {
          return NextResponse.json(
            { error: 'Invalid JSON in responseText' },
            { status: 400 }
          );
        }
      }
    }

    // Encrypt response for PII tools (IMP-048 Phase 2)
    let textToStore = responseText;
    if (isToolResponse && toolId && PII_TOOL_IDS.has(toolId)) {
      const encrypted = await encryptPII(rawDb, sessionId, responseText);
      if (encrypted) {
        textToStore = encrypted;
      }
    }

    // Check if response exists (include activityId in check for tools)
    const existing = await db.raw
      .prepare(
        `SELECT id FROM user_responses
         WHERE user_id = ? AND ${idColumn} = ? AND exercise_id = ?
         AND (activity_id = ? OR (activity_id IS NULL AND ? IS NULL))`
      )
      .bind(userId, contentId, exerciseId, activityId || null, activityId || null)
      .first<{ id: string }>();

    if (!existing) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      );
    }

    // Update existing response
    await db.raw
      .prepare(
        `UPDATE user_responses
         SET response_text = ?, updated_at = ?
         WHERE id = ?`
      )
      .bind(textToStore, now, existing.id)
      .run();

    return NextResponse.json({
      id: existing.id,
      updated: true,
    });
  } catch (error) {
    console.error('Error updating response:', error);
    return NextResponse.json(
      { error: 'Failed to update response' },
      { status: 500 }
    );
  }
});

// GET endpoint to fetch previous responses for an exercise
export const GET = withAuth(async (request, { userId, db: rawDb, sessionId }) => {
  try {
    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get('exerciseId');

    if (!exerciseId) {
      return NextResponse.json(
        { error: 'Missing exerciseId parameter' },
        { status: 400 }
      );
    }

    const db = createDb(rawDb);
    const responses = await db.raw
      .prepare(
        `SELECT id, prompt_id, tool_id, exercise_id, activity_id, response_text, created_at, updated_at
         FROM user_responses
         WHERE user_id = ? AND exercise_id = ?
         ORDER BY created_at`
      )
      .bind(userId, exerciseId)
      .all<{
        id: string;
        prompt_id: number | null;
        tool_id: number | null;
        exercise_id: string;
        activity_id: string | null;
        response_text: string;
        created_at: string;
        updated_at: string;
      }>();

    // Decrypt PII tool responses (IMP-048 Phase 2)
    const decryptedResponses = await Promise.all(
      (responses.results || []).map(async (response) => {
        if (response.tool_id && PII_TOOL_IDS.has(response.tool_id)) {
          const decrypted = await decryptPII(rawDb, sessionId, response.response_text);
          return { ...response, response_text: decrypted || response.response_text };
        }
        return response;
      })
    );

    return NextResponse.json({
      exerciseId,
      responses: decryptedResponses,
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
});
