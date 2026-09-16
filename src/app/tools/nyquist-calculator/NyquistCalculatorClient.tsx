"use client";

import { useId, useState } from "react";

export default function NyquistCalculatorClient() {
  const inputId = useId();
  const [depth, setDepth] = useState("5");

  const depthValue = Number.parseFloat(depth);
  const validDepth = Number.isFinite(depthValue) && depthValue > 0;

  const prfKHz = validDepth ? 77 / depthValue : 0;
  const nyquistKHz = prfKHz / 2;

  return (
    <section
      aria-labelledby={`${inputId}-title`}
      className="rounded border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl sm:p-8"
    >
      <h2
        id={`${inputId}-title`}
        className="mb-3 text-2xl font-semibold text-white"
      >
        Interactive Nyquist Limit Calculator
      </h2>

      <p className="mb-6 text-[#c2bab0]">
        Enter imaging depth in centimeters. The calculator estimates PRF and
        divides PRF by two to calculate the Nyquist limit.
      </p>

      <div className="max-w-md">
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-white"
        >
          Imaging depth in centimeters
        </label>

        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          min="0.1"
          step="0.1"
          value={depth}
          onChange={(event) => setDepth(event.target.value)}
          className="w-full rounded border border-white/20 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#c85b3a] focus:ring-2 focus:ring-[#c85b3a]/30"
          aria-describedby={`${inputId}-help`}
        />

        <p id={`${inputId}-help`} className="mt-2 text-sm text-[#8a8279]">
          Formula: PRF = 77 ÷ depth (cm)
        </p>
      </div>

      <div
        className="mt-8 grid gap-4 sm:grid-cols-2"
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
      </div>

      {!validDepth && (
        <p role="alert" className="mt-5 text-sm text-red-300">
          Enter a depth greater than zero to calculate the result.
        </p>
      )}
    </section>
  );
}
