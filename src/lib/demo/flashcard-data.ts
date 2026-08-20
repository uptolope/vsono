// ═══════════════════════════════════════════════════════════════════
// SonoPrep — Demo Flashcards (CLIENT-SAFE)
// 10 sample flashcards for the free demo. ORIGINAL demo content,
// not pulled from the paid 200-card deck.
// Safe to ship in the client bundle.
// ═══════════════════════════════════════════════════════════════════

export interface DemoFlashcard {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export const DEMO_FLASHCARDS: DemoFlashcard[] = [
  {
    id: 801,
    question: "What is the speed of sound in average soft tissue?",
    answer: "1,540 m/s — this is the calibration assumption used by all diagnostic ultrasound machines to calculate depth.",
    category: "physics",
  },
  {
    id: 802,
    question: "What is acoustic impedance?",
    answer: "The product of tissue density and the speed of sound in that tissue (Z = ρ × c). Differences in impedance between tissues determine how much ultrasound is reflected at boundaries.",
    category: "physics",
  },
  {
    id: 803,
    question: "What is the piezoelectric effect?",
    answer: "Certain crystals (e.g., PZT) convert electrical energy to mechanical (sound) energy and vice versa. This is how transducers both transmit and receive ultrasound.",
    category: "transducers",
  },
  {
    id: 804,
    question: "What determines axial resolution?",
    answer: "Spatial pulse length (SPL). Shorter pulses (higher frequency, fewer cycles) improve axial resolution. Two structures must be separated by at least ½ the SPL to be resolved.",
    category: "physics",
  },
  {
    id: 805,
    question: "What is aliasing in Doppler ultrasound?",
    answer: "A sampling error that occurs when the Doppler shift exceeds the Nyquist limit (half the PRF). The waveform wraps around the baseline. Fix: increase PRF, use CW Doppler, increase angle, or use a lower-frequency transducer.",
    category: "doppler",
  },
  {
    id: 806,
    question: "What does the Thermal Index (TI) estimate?",
    answer: "The estimated temperature rise in tissue caused by ultrasound exposure. TI = 1.0 means the beam could raise tissue temperature by approximately 1°C.",
    category: "safety",
  },
  {
    id: 807,
    question: "Name the three types of Thermal Index.",
    answer: "TIS (soft tissue), TIB (bone at or near focus), TIC (cranial bone at the transducer surface). Use TIB for obstetric scanning after the first trimester when fetal bone is present.",
    category: "safety",
  },
  {
    id: 808,
    question: "What is the difference between lateral and axial resolution?",
    answer: "Axial resolution distinguishes structures along the beam axis (determined by SPL). Lateral resolution distinguishes structures perpendicular to the beam (determined by beam width, worst in the far field).",
    category: "physics",
  },
  {
    id: 809,
    question: "What artifact appears deep to a fluid-filled structure?",
    answer: "Posterior acoustic enhancement (increased through-transmission). Sound passes through fluid with less attenuation, so echoes deep to the structure appear brighter than surrounding tissue at the same depth.",
    category: "artifacts",
  },
  {
    id: 810,
    question: "What is the ALARA principle?",
    answer: "As Low As Reasonably Achievable — use the minimum ultrasound output (power, time, TI, MI) needed to obtain diagnostic information. It is the guiding safety principle for all ultrasound examinations.",
    category: "safety",
  },
];
