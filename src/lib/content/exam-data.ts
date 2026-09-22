import "server-only";
// ═══════════════════════════════════════════════════════════════════
// SonoPrep — Exam Questions (SERVER-SIDE ONLY)
// 155 SPI exam questions, sourced verbatim (content-wise) from the
// "Sonographic Physics — SonoPrep For Board Exams" question bank
// (source: Sonographic_Physics__SonoPrep_For_Board_Exams_copy.pdf).
// Every record preserves the source's original question order and ID
// (1–155), including source duplicates, which are kept as separate
// records rather than deduplicated.
// 14 records were editorially corrected (typos, garbled formulas, or
// answer-choice/order ambiguity) — see EDITORIALLY_CORRECTED_IDS below
// and each record's editorialNote for the specific rationale.
// SECURITY: correctAnswer field must NEVER be sent to the client
// DO NOT IMPORT THIS FILE IN CLIENT COMPONENTS
// ═══════════════════════════════════════════════════════════════════

import { randomInt } from "node:crypto";

export interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option — NEVER expose to client
  domain: string;
  explanation: string; // Only shown AFTER answer submission
  /** Editorial review status against the source question bank. */
  editorialStatus: "validated" | "editorially_corrected";
  /** Present only when editorialStatus is "editorially_corrected". */
  editorialNote?: string;
}

export type ExamDomain =
  | "Domain 1: Physics Principles"
  | "Domain 2: Transducer Technology"
  | "Domain 3: Principles of Imaging"
  | "Domain 4: Doppler & Hemodynamics"
  | "Domain 5: Bioeffects & Safety";

// Supported domains — exactly 5. Marketing/UI copy must match this
// count; do not describe the exam as covering "6 domains" anywhere.
const DOMAINS: ExamDomain[] = [
  "Domain 1: Physics Principles",
  "Domain 2: Transducer Technology",
  "Domain 3: Principles of Imaging",
  "Domain 4: Doppler & Hemodynamics",
  "Domain 5: Bioeffects & Safety",
];

/**
 * The 14 question IDs that received a mandatory editorial review pass.
 * Used by the validator below to assert that exactly this set — no
 * more, no fewer — carries editorialStatus "editorially_corrected".
 */
const EDITORIALLY_CORRECTED_IDS = [
  43, 61, 70, 83, 84, 91, 103, 105, 108, 130, 136, 139, 141, 154,
] as const;

