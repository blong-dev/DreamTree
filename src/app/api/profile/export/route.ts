/**
 * GET /api/profile/export
 * Export all user data for download.
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (_request, { userId, db }) => {
  try {
    // Fetch all user data
    const [profile, settings, values, skills, responses, stories, experiences] = await Promise.all([
      db.prepare('SELECT * FROM user_profile WHERE user_id = ?').bind(userId).first(),
      db.prepare('SELECT * FROM user_settings WHERE user_id = ?').bind(userId).first(),
      db.prepare('SELECT * FROM user_values WHERE user_id = ?').bind(userId).first(),
      db.prepare('SELECT us.*, s.name as skill_name FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = ?').bind(userId).all(),
      db.prepare('SELECT * FROM user_responses WHERE user_id = ?').bind(userId).all(),
      db.prepare('SELECT * FROM user_stories WHERE user_id = ?').bind(userId).all(),
      db.prepare('SELECT * FROM user_experiences WHERE user_id = ?').bind(userId).all(),
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
});
