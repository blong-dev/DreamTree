/**
 * Onboarding Page
 * Aesthetic preferences and introduction to DreamTree
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/ChatInterface';
import { useUserStore } from '@/store/useUserStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { useProgressStore } from '@/store/useProgressStore';

export default function OnboardingPage() {
  const router = useRouter();
  const { walletAddress } = useUserStore();
  const { completeExercise } = useProgressStore();
  const {
    backgroundColor,
    fontFamily,
    textColor,
    setBackgroundColor,
    setFontFamily,
    setTextColor,
  } = usePreferencesStore();

  const [showPreferences, setShowPreferences] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  const handlePreferencesComplete = () => {
    setShowPreferences(false);
    setShowChat(true);
  };

  const handleCostUpdate = (cost: number) => {
    setTotalCost((prev) => prev + cost);
  };

  // System prompt for onboarding with exact intro script
  const onboardingPrompt = `You are Bee, an AI career coach introducing DreamTree to a new user.

**CRITICAL - Use this EXACT introduction (word for word):**

"Hi I'm Bee! I'll be your guide here at DreamTree. What should I call you?"

[Wait for their name]

Then respond with:

"It's great to meet you, [their name]! I'm an AI agent tasked with helping you find your dream job."

**After the introduction, continue with:**

1. Ask if they'd like to understand how their data is stored
   - If yes: "Great question! Your data is yours. We use wallet-based encryption, which means your information is stored locally on your device and optionally backed up encrypted on Cloudflare D1. You can download or delete it anytime. Think of it like having the only key to your own safe."
   - If no: "Perfect, let's move forward then."

2. Explain the structure:
   "DreamTree is organized into three parts:

   **Part 1 - Roots:** Understanding your foundation - your skills, values, and interests
   **Part 2 - Trunk:** Building your core - research, strategy, and planning
   **Part 3 - Branches:** Reaching your goals - taking action, networking, and launching

   There are 14 modules total, each with multiple exercises. We'll work through them together."

3. Provide motivation:
   "This isn't about finding 'the perfect job' - it's about discovering work that aligns with who you authentically are. It takes courage to do this deep work, and I'm here to support you every step of the way."

4. Let them ask questions at any time - answer honestly and helpfully

5. When they feel ready, tell them: "Wonderful! Let's dive into Module 1: Work Factors 1 - Skills and Talents. We'll start by exploring your transferable skills..."

**When onboarding is complete**, end your message with:
[EXERCISE_COMPLETE]

**Tone:** Warm, encouraging, like a wise friend. Never pushy. Use their name naturally in conversation.`;

  const handleComplete = () => {
    completeExercise('onboarding');
    router.push('/modules/1/continuous');
  };

  const handleOnboardingComplete = (exerciseId: string) => {
    // Auto-transition to Module 1 continuous flow
    setTimeout(() => {
      handleComplete();
    }, 1500);
  };

  const fontStyle =
    fontFamily === 'sans'
      ? 'system-ui, -apple-system, sans-serif'
      : fontFamily === 'serif'
        ? 'Georgia, serif'
        : fontFamily === 'courier'
          ? '"Courier New", monospace'
          : 'system-ui, sans-serif';

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor, color: textColor, fontFamily: fontStyle }}
    >
      {/* Fixed Cost Tracker - Top Right */}
      <div className="fixed top-4 right-4 z-50 rounded-lg bg-black/10 backdrop-blur-sm px-4 py-2 shadow-lg">
        <div className="text-right">
          <p className="text-xs opacity-60">Session Cost</p>
          <p className="text-lg font-bold">${totalCost.toFixed(4)}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
        {/* Aesthetic Preferences */}
        {showPreferences && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <div className="mb-6 inline-block">
                <span className="text-6xl">🌳</span>
              </div>
              <h1 className="text-4xl font-bold mb-3">Welcome to DreamTree</h1>
              <p className="text-lg opacity-80">
                Let's personalize your experience
              </p>
            </div>

            <div className="space-y-6 max-w-xl mx-auto">
              {/* Background Color */}
              <div>
                <label className="block text-sm font-semibold mb-3 opacity-80">
                  Background Color
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { color: '#FFFFFF', name: 'White' },
                    { color: '#E8D5B7', name: 'Light Cream' },
                    { color: '#2C2416', name: 'Brown' },
                    { color: '#1E293B', name: 'Bluish Charcoal' },
                    { color: '#000000', name: 'Black' },
                  ].map((option) => (
                    <button
                      key={option.color}
                      onClick={() => setBackgroundColor(option.color)}
                      className={`h-16 rounded-lg border-2 transition-all ${
                        backgroundColor === option.color
                          ? 'border-current scale-105'
                          : 'border-current/20 hover:border-current/40'
                      }`}
                      style={{ backgroundColor: option.color }}
                      title={option.name}
                    />
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-sm font-semibold mb-3 opacity-80">
                  Font Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'sans', label: 'Sans', sample: 'Aa', fontStyle: { fontFamily: 'system-ui, -apple-system, sans-serif' } },
                    { value: 'serif', label: 'Serif', sample: 'Aa', fontStyle: { fontFamily: 'Georgia, serif' } },
                    { value: 'courier', label: 'Courier', sample: 'Aa', fontStyle: { fontFamily: '"Courier New", monospace' } },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFontFamily(option.value)}
                      className={`py-4 rounded-lg border-2 transition-all ${
                        fontFamily === option.value
                          ? 'border-current bg-current/5'
                          : 'border-current/20 hover:border-current/40'
                      }`}
                      style={option.fontStyle}
                    >
                      <div className="text-2xl mb-1">{option.sample}</div>
                      <div className="text-xs opacity-60" style={{ fontFamily: 'system-ui, sans-serif' }}>{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-sm font-semibold mb-3 opacity-80">
                  Text Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { color: '#000000', name: 'Black' },
                    { color: '#1F2937', name: 'Charcoal' },
                    { color: '#E5E7EB', name: 'Light Gray' },
                    { color: '#FFFFFF', name: 'White' },
                  ].map((option) => (
                    <button
                      key={option.color}
                      onClick={() => setTextColor(option.color)}
                      className={`h-16 rounded-lg border-2 transition-all ${
                        textColor === option.color
                          ? 'border-current scale-105'
                          : 'border-current/20 hover:border-current/40'
                      }`}
                      style={{ backgroundColor: option.color }}
                      title={option.name}
                    />
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <div className="pt-6">
                <button
                  onClick={handlePreferencesComplete}
                  className="w-full py-4 bg-current/10 hover:bg-current/20 rounded-lg font-semibold transition-colors"
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        {showChat && (
          <div className="space-y-8">
            <ChatInterface
              moduleId={0}
              exerciseId="onboarding"
              systemPrompt={onboardingPrompt}
              onComplete={handleComplete}
              onCostUpdate={handleCostUpdate}
              onExerciseComplete={handleOnboardingComplete}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-sm opacity-50">
          <p>
            Methodology inspired by{' '}
            <a
              href="https://www.parachutebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-70 transition-opacity"
            >
              What Color Is Your Parachute?
            </a>
            {' '}by Richard N. Bolles
          </p>
        </div>
      </div>
    </div>
  );
}
