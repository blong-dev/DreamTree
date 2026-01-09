import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDb } from '@/lib/db';
import type { Env } from '@/types/database';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = getRequestContext() as unknown as { env: Env };
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
