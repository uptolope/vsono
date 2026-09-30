import "server-only";

import { getResendClient } from "@/lib/resend";
import { SITE_URL } from "@/lib/site-config";
import {
  unsubscribeApiUrl,
  unsubscribePageUrl,
} from "@/lib/unsubscribe-token";

/**
 * Lead email content + sender.
 *
 * Rules baked in (CAN-SPAM + honesty):
 *  - Every message carries a working one-click unsubscribe (header + link)
 *    and the sender's physical postal address (env MAIL_POSTAL_ADDRESS).
 *  - No invented numbers: nothing here claims a score, a pass rate or results
 *    the recipient didn't produce.
 *  - Prices/terms are stated exactly as on /products and /terms.
 */

export type LeadEmailStep = "welcome" | "plan" | "options" | "last";

/** Follow-up schedule after the welcome email, keyed by current nurtureStep. */
export const FOLLOW_UPS: {
  step: Exclude<LeadEmailStep, "welcome">;
  /** days to wait AFTER this email before the next one (null = end) */
  nextInDays: number | null;
}[] = [
  { step: "plan", nextInDays: 5 }, //   sent ~day 2, next ~day 7
  { step: "options", nextInDays: 7 }, // sent ~day 7, next ~day 14
  { step: "last", nextInDays: null }, // sent ~day 14
];

/** Days between the welcome email and the first follow-up. */
export const FIRST_FOLLOW_UP_DELAY_DAYS = 2;

export function isNurtureEnabled(): boolean {
  return (
    process.env.LEAD_NURTURE_ENABLED === "true" &&
    Boolean(process.env.MAIL_POSTAL_ADDRESS?.trim())
  );
}

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function link(path: string, step: LeadEmailStep): string {
  return (
    `${SITE_URL}${path}` +
    `?utm_source=sonoprep&utm_medium=email&utm_campaign=lead_followup&utm_content=${step}`
  );
}

interface Content {
  subject: string;
  preheader: string;
  paragraphs: string[];
  bullets?: string[];
  cta: { label: string; url: string };
  secondary?: { label: string; url: string }[];
}

