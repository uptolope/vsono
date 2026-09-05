// ═══════════════════════════════════════════════════════════════════
// SonoPrep — Physics Pearls (SERVER-SIDE ONLY)
// 50 high-yield physics concepts
// DO NOT IMPORT THIS FILE IN CLIENT COMPONENTS
// ═══════════════════════════════════════════════════════════════════

export interface PhysicsPearl {
  id: number;
  text: string;
}

/** All 50 physics pearls — SERVER USE ONLY */
export const PHYSICS_PEARLS: PhysicsPearl[] = [
  { id: 1, text: `Physics deals with matter, energy, motion, and force; these are the foundation of ultrasound imaging.` },
  { id: 2, text: `Ultrasound sonography uses mechanical, longitudinal sound waves to image internal structures.` },
  { id: 3, text: `Sound frequency used in medical ultrasound is greater than 20 kHz; diagnostic typically uses 2–15 MHz.` },
  { id: 4, text: `Period and frequency are inversely related and reciprocal: period × frequency = 1.` },
  { id: 5, text: `Amplitude, power, and intensity of the sound wave are interconnected and directly related.` },
  { id: 6, text: `Power is proportional to amplitude squared in ultrasound waves.` },
  { id: 7, text: `Intensity is power per unit area; measured in watts/cm², adjustable by the sonographer.` },
  { id: 8, text: `Wavelength is determined by both the source and the medium, not adjustable by the sonographer.` },
  { id: 9, text: `High-frequency transducers produce shorter wavelengths, providing greater image detail but less penetration.` },
  { id: 10, text: `Propagation speed depends on the medium, not the sound frequency; sound travels fastest in solids, slowest in gases.` },
  { id: 11, text: `The 13-microsecond rule: For each 13 μs go-return time, the reflector is 1 cm deeper in soft tissue.` },
  { id: 12, text: `Attenuation (loss of sound energy) occurs via absorption, reflection, and scattering; greater in high-frequency waves.` },
  { id: 13, text: `The attenuation coefficient in soft tissue is half the frequency (dB/cm = 0.5 × MHz).` },
  { id: 14, text: `Acoustic impedance (Z) is the product of density and propagation speed of a medium; mismatch causes reflection.` },
  { id: 15, text: `Reflection strength at a boundary depends on difference in acoustic impedance between two media.` },
  { id: 16, text: `Normal incidence (90° angle) creates reflections only if media impedances differ.` },
  { id: 17, text: `Oblique incidence (not 90°) can cause unpredictable reflection and transmission; direction changes by refraction.` },
  { id: 18, text: `Snell's Law governs refraction: greater speed difference, greater angle of refraction.` },
  { id: 19, text: `Bioeffects such as tissue heating and cavitation must be considered; thermal index (TI) and mechanical index (MI) regulate safety.` },
  { id: 20, text: `Axial resolution is determined by pulse length; shorter pulse length yields better resolution.` },
  { id: 21, text: `Lateral resolution depends on beam width; narrower beams improve lateral resolution.` },
  { id: 22, text: `Elevational resolution (slice thickness) is best in disc-shaped transducers.` },
  { id: 23, text: `Transducer arrays allow electronic beam steering and focusing for multi-dimensional imaging.` },
  { id: 24, text: `Pulsed wave transducers' frequency depends on crystal thickness and propagation speed.` },
  { id: 25, text: `PZT (lead zirconate titanate) is the most common piezoelectric material in medical ultrasound.` },
  { id: 26, text: `The matching layer on the transducer reduces reflection at skin interface by matching impedance.` },
  { id: 27, text: `Coupling gel eliminates air gaps, allowing efficient transmission of ultrasound into tissue.` },
  { id: 28, text: `Damping (backing) material in transducers shortens pulse duration, improving axial resolution.` },
  { id: 29, text: `Dynamic aperture narrows the sound beam across depth, enhancing lateral resolution.` },
  { id: 30, text: `Side and grating lobes degrade image quality; reduced by apodization and subdicing.` },
  { id: 31, text: `Linear phased array transducers have electronically adjustable focusing and beam steering.` },
  { id: 32, text: `Mechanical transducers have fixed focal depth, determined by element curvature or lens.` },
  { id: 33, text: `Harmonic imaging uses signals at twice the transmitted frequency, providing clearer images.` },
  { id: 34, text: `Pulse inversion harmonics improve image quality by canceling out fundamental frequencies.` },
  { id: 35, text: `Output power affects patient exposure and bioeffects, while receiver gain alters image brightness without affecting exposure.` },
  { id: 36, text: `Time Gain Compensation (TGC) adjusts for attenuation, equalizing image brightness at varying depths.` },
  { id: 37, text: `Dynamic range compression allows echoes within the system's display capabilities while preserving signal amplitude relationships.` },
  { id: 38, text: `Reverberation, comet tail, shadowing, and enhancement are common ultrasound artifacts.` },
  { id: 39, text: `Axial resolution formula: axial resolution (mm) = SPL / 2; SPL = wavelength × cycles per pulse.` },
  { id: 40, text: `Propagation speed errors (not 1540 m/s) cause depth misplacement of structures on image.` },
  { id: 41, text: `Tissue harmonics arise during transmission, while contrast harmonics are seen during reflection from microbubbles.` },
  { id: 42, text: `Coded excitation at the pulser improves SNR and allows deeper penetration.` },
  { id: 43, text: `Pre-amplification boosts weak signals before main amplification, improving SNR.` },
  { id: 44, text: `Compression maintains display values within the range of human vision (~20 shades of gray).` },
  { id: 45, text: `Reject (suppression/threshold) removes low voltage echoes, reducing noise but not brightness.` },
  { id: 46, text: `Channels are combinations of active elements, wiring, and electronics; most systems have 32-256 channels.` },
  { id: 47, text: `Annular phased array transducers provide multi-depth focusing using concentric ring elements.` },
  { id: 48, text: `Vector arrays combine linear sequential and phased array features for trapezoidal imaging.` },
  { id: 49, text: `Signal-to-noise ratio can be improved by increasing output gain, but this increases tissue exposure.` },
  { id: 50, text: `All imaging assumptions (straight-line travel, constant 1540 m/s, main axis reflections, thin imaging plane, etc.) have potential violations leading to artifacts.` }
];
