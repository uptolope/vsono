---
title: "Doppler Principles for the SPI Exam: Nyquist, Aliasing & Spectral Analysis"
description: "The Doppler domain is 34% of the SPI exam. Nyquist limit, aliasing, spectral Doppler analysis, and PRF — all covered."
url: "https://sonoprep.com/blog/doppler-principles-spi-exam"
date: "April 18, 2026"
read: "20 min read"
---

# Doppler Principles for the SPI Exam: Nyquist, Aliasing & Spectral Analysis

_April 18, 2026 · 20 min read_

Apply Doppler Concepts is the largest domain on the SPI exam, accounting for roughly 34% of the test — more than a third of all 110 questions. If you're going to over-invest your study time anywhere, this is where. This guide walks through the concepts that show up most often, in the order they tend to build on each other.

## The Doppler equation and Doppler shift

The Doppler effect describes the change in frequency of a sound wave when there's relative motion between the source and the reflector — in this case, blood cells moving through a vessel. The Doppler shift is the difference between the transmitted frequency and the received frequency.
The size of that shift depends on four things: the transmitted frequency, the velocity of the blood flow, the speed of sound in tissue, and the cosine of the Doppler angle — the angle between the ultrasound beam and the direction of blood flow.
That last variable, the angle, is where most exam questions focus. Because the equation involves the cosine of the angle, the relationship is not linear, and a few angle values are worth memorizing:

- At a 0° angle (beam parallel to flow), cosine is 1 — you get the maximum possible Doppler shift for that velocity.
- At a 90° angle (beam perpendicular to flow), cosine is 0 — the Doppler shift is zero, regardless of how fast the blood is moving. This is a classic exam trap: fast flow can produce no detectable signal at 90°.
- At 60°, cosine is 0.5 — a commonly used clinical angle because it balances signal strength with practical scanning geometry, and ARDMS likes to use it in calculation questions.

## Aliasing and the Nyquist limit

Aliasing is probably the single most-tested concept in the Doppler domain. It happens when the Doppler shift frequency exceeds half the pulse repetition frequency (PRF) — this threshold is called the Nyquist limit.
When aliasing occurs in spectral Doppler, the waveform appears to "wrap around" — the peak of the waveform gets cut off at the top of the display and reappears at the bottom, as if the velocity suddenly reversed direction. In color Doppler, aliasing shows up as an abrupt color change within a single flow jet — for example, a area of flow that should be uniformly red suddenly contains a patch of blue, even though the flow direction hasn't actually reversed.

### Ways to eliminate or reduce aliasing

The exam expects you to know multiple ways to address aliasing, because in practice you often need to combine several:

- Increase the PRF (raise the scale): Since aliasing occurs when shift exceeds PRF/2, raising the PRF raises the Nyquist limit and gives the system more "room" before wrapping occurs.
- Decrease the transmit frequency: Doppler shift is proportional to transmit frequency, so a lower frequency transducer produces a smaller shift for the same velocity, which is less likely to exceed the Nyquist limit.
- Decrease the Doppler angle: Wait — this one is counterintuitive. A smaller angle (closer to 0°) actually increases the Doppler shift (since cosine is larger), which makes aliasing more likely, not less. Increasing the angle toward 60° reduces the shift and can help avoid aliasing. Don't mix this up.
- Shift the baseline: In spectral Doppler, moving the baseline doesn't change the underlying physics, but it gives the waveform more room to display in one direction before hitting the edge of the display — effectively unwrapping a mildly aliased signal.
- Switch to continuous wave (CW) Doppler: CW Doppler has no PRF and therefore no Nyquist limit — it can measure any velocity without aliasing, at the cost of range resolution (you lose the ability to know exactly where along the beam the signal is coming from).
  **Exam trap to watch for:** "Decreasing the Doppler angle" is sometimes listed as an answer choice for "which of the following reduces aliasing." It's the opposite — decreasing the angle increases the Doppler shift and makes aliasing more likely. The correct direction is to increase the angle (move it closer to 90°, though not all the way, since that produces zero shift).

## Wall filters

Wall filters (also called high-pass filters) remove low-frequency, high-amplitude Doppler signals that come from slow-moving structures like vessel walls and surrounding tissue motion. Without a wall filter, this "wall thump" would clutter the spectral display and obscure the actual blood flow signal.
The tradeoff: setting the wall filter too high will also remove real, low-velocity blood flow signals — which matters in applications like venous Doppler or detecting low-flow states, where the flow you care about may be close in frequency to the wall motion you're trying to filter out.

## Sample gate and color Doppler concepts

The sample gate (or sample volume) in pulsed wave Doppler defines the specific location and size of the region being sampled along the beam. A larger gate samples a larger area — useful for finding a signal — but reduces spatial specificity, which matters when you're trying to isolate flow at a precise location like a stenosis.
Color priority determines whether color Doppler information or gray-scale information takes precedence when both are present in the same pixel — relevant when trying to visualize flow in a vessel near a strong gray-scale reflector.
The color Doppler map assigns colors to represent flow direction (commonly red toward the transducer, blue away — though this is a convention, not a physical law, and can be reversed) and often uses brightness or additional colors like yellow/green to represent velocity or turbulence.

## Continuous wave vs. pulsed wave Doppler

This comparison shows up repeatedly across multiple question formats:
| Property |
| Continuous Wave (CW) |
| Pulsed Wave (PW) |
| Range resolution |
| None — can't localize depth |
| Yes — sample gate defines depth |
| Aliasing |
| None possible |
| Limited by Nyquist (PRF/2) |
| Best for |
| Very high velocities (e.g., severe stenosis) |
| Site-specific velocity measurement |
| Transducer crystals |
| Two — one continuously transmits, one continuously receives |
| One — alternates between transmit and receive |

## General hemodynamic concepts

The exam also tests basic hemodynamic relationships — particularly the relationship between pressure gradients and resistance, and how flow velocity changes as a vessel narrows. The general principle (related to the continuity equation and Bernoulli's principle) is that as a vessel cross-sectional area decreases, velocity must increase to maintain flow — which is the physical basis for using velocity increases to identify stenosis severity.

## Spectral Doppler gain and scale

Gain and scale are two of the most commonly adjusted Doppler settings, and the exam tests whether you can identify the visual signs of each being set incorrectly:

- Spectral gain too high: excessive background noise fills the spectral display, and the waveform may appear washed out or "filled in."
- Spectral gain too low: the waveform appears faint or incomplete, with parts of the signal missing.
- Scale too low (relative to velocity): aliasing, as discussed above.
- Scale too high (relative to velocity): the waveform appears small, compressed into a small portion of the available display — you're not using the full vertical resolution available.
  The Doppler domain rewards understanding relationships, not memorizing isolated facts. Almost every concept above connects to at least one other — aliasing connects to PRF, angle, and CW vs. PW; wall filters connect to flow velocity and clinical application. SonoPrep's flashcard system groups these relationships together so you're reviewing connected concepts, not disconnected definitions.
