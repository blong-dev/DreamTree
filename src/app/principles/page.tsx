'use client';

import { useRouter } from 'next/navigation';
import { AcornIcon } from '@/components/icons';

export default function PrinciplesPage() {
  const router = useRouter();

  return (
    <div className="about-page">
      <header className="landing-header">
        <div className="landing-logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <AcornIcon width={32} height={32} />
          <span className="landing-wordmark">dreamtree</span>
        </div>
        <nav className="landing-nav">
          <button
            className="button button-ghost button-sm"
            onClick={() => router.push('/login')}
          >
            Sign In
          </button>
          <button
            className="button button-primary button-sm"
            onClick={() => router.push('/signup')}
          >
            Get Started
          </button>
        </nav>
      </header>

      <main className="about-main">
        <article className="about-content">
          <h1>Our Principles</h1>

          <p>
            DreamTree is built on four principles. They&apos;re not marketing.
            They&apos;re architectural decisions baked into the code.
          </p>

          <hr />

          <h2>1. Conversational Intimacy</h2>

          <p>
            Career work is personal. It deserves better than forms and progress bars.
          </p>

          <p>
            DreamTree feels like texting with a thoughtful coach. Messages appear one at a time.
            You respond in your own words. The interface fades away, leaving just the conversation.
          </p>

          <p>
            This isn&apos;t a design preference. It&apos;s the core emotional experience.
            The conversation metaphor shapes everything — how content flows, how you interact,
            how it feels to use.
          </p>

          <hr />

          <h2>2. User Autonomy</h2>

          <p>
            You set the pace. There are no deadlines, no reminders, no streaks to maintain.
          </p>

          <p>
            Skip the typing animation if you&apos;re in a hurry. Go back and edit previous answers.
            Choose your own colors and fonts. This is your space, not ours.
          </p>

          <p>
            We don&apos;t gamify your progress because you&apos;re not a user to be retained.
            You&apos;re a person doing important work. Points and badges would cheapen that.
          </p>

          <hr />

          <h2>3. Data Sovereignty</h2>

          <p>
            Your data belongs to you. Not to us. Not to advertisers. Not to anyone else.
          </p>

          <p>
            Personal information is encrypted with keys derived from your password.
            We can&apos;t read your data — not as a policy choice, but as a mathematical fact.
            Even if someone demanded access, we couldn&apos;t provide it.
          </p>

          <p>
            Export everything anytime. Delete everything permanently. The code is open source
            so you can verify these claims yourself.
          </p>

          <hr />

          <h2>4. Magic Moments</h2>

          <p>
            DreamTree remembers what you&apos;ve said and weaves it back when it matters.
          </p>

          <p>
            The skill you identified in Part 1 shows up in your story draft in Part 2.
            The value you ranked highest becomes a filter for evaluating opportunities.
            Your past answers inform your future exercises.
          </p>

          <p>
            These moments create the feeling of being truly heard — the feeling that
            separates real coaching from filling out forms. We call them connections,
            and there are over thirty of them woven throughout the workbook.
          </p>

          <hr />

          <h2>Why This Matters</h2>

          <p>
            Most software treats users as metrics to optimize. More engagement. More retention.
            More data to harvest.
          </p>

          <p>
            We think that&apos;s backwards. Technology should serve your intentions, not demand
            your attention. It should respect your intelligence, protect your privacy,
            and get out of the way.
          </p>

          <p>
            These principles aren&apos;t aspirational. They&apos;re in the code.
            <a href="https://github.com/blong-dev/DreamTree" target="_blank" rel="noopener noreferrer"> See for yourself.</a>
          </p>
        </article>
      </main>

      <footer className="landing-footer">
        <p>Your personal data is encrypted. We can&apos;t read it. That&apos;s the point.</p>
        <nav className="landing-footer-nav">
          <a href="/about">About</a>
          <a href="/principles">Principles</a>
          <a href="https://github.com/blong-dev/DreamTree" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </footer>
    </div>
  );
}
