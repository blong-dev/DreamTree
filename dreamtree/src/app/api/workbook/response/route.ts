import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/lib/db';
import { getSessionIdFromCookie, getSessionData } from '@/lib/auth/session';
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


interface SaveResponseRequest {
  promptId?: number;
  toolId?: number;
  exerciseId: string;
  activityId?: string;
  responseText: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get session
    const cookieHeader = request.headers.get('cookie');
    const sessionId = getSessionIdFromCookie(cookieHeader);

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { env } = getCloudflareContext();
    const db = createDb(env.DB);

    const sessionData = await getSessionData(env.DB, sessionId);
    if (!sessionData) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const userId = sessionData.user.id;

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
      const encrypted = await encryptPII(env.DB, sessionId, responseText);
      if (encrypted) {
        textToStore = encrypted;
      }
    }

    // Check if response already exists for this user/content/exercise
    const existing = await db.raw
      .prepare(
        `SELECT id FROM user_responses
         WHERE user_id = ? AND ${idColumn} = ? AND exercise_id = ?`
      )
      .bind(userId, contentId, exerciseId)
      .first<{ id: string }>();

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

      return NextResponse.json({
        id: existing.id,
        updated: true,
      });
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

      return NextResponse.json({
        id: responseId,
        updated: false,
      });
    }
  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json(
      { error: 'Failed to save response' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update an existing response
export async function PUT(request: NextRequest) {
  try {
    // Get session
    const cookieHeader = request.headers.get('cookie');
    const sessionId = getSessionIdFromCookie(cookieHeader);

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { env } = getCloudflareContext();
    const db = createDb(env.DB);

    const sessionData = await getSessionData(env.DB, sessionId);
    if (!sessionData) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const userId = sessionData.user.id;

    // Parse request body
    const body: SaveResponseRequest = await request.json();
    const { promptId, exerciseId, responseText } = body;

    if (!promptId || !exerciseId || responseText === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: promptId, exerciseId, responseText' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Check if response exists
    const existing = await db.raw
      .prepare(
        `SELECT id FROM user_responses
         WHERE user_id = ? AND prompt_id = ? AND exercise_id = ?`
      )
      .bind(userId, promptId, exerciseId)
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
      .bind(responseText, now, existing.id)
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
}

// GET endpoint to fetch previous responses for an exercise
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

    const { env } = getCloudflareContext();
    const sessionData = await getSessionData(env.DB, sessionId);

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const userId = sessionData.user.id;
    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get('exerciseId');

    if (!exerciseId) {
      return NextResponse.json(
        { error: 'Missing exerciseId parameter' },
        { status: 400 }
      );
    }

    const db = createDb(env.DB);
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
          const decrypted = await decryptPII(env.DB, sessionId, response.response_text);
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
}
