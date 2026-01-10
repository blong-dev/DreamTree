/**
 * ToolEmbed Tests
 *
 * Tests for the tool dispatcher component.
 * P3 task for AUDIT-001 resolution.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToolEmbed } from './ToolEmbed';
import type { ToolData } from './types';

// Mock all 15 tool wrappers to isolate dispatcher logic
vi.mock('./tool-wrappers', () => ({
  ListBuilderWrapper: ({ toolId }: { toolId: number }) => (
    <div data-testid="list-builder-wrapper">ListBuilder: {toolId}</div>
  ),
  SOAREDFormWrapper: ({ toolId }: { toolId: number }) => (
    <div data-testid="soared-form-wrapper">SOAREDForm: {toolId}</div>
  ),
  SkillTaggerWrapper: ({ toolId }: { toolId: number }) => (
    <div data-testid="skill-tagger-wrapper">SkillTagger: {toolId}</div>
  ),
  RankingGridWrapper: ({ toolId }: { toolId: number }) => (
    <div data-testid="ranking-grid-wrapper">RankingGrid: {toolId}</div>
  ),
  FlowTrackerWrapper: ({ toolId }: { toolId: number }) => (
    <div data-testid="flow-tracker-wrapper">FlowTracker: {toolId}</div>
  ),
  LifeDashboardWrapper: ({ toolId }: { toolId: number }) => (
    <div data-testid="life-dashboard-wrapper">LifeDashboard: {toolId}</div>
  ),
  FailureReframerWrapper: ({ toolId }: { toolId: number }) => (
    <div data-testid="failure-reframer-wrapper">FailureReframer: {toolId}</div>
  ),
  BucketingToolWrapper: ({ toolId }: { toolId: number }) => (
    <div data-testid="bucketing-tool-wrapper">BucketingTool: {toolId}</div>
  ),
  MBTISelectorWrapper: ({ toolId }: { toolId: number }) => (
    <div data-testid="mbti-selector-wrapper">MBTISelector: {toolId}</div>
  ),
  BudgetCalculatorWrapper: ({ toolId }: { toolId: number }) => (
    <div data-testid="budget-calculator-wrapper">BudgetCalculator: {toolId}</div>
  ),
  IdeaTreeWrapper: ({ toolId }: { toolId: number }) => (
    <div data-testid="idea-tree-wrapper">IdeaTree: {toolId}</div>
  ),
  MindsetProfilesWrapper: ({ toolId }: { toolId: number }) => (
    <div data-testid="mindset-profiles-wrapper">MindsetProfiles: {toolId}</div>
  ),
  CareerTimelineWrapper: ({ toolId }: { toolId: number }) => (
    <div data-testid="career-timeline-wrapper">CareerTimeline: {toolId}</div>
  ),
  CareerAssessmentWrapper: ({ toolId }: { toolId: number }) => (
    <div data-testid="career-assessment-wrapper">CareerAssessment: {toolId}</div>
  ),
  CompetencyAssessmentWrapper: ({ toolId }: { toolId: number }) => (
    <div data-testid="competency-assessment-wrapper">CompetencyAssessment: {toolId}</div>
  ),
}));

// Mock ErrorBoundary to just render children
vi.mock('../feedback', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('ToolEmbed', () => {
  const createTool = (name: string, id: number = 100001, instructions?: string): ToolData => ({
    id,
    name,
    instructions,
    tool_type: name,
  });

  const defaultProps = {
    exerciseId: '1.1.1',
    connectionId: null,
    onComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('error handling', () => {
    it('shows error state when tool.id is missing', () => {
      const tool = { name: 'list_builder' } as ToolData;

      render(<ToolEmbed tool={tool} {...defaultProps} />);

      expect(screen.getByText(/Tool configuration error: missing ID/i)).toBeInTheDocument();
    });

    it('shows error state when tool.id is 0', () => {
      const tool = createTool('list_builder', 0);

      render(<ToolEmbed tool={tool} {...defaultProps} />);

      expect(screen.getByText(/Tool configuration error: missing ID/i)).toBeInTheDocument();
    });
  });

  describe('tool routing', () => {
    it('routes to ListBuilderWrapper for list_builder', () => {
      render(<ToolEmbed tool={createTool('list_builder', 100001)} {...defaultProps} />);
      expect(screen.getByTestId('list-builder-wrapper')).toBeInTheDocument();
    });

    it('routes to SOAREDFormWrapper for soared_form', () => {
      render(<ToolEmbed tool={createTool('soared_form', 100002)} {...defaultProps} />);
      expect(screen.getByTestId('soared-form-wrapper')).toBeInTheDocument();
    });

    it('routes to SkillTaggerWrapper for skill_tagger', () => {
      render(<ToolEmbed tool={createTool('skill_tagger', 100003)} {...defaultProps} />);
      expect(screen.getByTestId('skill-tagger-wrapper')).toBeInTheDocument();
    });

    it('routes to RankingGridWrapper for ranking_grid', () => {
      render(<ToolEmbed tool={createTool('ranking_grid', 100004)} {...defaultProps} />);
      expect(screen.getByTestId('ranking-grid-wrapper')).toBeInTheDocument();
    });

    it('routes to FlowTrackerWrapper for flow_tracker', () => {
      render(<ToolEmbed tool={createTool('flow_tracker', 100005)} {...defaultProps} />);
      expect(screen.getByTestId('flow-tracker-wrapper')).toBeInTheDocument();
    });

    it('routes to LifeDashboardWrapper for life_dashboard', () => {
      render(<ToolEmbed tool={createTool('life_dashboard', 100006)} {...defaultProps} />);
      expect(screen.getByTestId('life-dashboard-wrapper')).toBeInTheDocument();
    });

    it('routes to FailureReframerWrapper for failure_reframer', () => {
      render(<ToolEmbed tool={createTool('failure_reframer', 100007)} {...defaultProps} />);
      expect(screen.getByTestId('failure-reframer-wrapper')).toBeInTheDocument();
    });

    it('routes to BucketingToolWrapper for bucketing_tool', () => {
      render(<ToolEmbed tool={createTool('bucketing_tool', 100008)} {...defaultProps} />);
      expect(screen.getByTestId('bucketing-tool-wrapper')).toBeInTheDocument();
    });

    it('routes to MBTISelectorWrapper for mbti_selector', () => {
      render(<ToolEmbed tool={createTool('mbti_selector', 100009)} {...defaultProps} />);
      expect(screen.getByTestId('mbti-selector-wrapper')).toBeInTheDocument();
    });

    it('routes to BudgetCalculatorWrapper for budget_calculator', () => {
      render(<ToolEmbed tool={createTool('budget_calculator', 100010)} {...defaultProps} />);
      expect(screen.getByTestId('budget-calculator-wrapper')).toBeInTheDocument();
    });

    it('routes to IdeaTreeWrapper for idea_tree', () => {
      render(<ToolEmbed tool={createTool('idea_tree', 100011)} {...defaultProps} />);
      expect(screen.getByTestId('idea-tree-wrapper')).toBeInTheDocument();
    });

    it('routes to MindsetProfilesWrapper for mindset_profiles', () => {
      render(<ToolEmbed tool={createTool('mindset_profiles', 100012)} {...defaultProps} />);
      expect(screen.getByTestId('mindset-profiles-wrapper')).toBeInTheDocument();
    });

    it('routes to CareerTimelineWrapper for career_timeline', () => {
      render(<ToolEmbed tool={createTool('career_timeline', 100013)} {...defaultProps} />);
      expect(screen.getByTestId('career-timeline-wrapper')).toBeInTheDocument();
    });

    it('routes to CareerAssessmentWrapper for career_assessment', () => {
      render(<ToolEmbed tool={createTool('career_assessment', 100014)} {...defaultProps} />);
      expect(screen.getByTestId('career-assessment-wrapper')).toBeInTheDocument();
    });

    it('routes to CompetencyAssessmentWrapper for competency_assessment', () => {
      render(<ToolEmbed tool={createTool('competency_assessment', 100015)} {...defaultProps} />);
      expect(screen.getByTestId('competency-assessment-wrapper')).toBeInTheDocument();
    });
  });

  describe('tool name normalization', () => {
    it('converts hyphens to underscores', () => {
      render(<ToolEmbed tool={createTool('list-builder', 100001)} {...defaultProps} />);
      expect(screen.getByTestId('list-builder-wrapper')).toBeInTheDocument();
    });

    it('converts to lowercase', () => {
      render(<ToolEmbed tool={createTool('LIST_BUILDER', 100001)} {...defaultProps} />);
      expect(screen.getByTestId('list-builder-wrapper')).toBeInTheDocument();
    });

    it('handles mixed case with hyphens', () => {
      render(<ToolEmbed tool={createTool('SOARED-Form', 100002)} {...defaultProps} />);
      expect(screen.getByTestId('soared-form-wrapper')).toBeInTheDocument();
    });
  });

  describe('unknown tools', () => {
    it('shows placeholder for unknown tool type', () => {
      render(<ToolEmbed tool={createTool('unknown_tool', 100099)} {...defaultProps} />);

      expect(screen.getByText(/Tool interface for: unknown_tool/i)).toBeInTheDocument();
      expect(screen.getByText(/This tool type is not yet implemented/i)).toBeInTheDocument();
    });

    it('shows tool name in placeholder', () => {
      render(<ToolEmbed tool={createTool('future_tool', 100099)} {...defaultProps} />);

      expect(screen.getByText(/future_tool/i)).toBeInTheDocument();
    });

    it('handles empty tool name', () => {
      const tool = { id: 100099, name: '' } as ToolData;

      render(<ToolEmbed tool={tool} {...defaultProps} />);

      expect(screen.getByText(/Unknown Tool/i)).toBeInTheDocument();
    });
  });

  describe('instructions', () => {
    it('shows instructions when provided', () => {
      const tool = createTool('list_builder', 100001, 'List your top skills');

      render(<ToolEmbed tool={tool} {...defaultProps} />);

      expect(screen.getByText('List your top skills')).toBeInTheDocument();
    });

    it('does not show instructions section when not provided', () => {
      const tool = createTool('list_builder', 100001);

      render(<ToolEmbed tool={tool} {...defaultProps} />);

      expect(screen.queryByText('List your top skills')).not.toBeInTheDocument();
    });

    it('shows instructions in dedicated container', () => {
      const tool = createTool('list_builder', 100001, 'Add items below');

      const { container } = render(<ToolEmbed tool={tool} {...defaultProps} />);

      const instructionsDiv = container.querySelector('.tool-embed-instructions');
      expect(instructionsDiv).toBeInTheDocument();
      expect(instructionsDiv).toHaveTextContent('Add items below');
    });
  });

  describe('props passing', () => {
    it('passes toolId to wrapper', () => {
      render(<ToolEmbed tool={createTool('list_builder', 12345)} {...defaultProps} />);

      expect(screen.getByText(/12345/)).toBeInTheDocument();
    });

    it('wraps tool content in tool-embed container', () => {
      const { container } = render(
        <ToolEmbed tool={createTool('list_builder', 100001)} {...defaultProps} />
      );

      expect(container.querySelector('.tool-embed')).toBeInTheDocument();
    });

    it('wraps tool in tool-embed-content container', () => {
      const { container } = render(
        <ToolEmbed tool={createTool('list_builder', 100001)} {...defaultProps} />
      );

      expect(container.querySelector('.tool-embed-content')).toBeInTheDocument();
    });
  });
});
