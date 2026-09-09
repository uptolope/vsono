warning: in the working copy of 'src/app/api/webhooks/stripe/route.ts', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/src/app/api/webhooks/stripe/route.ts b/src/app/api/webhooks/stripe/route.ts[m
[1mindex dc80af0..14e45e8 100644[m
[1m--- a/src/app/api/webhooks/stripe/route.ts[m
[1m+++ b/src/app/api/webhooks/stripe/route.ts[m
[36m@@ -420,49 +420,47 @@[m [masync function handleDispute([m
     throw new Error(`Dispute ${dispute.id} has no charge`);[m
   }[m
 [m
[31m-  const charge = await stripe.charges.retrieve(chargeId);[m
[31m-  const paymentIntentId = extractPaymentIntentId(charge.payment_intent);[m
[32m+[m[32mconst charge = await stripe.charges.retrieve(chargeId);[m
[32m+[m[32mconst paymentIntentId = extractPaymentIntentId(charge.payment_intent);[m
 [m
[31m-  if (!paymentIntentId) {[m
[31m-    throw new Error([m
[31m-      `Disputed charge ${chargeId} has no payment intent`[m
[31m-    );[m
[31m-  }[m
[32m+[m[32mif (!paymentIntentId) {[m
[32m+[m[32m  throw new Error(`Disputed charge ${chargeId} has no payment intent`);[m
[32m+[m[32m}[m
 [m
[31m-  const purchase = await prisma.purchase.findUnique({[m
[31m-    where: {[m
[31m-      stripePaymentIntentId: paymentIntentId,[m
[31m-    },[m
[31m-  });[m
[32m+[m[32mconst purchase = await prisma.purchase.findUnique({[m
[32m+[m[32m  where: {[m
[32m+[m[32m    stripePaymentIntentId: paymentIntentId,[m
[32m+[m[32m  },[m
[32m+[m[32m});[m
 [m
[31m-  if (!purchase) {[m
[31m-    throw new Error([m
[31m-      `Purchase not found for disputed payment intent ` +[m
[31m-        `${paymentIntentId}`[m
[31m-    );[m
[31m-  }[m
[32m+[m[32mif (!purchase) {[m
[32m+[m[32m  throw new Error([m
[32m+[m[32m    `Purchase not found for disputed payment intent ${paymentIntentId}`[m
[32m+[m[32m  );[m
[32m+[m[32m}[m
 [m
[31m-  if (purchase.status === "DISPUTED") {[m
[31m-    console.info([m
[31m-      `[webhook:${eventI}] Dispute already processed for purchase ` +[m
[31m-        ${purchase.id}`[m
[31m-    );[m
[32m+[m[32mif (purchase.status === "DISPUTED") {[m
[32m+[m[32m  console.info([m
[32m+[m[32m    "[webhook:" +[m
[32m+[m[32m      eventId +[m
[32m+[m[32m      "] Dispute already processed for purchase " +[m
[32m+[m[32m      purchase.id[m
[32m+[m[32m  );[m
 [m
[31m-    return;[m
[31m-  }[m
[32m+[m[32m  return;[m
[32m+[m[32m}[m
 [m
[31m-  await prisma.purchase.update({[m
[31m-    where: {[m
[31m-      id: purchase.id,[m
[31m-    },[m
[31m-    data: {[m
[31m-      status: "DISPUTED",[m
[31m-      accessExpiresAt: new Date(),[m
[31m-    },[m
[31m-  });[m
[32m+[m[32mawait prisma.purchase.update({[m
[32m+[m[32m  where: {[m
[32m+[m[32m    id: purchase.id,[m
[32m+[m[32m  },[m
[32m+[m[32m  data: {[m
[32m+[m[32m    status: "DISPUTED",[m
[32m+[m[32m    accessExpiresAt: new Date(),[m
[32m+[m[32m  },[m
[32m+[m[32m});[m
 [m
[31m-  console.info([m
[31m-    `[webhook:${eventId}] Access revoked for disputed purchase ` +[m
[31m-      `${purchase.id}`[m
[31m-  );[m
[32m+[m[32mconsole.info([m
[32m+[m[32m  `[webhook:${eventId}] Access revoked for disputed purchase ${purchase.id}`[m
[32m+[m[32m);[m
 }[m
\ No newline at end of file[m
