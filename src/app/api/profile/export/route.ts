/**
 * GET /api/profile/export
 * Export all user data for download.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getSessionData } from '@/lib/auth';
import '@/types/database'; // CloudflareEnv augmentation


export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('dt_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { env } = getCloudflareContext();
    const sessionData = await getSessionData(env.DB, sessionId);

    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const userId = sessionData.user.id;

    // Fetch all user data
    const [profile, settings, values, skills, responses, stories, experiences] = await Promise.all([
      env.DB.prepare('SELECT * FROM user_profile WHERE user_id = ?').bind(userId).first(),
      env.DB.prepare('SELECT * FROM user_settings WHERE user_id = ?').bind(userId).first(),
      env.DB.prepare('SELECT * FROM user_values WHERE user_id = ?').bind(userId).first(),
      env.DB.prepare('SELECT us.*, s.name as skill_name FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = ?').bind(userId).all(),
      env.DB.prepare('SELECT * FROM user_responses WHERE user_id = ?').bind(userId).all(),
      env.DB.prepare('SELECT * FROM user_stories WHERE user_id = ?').bind(userId).all(),
      env.DB.prepare('SELECT * FROM user_experiences WHERE user_id = ?').bind(userId).all(),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: profile || null,
      settings: settings || null,
      values: values || null,
      skills: skills.results || [],
      responses: responses.results || [],
      stories: stories.results || [],
      experiences: experiences.results || [],
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error exporting profile:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
