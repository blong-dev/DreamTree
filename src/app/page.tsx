'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingFlow, OnboardingData } from '@/components/onboarding';
import { AppShell, NavItemId } from '@/components/shell';
import { TOCPanel, WorkbookProgress } from '@/components/overlays';
import {
  DashboardGreeting,
  DailyDoList,
  ProgressMetrics,
  ProfilePreview,
  TOCInline,
  DailyDo,
  ProgressMetricData,
  UserPreview,
  TOCPartData,
  BackgroundColorId,
  FontFamilyId,
} from '@/components/dashboard';

// Mock data for development - will be replaced with real data fetching
const MOCK_DAILY_DOS: DailyDo[] = [
  {
    id: '1',
    type: 'flow-tracking',
    title: 'Track Your Flow State',
    subtitle: 'Log an activity where you lost track of time',
    action: { label: 'Log Flow', href: '/tools/flow-tracker' },
  },
  {
    id: '2',
    type: 'soared-prompt',
    title: 'SOARED Story Prompt',
    subtitle: 'Think of a time you helped someone solve a problem',
    action: { label: 'Write Story', href: '/tools/soared-form' },
  },
];

const MOCK_PROGRESS: ProgressMetricData[] = [
  { value: '32%', label: 'Workbook Complete' },
  { value: 12, label: 'SOARED Stories' },
  { value: 47, label: 'Skills Tagged' },
  { value: 5, label: 'Day Streak' },
];

