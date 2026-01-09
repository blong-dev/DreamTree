'use client';

import { ReactNode } from 'react';
import { ChevronUpIcon } from '../icons';

interface WorkbookInputZoneProps {
  /** Whether the input zone is collapsed (after scrolling) */
  collapsed: boolean;
  /** Callback to expand the collapsed zone */
  onExpand: () => void;
  /** The active input content (PromptInput, ToolEmbed, Continue, or TextInput) */
  children: ReactNode;
  /** Label to show in collapsed state */
  collapsedLabel?: string;
  /** Whether there's any active input to show */
  hasActiveInput: boolean;
}

/**
 * WorkbookInputZone provides a unified, fixed-position input area at the bottom
 * of the workbook. It collapses to a minimal bar after significant scrolling
 * and can be expanded by touch/click.
 *
 * This replaces the multiple input mechanisms (AppShell InputArea, inline PromptInput,
 * inline Continue button) with a single, consistent input zone.
 */
export function WorkbookInputZone({
  collapsed,
  onExpand,
  children,
  collapsedLabel = 'Tap to continue',
  hasActiveInput,
}: WorkbookInputZoneProps) {
  // Don't render if there's no active input
  if (!hasActiveInput) {
    return null;
  }

  return (
    <div
      className="workbook-input-zone"
      data-collapsed={collapsed}
    >
      {collapsed ? (
        <button
          className="workbook-input-zone-expand"
          onClick={onExpand}
          aria-label="Expand input area"
        >
          <ChevronUpIcon />
          <span>{collapsedLabel}</span>
        </button>
      ) : (
        <div className="workbook-input-zone-content">
          {children}
        </div>
      )}
    </div>
  );
}
