'use client';

import { useRouter } from 'next/navigation';
import { AcornIcon } from '@/components/icons';

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-logo">
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

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-content">
            <h1>A Space to Go Deep</h1>
            <p className="landing-hero-subtitle">
              Career transitions are hard. DreamTree is a guided workbook you text through —
              helping you discover what you&apos;re good at, tell your story, and figure out what&apos;s next.
              At your own pace.
            </p>
            <div className="landing-hero-actions">
              <button
                className="button button-primary button-lg"
                onClick={() => router.push('/signup')}
              >
                Begin When You&apos;re Ready
              </button>
            </div>
          </div>
        </section>

        <section className="landing-features">
          <div className="landing-feature">
            <div className="landing-feature-icon">1</div>
            <h3>Discover What You&apos;re Good At</h3>
            <p>Not a quiz. A conversation. We&apos;ll help you uncover skills you&apos;ve forgotten and patterns you couldn&apos;t see alone.</p>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">2</div>
            <h3>Tell Your Story</h3>
            <p>Your experience matters. We&apos;ll help you find the moments that shaped you and turn them into stories worth telling.</p>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">3</div>
            <h3>Figure Out What&apos;s Next</h3>
            <p>Clarity, not pressure. A direction that feels like yours, not someone else&apos;s template.</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>Your data is encrypted. Your pace is yours. No points, no streaks, no rush.</p>
      </footer>
    </div>
  );
}
