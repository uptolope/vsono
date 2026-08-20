import { z } from "zod";

// Every route that accepts a request body MUST parse it through one of
// these schemas before touching the database or Stripe. Do not add a
// route that reads req.json() directly without a .parse()/.safeParse()
// call against a schema defined here.

export const signupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  // Length + complexity floor only — do not weaken this without a reason.
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(200)
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(200),
});

// Only a known product key is ever accepted. The price is looked up
// server-side from PRODUCT_PRICE_MAP in src/lib/stripe.ts — the client
// can never supply a price ID or amount directly.
export const checkoutSchema = z.object({
  product: z.enum([
    "FLASHCARDS",
    "EXAM_SIMULATOR",
    "PHYSICS_PEARLS",
    "STUDY_NOTES",
    "PREMIUM_BUNDLE",
  ]),
});

export const accountDeleteSchema = z.object({
  // Require the user to re-type their email as a confirmation step,
  // separate from just being logged in, before we soft-delete.
  confirmEmail: z.string().trim().toLowerCase().email(),
});

export const examSubmitSchema = z.object({
  answers: z
    .array(z.object({ id: z.number().int().positive(), selected: z.number().int().min(0) }))
    .min(1)
    .max(200),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1).max(200),
  email: z.string().trim().toLowerCase().email().max(255),
  // Same complexity requirements as signup — user shouldn't be able
  // to downgrade their password strength via the reset flow.
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(200)
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AccountDeleteInput = z.infer<typeof accountDeleteSchema>;
export type ExamSubmitInput = z.infer<typeof examSubmitSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
