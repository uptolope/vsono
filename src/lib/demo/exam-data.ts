// ═══════════════════════════════════════════════════════════════════
// SonoPrep — Demo Exam Questions (CLIENT-SAFE)
//
// Exactly 10 questions, sourced verbatim from
// SonoPrep_Exam_Questions_Answers_Explanations.docx (Q1–Q10). These are
// the ONLY demo questions — no other question source may be loaded by
// the demo feature. `id` is the document's own numbered heading (Q1..Q10)
// and doubles as provenance back to that source.
//
// Distractor options (the 3 incorrect choices per question) are UI
// scaffolding only — the source document supplied a single correct
// answer per question, not a full multiple-choice set. The question
// text, correct answer, and explanation below are preserved exactly as
// supplied; only the wrong-answer choices were added, since the demo
// UI is multiple-choice.
//
// This bank is intentionally separate from the paid 155-question bank
// in `src/lib/content/exam-data.ts` and must never merge with it.
// ═══════════════════════════════════════════════════════════════════

export interface DemoQuestion {
  /** Source document ID (Q1..Q10) — also used as the provenance key. */
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  domain: string;
  explanation: string;
}

export const DEMO_QUESTIONS_PER_ATTEMPT = 10;

export const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    id: "Q1",
    question:
      "When using spectral Doppler, what happens to the frequency shift when the angle of incidence increases from 0° to 60°?",
    options: [
      "Frequency shift decreases.",
      "Frequency shift increases.",
      "Frequency shift stays the same.",
      "Frequency shift becomes zero.",
    ],
    correctAnswer: 0,
    domain: "Ultrasound Physics Topic Areas",
    explanation:
      "The Doppler equation includes cosθ. When θ increases from 0° to 60°, cosθ decreases from 1 to 0.5, causing the frequency shift to decrease. Maximum velocity is detected when the beam is parallel to flow (θ = 0°).",
  },
  {
    id: "Q2",
    question:
      "Which type of resolution is determined primarily by the transducer frequency?",
    options: [
      "Axial resolution.",
      "Lateral resolution.",
      "Temporal resolution.",
      "Contrast resolution.",
    ],
    correctAnswer: 0,
    domain: "Ultrasound Physics Topic Areas",
    explanation:
      "Axial resolution is determined by spatial pulse length, which is inversely related to frequency. Higher frequency transducers produce shorter wavelengths and shorter pulses, resulting in better axial resolution.",
  },
  {
    id: "Q3",
    question:
      "What happens to beam penetration when transducer frequency is increased?",
    options: [
      "Penetration decreases.",
      "Penetration increases.",
      "Penetration remains unchanged.",
      "Penetration depends only on power output.",
    ],
    correctAnswer: 0,
    domain: "Ultrasound Physics Topic Areas",
    explanation:
      "Higher frequency ultrasound has greater attenuation in tissue (approximately 0.5 dB/cm/MHz), providing less penetration. Lower frequencies are used for deeper structures at the cost of axial resolution.",
  },
  {
    id: "Q4",
    question: "What are the two main biological effects of ultrasound?",
    options: [
      "Thermal and cavitational.",
      "Electrical and magnetic.",
      "Chemical and thermal.",
      "Mechanical and electrical.",
    ],
    correctAnswer: 0,
    domain: "Ultrasound Physics Topic Areas",
    explanation:
      "The two main biological effects are thermal (tissue heating from absorbed ultrasound energy) and cavitational (bubble formation and collapse). These are monitored using the Thermal Index and Mechanical Index.",
  },
  {
    id: "Q5",
    question:
      "What percentage of ultrasound energy is reflected at a soft tissue-to-bone interface?",
    options: [
      "Nearly 100%.",
      "About 50%.",
      "About 25%.",
      "Less than 10%.",
    ],
    correctAnswer: 0,
    domain: "Ultrasound Physics Topic Areas",
    explanation:
      "Bone has a very different acoustic impedance compared to soft tissue, resulting in nearly total reflection (approximately 99%) of the ultrasound beam. This is why bone causes acoustic shadowing.",
  },
  {
    id: "Q6",
    question:
      "The Mechanical Index (MI) on an ultrasound machine displays 0.8. What does this value indicate?",
    options: [
      "Likelihood of cavitation.",
      "Tissue heating risk.",
      "Frame rate limitation.",
      "Spatial resolution loss.",
    ],
    correctAnswer: 0,
    domain: "Ultrasound Physics Topic Areas",
    explanation:
      "The Mechanical Index estimates the likelihood of cavitational effects based on the peak negative pressure in the ultrasound beam. An MI of 0.8 indicates moderate cavitational potential.",
  },
  {
    id: "Q7",
    question:
      "A mirror image artifact shows duplicate structures. What is the most common cause?",
    options: [
      "Refraction at a curved interface.",
      "Attenuation in soft tissue.",
      "Reverberation between two parallel reflectors.",
      "Aliasing in color Doppler.",
    ],
    correctAnswer: 0,
    domain: "Ultrasound Physics Topic Areas",
    explanation:
      "Refraction at a curved interface can cause beam deflection, creating duplicate structures. The most common example is hepatic vein duplication above the diaphragm.",
  },
  {
    id: "Q8",
    question:
      "In color Doppler, aliasing occurs when blood velocity exceeds the Nyquist limit. How can you typically reduce aliasing?",
    options: [
      "Increase the baseline shift.",
      "Decrease the pulse repetition frequency.",
      "Increase the color gain.",
      "Widen the region of interest.",
    ],
    correctAnswer: 0,
    domain: "Ultrasound Physics Topic Areas",
    explanation:
      "Shifting the baseline effectively doubles the Nyquist limit, allowing higher velocities to be displayed without aliasing. Other methods include increasing PRF or using continuous wave Doppler.",
  },
  {
    id: "Q9",
    question:
      "What is the typical attenuation coefficient of soft tissue in dB/cm/MHz?",
    options: [
      "0.5 dB/cm/MHz.",
      "1.0 dB/cm/MHz.",
      "0.1 dB/cm/MHz.",
      "2.0 dB/cm/MHz.",
    ],
    correctAnswer: 0,
    domain: "Ultrasound Physics Topic Areas",
    explanation:
      "The average attenuation coefficient of soft tissue is approximately 0.5 dB/cm/MHz. This means for every 1 MHz of frequency and every centimeter of depth, the signal loses about 0.5 dB.",
  },
  {
    id: "Q10",
    question: "What is acoustic impedance (Z) and how is it calculated?",
    options: [
      "Z = ρ × c (density times speed).",
      "Z = ρ / c (density divided by speed).",
      "Z = c / ρ (speed divided by density).",
      "Z = ρ × f (density times frequency).",
    ],
    correctAnswer: 0,
    domain: "Ultrasound Physics Topic Areas",
    explanation:
      "Acoustic impedance (Z) = density (ρ) × speed of sound (c). It represents the resistance to ultrasound wave propagation at an interface and determines how much sound is reflected.",
  },
];

export const DEMO_QUESTION_IDS: readonly string[] = DEMO_QUESTIONS.map(
  (q) => q.id
);
