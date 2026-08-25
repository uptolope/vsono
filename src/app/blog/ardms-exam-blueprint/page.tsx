import type { Metadata } from "next";
import BlogPostLayout, { proseClasses } from "@/components/BlogPostLayout";

export const metadata: Metadata = {
  title: "ARDMS SPI Exam Blueprint: Domain Weightings Explained | SonoPrep",
  description:
    "A breakdown of the official ARDMS SPI content outline — exactly how many questions come from each domain and how to allocate your study time.",
  keywords: [
    "ARDMS SPI exam blueprint",
    "SPI content outline",
    "SPI domain weightings",
  ],
  alternates: {
    canonical: "https://sonoprep.com/blog/ardms-exam-blueprint",
  },
};

export default function Page() {
  return (
    <BlogPostLayout
      tag="EXAM BLUEPRINT"
      title="ARDMS SPI Exam Blueprint: Domain Weightings Explained"
      date="April 26, 2026"
      read="17 min read"
      url="https://sonoprep.com/blog/ardms-exam-blueprint"
      description="A breakdown of the official ARDMS SPI content outline — exactly how many questions come from each domain, and how to weight your study time accordingly."
    >
      <p>
        Every SPI exam question comes from one of five domains in the official
        ARDMS content outline. ARDMS publishes this outline so candidates know
        exactly what to expect — and it's the single most useful document you
        can study before opening a textbook. If you only read one thing before
        you start preparing, read this.
      </p>

      <p>
        The current outline took effect in September 2023 and represents a
        meaningful shift from the previous version. If your school handed you
        study materials written before that date, some of the domain weightings
        you were given are out of date. Here's the current breakdown.
      </p>

      <h2 className={proseClasses.h2}>The five domains</h2>

      <table className={proseClasses.table}>
        <thead>
          <tr>
            <th className={proseClasses.th}>Domain</th>
            <th className={proseClasses.th}>Weight</th>
            <th className={proseClasses.th}>Approx. questions (of 110)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={proseClasses.td}>
              1. Perform Ultrasound Examinations
            </td>
            <td className={proseClasses.td}>23%</td>
            <td className={proseClasses.td}>~25</td>
          </tr>
          <tr>
            <td className={proseClasses.td}>
              2. Manage Ultrasound Transducers
            </td>
            <td className={proseClasses.td}>7%</td>
            <td className={proseClasses.td}>~8</td>
          </tr>
          <tr>
            <td className={proseClasses.td}>3. Optimize Sonographic Images</td>
            <td className={proseClasses.td}>26%</td>
            <td className={proseClasses.td}>~29</td>
          </tr>
          <tr>
            <td className={proseClasses.td}>4. Apply Doppler Concepts</td>
            <td className={proseClasses.td}>34%</td>
            <td className={proseClasses.td}>~37</td>
          </tr>
          <tr>
            <td className={proseClasses.td}>
              5. Provide Clinical Safety &amp; Quality Assurance
            </td>
            <td className={proseClasses.td}>10%</td>
            <td className={proseClasses.td}>~11</td>
          </tr>
        </tbody>
      </table>

      <p>
        Two domains — Apply Doppler Concepts and Optimize Sonographic Images —
        together account for 60% of the exam. That's more than half the test
        coming from just two of the five domains. If your study time is spread
        evenly across all five, you are under-preparing for the majority of the
        exam.
      </p>

      <div className={proseClasses.callout}>
        <p className="text-white text-sm mb-0">
          <strong>Quick gut check:</strong> if you can't confidently work
          through aliasing, wall filters, sample gate placement, and spectral
          Doppler measurements, you have a gap in the single largest domain on
          the exam — worth fixing before test day, not after.
        </p>
      </div>

      <h2 className={proseClasses.h2}>
        Domain 1: Perform Ultrasound Examinations (23%)
      </h2>
      <p>
        This domain covers the practical side of scanning — patient care,
        ergonomics, how sound interacts with tissue (echogenicity, reflection,
        attenuation), gray-scale artifacts like reverberation and shadowing,
        bioeffects, beam steering, and 3D/4D and contrast imaging concepts. It
        also includes patient management basics: verifying identity, reviewing
        history, and documentation standards.
      </p>
      <p>
        This domain rewards conceptual understanding over memorization.
        Questions tend to describe a scanning scenario and ask what's happening
        physically, or what you should do next.
      </p>

      <h2 className={proseClasses.h2}>
        Domain 2: Manage Ultrasound Transducers (7%)
      </h2>
      <p>
        The smallest domain, but don't skip it — at roughly 8 questions, it's
        still worth more than some people assume going in. Covers transducer
        selection, frequency tradeoffs, 2D array concepts, 3D/4D transducers,
        and non-imaging transducer applications (continuous wave Doppler probes,
        for example).
      </p>
      <p>
        Because this domain is compact, it's one of the most efficient places to
        study — a focused review session can cover nearly the entire domain.
      </p>

      <h2 className={proseClasses.h2}>
        Domain 3: Optimize Sonographic Images (26%)
      </h2>
      <p>
        This is where resolution concepts live — axial, lateral, elevational,
        and temporal resolution, plus frame rate, scan lines, line density, and
        sector width tradeoffs. It also covers image optimization tools: TGC,
        harmonic imaging, dynamic range, spatial compounding, edge enhancement,
        depth, and M-mode.
      </p>
      <p>
        Many of these concepts interact with each other — increasing frame rate
        often means decreasing line density or sector width, for example. The
        exam tests whether you understand those tradeoffs, not just definitions
        in isolation.
      </p>

      <h2 className={proseClasses.h2}>
        Domain 4: Apply Doppler Concepts (34%)
      </h2>
      <p>
        The largest domain by a wide margin, and the one most students
        underestimate before they start studying. Covers Doppler angle and the
        Doppler equation, the Doppler effect and Doppler shift, wall filters,
        sample gate placement, color priority, color Doppler maps, aliasing and
        how to eliminate it, continuous wave versus pulsed wave Doppler, color
        and power Doppler, tissue Doppler, spectral waveform evaluation, Doppler
        measurements, gain and scale settings for both spectral and color
        Doppler, and general hemodynamic principles like pressure gradients and
        resistance.
      </p>
      <p>
        If you take nothing else from this guide: Doppler is over a third of the
        exam. A weak grasp of aliasing, the Doppler equation, or wall filter
        behavior will cost you more points than a weak grasp of almost anything
        else on the test.
      </p>

      <h2 className={proseClasses.h2}>
        Domain 5: Provide Clinical Safety &amp; Quality Assurance (10%)
      </h2>
      <p>
        Covers infection control protocols, quality assurance documentation,
        transducer integrity checks, machine integrity verification, gray-scale
        QA testing with tissue-mimicking phantoms, and statistical concepts like
        sensitivity and specificity.
      </p>
      <p>
        This domain tends to be more memorization-based than the others —
        protocols and definitions rather than applied physics — which makes it a
        good candidate for flashcard-style review.
      </p>

      <h2 className={proseClasses.h2}>How to use this blueprint</h2>
      <p>
        A simple, defensible approach: allocate your study time roughly in
        proportion to domain weight, with a floor for the smaller domains so you
        don't skip them entirely. In practice, that means Doppler and image
        optimization should make up well over half of your total study hours,
        while transducers and clinical safety get focused, efficient review
        sessions rather than open-ended study time.
      </p>
      <p>
        It also means your practice exams should mirror this distribution. If a
        practice test gives every domain equal weight, your score on it won't
        accurately predict your real exam score — you could do well on a
        practice test that underweights Doppler and still walk into the real
        exam underprepared for over a third of the questions.
      </p>
    </BlogPostLayout>
  );
}
