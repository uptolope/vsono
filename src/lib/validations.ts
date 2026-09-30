import { z } from "zod";

// Every route that accepts a request body MUST parse it through one of
// these schemas before touching the database or Stripe. Do not add a
// route that reads req.json() directly without a .parse()/.safeParse()
// call against a schema defined here.

export const signupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
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

export const checkoutSchema = z.object({
  product: z.enum([
    "FLASHCARDS",
    "EXAM_SIMULATOR",
    "PHYSICS_PEARLS",
    "STUDY_NOTES",
    "PREMIUM_BUNDLE",
  ]),
  // GA4 client id from the visitor's `_ga` cookie (e.g. "123456.7890123").
  // Only used to attribute the purchase to the right session in analytics.
  gaClientId: z
    .string()
    .regex(/^\d{1,12}\.\d{1,12}$/)
    .optional(),
});

export const accountDeleteSchema = z.object({
  confirmEmail: z.string().trim().toLowerCase().email(),
});

export const examSubmitSchema = z.object({
  answers: z
    .array(
      z.object({
        id: z.number().int().positive(),
        selected: z.number().int().min(0),
        timeSpentMs: z.number().int().nonnegative().default(0),
      })
    )
    .min(1)
    .max(200),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1).max(200),
  email: z.string().trim().toLowerCase().email().max(255),
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