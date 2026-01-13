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
          <h1>The DreamTree Principles</h1>

          <p><em>A manifesto for the contribution economy.</em></p>

          <hr />

          <h2>1. Human contribution is the foundation of all value.</h2>

          <p>
            Every idea, every skill, every insight began in a human mind. The digital economy
            has obscured this truth, extracting value from attention while leaving creators
            unrecognized. We believe the economy should be rebuilt on contribution — verified,
            attributed, and compensated.
          </p>

          <h2>2. What you create belongs to you.</h2>

          <p>
            Your data, your story, your work — these are not raw materials for others to harvest.
            They are assets you own. Any system that touches your contributions must respect
            your sovereignty over them. This is not a feature. It is a foundation.
          </p>

          <h2>3. Knowledge should be free to use, but never free of its history.</h2>

          <p>
            Intelligence cannot be separated from provenance. Every insight stands on the
            shoulders of those who came before. We build systems that remember — that trace
            the lineage of ideas and honor the humans who shaped them.
          </p>

          <h2>4. Barriers to self-knowledge are barriers to human flourishing.</h2>

          <p>
            The clarity that executives buy for thousands, a student in debt deserves too.
            Libraries do not diminish books by lending them. We delete barriers not because
            it is easy, but because the alternative — hoarding wisdom — diminishes us all.
          </p>

          <h2>5. Abundance is the horizon; cooperation is the path.</h2>

          <p>
            Game theory teaches what wisdom traditions have always known: in the long game,
            cooperation wins. Harmony, balance, and moderation are not constraints on
            abundance — they are the means by which we reach it. The prisoner&apos;s dilemma
            resolves when we choose to cooperate.
          </p>

          <h2>6. Attention is finite; contribution compounds.</h2>

          <p>
            The attention economy extracts until exhaustion. We all feel it. A contribution
            economy can build. Every verified skill, every documented insight, every attributed
            creation becomes a brick in a structure that outlasts us. We choose to build.
          </p>

          <h2>7. Power without wisdom is adolescence.</h2>

          <p>
            We are living through the adolescence of artificial intelligence — and perhaps
            our own. Adolescence is dangerous not because of its energy, but because of its
            blindness. Maturity means aligning power with purpose, capability with conscience.
            We build for wisdom, not just scale.
          </p>

          <h2>8. Centralization is fragility; distribution is resilience.</h2>

          <p>
            When knowledge flows through a single gate, the gatekeeper becomes tyrant.
            When power concentrates, it corrupts — not always through malice, but through
            the quiet displacement of conscience by convenience. We build systems that no
            single entity can own or silence.
          </p>

          <h2>9. The world takes care of those who take care of the world.</h2>

          <p>
            Not always. Not immediately. But often enough to bet on. We plant seeds knowing
            we may not sit in their shade. We give freely because giving is not losing — it
            is growing. The revolutionary path is generosity at scale.
          </p>

          <h2>10. The story is still being written.</h2>

          <p>
            We do not know the ending. We are the last generation to remember a time before
            omnipresent intelligence, and the first to raise children who will never know
            its absence. The hinge of history is now. What we build today becomes the
            foundation of tomorrow. Choose wisely. Build boldly. The ending is not yet written.
          </p>

          <hr />

          <h2>In Practice</h2>

          <p>These principles guide everything we build:</p>

          <p>
            <strong>DreamTree</strong> — where individuals discover and own their story
          </p>

          <p>
            <strong>Value-Tech</strong> — where contributions become verifiable, portable assets
          </p>

          <p>
            <strong>The Great Library</strong> — where human knowledge preserves its lineage forever
          </p>

          <p>
            We are not building a product. We are building infrastructure for a more just
            economy — one that recognizes, attributes, and rewards the humans who create value.
          </p>

          <p>We are only just beginning.</p>

          <hr />

          <h2>Join Us</h2>

          <p>
            This is an open invitation. The code is open. The principles are public.
            The mission belongs to anyone who shares it.
          </p>

          <p>We climb the mountain the hard way because it is the right way.</p>

          <p><em>DreamTree, 2026</em></p>
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
