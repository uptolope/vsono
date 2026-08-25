// ═══════════════════════════════════════════════════════════════════
// SonoPrep — Demo Exam Questions (CLIENT-SAFE)
// 5 sample questions for the free demo. These are ORIGINAL demo
// questions, not pulled from the paid 111-question bank.
// Safe to ship in the client bundle.
// ═══════════════════════════════════════════════════════════════════

export interface DemoQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  domain: string;
  explanation: string;
}

export const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    id: 901,
    question:
      "As ultrasound frequency increases, what happens to axial resolution?",
    options: [
      "Axial resolution worsens",
      "Axial resolution improves",
      "Axial resolution is unchanged",
      "Axial resolution becomes unpredictable",
    ],
    correctAnswer: 1,
    domain: "Domain 1: Physics Principles",
    explanation:
      "Higher frequency produces shorter wavelengths and shorter spatial pulse length, which improves axial resolution. The trade-off is decreased penetration depth.",
  },
  {
    id: 902,
    question: "Which index on the ultrasound machine estimates the risk of cavitation?",
    options: [
      "Thermal Index (TI)",
      "Mechanical Index (MI)",
      "Frame Rate Index",
      "Gain Index",
    ],
    correctAnswer: 1,
    domain: "Domain 5: Bioeffects & Safety",
    explanation:
      "The Mechanical Index (MI) estimates the likelihood of cavitation — the formation and collapse of gas bubbles in tissue. It is calculated from peak rarefactional pressure divided by the square root of the center frequency.",
  },
  {
    id: 903,
    question:
      "In pulsed-wave Doppler, what artifact occurs when the Doppler shift exceeds the Nyquist limit?",
    options: ["Shadowing", "Aliasing", "Mirror image", "Ring-down"],
    correctAnswer: 1,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation:
      "Aliasing occurs when the sampled Doppler shift frequency exceeds half the pulse repetition frequency (the Nyquist limit). The waveform wraps around and appears on the opposite side of the baseline.",
  },
  {
    id: 904,
    question:
      "What type of transducer uses a flat array of elements to produce a rectangular image?",
    options: [
      "Sector/phased array",
      "Linear array",
      "Convex (curved) array",
      "Annular array",
    ],
    correctAnswer: 1,
    domain: "Domain 2: Transducer Technology",
    explanation:
      "A linear array transducer has a flat row of elements that fire sequentially to produce a rectangular field of view. It provides excellent near-field resolution and is commonly used for vascular and superficial imaging.",
  },
  {
    id: 905,
    question:
      "Which artifact is caused by an ultrasound beam striking a highly reflective, smooth surface at a perpendicular angle, producing equally spaced parallel lines?",
    options: [
      "Comet tail artifact",
      "Reverberation artifact",
      "Side lobe artifact",
      "Refraction artifact",
    ],
    correctAnswer: 1,
    domain: "Domain 3: Principles of Imaging",
    explanation:
      "Reverberation occurs when ultrasound bounces back and forth between two strong reflectors (or between the transducer face and a reflector). The repeated echoes are displayed at increasing depths as equally spaced parallel lines.",
  },
];
