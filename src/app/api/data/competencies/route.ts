import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/lib/db';
import '@/types/database'; // CloudflareEnv augmentation


export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const db = createDb(env.DB);

    // Use the built-in getAllCompetencies method
    const competencies = await db.getAllCompetencies();

    return NextResponse.json({ competencies });
  } catch (error) {
    console.error('Error fetching competencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competencies' },
      { status: 500 }
    );
  }
}
