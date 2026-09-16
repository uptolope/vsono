"use client";

import { useId, useState } from "react";

export default function NyquistCalculatorClient() {
  const prefix = useId();
  const depthId = `${prefix}-depth`;
  const shiftId = `${prefix}-shift`;

  const [depth, setDepth] = useState("7");
  const [shift, setShift] = useState("4.5");

  const depthValue = Number.parseFloat(depth);
  const shiftValue = Number.parseFloat(shift);

  const validDepth = Number.isFinite(depthValue) && depthValue > 0;
  const validShift = Number.isFinite(shiftValue) && shiftValue >= 0;

  const prfKHz = validDepth ? 77 / depthValue : 0;
  const nyquistKHz = prfKHz / 2;
  const aliasingDetected =
    validDepth && validShift && shiftValue > nyquistKHz;

  return (
    <section
      aria-labelledby={`${prefix}-title`}
      className="rounded border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl sm:p-8"
    >
      <h2
        id={`${prefix}-title`}
        className="mb-3 text-2xl font-semibold text-white"
      >
        Interactive Nyquist Limit &amp; Aliasing Calculator
      </h2>

      <p className="mb-6 text-[#c2bab0]">
        Enter imaging depth and measured Doppler shift frequency to determine
        whether the shift exceeds the Nyquist limit.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor={depthId}
            className="mb-2 block text-sm font-medium text-white"
          >
            Imaging depth in centimeters
          </label>

          <input
            id={depthId}
            type="number"
            inputMode="decimal"
            min="0.1"
            max="25"
            step="0.1"
            value={depth}
            onChange={(event) => setDepth(event.target.value)}
            className="w-full rounded border border-white/20 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#c85b3a] focus:ring-2 focus:ring-[#c85b3a]/30"
            aria-describedby={`${depthId}-help`}
          />

          <p id={`${depthId}-help`} className="mt-2 text-sm text-[#8a8279]">
            Formula: PRF = 77 ÷ depth (cm)
          </p>
        </div>

        <div>
          <label
            htmlFor={shiftId}
            className="mb-2 block text-sm font-medium text-white"
          >
            Measured Doppler shift in kHz
          </label>

          <input
            id={shiftId}
            type="number"
            inputMode="decimal"
            min="0"
            max="30"
            step="0.1"
            value={shift}
            onChange={(event) => setShift(event.target.value)}
            className="w-full rounded border border-white/20 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#c85b3a] focus:ring-2 focus:ring-[#c85b3a]/30"
            aria-describedby={`${shiftId}-help`}
          />

          <p id={`${shiftId}-help`} className="mt-2 text-sm text-[#8a8279]">
            Compare the measured shift with PRF ÷ 2.
          </p>
        </div>
      </div>

      <div
        className="mt-8 grid gap-4 sm:grid-cols-3"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="rounded border border-white/[0.08] bg-black/20 p-5">
          <p className="text-sm text-[#8a8279]">Estimated PRF</p>
          <p className="mt-1 text-3xl font-bold text-[#c85b3a]">
            {validDepth ? `${prfKHz.toFixed(2)} kHz` : "—"}
          </p>
        </div>

        <div className="rounded border border-white/[0.08] bg-black/20 p-5">
          <p className="text-sm text-[#8a8279]">Nyquist limit</p>
          <p className="mt-1 text-3xl font-bold text-[#c85b3a]">
            {validDepth ? `${nyquistKHz.toFixed(2)} kHz` : "—"}
          </p>
        </div>

        <div className="rounded border border-white/[0.08] bg-black/20 p-5">
          <p className="text-sm text-[#8a8279]">Status</p>
          <p
            className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-bold ${
              aliasingDetected
                ? "bg-red-900/50 text-red-300"
                : "bg-green-900/50 text-green-300"
            }`}
          >
            {!validDepth || !validShift
              ? "ENTER VALID VALUES"
              : aliasingDetected
                ? "ALIASING DETECTED"
                : "NO ALIASING"}
          </p>
        </div>
      </div>

      {!validDepth && (
        <p role="alert" className="mt-5 text-sm text-red-300">
          Enter a depth greater than zero.
        </p>
      )}

      {validDepth && !validShift && (
        <p role="alert" className="mt-5 text-sm text-red-300">
          Enter a Doppler shift of zero or greater.
        </p>
      )}
    </section>
  );
}
