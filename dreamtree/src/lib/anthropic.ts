/**
 * Anthropic AI Utilities
 * Helper functions for AI interactions
 */

import type { ChatMessage } from './api';

/**
 * Calculate token count estimate (rough approximation)
 * More accurate would use tiktoken, but this is good enough
 */
export function estimateTokenCount(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Build system prompt for a module/exercise
 */
export function buildSystemPrompt(config: {
  moduleId: number;
  exerciseId: string;
  exerciseTitle: string;
  goals: string[];
  conversationalGuidelines: string;
  userContext?: Record<string, unknown>;
  characterNotes?: Array<{
    category: string;
    observation: string;
    confidence: number;
  }>;
}): string {
  const {
    moduleId,
    exerciseId,
    exerciseTitle,
    goals,
    conversationalGuidelines,
    userContext,
    characterNotes,
  } = config;

  let prompt = `You are a career coach helping a user through Module ${moduleId}, Exercise ${exerciseId}: ${exerciseTitle}.

Your goals for this exercise:
${goals.map((g, i) => `${i + 1}. ${g}`).join('\n')}

Conversational approach:
${conversationalGuidelines}

`;

  if (userContext && Object.keys(userContext).length > 0) {
    prompt += `\nUser's context from previous exercises:
${JSON.stringify(userContext, null, 2)}

`;
  }

  if (characterNotes && characterNotes.length > 0) {
    prompt += `\nCharacter notes (from previous interactions):
${characterNotes
  .map((note) => `- ${note.category}: ${note.observation}`)
  .join('\n')}

Adjust your coaching style based on these observations.

`;
  }

  return prompt;
}

/**
 * Detect if AI is ready to transition from conversation to form
 */
export function shouldTransitionToForm(
  messages: ChatMessage[],
  minExchanges: number = 4
): boolean {
  // Count user-assistant exchanges
  const exchanges = Math.floor(messages.length / 2);

  if (exchanges < minExchanges) return false;

  // Check if last assistant message contains transition keywords
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role !== 'assistant') return false;

  const transitionKeywords = [
    'organize',
    'summarize',
    'let me help you capture',
    'create a form',
    'fill in',
  ];

  return transitionKeywords.some((keyword) =>
    lastMessage.content.toLowerCase().includes(keyword)
  );
}

/**
 * Extract structured data from conversation
 * Uses AI to parse conversation and extract relevant data
 */
export async function extractDataFromConversation(
  messages: ChatMessage[],
  extractionPrompt: string
): Promise<Record<string, unknown>> {
  // TODO: Implement AI-powered data extraction
  // This would call Claude again with a specific extraction prompt
  // For now, return empty object
  console.log('TODO: Extract data from conversation', {
    messageCount: messages.length,
    extractionPrompt,
  });

  return {};
}
