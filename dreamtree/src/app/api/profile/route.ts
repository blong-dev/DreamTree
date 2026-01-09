/**
 * GET /api/profile
 * Fetch user profile data including settings, skills, and values.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getSessionData } from '@/lib/auth';
import '@/types/database'; // CloudflareEnv augmentation


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

    const { env } = getCloudflareContext();
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

/**
 * PATCH /api/profile
 * Update user settings (appearance: background_color, text_color, font)
 */
export async function PATCH(request: NextRequest) {
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
    const body = await request.json();
    const { backgroundColor, textColor, font } = body;

    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (backgroundColor !== undefined) {
      updates.push('background_color = ?');
      values.push(backgroundColor);
    }
    if (textColor !== undefined) {
      updates.push('text_color = ?');
      values.push(textColor);
    }
    if (font !== undefined) {
      updates.push('font = ?');
      values.push(font);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Add userId for WHERE clause
    values.push(userId);

    await env.DB
      .prepare(`UPDATE user_settings SET ${updates.join(', ')} WHERE user_id = ?`)
      .bind(...values)
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile
 * Delete user account and all associated data.
 * All related tables have ON DELETE CASCADE, so deleting from users table
 * will cascade to: auth, emails, sessions, user_settings, user_modules,
 * user_profile, user_values, user_skills, user_experiences, user_stories,
 * user_locations, user_career_options, user_budget, user_flow_logs,
 * user_companies, user_contacts, user_jobs, user_idea_nodes, user_idea_trees,
 * user_competency_scores, user_responses, user_lists, user_checklists
 */
export async function DELETE() {
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

    // Delete user - cascades to all related tables
    await env.DB
      .prepare('DELETE FROM users WHERE id = ?')
      .bind(userId)
      .run();

    // Clear session cookie
    cookieStore.delete('dt_session');

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
