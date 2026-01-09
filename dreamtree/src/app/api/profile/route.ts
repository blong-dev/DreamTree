/**
 * GET /api/profile
 * Fetch user profile data including settings, skills, and values.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getSessionData } from '@/lib/auth';
import type { Env } from '@/types/database';

export const runtime = 'edge';

interface UserProfile {
  displayName: string | null;
  headline: string | null;
  summary: string | null;
}

interface UserSettings {
  backgroundColor: string;
  textColor: string;
  font: string;
  personalityType: string | null;
}

interface UserSkill {
  id: string;
  skillId: string;
  name: string;
  category: string | null;
  mastery: number | null;
  rank: number | null;
}

interface UserValue {
  workValues: string | null;
  lifeValues: string | null;
  compassStatement: string | null;
}

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('dt_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { env } = getRequestContext() as unknown as { env: Env };
    const sessionData = await getSessionData(env.DB, sessionId);

    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const userId = sessionData.user.id;

    // Fetch profile
    const profile = await env.DB
      .prepare('SELECT display_name, headline, summary FROM user_profile WHERE user_id = ?')
      .bind(userId)
      .first<{ display_name: string | null; headline: string | null; summary: string | null }>();

    // Fetch settings
    const settings = await env.DB
      .prepare('SELECT background_color, text_color, font, personality_type FROM user_settings WHERE user_id = ?')
      .bind(userId)
      .first<{ background_color: string; text_color: string; font: string; personality_type: string | null }>();

    // Fetch skills with skill names (join with skills table)
    const skillsResult = await env.DB
      .prepare(`
        SELECT us.id, us.skill_id, s.name, us.category, us.mastery, us.rank
        FROM user_skills us
        JOIN skills s ON us.skill_id = s.id
        WHERE us.user_id = ?
        ORDER BY us.mastery DESC, us.rank ASC
        LIMIT 10
      `)
      .bind(userId)
      .all<{ id: string; skill_id: string; name: string; category: string | null; mastery: number | null; rank: number | null }>();

    // Fetch values
    const values = await env.DB
      .prepare('SELECT work_values, life_values, compass_statement FROM user_values WHERE user_id = ?')
      .bind(userId)
      .first<{ work_values: string | null; life_values: string | null; compass_statement: string | null }>();

    const profileData: UserProfile = {
      displayName: profile?.display_name || null,
      headline: profile?.headline || null,
      summary: profile?.summary || null,
    };

    const settingsData: UserSettings = {
      backgroundColor: settings?.background_color || 'ivory',
      textColor: settings?.text_color || 'charcoal',
      font: settings?.font || 'inter',
      personalityType: settings?.personality_type || null,
    };

    const skillsData: UserSkill[] = (skillsResult.results || []).map(s => ({
      id: s.id,
      skillId: s.skill_id,
      name: s.name,
      category: s.category,
      mastery: s.mastery,
      rank: s.rank,
    }));

    const valuesData: UserValue = {
      workValues: values?.work_values || null,
      lifeValues: values?.life_values || null,
      compassStatement: values?.compass_statement || null,
    };

    return NextResponse.json({
      profile: profileData,
      settings: settingsData,
      skills: skillsData,
      values: valuesData,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
