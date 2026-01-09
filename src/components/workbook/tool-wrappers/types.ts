/**
 * Common props for all tool wrapper components
 * IMP-002: Shared interface for tool wrappers
 */
export interface ToolWrapperProps {
  toolId: number;
  exerciseId: string;
  connectionId: number | null;
  instructions?: string;
  onComplete: () => void;
}
