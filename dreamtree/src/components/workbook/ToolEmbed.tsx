'use client';

/**
 * ToolEmbed - Dispatcher for tool wrapper components
 * IMP-002: Refactored from 600+ lines with 15 useState to simple dispatcher
 *
 * Each tool now manages its own state in a dedicated wrapper component.
 * This component just dispatches to the right wrapper.
 */

import type { ToolData } from './types';
import { ErrorBoundary } from '../feedback';
import {
  ListBuilderWrapper,
  SOAREDFormWrapper,
  SkillTaggerWrapper,
  RankingGridWrapper,
  FlowTrackerWrapper,
  LifeDashboardWrapper,
  FailureReframerWrapper,
  BucketingToolWrapper,
  MBTISelectorWrapper,
  BudgetCalculatorWrapper,
  IdeaTreeWrapper,
  MindsetProfilesWrapper,
  CareerTimelineWrapper,
  CareerAssessmentWrapper,
  CompetencyAssessmentWrapper,
} from './tool-wrappers';

interface ToolEmbedProps {
  tool: ToolData;
  exerciseId: string;
  connectionId: number | null;
  onComplete: () => void;
}

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

export function ToolEmbed({ tool, exerciseId, connectionId, onComplete }: ToolEmbedProps) {
  const toolName = (tool.name || '').toLowerCase().replace(/-/g, '_') as ToolName;

  // Guard: tool.id is required for saving
  if (!tool.id) {
    return (
      <div className="tool-embed">
        <div className="tool-embed-error-state">
          <p>Tool configuration error: missing ID.</p>
        </div>
      </div>
    );
  }

  const commonProps = {
    toolId: tool.id,
    exerciseId,
    connectionId,
    instructions: tool.instructions,
    onComplete,
  };

  const renderTool = () => {
    switch (toolName) {
      case 'list_builder':
        return <ListBuilderWrapper {...commonProps} />;
      case 'soared_form':
        return <SOAREDFormWrapper {...commonProps} />;
      case 'skill_tagger':
        return <SkillTaggerWrapper {...commonProps} />;
      case 'ranking_grid':
        return <RankingGridWrapper {...commonProps} />;
      case 'flow_tracker':
        return <FlowTrackerWrapper {...commonProps} />;
      case 'life_dashboard':
        return <LifeDashboardWrapper {...commonProps} />;
      case 'failure_reframer':
        return <FailureReframerWrapper {...commonProps} />;
      case 'bucketing_tool':
        return <BucketingToolWrapper {...commonProps} />;
      case 'mbti_selector':
        return <MBTISelectorWrapper {...commonProps} />;
      case 'budget_calculator':
        return <BudgetCalculatorWrapper {...commonProps} />;
      case 'idea_tree':
        return <IdeaTreeWrapper {...commonProps} />;
      case 'mindset_profiles':
        return <MindsetProfilesWrapper {...commonProps} />;
      case 'career_timeline':
        return <CareerTimelineWrapper {...commonProps} />;
      case 'career_assessment':
        return <CareerAssessmentWrapper {...commonProps} />;
      case 'competency_assessment':
        return <CompetencyAssessmentWrapper {...commonProps} />;
      default:
        return (
          <div className="tool-embed-placeholder">
            <p>Tool interface for: {tool.name || 'Unknown Tool'}</p>
            <p className="tool-embed-note">This tool type is not yet implemented.</p>
          </div>
        );
    }
  };

  return (
    <div className="tool-embed">
      {tool.instructions && (
        <div className="tool-embed-instructions">
          <p>{tool.instructions}</p>
        </div>
      )}

      <div className="tool-embed-content">
        {/* IMP-023: Isolate tool crashes from killing the workbook */}
        <ErrorBoundary
          fallback={
            <div className="tool-embed-error-state">
              <p>This tool encountered an error.</p>
              <button
                className="button button-secondary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          }
        >
          {renderTool()}
        </ErrorBoundary>
      </div>
    </div>
  );
}
