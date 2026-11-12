/**
 * Structural fingerprint of the production database (Supabase project
 * euqrzxxldlsbhuyjuleo), captured read-only on 2026-11-12 BEFORE the
 * 20261112* migrations were applied.
 *
 * One md5 per table over its columns (name, type, nullability, default),
 * indexes and foreign-key/check/unique constraints — see FINGERPRINT_SQL in
 * tests/helpers/db.ts, which is the exact query that was run on production.
 *
 * The migration tests use it to prove that a database built from
 * prisma/migrations ends up with the same structure production has. If you
 * change production's schema through a new migration, the tests that compare
 * against this snapshot at the "reconcile" point still hold: they stop
 * applying migrations there.
 *
 * Not included on purpose: "Review" (missing in production at capture time —
 * that was the bug) and tables that do not belong to this app.
 */
export const PRODUCTION_FINGERPRINT_2026_11_12: Record<string, string> = {
  Account: "61c528f38a01cf634e5adb8e6c75b293",
  AuditLog: "1b241e6b8afa5b6080a40fdc88b794a9",
  DemoLead: "b67352b94e8bf839b464373e38c0a8dc",
  ExamAnswer: "d757c7188dbdefb017a6ee107006f19d",
  ExamSession: "025c2bdd17b904e7792072d41d8aa012",
  Product: "19acc7746f01984c4440e0cd18cfb824",
  Purchase: "ebc02f18db8055b9b5f4e4a450e28222",
  Session: "6e521d0247606434f9ac34df0c1eec67",
  StripeWebhookEvent: "9e997bd53ae2daeff54f77890c1c0690",
  User: "226c0b0b513dfbc7b183cd210904917e",
  VerificationToken: "18a2568c0c6a65968e0e37af5f781506",
  flashcard_progress: "a85de568fac297228999d9ea0c583179",
  flashcard_reviews: "8051d5828357adae0a7ea6c55547d8ff",
  rate_limit_buckets: "4b024c9d9f7d6e38863c3c4fbabd2a97",
  study_note_progress: "62ed068b7698d240d1087a88715a2896",
  subscribers: "0100a7677c59ec1283bf03cbed2f17ac",
};
