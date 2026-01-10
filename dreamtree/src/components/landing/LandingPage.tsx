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
            <h1>Figure Out What&apos;s Next</h1>
            <p className="landing-hero-subtitle">
              A guided workbook you text through. For people in career transitions
              who want clarity, not a quiz result.
            </p>
            <div className="landing-hero-actions">
              <button
                className="button button-primary button-lg"
                onClick={() => router.push('/signup')}
              >
                Get Started
              </button>
            </div>
          </div>
        </section>

        <section className="landing-features">
          <div className="landing-feature">
            <div className="landing-feature-icon">1</div>
            <h3>Uncover Your Skills</h3>
            <p>A real conversation about what you&apos;re good at — the patterns you couldn&apos;t see alone.</p>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">2</div>
            <h3>Build Your Story</h3>
            <p>Turn your experience into stories you can tell with confidence.</p>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">3</div>
            <h3>Find Your Direction</h3>
            <p>Clarity on what&apos;s next. A direction that fits who you are.</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>Your personal data is encrypted. We can&apos;t read it. That&apos;s the point.</p>
      </footer>
    </div>
  );
}
