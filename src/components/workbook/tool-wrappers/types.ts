/**
 * Response from tool save API
 */
export interface ToolSaveResponse {
  id: string;
  updated: boolean;
  newProgress: number;
  nextBlock: unknown | null;
  hasMore: boolean;
}

/**
 * Common props for all tool wrapper components
 * IMP-002: Shared interface for tool wrappers
 */
export interface ToolWrapperProps {
  toolId: number;
  exerciseId: string;
  connectionId: number | null;
  instructions?: string;
  onComplete: (data: ToolSaveResponse) => void;
}
