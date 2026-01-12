import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getSessionData } from '@/lib/auth';
import { AppShell } from '@/components/shell';
import { SkillsPage } from '@/components/skills';
import '@/types/database';

interface SkillRow {
  id: string;
  name: string;
  category: string;
}

interface UserSkillRow {
  skill_id: string;
}

export default async function SkillsRoute() { // code_id:151
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('dt_session')?.value;

  if (!sessionId) {
    redirect('/login');
  }

  const { env } = getCloudflareContext();
  const sessionData = await getSessionData(env.DB, sessionId);

  if (!sessionData) {
    redirect('/login');
  }

  const userId = sessionData.user.id;

  // Fetch all skills
  const skillsResult = await env.DB
    .prepare(
      `SELECT id, name, category
       FROM skills
       WHERE is_custom = 0 OR review_status = 'approved'
       ORDER BY category, name`
    )
    .all<SkillRow>();

  const skills = (skillsResult.results || []).map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category as 'transferable' | 'self_management' | 'knowledge',
  }));

  // Fetch user's tagged skill IDs
  const userSkillsResult = await env.DB
    .prepare('SELECT skill_id FROM user_skills WHERE user_id = ?')
    .bind(userId)
    .all<UserSkillRow>();

  const userSkillIds = (userSkillsResult.results || []).map((row) => row.skill_id);

  return (
    <AppShell showInput={false}>
      <SkillsPage skills={skills} userSkillIds={userSkillIds} />
    </AppShell>
  );
}
