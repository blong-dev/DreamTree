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
            <h1>Design Your Career</h1>
            <p className="landing-hero-subtitle">
              A guided workbook experience to discover your skills, tell your story,
              and build a career that fits who you are.
            </p>
            <div className="landing-hero-actions">
              <button
                className="button button-primary button-lg"
                onClick={() => router.push('/signup')}
              >
                Start Your Journey
              </button>
            </div>
          </div>
        </section>

        <section className="landing-features">
          <div className="landing-feature">
            <div className="landing-feature-icon">1</div>
            <h3>Discover Your Skills</h3>
            <p>Uncover transferable, self-management, and knowledge-based skills through structured reflection.</p>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">2</div>
            <h3>Tell Your Story</h3>
            <p>Build powerful SOARED stories that showcase your experience and impact.</p>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">3</div>
            <h3>Design Your Future</h3>
            <p>Create a career vision aligned with your values, interests, and goals.</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>Built with care for career explorers everywhere.</p>
      </footer>
    </div>
  );
}
