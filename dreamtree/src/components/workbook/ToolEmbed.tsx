'use client';

import { useState } from 'react';
import type { ToolData } from './types';

interface ToolEmbedProps {
  tool: ToolData;
  exerciseId: string;
  connectionId: number | null;
  onComplete: () => void;
}

export function ToolEmbed({ tool, onComplete }: ToolEmbedProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveTool = async () => {
    setIsLoading(true);
    try {
      // For now, just complete the tool
      // TODO: Implement proper tool data saving and rendering
      onComplete();
    } catch (err) {
      setError('Failed to save. Please try again.');
      console.error('Error saving tool:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tool-embed">
      <div className="tool-embed-header">
        <h3>{tool.name || 'Tool'}</h3>
        {tool.description && <p>{tool.description}</p>}
      </div>

      {tool.instructions && (
        <div className="tool-embed-instructions">
          <p>{tool.instructions}</p>
        </div>
      )}

      <div className="tool-embed-content">
        <div className="tool-embed-placeholder">
          <p>Tool interface for: {tool.name || 'Unknown Tool'}</p>
          <p className="tool-embed-note">Full tool functionality coming soon.</p>
        </div>
      </div>

      {error && (
        <div className="tool-embed-error">
          <p>{error}</p>
        </div>
      )}

      <div className="tool-embed-actions">
        <button
          className="button button-primary"
          onClick={saveTool}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
