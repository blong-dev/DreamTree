'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ToolData } from './types';

// Import all tool components
import {
  ListBuilder,
  SOAREDForm,
  SkillTagger,
  RankingGrid,
  FlowTracker,
  LifeDashboard,
  FailureReframer,
  BucketingTool,
  MBTISelector,
  BudgetCalculator,
  IdeaTree,
  MindsetProfiles,
  CareerTimeline,
  CareerAssessment,
  CompetencyAssessment,
  getDefaultIdeaTreeData,
  DEFAULT_EXPENSES,
} from '../tools';

import type {
  ListItem,
  SOAREDStoryData,
  RankingItem,
  Comparison,
  FlowTrackerData,
  LifeDashboardData,
  FailureReframerData,
  BucketingToolData,
  BudgetCalculatorData,
  IdeaTreeData,
  MindsetProfilesData,
  CareerTimelineData,
  CareerAssessmentData,
  CompetencyAssessmentData,
  MBTIType,
  Skill,
  Competency,
} from '../tools';

interface ToolEmbedProps {
  tool: ToolData;
  exerciseId: string;
  connectionId: number | null;
  onComplete: () => void;
}

// Map database tool names to component keys
type ToolName =
  | 'list_builder'
  | 'soared_form'
  | 'skill_tagger'
  | 'ranking_grid'
  | 'flow_tracker'
  | 'life_dashboard'
  | 'failure_reframer'
  | 'bucketing_tool'
  | 'mbti_selector'
  | 'budget_calculator'
  | 'idea_tree'
  | 'mindset_profiles'
  | 'career_timeline'
  | 'career_assessment'
  | 'competency_assessment';

// Standard MBTI types for the selector
const MBTI_TYPES: MBTIType[] = [
  { code: 'INTJ', name: 'The Architect' },
  { code: 'INTP', name: 'The Logician' },
  { code: 'ENTJ', name: 'The Commander' },
  { code: 'ENTP', name: 'The Debater' },
  { code: 'INFJ', name: 'The Advocate' },
  { code: 'INFP', name: 'The Mediator' },
  { code: 'ENFJ', name: 'The Protagonist' },
  { code: 'ENFP', name: 'The Campaigner' },
  { code: 'ISTJ', name: 'The Logistician' },
  { code: 'ISFJ', name: 'The Defender' },
  { code: 'ESTJ', name: 'The Executive' },
  { code: 'ESFJ', name: 'The Consul' },
  { code: 'ISTP', name: 'The Virtuoso' },
  { code: 'ISFP', name: 'The Adventurer' },
  { code: 'ESTP', name: 'The Entrepreneur' },
  { code: 'ESFP', name: 'The Entertainer' },
];

