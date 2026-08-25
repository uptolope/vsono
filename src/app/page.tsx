import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Focused practice",
    description:
      "Practice the concepts that matter most with structured questions designed around the SPI exam.",
  },
  {
    number: "02",
    title: "Smarter review",
    description:
      "Identify weak areas quickly and spend your study time where it produces the greatest improvement.",
  },
  {
    number: "03",
    title: "Built for confidence",
    description:
      "Use realistic practice sessions, detailed explanations, and repeat review to walk into test day prepared.",
  },
];

const stats = [
  ["49", "Study pages"],
  ["24/7", "Practice access"],
  ["100%", "Focused on imaging"],
  ["1", "Clear study path"],
];

export default function HomePage() {
  return (
    <main className="home-page">
      <header className="site-header">
        <div className="container site-header-inner">
          <Link href="/" className="site-logo">
            SonoPrep
          </Link>

          <nav className="site-nav" aria-label="Main navigation">
            <Link href="/flashcards">Flashcards</Link>
            <Link href="/practice">Practice</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/login">Sign in</Link>
          </nav>

          <Link href="/signup" className="premium-cta">
            Get started
          </Link>
        </div>
      </header>

      <section className="home-hero">
        <div className="hero-aurora" />

        <div className="home-container hero-content">
          <p className="t-caption fade-up">
            SPI · RDMS · RDCS · RVT · RMSKS
          </p>

          <h1 className="t-display fade-up">
            Pass your ultrasound exams with confidence.
          </h1>

          <p className="t-body hero-description fade-up-delay">
            SonoPrep gives you a focused way to study, practice, and review the
            material that matters most—without turning preparation into a
            second full-time job.
          </p>

          <div className="hero-actions fade-up-delay">
            <Link href="/signup" className="premium-cta">
              Start studying
              <span aria-hidden="true">→</span>
            </Link>

            <Link href="/demo" className="ghost-cta">
              Explore the platform
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="home-container">
          <div className="section-header">
            <p className="section-eyebrow">A better way to prepare</p>
            <h2 className="section-title">
              Less wandering. More meaningful practice.
            </h2>
            <p className="section-description">
              Everything is designed to help you build knowledge, find gaps,
              and make steady progress.
            </p>
          </div>

          <div className="home-grid">
            {features.map((feature) => (
              <article className="feature-card lift-card" key={feature.number}>
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

      <section className="section">
        <div className="home-container">
          <div className="stats-grid">
            {stats.map(([value, label]) => (
              <div className="stat-card" key={label}>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="home-container">
          <div className="lift-card" style={{ padding: "48px" }}>
            <p className="section-eyebrow">Your next study session</p>

            <h2 className="section-title">
              Turn uncertainty into a plan.
            </h2>

            <p className="section-description">
              Start with focused practice, review your results, and keep
              building from there.
            </p>

            <div className="hero-actions">
              <Link href="/signup" className="premium-cta">
                Begin preparation
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="section" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div className="home-container">
          <p className="t-muted">© {new Date().getFullYear()} SonoPrep</p>
        </div>
      </footer>
    </main>
  );
}