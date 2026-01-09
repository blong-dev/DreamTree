'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, NavItemId } from '@/components/shell';
import {
  DataPolicyBanner,
  ProfileHeader,
  ProfileSection,
  SkillsList,
  RankedList,
  DataControls,
} from '@/components/profile';
import type { BackgroundColorId, FontFamilyId } from '@/components/dashboard';

interface ProfileApiResponse {
  profile: {
    displayName: string | null;
    headline: string | null;
    summary: string | null;
  };
  settings: {
    backgroundColor: string;
    textColor: string;
    font: string;
    personalityType: string | null;
  };
  skills: Array<{
    id: string;
    skillId: string;
    name: string;
    category: string | null;
    mastery: number | null;
    rank: number | null;
  }>;
  values: {
    workValues: string | null;
    lifeValues: string | null;
    compassStatement: string | null;
  };
}

interface SkillDisplay {
  id: string;
  name: string;
  mastery: number;
}

interface RankedItem {
  id: string;
  name: string;
  rank: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeNavItem, setActiveNavItem] = useState<NavItemId>('profile');
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('User');
  const [backgroundColor, setBackgroundColor] = useState<BackgroundColorId>('ivory');
  const [font, setFont] = useState<FontFamilyId>('inter');
  const [skills, setSkills] = useState<SkillDisplay[]>([]);
  const [values, setValues] = useState<RankedItem[]>([]);

  // Fetch profile data from API
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data: ProfileApiResponse = await response.json();

        // Set profile data
        setDisplayName(data.profile.displayName || 'User');
        setBackgroundColor((data.settings.backgroundColor || 'ivory') as BackgroundColorId);
        setFont((data.settings.font || 'inter') as FontFamilyId);

        // Transform skills for display
        const transformedSkills: SkillDisplay[] = data.skills.map((s) => ({
          id: s.id,
          name: s.name,
          mastery: s.mastery || 3,
        }));
        setSkills(transformedSkills);

        // Parse values from JSON strings if available
        if (data.values.workValues) {
          try {
            const parsedValues = JSON.parse(data.values.workValues);
            if (Array.isArray(parsedValues)) {
              const transformedValues: RankedItem[] = parsedValues.map((v: { id?: string; name?: string; value?: string }, i: number) => ({
                id: v.id || `v-${i}`,
                name: v.name || v.value || String(v),
                rank: i + 1,
              }));
              setValues(transformedValues);
            }
          } catch {
            // Values not in JSON format, skip
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleNavigate = useCallback(
    (id: NavItemId) => {
      setActiveNavItem(id);
      if (id === 'home') {
        router.push('/');
      } else if (id === 'tools') {
        router.push('/tools');
      }
    },
    [router]
  );

  const handleDownloadData = async () => {
    try {
      const response = await fetch('/api/profile/export');
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      const allData = await response.json();

      const blob = new Blob([JSON.stringify(allData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dreamtree-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading data:', error);
    }
  };

  const handleDeleteData = async () => {
    if (
      confirm(
        'Are you sure you want to delete all your data? This cannot be undone.'
      )
    ) {
      try {
        // Logout and delete data
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
      } catch (error) {
        console.error('Error deleting data:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="onboarding-flow">
        <div className="onboarding-content" />
      </div>
    );
  }

  return (
    <AppShell
      activeNavItem={activeNavItem}
      onNavigate={handleNavigate}
      showBreadcrumb={false}
      showInput={false}
    >
      <div className="profile-page">
        <DataPolicyBanner />

        <ProfileHeader
          name={displayName}
          backgroundColor={backgroundColor}
          fontFamily={font}
        />

        <ProfileSection title="Top Skills">
          {skills.length > 0 ? (
            <SkillsList skills={skills} />
          ) : (
            <p className="profile-placeholder">
              Complete skill-related exercises to see your skills here.
            </p>
          )}
        </ProfileSection>

        <ProfileSection title="Values">
          {values.length > 0 ? (
            <RankedList items={values} />
          ) : (
            <p className="profile-placeholder">
              Complete values exercises to see your ranked values here.
            </p>
          )}
        </ProfileSection>

        <ProfileSection title="Interests" lockedUntil="Part 2 > Module 1">
          <p className="profile-placeholder">
            Complete more exercises to unlock interest insights.
          </p>
        </ProfileSection>

        <ProfileSection title="Career Paths" lockedUntil="Part 3 > Module 2">
          <p className="profile-placeholder">
            Complete more exercises to unlock career insights.
          </p>
        </ProfileSection>

        <DataControls
          onDownload={handleDownloadData}
          onDelete={handleDeleteData}
        />
      </div>
    </AppShell>
  );
}
