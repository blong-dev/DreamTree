'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { OnboardingData, BackgroundColorId, FontFamilyId } from '@/components/onboarding';

// Mock data for development
const MOCK_SKILLS = [
  { id: '1', name: 'Communication', mastery: 4 },
  { id: '2', name: 'Problem Solving', mastery: 5 },
  { id: '3', name: 'Leadership', mastery: 3 },
  { id: '4', name: 'Time Management', mastery: 4 },
  { id: '5', name: 'Project Management', mastery: 3 },
];

const MOCK_VALUES = [
  { id: 'v1', name: 'Creativity', rank: 1 },
  { id: 'v2', name: 'Independence', rank: 2 },
  { id: 'v3', name: 'Growth', rank: 3 },
  { id: 'v4', name: 'Impact', rank: 4 },
  { id: 'v5', name: 'Balance', rank: 5 },
];

const MOCK_INTERESTS = [
  { id: 'i1', name: 'Technology', rank: 1 },
  { id: 'i2', name: 'Design', rank: 2 },
  { id: 'i3', name: 'Psychology', rank: 3 },
];

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [activeNavItem, setActiveNavItem] = useState<NavItemId>('profile');

  useEffect(() => {
    const savedData = localStorage.getItem('dreamtree_user');
    if (savedData) {
      try {
        setUserData(JSON.parse(savedData));
      } catch {
        // If no user data, redirect to home
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router]);

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

  const handleUpdateVisual = (
    type: 'backgroundColor' | 'fontFamily',
    value: string
  ) => {
    if (!userData) return;

    const updatedData = { ...userData };
    if (type === 'backgroundColor') {
      updatedData.backgroundColor = value as BackgroundColorId;
    } else if (type === 'fontFamily') {
      updatedData.font = value as FontFamilyId;
    }

    localStorage.setItem('dreamtree_user', JSON.stringify(updatedData));
    setUserData(updatedData);

    // Apply theme change
    applyTheme(updatedData);
  };

  const handleDownloadData = () => {
    // Gather all user data
    const allData = {
      user: userData,
      // In production, gather from all tables
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dreamtree-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteData = () => {
    if (
      confirm(
        'Are you sure you want to delete all your data? This cannot be undone.'
      )
    ) {
      localStorage.removeItem('dreamtree_user');
      localStorage.removeItem('dreamtree_onboarding');
      document.documentElement.style.removeProperty('--color-bg');
      document.documentElement.style.removeProperty('--color-text');
      document.documentElement.style.removeProperty('--font-body');
      document.documentElement.removeAttribute('data-theme');
      router.push('/');
    }
  };

  if (!userData) {
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
          name={userData.name}
          backgroundColor={userData.backgroundColor}
          fontFamily={userData.font}
        />

        <ProfileSection title="Top Skills">
          <SkillsList skills={MOCK_SKILLS} />
        </ProfileSection>

        <ProfileSection title="Values">
          <RankedList items={MOCK_VALUES} />
        </ProfileSection>

        <ProfileSection title="Interests" lockedUntil="Part 2 › Module 1">
          <RankedList items={MOCK_INTERESTS} />
        </ProfileSection>

        <ProfileSection title="Career Paths" lockedUntil="Part 3 › Module 2">
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

function applyTheme(data: OnboardingData) {
  const colors: Record<string, { hex: string; isLight: boolean }> = {
    ivory: { hex: '#FAF8F5', isLight: true },
    'creamy-tan': { hex: '#E8DCC4', isLight: true },
    brown: { hex: '#5C4033', isLight: false },
    charcoal: { hex: '#2C3E50', isLight: false },
    black: { hex: '#1A1A1A', isLight: false },
  };

  const fonts: Record<string, string> = {
    inter: "'Inter', system-ui, sans-serif",
    lora: "'Lora', Georgia, serif",
    'courier-prime': "'Courier Prime', monospace",
    'shadows-into-light': "'Shadows Into Light', cursive",
    'manufacturing-consent': "'Manufacturing Consent', serif",
  };

  const bg = colors[data.backgroundColor];
  const text = colors[data.textColor];
  const font = fonts[data.font];

  if (bg) {
    document.documentElement.style.setProperty('--color-bg', bg.hex);
    document.documentElement.setAttribute(
      'data-theme',
      bg.isLight ? 'light' : 'dark'
    );
  }
  if (text) {
    document.documentElement.style.setProperty('--color-text', text.hex);
  }
  if (font) {
    document.documentElement.style.setProperty('--font-body', font);
  }
}
