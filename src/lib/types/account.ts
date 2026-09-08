export interface AccountPurchaseInfo {
  /**
   * ProductType enum value, such as:
   * FLASHCARDS, EXAM_SIMULATOR, PHYSICS_PEARLS,
   * STUDY_NOTES, or PREMIUM_BUNDLE.
   */
  product: string;

  /**
   * A completed purchase is returned by the account API.
   */
  status: "COMPLETED";

  amountPaidCents: number;

  accessGrantedAt: string;

  accessExpiresAt: string;

  createdAt: string;
}