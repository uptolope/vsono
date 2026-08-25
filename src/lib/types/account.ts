// Shared client-facing shape for a single purchase, as returned by
// GET /api/account/data. Both the API route and every consumer
// (currently AccountPageClient.tsx) import this type so the property
// names can never drift apart again.
export interface AccountPurchaseInfo {
  /** ProductType enum value, e.g. "FLASHCARDS" — matches PRODUCT_LABELS keys. */
  product: string;
  status: string;
  amountPaidCents: number;
  accessGrantedAt: string;
  accessExpiresAt: string;
  createdAt: string;
}