export function ToolEmbed({ tool, exerciseId, connectionId, onComplete }: ToolEmbedProps) {
  const toolName = (tool.name || '').toLowerCase().replace(/-/g, '_') as ToolName;

  // State for different tool types
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [soaredData, setSoaredData] = useState<SOAREDStoryData>({
    title: '',
    situation: '',
    obstacle: '',
    action: '',
    result: '',
    evaluation: '',
    discovery: '',
    storyType: 'challenge',
  });
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [rankingItems, setRankingItems] = useState<RankingItem[]>([]);
  const [rankingComparisons, setRankingComparisons] = useState<Comparison[]>([]);
  const [flowData, setFlowData] = useState<FlowTrackerData>({ entries: [] });
  const [lifeDashboardData, setLifeDashboardData] = useState<LifeDashboardData>({
    work: null,
    play: null,
    love: null,
    health: null,
  });
  const [failureData, setFailureData] = useState<FailureReframerData>({
    situation: '',
    initialFeelings: '',
    whatLearned: '',
    whatWouldChange: '',
    silverLining: '',
    nextStep: '',
    reframedStatement: '',
  });
  const [bucketingData, setBucketingData] = useState<BucketingToolData>({
    items: [],
    bucketLabels: ['Most Used', 'Often Used', 'Sometimes', 'Rarely', 'Least Used'],
  });
  const [mbtiValue, setMbtiValue] = useState<string | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetCalculatorData>({
    grossMonthlyIncome: 0,
    grossYearlyIncome: 0,
    incomeInputMode: 'yearly',
    filingStatus: 'single',
    stateCode: null,
    expenses: DEFAULT_EXPENSES,
    notes: '',
  });
  const [ideaTreeData, setIdeaTreeData] = useState<IdeaTreeData>(getDefaultIdeaTreeData());
  const [mindsetData, setMindsetData] = useState<MindsetProfilesData>({
    selectedCharacters: {
      'curiosity': '',
      'bias-to-action': '',
      'reframing': '',
      'awareness': '',
      'radical-collaboration': '',
    },
  });
  const [timelineData, setTimelineData] = useState<CareerTimelineData>({
    milestones: [],
    startYear: new Date().getFullYear() - 10,
  });
  const [careerData, setCareerData] = useState<CareerAssessmentData>({ options: [] });
  const [competencyData, setCompetencyData] = useState<CompetencyAssessmentData>({ scores: [] });

  // Reference data for tools
  const [skills, setSkills] = useState<Skill[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch skills when skill_tagger tool is rendered
  useEffect(() => {
    if (toolName === 'skill_tagger' && skills.length === 0) {
      setDataLoading(true);
      fetch('/api/data/skills')
        .then(res => res.json() as Promise<{ skills?: Skill[] }>)
        .then(data => {
          if (data.skills) {
            setSkills(data.skills);
          }
        })
        .catch(err => console.error('Failed to load skills:', err))
        .finally(() => setDataLoading(false));
    }
  }, [toolName, skills.length]);

  // Fetch competencies when competency_assessment tool is rendered
  useEffect(() => {
    if (toolName === 'competency_assessment' && competencies.length === 0) {
      setDataLoading(true);
      fetch('/api/data/competencies')
        .then(res => res.json() as Promise<{ competencies?: Competency[] }>)
        .then(data => {
          if (data.competencies) {
            setCompetencies(data.competencies);
          }
        })
        .catch(err => console.error('Failed to load competencies:', err))
        .finally(() => setDataLoading(false));
    }
  }, [toolName, competencies.length]);

  // Fetch connected data when connectionId is provided
  useEffect(() => {
    if (!connectionId) return;

    setDataLoading(true);
    fetch(`/api/data/connection?connectionId=${connectionId}`)
      .then(res => res.json() as Promise<{ data?: unknown; method?: string; isEmpty?: boolean }>)
      .then(result => {
        if (result.isEmpty || !result.data) return;

        // Apply connected data based on tool type
        switch (toolName) {
          case 'skill_tagger':
            // Connected skills to pre-select
            if (Array.isArray(result.data)) {
              const skillIds = result.data.map((s: { skillId?: string; id?: string }) =>
                s.skillId || s.id || ''
              ).filter(Boolean);
              setSelectedSkillIds(skillIds);
            }
            break;
          case 'list_builder':
            // Pre-populate list with connected items
            if (Array.isArray(result.data)) {
              const items = result.data.map((item: { id?: string; value?: string; name?: string }, i: number) => ({
                id: item.id || `connected-${i}`,
                value: item.value || item.name || '',
              }));
              setListItems(items);
            }
            break;
          case 'ranking_grid':
            // Pre-populate ranking items
            if (Array.isArray(result.data)) {
              const items = result.data.map((item: { id?: string; value?: string; name?: string; rank?: number }, i: number) => ({
                id: item.id || `connected-${i}`,
                value: item.value || item.name || '',
                rank: item.rank,
              }));
              setRankingItems(items);
            }
            break;
          // Add more tool-specific handling as needed
        }
      })
      .catch(err => console.error('Failed to load connection data:', err))
      .finally(() => setDataLoading(false));
  }, [connectionId, toolName]);

  // Get the current data for the active tool
  const getToolData = useCallback(() => {
    switch (toolName) {
      case 'list_builder':
        return listItems;
      case 'soared_form':
        return soaredData;
      case 'skill_tagger':
        return { selectedSkillIds };
      case 'ranking_grid':
        return { items: rankingItems, comparisons: rankingComparisons };
      case 'flow_tracker':
        return flowData;
      case 'life_dashboard':
        return lifeDashboardData;
      case 'failure_reframer':
        return failureData;
      case 'bucketing_tool':
        return bucketingData;
      case 'mbti_selector':
        return { selectedCode: mbtiValue };
      case 'budget_calculator':
        return budgetData;
      case 'idea_tree':
        return ideaTreeData;
      case 'mindset_profiles':
        return mindsetData;
      case 'career_timeline':
        return timelineData;
      case 'career_assessment':
        return careerData;
      case 'competency_assessment':
        return competencyData;
      default:
        return {};
    }
  }, [
    toolName, listItems, soaredData, selectedSkillIds, rankingItems, rankingComparisons,
    flowData, lifeDashboardData, failureData, bucketingData, mbtiValue, budgetData,
    ideaTreeData, mindsetData, timelineData, careerData, competencyData
  ]);

  // Save tool data to the API
  const saveToolData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/workbook/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: tool.id,
          exerciseId,
          responseText: JSON.stringify(getToolData()),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save tool data');
      }

      onComplete();
    } catch (err) {
      console.error('Error saving tool:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [tool.id, exerciseId, getToolData, onComplete]);

  // Handle ranking comparison
  const handleRankingCompare = useCallback((winnerId: string, loserId: string) => {
    setRankingComparisons(prev => [...prev, { winnerId, loserId }]);
  }, []);

  // Handle ranking complete
  const handleRankingComplete = useCallback((ranked: RankingItem[]) => {
    setRankingItems(ranked);
  }, []);

  // Render the appropriate tool component
  const renderTool = () => {
    switch (toolName) {
      case 'list_builder':
        return (
          <ListBuilder
            items={listItems}
            onChange={setListItems}
            label={tool.description || 'Add items to your list'}
            placeholder="Add an item..."
            reorderable
          />
        );

      case 'soared_form':
        return (
          <SOAREDForm
            data={soaredData}
            onChange={setSoaredData}
          />
        );

      case 'skill_tagger':
        if (dataLoading) {
          return <div className="tool-embed-loading">Loading skills...</div>;
        }
        return (
          <SkillTagger
            skills={skills}
            selectedSkillIds={selectedSkillIds}
            onChange={setSelectedSkillIds}
            storyTitle={tool.description || 'Tag skills for this story'}
          />
        );

      case 'ranking_grid':
        return (
          <RankingGrid
            items={rankingItems}
            comparisons={rankingComparisons}
            onCompare={handleRankingCompare}
            onComplete={handleRankingComplete}
            label={tool.description || 'Rank these items'}
          />
        );

      case 'flow_tracker':
        return (
          <FlowTracker
            data={flowData}
            onChange={setFlowData}
          />
        );

      case 'life_dashboard':
        return (
          <LifeDashboard
            data={lifeDashboardData}
            onChange={setLifeDashboardData}
          />
        );

      case 'failure_reframer':
        return (
          <FailureReframer
            data={failureData}
            onChange={setFailureData}
          />
        );

      case 'bucketing_tool':
        return (
          <BucketingTool
            data={bucketingData}
            onChange={setBucketingData}
          />
        );

      case 'mbti_selector':
        return (
          <MBTISelector
            value={mbtiValue}
            onChange={setMbtiValue}
            types={MBTI_TYPES}
            label={tool.description || 'Select your MBTI type'}
          />
        );

      case 'budget_calculator':
        return (
          <BudgetCalculator
            data={budgetData}
            onChange={setBudgetData}
          />
        );

      case 'idea_tree':
        return (
          <IdeaTree
            data={ideaTreeData}
            onChange={setIdeaTreeData}
          />
        );

      case 'mindset_profiles':
        return (
          <MindsetProfiles
            data={mindsetData}
            onChange={setMindsetData}
          />
        );

      case 'career_timeline':
        return (
          <CareerTimeline
            data={timelineData}
            onChange={setTimelineData}
          />
        );

      case 'career_assessment':
        return (
          <CareerAssessment
            data={careerData}
            onChange={setCareerData}
          />
        );

      case 'competency_assessment':
        if (dataLoading) {
          return <div className="tool-embed-loading">Loading competencies...</div>;
        }
        return (
          <CompetencyAssessment
            data={competencyData}
            onChange={setCompetencyData}
            competencies={competencies}
          />
        );

      default:
        return (
          <div className="tool-embed-placeholder">
            <p>Tool interface for: {tool.name || 'Unknown Tool'}</p>
            <p className="tool-embed-note">This tool type is not yet implemented.</p>
          </div>
        );
    }
  };

  // Format tool name for display
  const displayName = tool.name
    ?.replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase()) || 'Tool';

  return (
    <div className="tool-embed">
      <div className="tool-embed-header">
        <h3>{displayName}</h3>
        {tool.description && <p>{tool.description}</p>}
      </div>

      {tool.instructions && (
        <div className="tool-embed-instructions">
          <p>{tool.instructions}</p>
        </div>
      )}

      <div className="tool-embed-content">
        {renderTool()}
      </div>

      {error && (
        <div className="tool-embed-error">
          <p>{error}</p>
        </div>
      )}

      <div className="tool-embed-actions">
        <button
          className="button button-primary"
          onClick={saveToolData}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
}
