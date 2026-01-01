/**
 * AI Chat Endpoint
 * POST /api/ai/chat
 * Handles conversational AI interactions with Claude
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { parseAuthHeader, isAuthSignatureValid } from '@/lib/wallet';

function getAnthropic() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  });
}

// Token pricing (as of Jan 2025)
const PRICING = {
  'claude-sonnet-4-20250514': {
    input: 3.0 / 1_000_000, // $3 per million tokens
    output: 15.0 / 1_000_000, // $15 per million tokens
  },
};

export async function POST(request: NextRequest) {
  try {
    // Skip authentication in development for testing
    const isDevelopment = process.env.NODE_ENV === 'development';
    console.log('🔍 Chat API - NODE_ENV:', process.env.NODE_ENV, 'isDevelopment:', isDevelopment);

    const authHeader = request.headers.get('Authorization');
    console.log('🔍 Chat API - authHeader present:', !!authHeader);

    if (!isDevelopment) {
      console.log('⚠️ Production mode - checking auth');
      if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const auth = parseAuthHeader(authHeader);
      if (!auth || !isAuthSignatureValid(auth.timestamp)) {
        return NextResponse.json(
          { error: 'Invalid or expired signature' },
          { status: 401 }
        );
      }
    } else {
      console.log('✅ Development mode - skipping auth');
    }

    const body = await request.json();
    const { message, conversationHistory, context, systemPrompt: customSystemPrompt } = body;

    if (!message || !context) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Check user credit balance

    // TODO: Fetch user context (previous responses, character notes)
    // TODO: Build module-specific system prompt

    // Use custom system prompt if provided, otherwise use default
    const systemPrompt = customSystemPrompt || `You are Bee, a career coach helping a user through Module ${context.moduleId}, Exercise ${context.exerciseId}.

Your role is to guide them through self-discovery exercises using thoughtful questions and supportive feedback.

Be warm, encouraging, and help them explore their career aspirations deeply.`;

    // Build messages array
    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    // Call Anthropic API
    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });

    // Calculate cost
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const model = 'claude-sonnet-4-20250514';
    const pricing = PRICING[model];

    const cost =
      inputTokens * pricing.input + outputTokens * pricing.output;

    // TODO: Deduct from user credits
    // TODO: Log API usage
    // TODO: Update user balance

    const responseText =
      response.content[0].type === 'text'
        ? response.content[0].text
        : '';

    return NextResponse.json({
      response: responseText,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
      },
      cost: parseFloat(cost.toFixed(4)),
      creditsRemaining: 14.86, // Mock value - TODO: return actual balance
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'AI chat failed',
      },
      { status: 500 }
    );
  }
}
