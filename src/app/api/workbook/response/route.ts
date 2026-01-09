import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/lib/db';
import { getSessionIdFromCookie, getSessionData } from '@/lib/auth/session';
import { nanoid } from 'nanoid';
import '@/types/database'; // CloudflareEnv augmentation


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
        .bind(responseText, now, existing.id)
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
          .bind(responseId, userId, toolId, exerciseId, activityId || null, responseText, now, now)
          .run();
      } else {
        await db.raw
          .prepare(
            `INSERT INTO user_responses (id, user_id, prompt_id, tool_id, exercise_id, activity_id, response_text, created_at, updated_at)
             VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?)`
          )
          .bind(responseId, userId, promptId, exerciseId, activityId || null, responseText, now, now)
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
      .all();

    return NextResponse.json({
      exerciseId,
      responses: responses.results || [],
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}
