"use client";

import { useState } from "react";

export default function UltrasoundCalculatorsClient() {
  const [spl, setSpl] = useState("1.54");
  const [prf, setPrf] = useState("8000");

  const splValue = Number.parseFloat(spl);
  const prfValue = Number.parseFloat(prf);

  const axialResolution = Number.isFinite(splValue)
    ? (splValue / 2).toFixed(3)
    : "0.000";

  const nyquistLimit = Number.isFinite(prfValue)
    ? (prfValue / 2).toFixed(0)
    : "0";

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="rounded border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="mb-2 text-2xl font-semibold text-white">
          Axial Resolution
        </h2>

        <p className="mb-6 text-sm leading-relaxed text-[#c2bab0]">
          Axial resolution is calculated by dividing the spatial pulse length
          by two.
        </p>

        <div className="mb-5 rounded bg-white/[0.03] p-4">
          <p className="font-mono text-sm text-[#c2bab0]">
            Axial Resolution = SPL ÷ 2
          </p>
        </div>

        <label
          htmlFor="spatial-pulse-length"
          className="mb-2 block text-sm font-medium text-white"
        >
          Spatial Pulse Length (SPL) in millimeters
        </label>

        <input
          id="spatial-pulse-length"
          type="number"
          min="0"
          step="0.01"
          value={spl}
          onChange={(event) => setSpl(event.target.value)}
          className="mb-6 w-full rounded border border-slate-300 bg-[#0B0D10] px-3 py-2 text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        />

        <div className="rounded border border-sky-100 bg-sky-50 p-4">
          <p className="text-sm text-slate-700">Axial Resolution</p>
          <p className="text-3xl font-bold text-[#c85b3a]">
            {axialResolution} mm
          </p>
        </div>
      </section>

      <section className="rounded border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="mb-2 text-2xl font-semibold text-white">
          Nyquist Limit
        </h2>

        <p className="mb-6 text-sm leading-relaxed text-[#c2bab0]">
          The Nyquist limit is the maximum Doppler frequency shift that can be
          measured without aliasing.
        </p>

        <div className="mb-5 rounded bg-white/[0.03] p-4">
          <p className="font-mono text-sm text-[#c2bab0]">
            Nyquist Limit = PRF ÷ 2
          </p>
        </div>

        <label
          htmlFor="pulse-repetition-frequency"
          className="mb-2 block text-sm font-medium text-white"
        >
          Pulse Repetition Frequency (PRF) in hertz
        </label>

        <input
          id="pulse-repetition-frequency"
          type="number"
          min="0"
          step="100"
          value={prf}
          onChange={(event) => setPrf(event.target.value)}
          className="mb-6 w-full rounded border border-slate-300 bg-[#0B0D10] px-3 py-2 text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        />

        <div className="rounded border border-sky-100 bg-sky-50 p-4">
          <p className="text-sm text-slate-700">Nyquist Limit</p>
          <p className="text-3xl font-bold text-[#c85b3a]">
            {nyquistLimit} Hz
          </p>
        </div>
      </section>
    </div>
  );
}