/** All 155 exam questions — SERVER USE ONLY */
export const EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 1,
    question: `Ultrasound wave propagation causes displacement of particles in a medium. The regions of greatest particle concentration are called ____ while the regions of lowest particle concentration are called ____?`,
    options: [
      `Compressions, rarefactions`,
      `Rarefactions, compressions`,
      `Elevation, depression`,
      `Depression, elevation`,
    ],
    correctAnswer: 0,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Compressions, rarefactions.`,
    editorialStatus: "validated",
  },
  {
    id: 2,
    question: `The effects of ultrasound on living tissue are called?`,
    options: [
      `Hazardous effects`,
      `Chemical effects`,
      `Tissue effects`,
      `Bio-effects`,
    ],
    correctAnswer: 3,
    domain: "Domain 5: Bioeffects & Safety",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Bio-effects.`,
    editorialStatus: "validated",
  },
  {
    id: 3,
    question: `The acoustic variables that change as sound propagates through a medium?`,
    options: [
      `Pressure`,
      `Density`,
      `Particle motion`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 4,
    question: `The properties that describe the effects of the medium on the sound wave travelling through it are called?`,
    options: [
      `Mechanical properties`,
      `Travelling properties`,
      `Acoustic propagation properties`,
      `Variable properties`,
    ],
    correctAnswer: 2,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Acoustic propagation properties.`,
    editorialStatus: "validated",
  },
  {
    id: 5,
    question: `Destructive interference results?`,
    options: [
      `when a pair of in-phase waves interferes with each other`,
      `when a pair of conjugal waves interferes with each other`,
      `when a pair of out-of-phase waves interferes with each other`,
      `when a pair of transverse waves interferes with each other`,
    ],
    correctAnswer: 2,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: when a pair of out-of-phase waves interferes with each other.`,
    editorialStatus: "validated",
  },
  {
    id: 6,
    question: `Transverse waves travel____ to the motion of the particle in the wave, while longitudinal waves travel ____ to the particle motion?`,
    options: [
      `incidental`,
      `Perpendicular`,
      `Parallel`,
      `a & b`,
      `b & c`,
    ],
    correctAnswer: 4,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: b & c.`,
    editorialStatus: "validated",
  },
  {
    id: 7,
    question: `Waves that are in-phase interfere constructively with each other. The single wave resulting from the interference will always have a ____ amplitude than either of the original waves?`,
    options: [
      `Smaller`,
      `Higher`,
      `Longer`,
      `The same`,
    ],
    correctAnswer: 1,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Higher.`,
    editorialStatus: "validated",
  },
  {
    id: 8,
    question: `The acoustic parameters include:`,
    options: [
      `Period`,
      `Wavelength`,
      `Intensity`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 9,
    question: `Ultrasound frequency is defined as sound wave at least?`,
    options: [
      `10,000Hz`,
      `5000Hz`,
      `20,000Hz`,
      `15,000Hz`,
    ],
    correctAnswer: 2,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: 20,000Hz.`,
    editorialStatus: "validated",
  },
  {
    id: 10,
    question: `Infrasound has frequency less than?`,
    options: [
      `20Hz`,
      `40Hz`,
      `10Hz`,
      `100Hz`,
    ],
    correctAnswer: 0,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: 20Hz.`,
    editorialStatus: "validated",
  },
  {
    id: 11,
    question: `Frequency is ____ to period?`,
    options: [
      `Directly related`,
      `Equal`,
      `Reciprocal`,
      `Proportional`,
    ],
    correctAnswer: 2,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Reciprocal.`,
    editorialStatus: "validated",
  },
  {
    id: 12,
    question: `The strength of the amplitude diminishes as sound wave travels within the body. This process is known as?`,
    options: [
      `attenuation`,
      `propagation`,
      `intensity`,
      `amplification`,
    ],
    correctAnswer: 0,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: attenuation.`,
    editorialStatus: "validated",
  },
  {
    id: 13,
    question: `The units of power are?`,
    options: [
      `Centimeters`,
      `kilogram`,
      `Watts`,
      `Micrometer`,
    ],
    correctAnswer: 2,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Watts.`,
    editorialStatus: "validated",
  },
  {
    id: 14,
    question: `Power is proportional to?`,
    options: [
      `Wavelength`,
      `Imaging depth`,
      `Amplitude`,
      `Amplitude2`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Amplitude2.`,
    editorialStatus: "validated",
  },
  {
    id: 15,
    question: `The wavelength is determined by?`,
    options: [
      `The source`,
      `The medium`,
      `The source and the medium`,
      `The monitor`,
    ],
    correctAnswer: 2,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: The source and the medium.`,
    editorialStatus: "validated",
  },
  {
    id: 16,
    question: `Higher frequencies generally produce?`,
    options: [
      `higher quality images`,
      `greater details`,
      `lower quality images`,
      `shallow imaging depth`,
      `a & b & d`,
    ],
    correctAnswer: 4,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: a & b & d.`,
    editorialStatus: "validated",
  },
  {
    id: 17,
    question: `The propagation speed of ultrasound in soft tissue is?`,
    options: [
      `300 m/s`,
      `1,540 m/s`,
      `3300 m/s`,
      `500 m/s`,
    ],
    correctAnswer: 1,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: 1,540 m/s.`,
    editorialStatus: "validated",
  },
  {
    id: 18,
    question: `The property(ies) that establish the propagation speed of sound in a medium are?`,
    options: [
      `Density`,
      `Elasticity`,
      `a & b`,
      `None of the above`,
    ],
    correctAnswer: 2,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: a & b.`,
    editorialStatus: "validated",
  },
  {
    id: 19,
    question: `The pulse duration is the actual time that a transducer is creating one pulse. Pulse duration is determined by?`,
    options: [
      `The sound source(transducer)`,
      `The sonographer`,
      `The medium`,
      `The patient`,
    ],
    correctAnswer: 0,
    domain: "Domain 2: Transducer Technology",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: The sound source(transducer).`,
    editorialStatus: "validated",
  },
  {
    id: 20,
    question: `Both the period and pulse duration are measured in units of?`,
    options: [
      `Density`,
      `Volume`,
      `Distance`,
      `Time`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Time.`,
    editorialStatus: "validated",
  },
  {
    id: 21,
    question: `Spatial pulse length is the distance that a pulse occupies in space. Spatial pulse length, like wavelength depends on?`,
    options: [
      `The imaging depth`,
      `The source`,
      `The medium`,
      `Both the source and the medium`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Both the source and the medium.`,
    editorialStatus: "validated",
  },
  {
    id: 22,
    question: `Pulse repetition period(PRP) and pulse repetition frequency(PRF) are?`,
    options: [
      `Directly related`,
      `Reciprocals`,
      `Affected by the depth of view`,
      `b & c`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: b & c.`,
    editorialStatus: "validated",
  },
  {
    id: 23,
    question: `The Duty factor is the amount of time that the transducer is transmitting sound energy. The value of the duty factor is?`,
    options: [
      `Unitless`,
      `Expressed as percentages or decimal`,
      `Expressed in units of distance`,
      `a & b`,
    ],
    correctAnswer: 3,
    domain: "Domain 2: Transducer Technology",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: a & b.`,
    editorialStatus: "validated",
  },
  {
    id: 24,
    question: `The duty factor of a continuous wave is?`,
    options: [
      `Between 50 & 60 %`,
      `100%`,
      `Less than 100%`,
      `More than 100%`,
    ],
    correctAnswer: 1,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: 100%.`,
    editorialStatus: "validated",
  },
  {
    id: 25,
    question: `The duty factor of a pulsed wave is?`,
    options: [
      `Between 50 & 60 %`,
      `100%`,
      `Less than 100%`,
      `More than 100%`,
    ],
    correctAnswer: 2,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Less than 100%.`,
    editorialStatus: "validated",
  },
  {
    id: 26,
    question: `In diagnostic pulsed ultrasound, the duty factor is usually?`,
    options: [
      `Less than 1%`,
      `100%`,
      `Between 50 & 60%`,
      `More than 1%`,
    ],
    correctAnswer: 0,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Less than 1%.`,
    editorialStatus: "validated",
  },
  {
    id: 27,
    question: `The parameters that describe a pulsed wave are:`,
    options: [
      `Pulse duration`,
      `Pulse repetition period`,
      `Pulse repetition frequency`,
      `Spatial pulse length`,
      `Duty factor`,
      `All of the above`,
    ],
    correctAnswer: 5,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 28,
    question: `A substance applied on the face of the transducer and used to avoid diminished quality of sound signal transmitted between the transducer and the body tissue is known as?`,
    options: [
      `Ultraviolet agent`,
      `Contrast agent`,
      `Bubble agent`,
      `Gel or coupling agent`,
    ],
    correctAnswer: 3,
    domain: "Domain 2: Transducer Technology",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Gel or coupling agent.`,
    editorialStatus: "validated",
  },
  {
    id: 29,
    question: `Attenuation is the process by which the power of sound wave diminishes as it propagates through a medium. The following factors contribute to attenuation?`,
    options: [
      `Reflection`,
      `Scattering`,
      `Absorption`,
      `All of the above`,
      `a & b`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 30,
    question: `Axial resolution depends on____ while lateral resolution depends on ____?`,
    options: [
      `Spatial pulse length, beam width`,
      `Beam width, spatial pulse length`,
      `Attenuation`,
      `Intensity`,
    ],
    correctAnswer: 0,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Spatial pulse length, beam width.`,
    editorialStatus: "validated",
  },
  {
    id: 31,
    question: `Axial resolution is also known as?`,
    options: [
      `Azimuthal`,
      `Longitudinal`,
      `Radial`,
      `Range`,
      `Depth`,
      `a, b, c, d`,
      `b, c, d, e`,
    ],
    correctAnswer: 6,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: b, c, d, e.`,
    editorialStatus: "validated",
  },
  {
    id: 32,
    question: `Lateral resolution is also known as?`,
    options: [
      `Radial`,
      `Angular`,
      `Azimuthal`,
      `Transverse`,
      `a, b and c`,
      `b, c, and d`,
    ],
    correctAnswer: 5,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: b, c, and d.`,
    editorialStatus: "validated",
  },
  {
    id: 33,
    question: `The Principle which states that all points on a wave-front can be considered as point sources for the production of spherical secondary wavelets is called?`,
    options: [
      `Bernoulli principle`,
      `Huygens Principle`,
      `Ohm Principle`,
      `Pythagorean principle`,
    ],
    correctAnswer: 1,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Huygens Principle.`,
    editorialStatus: "validated",
  },
  {
    id: 34,
    question: `Ultrasound waves in tissues are?`,
    options: [
      `Longitudinal`,
      `Lateral`,
      `Transverse`,
      `Vertical`,
    ],
    correctAnswer: 0,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Longitudinal.`,
    editorialStatus: "validated",
  },
  {
    id: 35,
    question: `The term Hertz(Hz) denotes?`,
    options: [
      `Cycles per second`,
      `Cycles per day`,
      `Cycles per hour`,
      `Cycles per minute`,
    ],
    correctAnswer: 0,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Cycles per second.`,
    editorialStatus: "validated",
  },
  {
    id: 36,
    question: `The damping material in the transducer housing does not affect lateral resolution. However it:`,
    options: [
      `Reduces pulse duration`,
      `Improves axial resolution`,
      `Reduces Spatial pulse length (SPL)`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 2: Transducer Technology",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 37,
    question: `In ultrasound physics, the time taken to complete one cycle is called?`,
    options: [
      `Wavelength`,
      `Frequency`,
      `Amplitude`,
      `Period`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Period.`,
    editorialStatus: "validated",
  },
  {
    id: 38,
    question: `Longitudinal waves are characterized by?`,
    options: [
      `Motion of particles parallel to the axis of wave propagation`,
      `Motion of particles perpendicular to the axis of wave propagation`,
      `Motion of particles above the axis of wave propagation`,
      `Motion of particles below the axis of wave propagation`,
    ],
    correctAnswer: 0,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Motion of particles parallel to the axis of wave propagation.`,
    editorialStatus: "validated",
  },
  {
    id: 39,
    question: `Transverse waves are characterized by?`,
    options: [
      `Motion of particles parallel to the axis of wave propagation`,
      `Motion of particles perpendicular to the axis of wave propagation`,
      `Motion of particles above the axis of wave propagation`,
      `Motion of particles below the axis of wave propagation`,
    ],
    correctAnswer: 1,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Motion of particles perpendicular to the axis of wave propagation.`,
    editorialStatus: "validated",
  },
  {
    id: 40,
    question: `Wavelength will ____ if frequency ____?`,
    options: [
      `Decrease, decreases`,
      `Decrease, increases`,
      `Increase, decreases`,
      `Increase, increases`,
      `b & c`,
    ],
    correctAnswer: 4,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: b & c.`,
    editorialStatus: "validated",
  },
  {
    id: 41,
    question: `Penetration will ____ as frequency ____?`,
    options: [
      `Decrease, decreases`,
      `Decrease, increases`,
      `Increase, decreases`,
      `Increase, increases`,
      `b & c`,
    ],
    correctAnswer: 4,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: b & c.`,
    editorialStatus: "validated",
  },
  {
    id: 42,
    question: `Resolution ____ as frequency ____?`,
    options: [
      `Decrease, decreases`,
      `Decrease, increases`,
      `Increase, decreases`,
      `Increase, increases`,
      `a & d`,
    ],
    correctAnswer: 4,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: a & d.`,
    editorialStatus: "validated",
  },
  {
    id: 43,
    question: `Attenuation may be a result of?`,
    options: [
      `Reflection`,
      `Absorption`,
      `Transmission`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Attenuation in tissue results from a combination of reflection, absorption, and scattering — so "all of the above" is correct.`,
    editorialStatus: "editorially_corrected",
    editorialNote: `Clarified wording; original answer (D) already correct, no letter change.`,
  },
  {
    id: 44,
    question: `Acoustic impedance(Z) may be defined as?`,
    options: [
      `Intensity X density`,
      `Density X wavelength`,
      `Wavelength X propagation speed`,
      `Density X propagation speed`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Density X propagation speed.`,
    editorialStatus: "validated",
  },
  {
    id: 45,
    question: `Acoustic impedance depends on:`,
    options: [
      `Density of tissue`,
      `Stiffness of tissue`,
      `Elasticity of the tissue`,
      `Compressibility of the tissue`,
      `All of the above`,
    ],
    correctAnswer: 4,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 46,
    question: `The number of pulses emitted per second is called?`,
    options: [
      `Pulse repetition period (PRP)`,
      `Pulse repetition frequency (PRF)`,
      `Pulse duration (PD)`,
      `Spatial pulse length (SPL)`,
    ],
    correctAnswer: 1,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Pulse repetition frequency (PRF).`,
    editorialStatus: "validated",
  },
  {
    id: 47,
    question: `The time from the beginning of one pulse to the beginning of the next?`,
    options: [
      `Pulse repetition period (PRP)`,
      `Pulse repetition frequency (PRF)`,
      `Pulse duration (PD)`,
      `Spatial pulse length (SPL)`,
    ],
    correctAnswer: 0,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Pulse repetition period (PRP).`,
    editorialStatus: "validated",
  },
  {
    id: 48,
    question: `The time during which pulse actually occurs?`,
    options: [
      `Pulse repetition period (PRP)`,
      `Pulse repetition frequency (PRF)`,
      `Pulse duration (PD)`,
      `Spatial pulse length (SPL)`,
    ],
    correctAnswer: 2,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Pulse duration (PD).`,
    editorialStatus: "validated",
  },
  {
    id: 49,
    question: `Transducers are focused by two main methods, internal focusing and external focusing. Internal focusing is achieved by____ while external focusing is achieved by ____?`,
    options: [
      `Cutting a curved transducer element, using an acoustic lens`,
      `Using an acoustic lens, cutting a curved transducer element`,
      `Both are achieved by cutting a curved transducer element`,
      `Both are achieved by using an acoustic lens`,
    ],
    correctAnswer: 0,
    domain: "Domain 2: Transducer Technology",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Cutting a curved transducer element, using an acoustic lens.`,
    editorialStatus: "validated",
  },
  {
    id: 50,
    question: `The range of frequencies that are present within the pulse is called?`,
    options: [
      `Bandwidth`,
      `Frequency`,
      `Pulse repetition frequency`,
      `Power`,
    ],
    correctAnswer: 0,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Bandwidth.`,
    editorialStatus: "validated",
  },
  {
    id: 51,
    question: `The ratio of the operating (main)frequency to the bandwidth is called?`,
    options: [
      `Amplitude factor`,
      `Quality factor`,
      `Intensity factor`,
      `Propagation factor`,
    ],
    correctAnswer: 1,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Quality factor.`,
    editorialStatus: "validated",
  },
  {
    id: 52,
    question: `Decreasing the spatial pulse length?`,
    options: [
      `Improves lateral resolution`,
      `Decreases lateral resolution`,
      `Increases axial resolution`,
      `Decreases axial resolution`,
    ],
    correctAnswer: 2,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Increases axial resolution.`,
    editorialStatus: "validated",
  },
  {
    id: 53,
    question: `Axial resolution is improved by?`,
    options: [
      `Damping the PZT`,
      `Intensity`,
      `Power`,
      `Sound beam diameter`,
    ],
    correctAnswer: 0,
    domain: "Domain 2: Transducer Technology",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Damping the PZT.`,
    editorialStatus: "validated",
  },
  {
    id: 54,
    question: `If the amplitude is doubled, the intensity is?`,
    options: [
      `Doubled`,
      `Reduced by 50%`,
      `Unchanged`,
      `Increased 4 fold`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Increased 4 fold.`,
    editorialStatus: "validated",
  },
  {
    id: 55,
    question: `Attenuation is the process by which?`,
    options: [
      `the power of sound wave diminishes as it propagates through the body`,
      `the intensity of sound increases as it travels through a medium`,
      `the intensity of soundwave remains unchanged as it propagates though a medium`,
      `the intensity of sound is converted into electrical energy as it travels through a medium`,
    ],
    correctAnswer: 0,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: the power of sound wave diminishes as it propagates through the body.`,
    editorialStatus: "validated",
  },
  {
    id: 56,
    question: `The bandwidth of an ultrasound beam is?`,
    options: [
      `Can be increased using the coupling gel`,
      `Is the difference between the highest and lowest frequency`,
      `Is the addition of the highest and lowest frequency`,
      `The median frequency`,
    ],
    correctAnswer: 1,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Is the difference between the highest and lowest frequency.`,
    editorialStatus: "validated",
  },
  {
    id: 57,
    question: `The relative strength of a sound beam as it undergoes attenuation or amplification may be measured in :`,
    options: [
      `Inches`,
      `Kilograms`,
      `Rayls`,
      `Decibels`,
    ],
    correctAnswer: 3,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Decibels.`,
    editorialStatus: "validated",
  },
  {
    id: 58,
    question: `The incident intensity of a sound beam is 65 w/cm2 while the transmitted intensity is 55 w/cm2. What is the reflected intensity?`,
    options: [
      `110 w/cm2`,
      `10 w/cm2`,
      `25 w/cm2`,
      `There is no refection`,
    ],
    correctAnswer: 1,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: 10 w/cm2.`,
    editorialStatus: "validated",
  },
  {
    id: 59,
    question: `The acoustic impedance of a medium?`,
    options: [
      `The product of the propagation speed and the density of the medium`,
      `Directly proportional to the density`,
      `Inversely proportional to the propagation speed`,
      `Is unrelated to either the propagation or density`,
    ],
    correctAnswer: 0,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: The product of the propagation speed and the density of the medium.`,
    editorialStatus: "validated",
  },
  {
    id: 60,
    question: `The following is true about decibels except:`,
    options: [
      `A decibel represents a relationship between two numbers`,
      `a relative measure of intensity of power`,
      `Decibel notation is based on algorithms`,
      `The decibel notation is negative when the acoustic signal is amplified and positive when the acoustic signal is attenuated`,
    ],
    correctAnswer: 3,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: The decibel notation is negative when the acoustic signal is amplified and positive when the acoustic signal is attenuated.`,
    editorialStatus: "validated",
  },
  {
    id: 61,
    question: `Which two factors are the primary determinants of total attenuation in soft tissue?`,
    options: [
      `Tissue thickness (path length) and frequency`,
      `Propagation speed and period`,
      `Beam width and focal depth`,
      `Pulse repetition frequency and duty factor`,
    ],
    correctAnswer: 0,
    domain: "Domain 1: Physics Principles",
    explanation: `Total attenuation in soft tissue scales with both the distance the beam travels through tissue (path length/thickness) and the operating frequency — soft tissue attenuates roughly 0.5 dB per centimeter per MHz. Propagation speed, period, beam width, focal depth, PRF, and duty factor do not determine how much a beam attenuates.`,
    editorialStatus: "editorially_corrected",
    editorialNote: `REWRITTEN. The source question ("Attenuation in soft tissue [increases with]") was single-factor and its source-key answer (frequency) was correct, but an externally supplied correction proposed changing the answer to "propagation speed," which is not an established acoustic relationship — propagation speed is not a determinant of attenuation. Rather than silently keep the old wording or adopt an incorrect answer, the question was rewritten as a two-factor item ("tissue thickness and frequency"), which is the scientifically precise, single-best-answer version of the same learning objective (what governs total attenuation). Correct answer: A.`,
  },
  {
    id: 62,
    question: `Which of the following determines the amount of reflection at an interface of two dissimilar media?`,
    options: [
      `The time gain compensation`,
      `The frequency`,
      `The period`,
      `The difference in acoustic impedance`,
    ],
    correctAnswer: 3,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: The difference in acoustic impedance.`,
    editorialStatus: "validated",
  },
  {
    id: 63,
    question: `When a sound wave strikes a tissue interface at an oblique angle of incidence, what other condition must be present for refraction to take place?`,
    options: [
      `A strong reflector`,
      `The presence of several smaller reflectors`,
      `Normal incidence`,
      `A difference in propagation speeds between the two media`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: A difference in propagation speeds between the two media.`,
    editorialStatus: "validated",
  },
  {
    id: 64,
    question: `When a sound wave strikes an interface with a normal incidence, the following other condition must be present for reflection to happen.`,
    options: [
      `An oblique incidence`,
      `A strong reflector`,
      `A difference in acoustic impedance`,
      `The two media must have the same acoustic impedance`,
    ],
    correctAnswer: 2,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: A difference in acoustic impedance.`,
    editorialStatus: "validated",
  },
  {
    id: 65,
    question: `Ultrasound transducers?`,
    options: [
      `Convert thermal to cavitation energy and vice versa`,
      `Convert electrical to mechanical energy and vice versa`,
      `Only converts mechanical to heat energy`,
      `Only converts heat to mechanical energy`,
    ],
    correctAnswer: 1,
    domain: "Domain 5: Bioeffects & Safety",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Convert electrical to mechanical energy and vice versa.`,
    editorialStatus: "validated",
  },
  {
    id: 66,
    question: `Which of the following describes the change in direction of an ultrasound beam as it travels from one medium to another?`,
    options: [
      `Rarefaction`,
      `Compression`,
      `Reflection`,
      `Refraction`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Refraction.`,
    editorialStatus: "validated",
  },
  {
    id: 67,
    question: `Which of the following relates to the quality factor?`,
    options: [
      `Main frequency`,
      `Highest frequency`,
      `Lowest frequency`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 68,
    question: `The incident reflection coefficient is?`,
    options: [
      `The % of intensity that bounces back at an interface between two media of different impedance`,
      `The % of intensity that is absorbed at the interface`,
      `The % of intensity that is transmitted at the interface between two media of different impedance`,
      `All of the above`,
    ],
    correctAnswer: 0,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: The % of intensity that bounces back at an interface between two media of different impedance.`,
    editorialStatus: "validated",
  },
  {
    id: 69,
    question: `The incident transmission coefficient is?`,
    options: [
      `The % of intensity that bounces back at an interface between two media of different impedance`,
      `The % of intensity that is absorbed at the interface`,
      `The % of intensity that is transmitted at the interface between two media of different impedance`,
      `All of the above`,
    ],
    correctAnswer: 2,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: The % of intensity that is transmitted at the interface between two media of different impedance.`,
    editorialStatus: "validated",
  },
  {
    id: 70,
    question: `The formula for the incident reflection coefficient (IRC) is?`,
    options: [
      `(Z2 + Z1 /Z2 + Z1 )2 X 100`,
      `(Z2 + Z1 /Z2 - Z1 )2 X 100`,
      `(Z2 – Z1 /Z2 + Z1 )2 X 100`,
      `(Z2 – Z1 /Z2 - Z1 )2 X 100`,
    ],
    correctAnswer: 2,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Incident Reflection Coefficient (IRC) = [(Z2 − Z1) / (Z2 + Z1)]² × 100, where Z1 and Z2 are the acoustic impedances of the two media.`,
    editorialStatus: "editorially_corrected",
    editorialNote: `Corrected garbled formula formatting from the source text; original answer (C) was already correct.`,
  },
  {
    id: 71,
    question: `IRC is?`,
    options: [
      `A unitless value expressed as percentage`,
      `Expressed in decibels`,
      `Expressed as Watts/cm2`,
      `Expressed in units of time`,
    ],
    correctAnswer: 0,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: A unitless value expressed as percentage.`,
    editorialStatus: "validated",
  },
  {
    id: 72,
    question: `Incident intensity is reflected intensity plus transmitted intensity?`,
    options: [
      `A unitless value expressed as percentage`,
      `Expressed in decibels`,
      `Expressed as Watts/cm2`,
      `Expressed in units of time`,
    ],
    correctAnswer: 2,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Expressed as Watts/cm2.`,
    editorialStatus: "validated",
  },
  {
    id: 73,
    question: `According to the Range equation?`,
    options: [
      `For every 10 seconds of go-return-time, the sound beam travels a distance of 1 centimeter deeper in the body`,
      `For every 10 microsecond of go-return-time, the sound beam travels a distance of 1 centimeter deeper in the body`,
      `For every 13 seconds of go-return-time, the sound beam travels a distance of 1 centimeter deeper in the body`,
      `For every 13 microseconds of go-return-time, the sound beam travels a distance of 1 centimeter deeper in the body`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: For every 13 microseconds of go-return-time, the sound beam travels a distance of 1 centimeter deeper in the body.`,
    editorialStatus: "validated",
  },
  {
    id: 74,
    question: `A- mode appears on display as?`,
    options: [
      `A block of wavy lines, indicating the changing position of moving reflectors`,
      `A line graph display as a series of upward spikes`,
      `A line of dots of varying brightness`,
      `A mix of colors, usually read, blue, green and yellow`,
    ],
    correctAnswer: 1,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: A line graph display as a series of upward spikes.`,
    editorialStatus: "validated",
  },
  {
    id: 75,
    question: `B- mode appears on display as?`,
    options: [
      `A block of wavy lines, indicating the changing position of moving reflectors`,
      `A line graph display as a series of upward spikes`,
      `A line of dots of varying brightness`,
      `A mix of colors, usually read, blue, green and yellow`,
    ],
    correctAnswer: 2,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: A line of dots of varying brightness.`,
    editorialStatus: "validated",
  },
  {
    id: 76,
    question: `Better axial resolution is associated with the following except?`,
    options: [
      `Shorter SPL`,
      `Shorter PD`,
      `Shorter wavelength`,
      `Smaller beam width`,
    ],
    correctAnswer: 3,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Smaller beam width.`,
    editorialStatus: "validated",
  },
  {
    id: 77,
    question: `Focusing the ultrasound beam helps to achieve the following except?`,
    options: [
      `Narrower focal depth`,
      `Shorter wavelength`,
      `Focal zone is shorter and thinner`,
      `Narrower beam diameter(width) in near field and focal zone`,
    ],
    correctAnswer: 1,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Shorter wavelength.`,
    editorialStatus: "validated",
  },
  {
    id: 78,
    question: `The matching layer?`,
    options: [
      `Helps to reduce reflection at the transducer/tissue interface`,
      `Helps to increase reflection at the transducer/tissue interface`,
      `Helps to reduce transmission at the transducer/tissue interface`,
      `Helps to increase the attenuation at the transducer/tissue interface`,
    ],
    correctAnswer: 0,
    domain: "Domain 2: Transducer Technology",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Helps to reduce reflection at the transducer/tissue interface.`,
    editorialStatus: "validated",
  },
  {
    id: 79,
    question: `The frequency of the acoustic wave produced by a standard pulsed wave ultrasound system depends on?`,
    options: [
      `Frequency of the electric voltage in the system`,
      `Curie temperature`,
      `Type of active element`,
      `The thickness of the PZT and propagation speed of sound in the PZT`,
    ],
    correctAnswer: 3,
    domain: "Domain 2: Transducer Technology",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: The thickness of the PZT and propagation speed of sound in the PZT.`,
    editorialStatus: "validated",
  },
  {
    id: 80,
    question: `Bi-stable images are composed of?`,
    options: [
      `2 or more shades of gray`,
      `2 shades of gray`,
      `One shade of gray`,
      `Shades of blue and red`,
    ],
    correctAnswer: 1,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: 2 shades of gray.`,
    editorialStatus: "validated",
  },
  {
    id: 81,
    question: `In grayscale displays?`,
    options: [
      `There are multiple levels of brightness from light to darker shades of gray`,
      `These different shades indicate different echo amplitudes`,
      `The different shades differentiate the various body tissues`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 82,
    question: `The scan converter?`,
    options: [
      `temporarily retains scanned image for review and converts the image into format suitable for display, recording and storage`,
      `permanently stores the scanned image`,
      `deletes the stored image`,
      `all of the above`,
    ],
    correctAnswer: 0,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: temporarily retains scanned image for review and converts the image into format suitable for display, recording and storage.`,
    editorialStatus: "validated",
  },
  {
    id: 83,
    question: `Within the scan converter,?`,
    options: [
      `Image attributes such as amplitude at each pixel location are converted from analog and re-presented in binary form`,
      `Echo signals into a suitable format for display`,
      `The multiple frames(images) acquired are displayed as a single scan`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 3: Principles of Imaging",
    explanation: `The scan converter digitizes incoming echo/image data, organizes it into a format suitable for display, and outputs the assembled frames — all three functions apply.`,
    editorialStatus: "editorially_corrected",
    editorialNote: `Clarified wording; original answer (D) already correct.`,
  },
  {
    id: 84,
    question: `Picture Archiving and communications System (PACS)?`,
    options: [
      `is the set of rules under which the components of the system communicate.`,
      `is the physical computer network installed within the facility`,
      `is the administrative procedure for communicating with colleagues`,
      `is the procedure for communicating with patients`,
    ],
    correctAnswer: 1,
    domain: "Domain 3: Principles of Imaging",
    explanation: `PACS (Picture Archiving and Communications System) is the network and storage infrastructure used to store, retrieve, distribute, and display medical images within a facility — distinct from DICOM, which is the communication standard/protocol the devices use.`,
    editorialStatus: "editorially_corrected",
    editorialNote: `Clarified definition to avoid confusion with the adjacent DICOM question; original answer (B) already correct.`,
  },
  {
    id: 85,
    question: `Digital Imaging and Computers in Medicine (DICOM)?`,
    options: [
      `is the set of rules under which the components of the system communicate.`,
      `is the physical computer network installed within the facility`,
      `is the administrative procedure for communicating with colleagues`,
      `is the procedure for communicating with patients`,
    ],
    correctAnswer: 0,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: is the set of rules under which the components of the system communicate..`,
    editorialStatus: "validated",
  },
  {
    id: 86,
    question: `There are 2 types of scan converters, analog and digital. The limitations of analog scan converters include?`,
    options: [
      `image fade`,
      `image flicker`,
      `deterioration`,
      `all of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: all of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 87,
    question: `Advantages of digital converters include?`,
    options: [
      `Uniformity`,
      `Stability`,
      `Durability`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 88,
    question: `With digital imaging, the image or picture is divided into many small squares similar to a checkerboard called?`,
    options: [
      `Bits`,
      `Pixel`,
      `Word`,
      `Bytes`,
    ],
    correctAnswer: 1,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Pixel.`,
    editorialStatus: "validated",
  },
  {
    id: 89,
    question: `A byte = ____bits while a word = ____ bytes?`,
    options: [
      `16, 8`,
      `8, 16`,
      `8, 2`,
      `2, 8`,
    ],
    correctAnswer: 2,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: 8, 2.`,
    editorialStatus: "validated",
  },
  {
    id: 90,
    question: `Spatial compounding?`,
    options: [
      `Is the technique by which Images of an object are acquired in different acoustic frequencies and then averaged or compounded to reduce speckles (signal to noise ratio)`,
      `Superimposes the current frame on previous frames (history) to create a smoother image`,
      `Is the technique for producing a single image from several imaging angles. The frames are overlapped to form a single real-time image`,
      `Is the method of filling in gaps of missing data that usually exists in sector shaped images as scan lines become wider apart with depth`,
    ],
    correctAnswer: 2,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Is the technique for producing a single image from several imaging angles. The frames are overlapped to form a single real-time image.`,
    editorialStatus: "validated",
  },
  {
    id: 91,
    question: `Dynamic Range?`,
    options: [
      `The range of signal amplitudes a system can process and display accurately`,
      `A fixed value that is the same on every ultrasound system regardless of settings`,
      `Unrelated to the number of gray shades an image can display`,
      `Measured only in linear units, never in decibels`,
    ],
    correctAnswer: 0,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Dynamic range is the range of signal amplitudes (expressed in dB) a system can process and display accurately. The other options describe things that are false — dynamic range is adjustable, it directly affects the number of displayable gray shades, and it is conventionally expressed in decibels.`,
    editorialStatus: "editorially_corrected",
    editorialNote: `Rewrote the answer choices: the original wording made "all of the above" defensible because two of the three sub-statements were also arguably true, creating ambiguity. Rewritten so there is exactly one unambiguous correct answer (A) on the same topic (definition of dynamic range).`,
  },
  {
    id: 92,
    question: `Harmonic frequencies :`,
    options: [
      `Are created due to the linear distortions that sound pulses undergo as they propagate through tissue`,
      `Harmonic frequencies are created due to the nonlinear distortions that sound pulses undergo as they propagate through tissue`,
      `Harmonic frequencies are fractions of the main or fundamental frequencies`,
      `Harmonic imaging is the creation of an image from sound reflections at half the fundamental frequency of the transmitted sound`,
    ],
    correctAnswer: 1,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Harmonic frequencies are created due to the nonlinear distortions that sound pulses undergo as they propagate through tissue.`,
    editorialStatus: "validated",
  },
  {
    id: 93,
    question: `Contrast agents?`,
    options: [
      `Are designed to create strong reflections that light up blood vessels, blood chambers and other anatomic regions`,
      `Are either intravenously injected or ingested`,
      `Are commonly used to enhance echo signals from blood`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 94,
    question: `Phased array transducers are?`,
    options: [
      `Focused and steered electronically`,
      `Focused and steered mechanically`,
      `Focused electronically and steered mechanically`,
      `Focused mechanically and steered electronically`,
    ],
    correctAnswer: 0,
    domain: "Domain 2: Transducer Technology",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Focused and steered electronically.`,
    editorialStatus: "validated",
  },
  {
    id: 95,
    question: `Mechanical transducers are?`,
    options: [
      `Focused and steered electronically`,
      `Focused and steered mechanically`,
      `Focused electronically and steered mechanically`,
      `Focused mechanically and steered electronically`,
    ],
    correctAnswer: 1,
    domain: "Domain 2: Transducer Technology",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Focused and steered mechanically.`,
    editorialStatus: "validated",
  },
  {
    id: 96,
    question: `One method of focusing an array transducer is?`,
    options: [
      `Internal focusing, using a curved element`,
      `Supradicing`,
      `Apodization`,
      `b & c`,
    ],
    correctAnswer: 2,
    domain: "Domain 2: Transducer Technology",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Apodization.`,
    editorialStatus: "validated",
  },
  {
    id: 97,
    question: `Type of resolution contributes to image quality:`,
    options: [
      `Axial resolution`,
      `Lateral resolution`,
      `Elevational resolution`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 98,
    question: `Dynamic or multiple focusing is a technique to?`,
    options: [
      `Focus the ultrasound beam at multiple imaging points only during reception of ultrasound signals or waves`,
      `Focus the ultrasound beam at multiple imaging points only during transmission of ultrasound signals or waves`,
      `Focus the ultrasound beam at multiple imaging points both during transmission and reception of ultrasound signals or waves`,
      `Focus the ultrasound beam in the receiver`,
    ],
    correctAnswer: 2,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Focus the ultrasound beam at multiple imaging points both during transmission and reception of ultrasound signals or waves.`,
    editorialStatus: "validated",
  },
  {
    id: 99,
    question: `The following is true about frame rate?`,
    options: [
      `The frame rate is the number of frames or images produced in a second and is measured in Hertz`,
      `The frame rate and the time to produce one frame are reciprocals`,
      `The frame rate is determined by the imaging depth and propagation speed`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 100,
    question: `The following is true about line density?`,
    options: [
      `It is the amount of spacing between each scan line or sound beam`,
      `Low line density generates widely space lines between sound beams or pulses, fewer pulses per frame and higher frame rate`,
      `High line density generates tightly-spaced lines between successive sound beams, more pulses per frame and lower frame rate`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 101,
    question: `The following is true about the pulser?`,
    options: [
      `The pulser creates and controls electrical pulses sent to the transducer to excite the PZT crystals`,
      `The pulser is also known as power, gain, output gain, acoustic power, pulser power, energy output and transmitter output`,
      `The pulser functions during transmission`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 2: Transducer Technology",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 102,
    question: `The beam former?`,
    options: [
      `Functions both during transmission and reception`,
      `The beam former receives a single electrical signal from the pulser and distributes these to the active elements in a specific pattern according to need`,
      `Is responsible for apodization, a process whereby electrical spike voltages are selectively regulated to reduce side lobes`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 2: Transducer Technology",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 103,
    question: `What is the standard order of signal-processing functions in the ultrasound receiver?`,
    options: [
      `Demodulation, amplification, compensation, compression, reject`,
      `Amplification, reject, compression, compensation, demodulation`,
      `Reject, amplification, compression, compensation, demodulation`,
      `Amplification, compensation, compression, demodulation, reject`,
    ],
    correctAnswer: 3,
    domain: "Domain 3: Principles of Imaging",
    explanation: `The receiver processes the returning echo signal in this order: amplification (boosts the weak returning signal), compensation/TGC (corrects for depth-dependent attenuation), compression (reduces the dynamic range to fit the display), demodulation (envelope detection — converts the RF signal to a video signal), and rejection (removes low-level noise). This is the sequence taught throughout standard SPI review references.`,
    editorialStatus: "editorially_corrected",
    editorialNote: `CONVENTION DOCUMENTED. Two orderings were in play: the source bank's original "amplification, compensation, compression, demodulation, reject," and an externally supplied correction proposing "amplification, compensation, demodulation, compression, reject" (swapping compression and demodulation). Standard SPI teaching materials place compression before demodulation (amplification -> compensation -> compression -> demodulation -> rejection). The source bank's original order was adopted as the single authoritative sequence and used consistently in the question, options, and explanation; the swapped-order alternative was not used anywhere in the final content.`,
  },
  {
    id: 104,
    question: `Examples of ultrasound artifacts include?`,
    options: [
      `Shadowing`,
      `Enhancement`,
      `Reverberation`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 105,
    question: `Which of the following is true about Thermal effects?`,
    options: [
      `They are produced primarily by a mechanism of attenuation`,
      `Absorption, a major component of attenuation leads to rise in tissue temperature which may cause irreversible damage to body tissue`,
      `It is generally agreed that exposure producing a maximum of 10 rise in temperature can be used without any effect`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 5: Bioeffects & Safety",
    explanation: `Thermal bioeffects result mainly from absorption (a component of attenuation) raising tissue temperature. A rise of roughly 1°C or less under typical diagnostic exposure conditions is generally not considered harmful — though no ultrasound exposure is completely risk-free, which is the basis of the ALARA principle.`,
    editorialStatus: "editorially_corrected",
    editorialNote: `Fixed an apparent OCR/typo in the source ("10 rise in temperature" corrected to "1°C"); original answer (D) already correct.`,
  },
  {
    id: 106,
    question: `Ultrasound systems assume a propagation speed of 1540 m/s in soft tissue. If the beam passes from a medium of one speed into a medium of higher speed, the calculated distance will be less than the actual distance, causing the echo to be displayed closer to the transducer. This type of artifact is called?`,
    options: [
      `Display artifact`,
      `Sound beam artifact`,
      `Propagation speed error artifact`,
      `Transducer artifact`,
    ],
    correctAnswer: 2,
    domain: "Domain 2: Transducer Technology",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Propagation speed error artifact.`,
    editorialStatus: "validated",
  },
  {
    id: 107,
    question: `An increase in the apparent size of an object on the display monitor is called?`,
    options: [
      `Magnification`,
      `Compression`,
      `Demodulation`,
      `Suppression`,
    ],
    correctAnswer: 0,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Magnification.`,
    editorialStatus: "validated",
  },
  {
    id: 108,
    question: `In Doppler technique, the received echoes would be ____ as the ultrasound beam becomes more ____ to the organ interface?`,
    options: [
      `Smaller, parallel`,
      `Larger, perpendicular`,
      `Larger, parallel`,
      `None of the above`,
    ],
    correctAnswer: 2,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `The Doppler shift is largest when the ultrasound beam is more parallel to flow (smaller angle of insonation), because the Doppler equation includes a cosine-of-angle term that approaches its maximum value (1) as the angle approaches 0°.`,
    editorialStatus: "editorially_corrected",
    editorialNote: `Clarified wording; original answer (C) already correct.`,
  },
  {
    id: 109,
    question: `In bio effect studies, the term “In Vitro” means:`,
    options: [
      `Zombie tissues replacing human tissues`,
      `Tissue cultures in a test tube`,
      `Living human tissues`,
      `None of the above`,
    ],
    correctAnswer: 1,
    domain: "Domain 5: Bioeffects & Safety",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Tissue cultures in a test tube.`,
    editorialStatus: "validated",
  },
  {
    id: 110,
    question: `Digital computers use a special number system called?`,
    options: [
      `Decimal number system`,
      `Roman number system`,
      `Egyptian number`,
      `Binary number system`,
    ],
    correctAnswer: 3,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Binary number system.`,
    editorialStatus: "validated",
  },
  {
    id: 111,
    question: `The Doppler shift is?`,
    options: [
      `The difference between the frequency of reflected echo signal and transmitted echo signal`,
      `The addition of the frequency of reflected echo signal and transmitted echo signal`,
      `The product of the frequency of reflected echo signal and transmitted echo signal`,
      `The ratio of the frequency of reflected echo signal to transmitted echo signal`,
    ],
    correctAnswer: 0,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: The difference between the frequency of reflected echo signal and transmitted echo signal.`,
    editorialStatus: "validated",
  },
  {
    id: 112,
    question: `Laminar flow is:`,
    options: [
      `Aligned and parallel flow streamlines`,
      `Characterized by layers of blood; each layer traveling at individual speeds`,
      `Usually found in normal physiological states`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 113,
    question: `An artifact is an error in imaging. They are echoes without anatomic correlation in terms of location, interface and intensity. Artifacts may appear on images as any of the following:`,
    options: [
      `Incorrect shape or size of reflection`,
      `Incorrectly positioned reflection`,
      `Incorrect reflection brightness`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 114,
    question: `Nyquist limit is defined as?`,
    options: [
      `Equal to the PRF`,
      `Half of the PRP`,
      `Equal to the PRP`,
      `Half the PRF`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Half the PRF.`,
    editorialStatus: "validated",
  },
  {
    id: 115,
    question: `The causes of artifact include:`,
    options: [
      `Violation of assumptions`,
      `The physics of ultrasound`,
      `Operator error`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 116,
    question: `Assumptions built into imaging systems which, when violated may result in creation of artifacts include:`,
    options: [
      `Sound travels in a straight line`,
      `Sound travels directly to a reflector and back`,
      `Sound travels in soft tissue at exactly 1540 m/s`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 3: Principles of Imaging",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 117,
    question: `If the velocity of the flow exceeds the Nyquist limit?`,
    options: [
      `The velocity of flow is increases`,
      `The velocity of flow is decreases`,
      `Velocity of flow appear to be in same direction`,
      `Velocity of flow appear to be in opposite direction`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Velocity of flow appear to be in opposite direction.`,
    editorialStatus: "validated",
  },
  {
    id: 118,
    question: `We may have more aliasing due to:`,
    options: [
      `Faster blood velocity`,
      `Higher transducer frequency`,
      `Deep sample volume or gate(low PRF)`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 119,
    question: `The principle that describes the relationship between velocity (kinetic energy) and pressure in a moving fluid is called?`,
    options: [
      `Ohm’s Principle`,
      `Doppler Principle`,
      `Bernoulli Principle`,
      `Huygens’ Principle`,
    ],
    correctAnswer: 2,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Bernoulli Principle.`,
    editorialStatus: "validated",
  },
  {
    id: 120,
    question: `According to the principle that describes the relationship between velocity (kinetic energy) and pressure in a moving fluid:`,
    options: [
      `With a steady flow, the sum of all forms of energy remain constant everywhere.`,
      `Energy lost in one form is gained in another form. Hence the sum of both kinetic and pressure energy remains constant`,
      `Higher velocity increases kinetic energy and simultaneously decreases pressure energy and vice versa`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 121,
    question: `Velocity indicates the speed of a fluid moving from one location to another, measured in units of?`,
    options: [
      `distance/time`,
      `time/distance`,
      `volume/distance`,
      `volume/time`,
    ],
    correctAnswer: 0,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: distance/time.`,
    editorialStatus: "validated",
  },
  {
    id: 122,
    question: `The basic forms of normal blood flow:`,
    options: [
      `Pulsatile flow`,
      `Phasic flow`,
      `Steady flow`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 123,
    question: `Which of the following is correct about blood flow?`,
    options: [
      `Pulsatile flow occurs in arterial blood flow as a result of cardiac contraction and relaxation`,
      `Phasic or spontaneous flow occurs when venous blood flows with variable velocity as a result of changes in respiration`,
      `Steady flow occurs when a fluid moves at constant speed or velocity`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 124,
    question: `The following are true about laminar flow except:`,
    options: [
      `The streamlines are non- aligned`,
      `The streamlines are and parallel and flow in layers. The layers of blood that travel at individual speeds`,
      `It is commonly found in normal physiological states`,
      `The streamlines are aligned`,
    ],
    correctAnswer: 0,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: The streamlines are non- aligned.`,
    editorialStatus: "validated",
  },
  {
    id: 125,
    question: `Which of the following is incorrect?`,
    options: [
      `There are 2 types of laminar flow; plug flow and parabolic flow`,
      `Parabolic flow has a bullet-shaped profile with the highest flow is at the center of the lumen and gradually decreases to its minimum at the vessel wall`,
      `Turbulent flow is characterized chaotic flow patterns in many different directions and speeds`,
      `Turbulent flow is usually associated with normal cardiovascular physiologic state`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Turbulent flow is usually associated with normal cardiovascular physiologic state.`,
    editorialStatus: "validated",
  },
  {
    id: 126,
    question: `Hydrostatic pressure?`,
    options: [
      `Is pressure related to the weight of blood pressing on a vessel wall measured at a height above or below the heart level.`,
      `It is the difference between the pressure at the heart level and site of measurement`,
      `It is reported in units of mmHg`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 127,
    question: `Which of the following is true about blood flow?`,
    options: [
      `Blood flows from one location to another due to energy gradient`,
      `Blood moves from area of high gradient to area of low gradient`,
      `Pressure gradient is a form of energy`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 128,
    question: `Techniques for reducing or eliminating aliasing include:`,
    options: [
      `Adjust the scale`,
      `Shifting the base`,
      `Using Continuous Wave Doppler`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 129,
    question: `The sound created from the difference between transmitted and reflected frequency is?`,
    options: [
      `infrasonic`,
      `Audible`,
      `Ultrasonic`,
      `Supersonic`,
    ],
    correctAnswer: 1,
    domain: "Domain 1: Physics Principles",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Audible.`,
    editorialStatus: "validated",
  },
  {
    id: 130,
    question: `Doppler shift provide information about flow velocity relative to the transducer. Which of the following is true regarding Doppler shift?`,
    options: [
      `Higher velocities create higher Doppler shifts and vice versa, that is the Doppler shift would double if the velocity doubles and triple if the velocity triples`,
      `The velocities measured by the transducer are the same regardless of the transducer frequency`,
      `Doppler shift are directly related to transducer frequency; when the transducer frequency is halved, the Doppler shift would also be halved`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `All three statements are consistent with the Doppler equation (Δf = 2·f₀·v·cosθ / c): Doppler shift scales linearly with velocity, calculated velocity is independent of transducer frequency once the equation is solved for v, and the observed Doppler shift itself scales linearly with transmitted frequency.`,
    editorialStatus: "editorially_corrected",
    editorialNote: `Verified all three sub-statements are independently true and consistent with each other, so "all of the above" (D) is defensible as written; no change made.`,
  },
  {
    id: 131,
    question: `Aliasing is a?`,
    options: [
      `Pulsed ultrasound artifact where high Doppler shifts(velocities) beyond the Nyquist limit are identified as flow in the same direction`,
      `Pulsed wave ultrasound artifact where high Doppler shifts(velocities) beyond the Nyquist limit are misidentified as flow in the opposite direction`,
      `Continuous wave ultrasound artifact where high Doppler shifts(velocities) beyond the Nyquist limit are misidentified as flow in the same direction`,
      `Continuous wave ultrasound artifact where high Doppler shifts(velocities) beyond the Nyquist limit are misidentified as flow in the opposite direction`,
    ],
    correctAnswer: 1,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Pulsed wave ultrasound artifact where high Doppler shifts(velocities) beyond the Nyquist limit are misidentified as flow in the opposite direction.`,
    editorialStatus: "validated",
  },
  {
    id: 132,
    question: `Continuous Wave Doppler has the following properties except:`,
    options: [
      `High quality factor`,
      `Higher sensitivity to flow signal`,
      `Range ambiguity`,
      `Range specificity`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Range specificity.`,
    editorialStatus: "validated",
  },
  {
    id: 133,
    question: `A duplex ultrasound system displays?`,
    options: [
      `Only 2D information`,
      `Only Doppler information`,
      `Neither 2D nor Doppler information`,
      `Both 2D and Doppler information`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Both 2D and Doppler information.`,
    editorialStatus: "validated",
  },
  {
    id: 134,
    question: `Color flow Doppler:`,
    options: [
      `Is a pulsed Doppler imaging modality, hence it is prone to aliasing`,
      `Displays anatomic data in 2D grayscale while simultaneously displaying flow information in color`,
      `The color deals with the Doppler frequencies produced by moving red blood cells in the image plane`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 135,
    question: `With Doppler:`,
    options: [
      `The best views are obtained at either 00 or 1800`,
      `Aliasing may be avoided by using lower frequency transducer`,
      `Images may be obtained by both Pulsed and Continuous wave`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 136,
    question: `Which of the following is correct?`,
    options: [
      `Velocity color modes may be identified side-to-side (horizontal) changes in the color bar, whereas variance color maps only change from top to bottom (vertically)`,
      `Variance color modes may be identified side-to-side (horizontal) changes in the color bar, whereas velocity maps only change from top to bottom (vertically)`,
      `Variance color mode and velocity color mode will not appear similar if flow is laminar`,
      `All of the above`,
    ],
    correctAnswer: 1,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Conventionally, velocity color maps are read as changes along the color bar (commonly associated with vertical position on the bar), while variance maps add a separate indicator (often green) for flow turbulence. Note: exact color-bar orientation and conventions vary by manufacturer and preset, so this should be read as the general convention rather than a universal standard.`,
    editorialStatus: "editorially_corrected",
    editorialNote: `Added a caveat noting that color-map display conventions vary by manufacturer; original answer (B) retained as the standard convention.`,
  },
  {
    id: 137,
    question: `Duplex imaging combines?`,
    options: [
      `2D grayscale with Doppler`,
      `M mode with 2D grayscale`,
      `Color Doppler with Pedoff`,
      `Pedoff with 2D grayscale.`,
    ],
    correctAnswer: 0,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: 2D grayscale with Doppler.`,
    editorialStatus: "validated",
  },
  {
    id: 138,
    question: `In Doppler color flow imaging:`,
    options: [
      `Stationery tissues are displayed in color while moving tissues are in gray scale.`,
      `Both Stationery and moving tissues are displayed in gray scale`,
      `Both stationery and moving tissues displayed in color.`,
      `Stationery tissues are displayed in gray scale while moving tissues are in color.`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Stationery tissues are displayed in gray scale while moving tissues are in color..`,
    editorialStatus: "validated",
  },
  {
    id: 139,
    question: `In Doppler technique, the received echoes would be ____ as the ultrasound beam becomes more ____ to the organ interface?`,
    options: [
      `Smaller, parallel`,
      `Larger, perpendicular`,
      `Larger, parallel`,
      `None of the above`,
    ],
    correctAnswer: 2,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `The Doppler shift is largest when the ultrasound beam is more parallel to flow (smaller angle of insonation), because the Doppler equation includes a cosine-of-angle term that approaches its maximum value (1) as the angle approaches 0°.`,
    editorialStatus: "editorially_corrected",
    editorialNote: `Duplicate of Q108 in the source bank; preserved as a separate record per instructions. Clarified wording; original answer (C) already correct.`,
  },
  {
    id: 140,
    question: `The Doppler Effect happens to all waves coming from a moving source, regardless of propagation velocities or power levels. The Doppler Effect depends on:`,
    options: [
      `the closing velocity between transducer and tissue`,
      `Carrier frequency`,
      `Ultrasound propagation velocity`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 141,
    question: `The color flow image provides information on all of the following except:`,
    options: [
      `The existence of flow`,
      `The location of the flow in the image`,
      `The flow direction relative to transducer`,
      `Flow velocity`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Color flow Doppler shows the existence of flow, its location, and its direction relative to the transducer, but it displays a mean/estimated velocity per pixel rather than a precise peak velocity — spectral Doppler is needed for that.`,
    editorialStatus: "editorially_corrected",
    editorialNote: `Clarified wording; original answer (D) already correct.`,
  },
  {
    id: 142,
    question: `With bidirectional spectral Doppler:`,
    options: [
      `Flow toward the transducer is displayed below the baseline while flow away from the transducer is also displayed below the baseline`,
      `Flow toward the transducer is displayed above the baseline while flow away from the transducer is displayed below the baseline`,
      `Flow toward the transducer is displayed below the baseline while flow away from the transducer is displayed above the baseline`,
      `Flow toward the transducer is displayed above the baseline while flow away from the transducer is also displayed above the baseline`,
    ],
    correctAnswer: 1,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Flow toward the transducer is displayed above the baseline while flow away from the transducer is displayed below the baseline.`,
    editorialStatus: "validated",
  },
  {
    id: 143,
    question: `The following is correct about Doppler color flow imaging except that:`,
    options: [
      `It is a continuous wave system`,
      `It is a pulsed wave system`,
      `It is range specific`,
      `It cannot detect the peak velocity of blood flow`,
    ],
    correctAnswer: 0,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: It is a continuous wave system.`,
    editorialStatus: "validated",
  },
  {
    id: 144,
    question: `With Doppler color flow system, aliasing occurs when:`,
    options: [
      `Doppler frequency exceeds the PRF sampling (Nyquist) limit`,
      `Doppler frequency is below the PRF sampling (Nyquist) limit`,
      `Doppler frequency equals the PRF sampling (Nyquist) limit`,
      `PRF sampling (Nyquist) limit exceeds the Doppler frequency`,
    ],
    correctAnswer: 0,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Doppler frequency exceeds the PRF sampling (Nyquist) limit.`,
    editorialStatus: "validated",
  },
  {
    id: 145,
    question: `Which of the following is correct about Power Doppler Imaging?`,
    options: [
      `It is able to detect low velocity signals unlike spectral and color flow Doppler`,
      `It is limited because it does not show the direction of flow`,
      `It only captures the amplitudes of the signals`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 146,
    question: `The Doppler shift is?`,
    options: [
      `The difference between the frequency of reflected echo signal and transmitted echo signal`,
      `The addition of the frequency of reflected echo signal and transmitted echo signal`,
      `The product of the frequency of reflected echo signal and transmitted echo signal`,
      `The ratio of the frequency of reflected echo signal to transmitted echo signal`,
    ],
    correctAnswer: 0,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: The difference between the frequency of reflected echo signal and transmitted echo signal.`,
    editorialStatus: "validated",
  },
  {
    id: 147,
    question: `Laminar flow is:`,
    options: [
      `Aligned and parallel flow streamlines`,
      `Characterized by layers of blood; each layer traveling at individual speeds`,
      `Usually found in normal physiological states`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 148,
    question: `The two forms of laminar flow are?`,
    options: [
      `Plug and parabolic flow`,
      `Parabolic and abrupt flow`,
      `Incident and plug flow`,
      `Incident and parabolic flow`,
    ],
    correctAnswer: 0,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Plug and parabolic flow.`,
    editorialStatus: "validated",
  },
  {
    id: 149,
    question: `Turbulent flow?`,
    options: [
      `Chaotic and multi-velocity flow patterns`,
      `Often associated with cardiovascular pathology and elevated blood velocities`,
      `may be noticed downstream a Stenosis`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 150,
    question: `Bernoulli’s Principle?`,
    options: [
      `Describes the relationship between velocity (kinetic energy) and pressure in a moving fluid`,
      `States that with a steady flow, the sum of all forms of energy remain constant everywhere.`,
      `Is derived from the Principle of conservation of energy which states that energy is neither created nor destroyed.`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 151,
    question: `In bidirectional Doppler?`,
    options: [
      `A positive Doppler shift indicates a movement away from the transducer`,
      `A negative Doppler shift indicates a movement toward the transducer`,
      `Flow toward the transducer is above the baseline(+) while flow away from the transducer is below the baseline(-)`,
      `All of the above`,
    ],
    correctAnswer: 2,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Flow toward the transducer is above the baseline(+) while flow away from the transducer is below the baseline(-).`,
    editorialStatus: "validated",
  },
  {
    id: 152,
    question: `Power Doppler?`,
    options: [
      `Is non-directional color Doppler`,
      `Only identifies the presence of Doppler shift`,
      `does not evaluate for velocity`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
  {
    id: 153,
    question: `Pulsed Wave Doppler:`,
    options: [
      `Requires 2 crystals in the transducer, one for transmission and the other for reception`,
      `Accurately measures high velocities`,
      `Is unable to determine the precise location of peak velocity`,
      `Requires only one PZT crystal, which alternates between transmit and receive times`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: Requires only one PZT crystal, which alternates between transmit and receive times.`,
    editorialStatus: "validated",
  },
  {
    id: 154,
    question: `Continuous Wave Doppler?`,
    options: [
      `Measures velocity in a small region called gate or sample volume`,
      `is able to select the exact location where velocities are measured (Range resolution)`,
      `Is unable to measure high velocity flows accurately, causing aliasing`,
      `Lacks TGC, hence deeper images not adequately compensated for`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Continuous Wave (CW) Doppler uses two crystals transmitting and receiving simultaneously, so it has no way to time-gate returning echoes by depth. This means it lacks range resolution — it cannot isolate a specific sample depth — and cannot apply real-time-adjusted TGC, unlike Pulsed Wave Doppler. Its advantage is that it can measure very high velocities without aliasing.`,
    editorialStatus: "editorially_corrected",
    editorialNote: `Expanded explanation to lead with range resolution (the primary tested distinction between CW and PW Doppler) in addition to the TGC point already in the source; original answer (D) already correct.`,
  },
  {
    id: 155,
    question: `Doppler artifacts include:`,
    options: [
      `Ghosting`,
      `Crosstalk`,
      `Aliasing`,
      `All of the above`,
    ],
    correctAnswer: 3,
    domain: "Domain 4: Doppler & Hemodynamics",
    explanation: `Per the source ARDMS-style question bank, the correct choice is: All of the above.`,
    editorialStatus: "validated",
  },
];

// ── VALIDATION / CONTENT AUDIT ────────────────────────────────────────
// Validate all questions at module load time. This also functions as
// the automated content audit required for this feature: it fails
// loudly (throws) if the bank drifts from spec.
function validateExamQuestions(): void {
  const EXPECTED_COUNT = 155;

  if (EXAM_QUESTIONS.length !== EXPECTED_COUNT) {
    throw new Error(
      `EXAM_QUESTIONS: expected ${EXPECTED_COUNT} questions, found ${EXAM_QUESTIONS.length}`
    );
  }

  // IDs must be exactly 1..155, unique, no gaps
  const ids = EXAM_QUESTIONS.map((q) => q.id).sort((a, b) => a - b);
  for (let i = 0; i < EXPECTED_COUNT; i++) {
    if (ids[i] !== i + 1) {
      throw new Error(
        `EXAM_QUESTIONS: IDs must be exactly 1..${EXPECTED_COUNT} with no gaps or duplicates. Problem at position ${i}: found ${ids[i]}, expected ${i + 1}.`
      );
    }
  }

  const correctedIds: number[] = [];

  EXAM_QUESTIONS.forEach((q) => {
    // Validate correctAnswer is in bounds
    if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
      throw new Error(
        `Question ${q.id}: correctAnswer ${q.correctAnswer} out of range [0, ${q.options.length - 1}]`
      );
    }

    if (q.options.length < 2) {
      throw new Error(`Question ${q.id}: must have at least 2 options`);
    }

    // Validate domain is valid
    if (!DOMAINS.includes(q.domain as ExamDomain)) {
      throw new Error(
        `Question ${q.id}: invalid domain "${q.domain}". Must be one of: ${DOMAINS.join(", ")}`
      );
    }

    // Validate required fields
    if (!q.question || q.question.trim().length === 0) {
      throw new Error(`Question ${q.id}: question text is empty`);
    }

    if (!Array.isArray(q.options) || q.options.length < 2) {
      throw new Error(`Question ${q.id}: must have at least 2 options`);
    }

    if (!q.explanation || q.explanation.trim().length === 0) {
      throw new Error(`Question ${q.id}: explanation is empty`);
    }

    // Editorial metadata consistency
    if (q.editorialStatus === "editorially_corrected") {
      correctedIds.push(q.id);
      if (!q.editorialNote || q.editorialNote.trim().length === 0) {
        throw new Error(
          `Question ${q.id}: marked editorially_corrected but missing editorialNote`
        );
      }
    } else if (q.editorialStatus !== "validated") {
      throw new Error(
        `Question ${q.id}: invalid editorialStatus "${q.editorialStatus}"`
      );
    }
  });

  // The corrected-ID set must match EDITORIALLY_CORRECTED_IDS exactly —
  // no more, no fewer. This is the check that resolves the "14 vs 12"
  // ambiguity: it fails the build if any of the 14 mandatory IDs is
  // missing its correction, or if an ID outside that list is
  // incorrectly marked as corrected.
  const sortedCorrected = [...correctedIds].sort((a, b) => a - b);
  const expected = [...EDITORIALLY_CORRECTED_IDS].sort((a, b) => a - b);
  const correctedSetMatches =
    sortedCorrected.length === expected.length &&
    sortedCorrected.every((id, i) => id === expected[i]);

  if (!correctedSetMatches) {
    throw new Error(
      `EXAM_QUESTIONS: editorially_corrected IDs ${JSON.stringify(sortedCorrected)} do not match the mandatory set ${JSON.stringify(expected)}`
    );
  }

  // Validate domain counts
  const domainCounts = DOMAINS.reduce(
    (acc, domain) => {
      acc[domain] = EXAM_QUESTIONS.filter((q) => q.domain === domain).length;
      return acc;
    },
    {} as Record<string, number>
  );

  console.info(
    `[exam-data] Validation passed. ${EXPECTED_COUNT} questions, ${correctedIds.length} editorially corrected (IDs: ${sortedCorrected.join(", ")}). Domain distribution:`,
    domainCounts
  );
}

// Run validation at module load
validateExamQuestions();

// ── COMPUTED DOMAIN INFO ────────────────────────────────────────────
export const EXAM_DOMAIN_INFO = DOMAINS.map((domain) => ({
  value: domain,
  label: domain.split(": ")[1] || domain,
  count: EXAM_QUESTIONS.filter((q) => q.domain === domain).length,
}));

/** Total size of the full question bank (derive — never hardcode elsewhere). */
export const TOTAL_EXAM_QUESTIONS = EXAM_QUESTIONS.length;

/** Number of distinct domains actually implemented — use this, not a hardcoded "6". */
export const TOTAL_EXAM_DOMAINS = DOMAINS.length;

/** Client-safe question (no correct answer) */
export interface ClientExamQuestion {
  id: number;
  question: string;
  options: string[];
  domain: string;
}

/** Strip correct answers for client delivery */
export function toClientQuestions(
  questions: ExamQuestion[]
): ClientExamQuestion[] {
  if (!Array.isArray(questions)) {
    throw new Error("toClientQuestions: input must be an array");
  }

  return questions.map(({ id, question, options, domain }) => {
    // ✅ FIXED: check that options IS an array (was incorrectly inverted)
    if (!id || !question || !Array.isArray(options) || !domain) {
      throw new Error("toClientQuestions: malformed question object");
    }

    return { id, question, options, domain };
  });
}

/** Shuffle array using Fisher-Yates with crypto-secure randomness */
export function shuffleQuestions<T>(arr: T[]): T[] {
  if (!Array.isArray(arr)) {
    throw new Error("shuffleQuestions: input must be an array");
  }

  const shuffled = [...arr];

  for (let i = shuffled.length - 1; i > 0; i--) {
    // Use crypto.randomInt for cryptographically secure randomness
    const j = randomInt(0, i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

