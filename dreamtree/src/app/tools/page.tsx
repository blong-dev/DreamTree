'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, NavItemId } from '@/components/shell';
import { ToolType } from '@/components/tools';
import { ArrowLeftIcon } from '@/components/icons';

// Tool metadata for the index page
const TOOL_CATEGORIES = [
  {
    title: 'Story & Reflection',
    tools: [
      {
        type: 'soared_form' as ToolType,
        name: 'SOARED Stories',
        description: 'Capture achievement stories using the SOARED framework',
        count: 0,
      },
      {
        type: 'failure_reframer' as ToolType,
        name: 'Failure Reframes',
        description: 'Transform setbacks into learning opportunities',
        count: 0,
      },
    ],
  },
  {
    title: 'Skills & Strengths',
    tools: [
      {
        type: 'skill_tagger' as ToolType,
        name: 'Skill Tagger',
        description: 'Tag and categorize your skills',
        count: 0,
      },
      {
        type: 'bucketing_tool' as ToolType,
        name: 'Skill Buckets',
        description: 'Rate your skill mastery levels',
        count: 0,
      },
      {
        type: 'competency_assessment' as ToolType,
        name: 'Competency Assessment',
        description: 'Assess your workplace competencies',
        count: 0,
      },
    ],
  },
  {
    title: 'Values & Personality',
    tools: [
      {
        type: 'ranking_grid' as ToolType,
        name: 'Rankings',
        description: 'Rank and prioritize items',
        count: 0,
      },
      {
        type: 'mbti_selector' as ToolType,
        name: 'Personality Type',
        description: 'Explore your MBTI preferences',
        count: 0,
      },
      {
        type: 'mindset_profiles' as ToolType,
        name: 'Mindset Profiles',
        description: 'Understand different mindsets',
        count: 0,
      },
    ],
  },
  {
    title: 'Flow & Activity',
    tools: [
      {
        type: 'flow_tracker' as ToolType,
        name: 'Flow Tracker',
        description: 'Log activities and flow states',
        count: 0,
      },
      {
        type: 'life_dashboard' as ToolType,
        name: 'Life Dashboard',
        description: 'Track life domains and balance',
        count: 0,
      },
    ],
  },
  {
    title: 'Career Planning',
    tools: [
      {
        type: 'career_timeline' as ToolType,
        name: 'Career Timeline',
        description: 'Map your career history and future',
        count: 0,
      },
      {
        type: 'career_assessment' as ToolType,
        name: 'Career Assessment',
        description: 'Evaluate career options',
        count: 0,
      },
      {
        type: 'budget_calculator' as ToolType,
        name: 'Budget Calculator',
        description: 'Plan your financial needs',
        count: 0,
      },
    ],
  },
  {
    title: 'Lists & Ideas',
    tools: [
      {
        type: 'list_builder' as ToolType,
        name: 'Lists',
        description: 'Create and manage lists',
        count: 0,
      },
      {
        type: 'idea_tree' as ToolType,
        name: 'Idea Trees',
        description: 'Map out ideas visually',
        count: 0,
      },
    ],
  },
];

export default function ToolsIndexPage() {
  const router = useRouter();
  const [activeNavItem, setActiveNavItem] = useState<NavItemId>('tools');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('dreamtree_user');
    if (savedData) {
      setIsAuthenticated(true);
    } else {
      router.push('/');
    }
  }, [router]);

  const handleNavigate = useCallback(
    (id: NavItemId) => {
      setActiveNavItem(id);
      if (id === 'home') {
        router.push('/');
      } else if (id === 'profile') {
        router.push('/profile');
      }
    },
    [router]
  );

  const handleToolClick = (toolType: ToolType) => {
    router.push(`/tools/${toolType}`);
  };

  if (isAuthenticated === null) {
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
      <div className="tools-index">
        <header className="tools-index-header">
          <button className="tools-index-back" onClick={() => router.push('/')}>
            <ArrowLeftIcon width={16} height={16} />
            <span>Back</span>
          </button>
          <h1 className="tools-index-title">Tools</h1>
        </header>

        <p className="tools-index-description">
          All your workbook tools in one place. Tools are used throughout the
          workbook exercises - you can also access them here to review or create
          new entries.
        </p>

        {TOOL_CATEGORIES.map((category) => (
          <section key={category.title} className="tools-index-category">
            <h2 className="tools-index-category-title">{category.title}</h2>
            <div className="tools-index-grid">
              {category.tools.map((tool) => (
                <button
                  key={tool.type}
                  className="tools-index-card"
                  onClick={() => handleToolClick(tool.type)}
                >
                  <h3 className="tools-index-card-name">{tool.name}</h3>
                  <p className="tools-index-card-description">
                    {tool.description}
                  </p>
                  {tool.count > 0 && (
                    <span className="tools-index-card-count">
                      {tool.count} {tool.count === 1 ? 'entry' : 'entries'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
