"use client";

import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Study the right material",
    description:
      "Prepare with content mapped to the official ARDMS SPI exam outline so your study time stays focused.",
  },
  {
    number: "02",
    title: "Practice with purpose",
    description:
      "Use realistic questions, detailed explanations, and targeted review to identify and improve weak areas.",
  },
  {
    number: "03",
    title: "Build exam confidence",
    description:
      "Track your progress with flashcards, physics notes, and a full exam simulator built for SPI preparation.",
  },
];

const stats = [
  {
    value: "1,000+",
    label: "Practice questions",
  },
  {
    value: "49",
    label: "Study pages",
  },
  {
    value: "24/7",
    label: "Access to your prep",
  },
  {
    value: "10-day",
    label: "Money-back guarantee",
  },
];

export function HomePageClient() {
  return (
    <main className="home-page">
      <header className="site-header">
        <div className="container site-header-inner">
          <Link href="/" className="site-logo" aria-label="SonoPrep home">
            SonoPrep
          </Link>

          <nav className="site-nav" aria-label="Main navigation">
            <Link href="/practice">Practice</Link>
            <Link href="/flashcards">Flashcards</Link>
            <Link href="/notes">Physics notes</Link>
            <Link href="/pricing">Pricing</Link>
          </nav>

          <div className="site-header-actions">
            <Link href="/login" className="header-login">
              Sign in
            </Link>

            <Link href="/signup" className="premium-cta header-cta">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="home-hero">
        <div className="hero-aurora" aria-hidden="true" />

        <div className="home-container hero-content">
          <p className="t-caption fade-up">ARDMS SPI EXAM PREP</p>

          <h1 className="t-display fade-up">
            Pass the SPI exam on your first attempt.
          </h1>

          <p className="t-body hero-description fade-up-delay">
            A focused exam preparation system with a question bank,
            flashcards, physics notes, and a full exam simulator—all mapped to
            the official ARDMS content outline.
          </p>

          <div className="hero-actions fade-up-delay">
            <Link href="/signup" className="premium-cta">
              Start studying
              <span aria-hidden="true">→</span>
            </Link>

            <Link href="/practice" className="ghost-cta">
              Try free practice
            </Link>
          </div>

          <p className="hero-note fade-up-delay">
            No account required for free practice
          </p>
        </div>
      </section>

      <section className="section">
        <div className="home-container">
          <div className="section-header">
            <p className="section-eyebrow">Everything you need</p>

            <h2 className="section-title">Study smarter, not longer.</h2>

            <p className="section-description">
              SonoPrep brings your entire SPI preparation workflow into one
              focused study system.
            </p>
          </div>

          <div className="home-grid">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="feature-card lift-card"
              >
                <div className="feature-icon" aria-hidden="true">
                  {feature.number}
                </div>

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section stats-section">
        <div className="home-container">
          <div className="stats-grid">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="home-container">
          <div className="final-cta lift-card">
            <p className="section-eyebrow">Ready to get started?</p>

            <h2 className="section-title">
              Turn your study time into exam confidence.
            </h2>

            <p className="section-description">
              Start with free practice, then build a preparation plan that
              works for you.
            </p>

            <div className="hero-actions">
              <Link href="/signup" className="premium-cta">
                Start preparing
                <span aria-hidden="true">→</span>
              </Link>

              <Link href="/pricing" className="secondary-cta">
                View plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="home-container site-footer-inner">
          <p>© {new Date().getFullYear()} SonoPrep</p>

          <div className="footer-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
