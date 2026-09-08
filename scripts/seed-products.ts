import "dotenv/config";
import Stripe from "stripe";
import { PrismaClient, ProductType } from "@prisma/client";

const prisma = new PrismaClient();

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error("STRIPE_SECRET_KEY is missing from .env");
}

const stripe = new Stripe(secretKey);

const products = [
  {
    type: ProductType.FLASHCARDS,
    name: "SonoPrep Flashcards",
    description: "Access to the SonoPrep flashcard library.",
    envName: "STRIPE_PRICE_FLASHCARDS",
    id: "flashcards",
  },
  {
    type: ProductType.PHYSICS_PEARLS,
    name: "Physics Pearls",
    description: "Access to SonoPrep Physics Pearls.",
    envName: "STRIPE_PRICE_PHYSICS_PEARLS",
    id: "physics-pearls",
  },
  {
    type: ProductType.EXAM_SIMULATOR,
    name: "Exam Simulator",
    description: "Access to the SonoPrep exam simulator.",
    envName: "STRIPE_PRICE_EXAM_SIMULATOR",
    id: "exam-simulator",
  },
  {
    type: ProductType.STUDY_NOTES,
    name: "Study Notes",
    description: "Access to SonoPrep study notes.",
    envName: "STRIPE_PRICE_STUDY_NOTES",
    id: "study-notes",
  },
  {
    type: ProductType.PREMIUM_BUNDLE,
    name: "Premium Bundle",
    description: "Access to all SonoPrep premium resources.",
    envName: "STRIPE_PRICE_PREMIUM_BUNDLE",
    id: "premium-bundle",
  },
];

async function main() {
  for (const item of products) {
    const priceId = process.env[item.envName];

    if (!priceId) {
      throw new Error(item.envName + " is missing from .env");
    }

    if (!priceId.startsWith("price_")) {
      throw new Error(item.envName + " is not a valid Stripe Price ID");
    }

    console.log("Checking " + item.type + "...");

    const stripePrice = await stripe.prices.retrieve(priceId);

    if (!stripePrice.active) {
      throw new Error(item.envName + " points to an inactive Stripe price");
    }

    if (stripePrice.unit_amount === null) {
      throw new Error(item.envName + " has no unit amount");
    }

    const savedProduct = await prisma.product.upsert({
      where: {
        type: item.type,
      },
      update: {
        name: item.name,
        description: item.description,
        priceInCents: stripePrice.unit_amount,
        stripePriceId: priceId,
        active: true,
      },
      create: {
        id: item.id,
        type: item.type,
        name: item.name,
        description: item.description,
        priceInCents: stripePrice.unit_amount,
        stripePriceId: priceId,
        active: true,
      },
    });

    console.log(
      "Saved " +
        savedProduct.type +
        " - " +
        savedProduct.priceInCents +
        " cents - " +
        savedProduct.stripePriceId
    );
  }

  console.log("All five products were seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });