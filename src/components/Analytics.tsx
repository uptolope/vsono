"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
const GA_ID_PATTERN = /^G-[A-Z0-9]{6,}$/;

/**
 * Loads Google Analytics 4 — only when configured, and never for visitors who
 * send Global Privacy Control or Do Not Track. Ads/remarketing features are
 * switched off to match the Privacy Policy ("We do not use advertising or
 * tracking cookies").
 */
export default function Analytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    const optedOut =
      nav.globalPrivacyControl === true ||
      nav.doNotTrack === "1" ||
      (window as unknown as { doNotTrack?: string }).doNotTrack === "1";

    setEnabled(GA_ID_PATTERN.test(GA_ID) && !optedOut);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
    </>
  );
}