const MOCK_TOC: TOCPartData[] = [
  {
    id: '1',
    title: 'Part 1: Roots',
    progress: 65,
    status: 'in-progress',
    modules: [
      {
        id: '1.1',
        title: 'Module 1: Your Story',
        status: 'complete',
        exercises: [
          { id: '1.1.1', title: 'Introduction', status: 'complete' },
          { id: '1.1.2', title: 'Life Timeline', status: 'complete' },
        ],
      },
      {
        id: '1.2',
        title: 'Module 2: Values',
        status: 'in-progress',
        exercises: [
          { id: '1.2.1', title: 'Values Sort', status: 'complete' },
          { id: '1.2.2', title: 'Values in Action', status: 'in-progress' },
          { id: '1.2.3', title: 'Values Statement', status: 'available' },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Part 2: Trunk',
    progress: 0,
    status: 'locked',
    modules: [],
  },
  {
    id: '3',
    title: 'Part 3: Branches',
    progress: 0,
    status: 'locked',
    modules: [],
  },
];

// Convert TOCPartData to WorkbookProgress format for TOCPanel
function toWorkbookProgress(parts: TOCPartData[]): WorkbookProgress {
  return {
    parts: parts.map((part) => ({
      id: part.id,
      title: part.title,
      status: part.status,
      percentComplete: part.progress,
      modules: part.modules.map((mod) => ({
        id: mod.id,
        title: mod.title,
        status: mod.status,
        exercises: mod.exercises.map((ex) => ({
          id: ex.id,
          title: ex.title,
          status: ex.status,
        })),
      })),
    })),
  };
}

export default function Home() {
  const router = useRouter();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [showTOC, setShowTOC] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState<NavItemId>('home');

  useEffect(() => {
    // Check if user has completed onboarding
    const savedData = localStorage.getItem('dreamtree_user');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setUserData(parsed);
        setNeedsOnboarding(false);
        // Apply saved theme
        applyTheme(parsed);
      } catch {
        setNeedsOnboarding(true);
      }
    } else {
      setNeedsOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = (data: OnboardingData) => {
    localStorage.setItem('dreamtree_user', JSON.stringify(data));
    setUserData(data);
    setNeedsOnboarding(false);
    applyTheme(data);
  };

  const handleNavigate = useCallback(
    (id: NavItemId) => {
      setActiveNavItem(id);
      if (id === 'contents') {
        setShowTOC(true);
      } else if (id === 'profile') {
        router.push('/profile');
      } else if (id === 'tools') {
        router.push('/tools');
      }
    },
    [router]
  );

  const handleTOCNavigate = useCallback(
    (location: import('@/components/overlays').BreadcrumbLocation) => {
      setShowTOC(false);
      // Navigate to exercise - will be implemented with full routing
      if (location.exerciseId) {
        router.push(`/exercise/${location.exerciseId}`);
      }
    },
    [router]
  );

  // Loading state
  if (needsOnboarding === null) {
    return (
      <div className="onboarding-flow">
        <div className="onboarding-content" />
      </div>
    );
  }

  // Show onboarding for new users
  if (needsOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Build user preview for ProfilePreview component
  const userPreview: UserPreview = {
    name: userData?.name || 'User',
    topSkills: {
      transferable: null,
      selfManagement: null,
      knowledge: null,
    },
    backgroundColor: (userData?.backgroundColor || 'ivory') as BackgroundColorId,
    fontFamily: (userData?.font || 'inter') as FontFamilyId,
  };

  return (
    <>
      <AppShell
        activeNavItem={activeNavItem}
        onNavigate={handleNavigate}
        showBreadcrumb={false}
        showInput={false}
      >
        <div className="dashboard">
          <DashboardGreeting name={userData?.name || 'User'} />

          <section className="dashboard-section">
            <h2 className="dashboard-section-title">Daily Do&apos;s</h2>
            <DailyDoList items={MOCK_DAILY_DOS} />
          </section>

          <section className="dashboard-section">
            <h2 className="dashboard-section-title">Your Progress</h2>
            <ProgressMetrics metrics={MOCK_PROGRESS} />
          </section>

          <section className="dashboard-section">
            <h2 className="dashboard-section-title">Profile Preview</h2>
            <ProfilePreview user={userPreview} />
          </section>

          <section className="dashboard-section">
            <h2 className="dashboard-section-title">Workbook</h2>
            <TOCInline
              parts={MOCK_TOC}
              onNavigate={handleTOCNavigate}
            />
            <button
              className="button button-ghost button-sm"
              style={{ marginTop: 'var(--space-4)' }}
              onClick={() => setShowTOC(true)}
            >
              View All
            </button>
          </section>

          {/* Dev reset button */}
          <button
            className="button button-ghost button-sm"
            style={{ marginTop: 'var(--space-8)' }}
            onClick={() => {
              localStorage.removeItem('dreamtree_user');
              localStorage.removeItem('dreamtree_onboarding');
              setNeedsOnboarding(true);
              document.documentElement.style.removeProperty('--color-bg');
              document.documentElement.style.removeProperty('--color-text');
              document.documentElement.style.removeProperty('--font-body');
              document.documentElement.removeAttribute('data-theme');
            }}
          >
            Reset Onboarding (Dev)
          </button>
        </div>
      </AppShell>

      <TOCPanel
        open={showTOC}
        onClose={() => setShowTOC(false)}
        progress={toWorkbookProgress(MOCK_TOC)}
        onNavigate={handleTOCNavigate}
      />
    </>
  );
}

function applyTheme(data: OnboardingData) {
  const colors: Record<string, { hex: string; isLight: boolean }> = {
    'ivory': { hex: '#FAF8F5', isLight: true },
    'creamy-tan': { hex: '#E8DCC4', isLight: true },
    'brown': { hex: '#5C4033', isLight: false },
    'charcoal': { hex: '#2C3E50', isLight: false },
    'black': { hex: '#1A1A1A', isLight: false },
  };

  const fonts: Record<string, string> = {
    'inter': "'Inter', system-ui, sans-serif",
    'lora': "'Lora', Georgia, serif",
    'courier-prime': "'Courier Prime', monospace",
    'shadows-into-light': "'Shadows Into Light', cursive",
    'jacquard-24': "'Jacquard 24', serif",
  };

  const bg = colors[data.backgroundColor];
  const text = colors[data.textColor];
  const font = fonts[data.font];

  document.documentElement.style.setProperty('--color-bg', bg.hex);
  document.documentElement.style.setProperty('--color-text', text.hex);
  document.documentElement.style.setProperty('--font-body', font);
  document.documentElement.setAttribute('data-theme', bg.isLight ? 'light' : 'dark');
}
