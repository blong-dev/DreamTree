import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/lib/db';
import '@/types/database'; // CloudflareEnv augmentation


export async function GET() { // code_id:137
  try {
    const { env } = getCloudflareContext();
    const db = createDb(env.DB);

    // Fetch all skills from the database using raw query
    const result = await db.raw
      .prepare(
        `SELECT id, name, category
         FROM skills
         WHERE is_custom = 0 OR review_status = 'approved'
         ORDER BY category, name`
      )
      .all();

    const skills = (result.results || []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      name: row.name as string,
      category: row.category as string,
      mastery: 0, // Default mastery - will be overridden by user data
    }));

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
