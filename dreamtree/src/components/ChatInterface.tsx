/**
 * Chat Interface Component
 * Play/screenplay style conversational AI interaction
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { api } from '@/lib/api';
import type { ChatMessage } from '@/lib/api';
import { saveConversation } from '@/lib/storage';

export interface UserResponse {
  id: string;
  exerciseId: string;
  moduleId: number;
  question: string; // Context from Bee's previous message
  answer: string;
  timestamp: number;
  isEdited: boolean;
  editHistory?: Array<{ value: string; editedAt: number }>;
}

interface ChatInterfaceProps {
  moduleId: number;
  exerciseId: string;
  systemPrompt?: string;
  onComplete?: (data: unknown) => void;
  onCostUpdate?: (cost: number) => void;
  onExerciseComplete?: (exerciseId: string) => void;
}

export function ChatInterface({
  moduleId,
  exerciseId,
  systemPrompt,
  onComplete,
  onCostUpdate,
  onExerciseComplete,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [userName, setUserName] = useState('You');
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { credits, updateCredits } = useUserStore();
  const { backgroundColor, fontFamily, textColor } = usePreferencesStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-send initial greeting from AI
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      sendInitialGreeting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract user's name from conversation
  useEffect(() => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user');
    if (lastUserMessage) {
      // Simple heuristic: if message contains "I'm" or "My name is"
      const match =
        lastUserMessage.content.match(/(?:I'm|I am|my name is|call me)\s+(\w+)/i);
      if (match) {
        setUserName(match[1]);
      }
    }
  }, [messages]);

  const sendInitialGreeting = async () => {
    setIsLoading(true);

    try {
      // Start conversation with first message from the script
      const response = await api.sendChatMessage(
        'Begin the conversation',
        [],
        {
          moduleId,
          exerciseId,
        },
        systemPrompt
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
      };

      setMessages([assistantMessage]);
      if (onCostUpdate) {
        onCostUpdate(response.cost);
      }
      updateCredits(response.creditsRemaining);
    } catch (error) {
      console.error('Chat initialization error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Hello! I\'m Bee, your career coach for this exercise. Let\'s begin - what would you like to explore?',
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    };

    // Get last assistant message as question context
    const lastBeeMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'assistant');

    // Create user response for data collection
    const userResponse: UserResponse = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exerciseId,
      moduleId,
      question: lastBeeMessage?.content || '',
      answer: input.trim(),
      timestamp: Date.now(),
      isEdited: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserResponses((prev) => [...prev, userResponse]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(
        input.trim(),
        messages,
        {
          moduleId,
          exerciseId,
        },
        systemPrompt
      );

      // Check for exercise completion marker
      let responseContent = response.response;
      if (responseContent.includes('[EXERCISE_COMPLETE]')) {
        responseContent = responseContent.replace('[EXERCISE_COMPLETE]', '').trim();
        // Trigger exercise completion after response is displayed
        setTimeout(() => {
          if (onExerciseComplete) {
            onExerciseComplete(exerciseId);
          }
        }, 1000);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responseContent,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Persist conversation to IndexedDB
      const messagesWithTimestamps = [...messages, userMessage, assistantMessage].map(msg => ({
        ...msg,
        timestamp: Date.now(),
      }));
      await saveConversation(exerciseId, messagesWithTimestamps);

      // TODO: Store responses separately
      // For now, responses are collected but not persisted to IndexedDB

      if (onCostUpdate) {
        onCostUpdate(response.cost);
      }
      updateCredits(response.creditsRemaining);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (index: number, content: string) => {
    setEditingMessageId(index);
    setEditValue(content);
  };

  const saveEdit = async (index: number) => {
    if (!editValue.trim()) return;

    // Update message
    const updatedMessages = [...messages];
    updatedMessages[index] = {
      ...updatedMessages[index],
      content: editValue.trim(),
    };
    setMessages(updatedMessages);

    // Update corresponding user response
    const messagesSoFar = updatedMessages.slice(0, index + 1);
    const userMessageIndex = messagesSoFar.filter(m => m.role === 'user').length - 1;

    if (userMessageIndex >= 0 && userMessageIndex < userResponses.length) {
      const updatedResponses = [...userResponses];
      const oldValue = updatedResponses[userMessageIndex].answer;
      updatedResponses[userMessageIndex] = {
        ...updatedResponses[userMessageIndex],
        answer: editValue.trim(),
        isEdited: true,
        editHistory: [
          ...(updatedResponses[userMessageIndex].editHistory || []),
          { value: oldValue, editedAt: Date.now() },
        ],
      };
      setUserResponses(updatedResponses);

      // Persist updated conversation
      const messagesWithTimestamps = updatedMessages.map(msg => ({
        ...msg,
        timestamp: Date.now(),
      }));
      await saveConversation(exerciseId, messagesWithTimestamps);

      // TODO: Update stored responses
    }

    setEditingMessageId(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Apply user preferences
  const fontStyle =
    fontFamily === 'sans'
      ? 'system-ui, -apple-system, sans-serif'
      : fontFamily === 'serif'
        ? 'Georgia, serif'
        : fontFamily === 'courier'
          ? '"Courier New", monospace'
          : 'system-ui, sans-serif';

  const containerStyle = {
    backgroundColor,
    color: textColor,
    fontFamily: fontStyle,
  };

  return (
    <div className="space-y-4" style={containerStyle}>
      {/* Screenplay-style Messages */}
      <div className="space-y-6">
        {messages.length === 0 && isLoading && (
          <div className="animate-pulse">
            <div className="h-3 bg-gray-300/30 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-300/30 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-300/30 rounded w-full"></div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className="space-y-1">
            {message.role === 'assistant' ? (
              // Bee's dialogue - screenplay format
              <div>
                <p className="mb-1 text-sm font-bold uppercase tracking-wide opacity-60">
                  Bee
                </p>
                <p className="leading-relaxed whitespace-pre-wrap pl-4">
                  {message.content}
                </p>
              </div>
            ) : (
              // User's dialogue - screenplay format (editable)
              <div>
                <p className="mb-1 text-sm font-bold uppercase tracking-wide opacity-60">
                  {userName}
                </p>
                {editingMessageId === index ? (
                  // Edit mode
                  <div className="pl-4 space-y-2">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full resize-none bg-transparent border border-current/40 rounded px-3 py-2 focus:border-current focus:outline-none focus:ring-1 focus:ring-current/20"
                      style={{ color: textColor }}
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(index)}
                        className="px-4 py-1 bg-current/10 hover:bg-current/20 rounded text-sm transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-1 bg-transparent hover:bg-current/5 rounded text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode - clickable to edit
                  <p
                    onClick={() => startEdit(index, message.content)}
                    className="leading-relaxed whitespace-pre-wrap pl-4 italic cursor-pointer hover:bg-current/5 rounded p-2 -ml-2 transition-colors"
                    title="Click to edit"
                  >
                    {message.content}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && messages.length > 0 && (
          <div>
            <p className="mb-1 text-sm font-bold uppercase tracking-wide opacity-60">
              Bee
            </p>
            <div className="flex items-center gap-2 pl-4 opacity-50">
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Screenplay style */}
      {messages.length > 0 && (
        <div className="pt-6 border-t border-current/10">
          <div className="space-y-2">
            <p className="text-sm font-bold uppercase tracking-wide opacity-60">
              {userName}
            </p>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response..."
              className="w-full resize-none bg-transparent border border-current/20 rounded px-4 py-3 pl-4 placeholder-current/40 focus:border-current/40 focus:outline-none focus:ring-1 focus:ring-current/20"
              style={{ color: textColor }}
              rows={3}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs opacity-50">
                Press <kbd className="px-1.5 py-0.5 bg-current/10 rounded">Enter</kbd> to send
              </p>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-6 py-2 bg-current/10 hover:bg-current/20 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
