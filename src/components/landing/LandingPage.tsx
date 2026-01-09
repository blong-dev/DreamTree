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
            <h1>Go Deep</h1>
            <p className="landing-hero-subtitle">
              Most career tools give you a quiz and a label. DreamTree is different —
              a guided workbook that helps you actually understand what you&apos;re good at,
              build stories worth telling, and figure out what&apos;s next.
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
            <h3>Know What You&apos;re Good At</h3>
            <p>Not a 5-minute quiz. A real conversation about your skills, patterns, and what makes you tick.</p>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">2</div>
            <h3>Build Your Story</h3>
            <p>Your experience is raw material. We help you shape it into something you can use.</p>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">3</div>
            <h3>Figure Out What&apos;s Next</h3>
            <p>Clarity without the bullshit. A direction that&apos;s actually yours.</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>Your personal data is encrypted. We can&apos;t read it. That&apos;s the point.</p>
      </footer>
    </div>
  );
}
