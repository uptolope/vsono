import type { Metadata } from "next";
import BlogPostLayout, { proseClasses } from "@/components/BlogPostLayout";

export const metadata: Metadata = {
  title:
    "Ultrasound Artifacts: The 7 Most Common SPI Exam Questions | SonoPrep",
  description:
    "Reverberation, shadowing, comet-tail, mirror image — the ARDMS SPI exam tests these artifacts every time. Learn to identify and explain each one.",
  keywords: [
    "ultrasound artifacts SPI",
    "reverberation artifact",
    "mirror image artifact",
    "comet tail artifact",
  ],
  alternates: {
    canonical: "https://sonoprep.com/blog/ultrasound-artifacts-spi",
  },
};

export default function Page() {
  return (
    <BlogPostLayout
      tag="IMAGE QUALITY"
      title="Ultrasound Artifacts: The 7 Most Common SPI Exam Questions"
      date="April 3, 2026"
      read="15 min read"
      url="https://sonoprep.com/blog/ultrasound-artifacts-spi"
      description="Reverberation, shadowing, comet-tail, mirror image — the ARDMS SPI exam tests these artifacts heavily. Learn to identify and explain all 7."
    >
      <p>
        Artifacts are a favorite SPI exam topic because they test whether you
        understand the underlying physics, not just whether you can recognize a
        pattern on a screen. Every artifact below has a clear physical cause —
        and the exam usually asks about the cause, not just the name. Here are
        the seven that come up most often.
      </p>

      <h2 className={proseClasses.h2}>1. Reverberation</h2>
      <p>
        Reverberation occurs when sound bounces back and forth between two
        strong, parallel reflectors — often the transducer face and a
        superficial reflective structure — before finally returning to the
        transducer. Each "bounce" creates an additional echo, displayed at
        increasing depth, producing a series of equally spaced parallel lines
        that get fainter with depth.
      </p>
      <p>
        The exam may also test "ring-down" artifact as a related concept — a
        continuous reverberation often associated with gas bubbles, appearing as
        a solid streak rather than discrete lines.
      </p>

      <h2 className={proseClasses.h2}>2. Comet-tail artifact</h2>
      <p>
        A specific, dense form of reverberation, comet-tail artifact appears as
        a bright, tapering trail of echoes extending from a strongly reflective
        small object — classically associated with metallic objects (like a
        surgical clip or IUD) or small gas bubbles. The "tail" results from very
        rapid, closely spaced reverberation between the object's surfaces.
      </p>

      <h2 className={proseClasses.h2}>3. Posterior acoustic shadowing</h2>
      <p>
        Shadowing appears as a dark band extending posterior to (behind) a
        structure that strongly attenuates or reflects sound — most commonly
        calcifications, bone, or dense fibrous tissue. Because so little sound
        energy makes it past the structure, very little returns from the tissue
        behind it, so that region appears dark on the image.
      </p>
      <p>
        Shadowing is a useful diagnostic clue, not just an artifact to correct —
        its presence or absence helps differentiate, for example, a calcified
        gallstone (which shadows) from a polyp (which typically does not).
      </p>

      <h2 className={proseClasses.h2}>4. Posterior acoustic enhancement</h2>
      <p>
        The opposite of shadowing — enhancement appears as a bright band
        posterior to a structure that attenuates sound very little, classically
        a simple fluid-filled structure like a cyst or the bladder. Because the
        fluid absorbs less sound than the surrounding tissue would, more sound
        energy reaches the tissue behind it, and that tissue appears
        artificially bright by comparison to the surrounding area at the same
        depth.
      </p>

      <h2 className={proseClasses.h2}>5. Mirror image artifact</h2>
      <p>
        Mirror image artifact occurs when sound reflects off a strong curved or
        flat reflector (commonly the diaphragm) and continues on to image a real
        structure, then returns along the same reflected path. The system
        assumes sound traveled in a straight line, so it displays a duplicate of
        the real structure on the opposite side of the strong reflector — at a
        depth corresponding to the total path length traveled.
      </p>
      <p>
        Classic example: a liver lesion appearing to be duplicated above the
        diaphragm, inside what should be the lung field — the "duplicate" is the
        mirror image, not a second real structure.
      </p>

      <h2 className={proseClasses.h2}>6. Refraction artifact</h2>
      <p>
        Refraction occurs when sound crosses a boundary between two tissues with
        different propagation speeds at an oblique angle, causing the beam to
        bend. Because the system assumes the beam travels in a straight line, a
        structure can appear to be displaced from its true position — sometimes
        appearing duplicated or split.
      </p>
      <p>
        A commonly cited example is at the edge of the rectus abdominis muscles,
        where refraction can cause a structure (like a gestational sac) to
        appear duplicated, side by side.
      </p>

      <h2 className={proseClasses.h2}>7. Side lobe and beam width artifacts</h2>
      <p>
        Real ultrasound beams aren't perfectly narrow — they have a main beam
        plus weaker side lobes (or, in array transducers, grating lobes). Energy
        from these secondary beams can return from structures outside the main
        beam's path, and the system displays that energy as if it came from the
        main beam — producing artifactual echoes inside structures that should
        be anechoic, such as artifactual "debris" appearing within a simple
        cyst.
      </p>
      <p>
        Beam width artifact is the related concept where the main beam itself is
        wider than displayed, causing structures at the edge of the beam to be
        smeared across a wider area than their true size — particularly
        noticeable at the focal zone boundaries.
      </p>

      <div className={proseClasses.callout}>
        <p className="text-white text-sm mb-0">
          <strong>How the exam tests this:</strong> rather than just asking
          "what is this artifact called," questions often describe a scanning
          scenario and ask you to identify the artifact from the physical setup
          — e.g., "a strongly reflective curved structure near the diaphragm,
          with a duplicated structure appearing above it" (mirror image), or ask
          what setting change would reduce a described artifact. Recognizing the
          underlying cause is what lets you answer both question types from the
          same knowledge.
        </p>
      </div>

      <h2 className={proseClasses.h2}>A quick reference table</h2>
      <table className={proseClasses.table}>
        <thead>
          <tr>
            <th className={proseClasses.th}>Artifact</th>
            <th className={proseClasses.th}>Visual appearance</th>
            <th className={proseClasses.th}>Underlying cause</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={proseClasses.td}>Reverberation</td>
            <td className={proseClasses.td}>
              Equally spaced parallel lines, fading with depth
            </td>
            <td className={proseClasses.td}>
              Sound bouncing between two strong parallel reflectors
            </td>
          </tr>
          <tr>
            <td className={proseClasses.td}>Comet-tail</td>
            <td className={proseClasses.td}>
              Bright tapering trail behind a small reflector
            </td>
            <td className={proseClasses.td}>
              Rapid reverberation in metal or gas
            </td>
          </tr>
          <tr>
            <td className={proseClasses.td}>Shadowing</td>
            <td className={proseClasses.td}>Dark band behind a structure</td>
            <td className={proseClasses.td}>
              Strong attenuation/reflection by that structure
            </td>
          </tr>
          <tr>
            <td className={proseClasses.td}>Enhancement</td>
            <td className={proseClasses.td}>Bright band behind a structure</td>
            <td className={proseClasses.td}>
              Minimal attenuation (fluid-filled structure)
            </td>
          </tr>
          <tr>
            <td className={proseClasses.td}>Mirror image</td>
            <td className={proseClasses.td}>
              Duplicate structure across a strong reflector
            </td>
            <td className={proseClasses.td}>
              Reflected path mistaken for a straight path
            </td>
          </tr>
          <tr>
            <td className={proseClasses.td}>Refraction</td>
            <td className={proseClasses.td}>
              Structure displaced or duplicated
            </td>
            <td className={proseClasses.td}>
              Beam bending at a tissue boundary
            </td>
          </tr>
          <tr>
            <td className={proseClasses.td}>Side lobe / beam width</td>
            <td className={proseClasses.td}>
              Artifactual echoes inside anechoic structures
            </td>
            <td className={proseClasses.td}>
              Energy from secondary beam paths
            </td>
          </tr>
        </tbody>
      </table>
    </BlogPostLayout>
  );
}