function contentFor(step: LeadEmailStep): Content {
  switch (step) {
    case "welcome":
      return {
        subject: "Your free SPI diagnostic is ready",
        preheader: "10 questions, instant explanations, no card required.",
        paragraphs: [
          "Thanks for requesting the free SonoPrep SPI diagnostic. It takes a few minutes: 10 ARDMS SPI-style questions with an explanation after each one.",
          "How to get the most from it: note which topics you miss (not just your score) and review those first. A diagnostic is only useful if it changes what you study next.",
        ],
        cta: { label: "Start the free diagnostic", url: link("/demo", step) },
        secondary: [
          { label: "SPI physics formula sheet", url: link("/spi-physics-formula-sheet", step) },
          { label: "SPI ultrasound glossary", url: link("/spi-ultrasound-glossary", step) },
          { label: "Free ultrasound physics calculators", url: link("/ultrasound-physics-calculators", step) },
        ],
      };
    case "plan":
      return {
        subject: "A simple way to structure your SPI study weeks",
        preheader: "Diagnose, fix weak areas, then simulate the real thing.",
        paragraphs: [
          "Most SPI candidates don't fail for lack of effort — they spread their time evenly instead of targeting weak areas. A structure that works for many students:",
        ],
        bullets: [
          "Week 1: take a diagnostic and list the topics you missed.",
          "Weeks 2–4: study weakest areas first; use spaced repetition (short daily flashcard sessions) so facts stick.",
          "Final stretch: take timed, full-length practice exams and review every explanation — including the ones you got right.",
        ],
        cta: {
          label: "See the 30-day and 45-day study plans",
          url: link("/blog/spi-study-plan-30-45-days", step),
        },
      };
    case "options":
      return {
        subject: "What you actually need for the SPI (and what it costs)",
        preheader: "One-time payment, no subscription. Access starts at purchase.",
        paragraphs: [
          "If you want guided practice beyond the free diagnostic, here is exactly how SonoPrep works:",
        ],
        bullets: [
          "Individual products (flashcards, exam simulator, Physics Pearls, study notes) start at $9 and include 30 days of access.",
          "The Premium Bundle is $99 for all four and includes 45 days of access.",
          "Everything is a one-time payment — no subscription, no auto-renewal.",
          "Access starts when you buy, so buy when you're ready to study.",
          "There is a 10-day refund policy for eligible first purchases — details are in our Terms.",
        ],
        cta: { label: "Compare products and pricing", url: link("/products", step) },
        secondary: [{ label: "Refund and access terms", url: link("/terms", step) }],
      };
    case "last":
      return {
        subject: "One last note from SonoPrep",
        preheader: "The free tools stay free.",
        paragraphs: [
          "This is the last follow-up we'll send. The free diagnostic, formula sheet, glossary and calculators stay available whenever you need them.",
          ...(process.env.EMAIL_REPLY_TO?.trim()
            ? [
                "If you have a question about which materials fit your exam date, just reply to this email.",
              ]
            : []),
        ],
        cta: { label: "Open the free diagnostic", url: link("/demo", step) },
        secondary: [{ label: "View products", url: link("/products", step) }],
      };
  }
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderLeadEmail(
  step: LeadEmailStep,
  email: string,
  postalAddress: string,
): RenderedEmail {
  const c = contentFor(step);
  const unsub = unsubscribePageUrl(email);

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#ffffff;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(c.preheader)}</span>
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222;">
  <h2 style="color:#c85b3a;margin:0 0 16px;">${esc(c.subject)}</h2>
  ${c.paragraphs.map((p) => `<p style="font-size:16px;line-height:1.6;margin:0 0 16px;">${esc(p)}</p>`).join("\n  ")}
  ${c.bullets ? `<ul style="font-size:16px;line-height:1.7;margin:0 0 20px;padding-left:20px;">${c.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
  <p style="margin:24px 0;"><a href="${esc(c.cta.url)}" style="display:inline-block;background:#c85b3a;color:#fff;padding:12px 22px;text-decoration:none;border-radius:4px;font-weight:bold;">${esc(c.cta.label)} →</a></p>
  ${c.secondary ? `<p style="font-size:14px;line-height:1.8;margin:0 0 16px;">${c.secondary.map((l) => `<a href="${esc(l.url)}" style="color:#c85b3a;">${esc(l.label)}</a>`).join("<br>")}</p>` : ""}
  <hr style="border:none;border-top:1px solid #eee;margin:28px 0 16px;">
  <p style="font-size:12px;line-height:1.6;color:#777;margin:0 0 8px;">You're receiving this because ${esc(email)} was entered on sonoprep.com to get the free SPI diagnostic. <a href="${esc(unsub)}" style="color:#777;">Unsubscribe</a>.</p>
  <p style="font-size:12px;line-height:1.6;color:#777;margin:0 0 8px;">SonoPrep · ${esc(postalAddress)}</p>
  <p style="font-size:12px;line-height:1.6;color:#777;margin:0;">SonoPrep is an independent study resource, not affiliated with or endorsed by ARDMS or Inteleos. ARDMS® is a registered trademark of Inteleos.</p>
</div></body></html>`;

  const text = [
    c.subject,
    "",
    ...c.paragraphs.flatMap((p) => [p, ""]),
    ...(c.bullets ? [...c.bullets.map((b) => `- ${b}`), ""] : []),
    `${c.cta.label}: ${c.cta.url}`,
    ...(c.secondary ? ["", ...c.secondary.map((l) => `${l.label}: ${l.url}`)] : []),
    "",
    "--",
    `You're receiving this because ${email} was entered on sonoprep.com to get the free SPI diagnostic.`,
    `Unsubscribe: ${unsub}`,
    `SonoPrep · ${postalAddress}`,
    "SonoPrep is an independent study resource, not affiliated with or endorsed by ARDMS or Inteleos. ARDMS® is a registered trademark of Inteleos.",
  ].join("\n");

  return { subject: c.subject, html, text };
}

const DEFAULT_FROM = "SonoPrep <noreply@mail.sonoprep.com>";

/** Sends one lead email. Throws if the postal address isn't configured. */
export async function sendLeadEmail(
  step: LeadEmailStep,
  email: string,
): Promise<void> {
  const postalAddress = process.env.MAIL_POSTAL_ADDRESS?.trim();

  if (!postalAddress) {
    throw new Error(
      "MAIL_POSTAL_ADDRESS is not set; refusing to send marketing email " +
        "without a physical address (CAN-SPAM).",
    );
  }

  const { subject, html, text } = renderLeadEmail(step, email, postalAddress);

  await getResendClient().emails.send({
    from: process.env.EMAIL_FROM?.trim() || DEFAULT_FROM,
    to: email,
    subject,
    html,
    text,
    ...(process.env.EMAIL_REPLY_TO?.trim()
      ? { replyTo: process.env.EMAIL_REPLY_TO.trim() }
      : {}),
    headers: {
      "List-Unsubscribe": `<${unsubscribeApiUrl(email)}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}
