import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
);
async function activateCreatorProducts(creatorId: string) {

  const products = await adminDb
    .collection("products")
    .where("userId", "==", creatorId)
    .get();

  const batch = adminDb.batch();

  products.forEach((product) => {

    batch.update(product.ref, {
      isActive: true,
    });

  });

  await batch.commit();

}
export async function POST(req: NextRequest) {

  const body = await req.text();

  const signature =
    req.headers.get("stripe-signature");

  if (!signature) {

    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );

  }

  let event: Stripe.Event;

  try {

    event =
      stripe.webhooks.constructEvent(

        body,

        signature,

        process.env.STRIPE_WEBHOOK_SECRET!

      );

  } catch (err: any) {

    console.log(err);

    return NextResponse.json(
      {
        error: "Invalid webhook"
      },
      {
        status: 400
      }
    );

  }

  switch (event.type) {

   case "checkout.session.completed": {

  const session =
    event.data.object as Stripe.Checkout.Session;

  const productId =
    session.metadata?.productId;

  const creatorId =
    session.metadata?.creatorId;

  const customerEmail =
    session.customer_email || "";

  // ===============================
  // SUBSCRIPTION PAYMENT
  // ===============================

  if (session.mode === "subscription") {

    if (!creatorId) break;

    await adminDb
      .collection("users")
      .doc(creatorId)
      .update({

        subscriptionStatus: "active",

        subscriptionPlan: "Creator Pro",

        stripeCustomerId: session.customer,

        stripeSubscriptionId: session.subscription,

        subscriptionStart: new Date(),

      });

    console.log("✅ Creator subscription activated");

    break;
  }

  // ===============================
  // PRODUCT PURCHASE
  // ===============================

  if (!productId) break;

  // Get product...

  const productDoc =
    await adminDb
      .collection("products")
      .doc(productId)
      .get();

  // ...everything below stays exactly the same

  if (!productDoc.exists) break;

  const product =
    productDoc.data()!;

  const amount =
    Number(product.price);

  // Save order

  await adminDb
    .collection("orders")
    .add({

      productId,

      creatorId,

      customerEmail,

      amount,

      stripeSessionId:
        session.id,

      createdAt:
        new Date(),

    });

  // Update product statistics

  await adminDb
    .collection("products")
    .doc(productId)
    .update({

      customers:
        (product.customers || 0) + 1,

      revenue:
        (product.revenue || 0) + amount,

    });
    // Update creator earnings

if (creatorId) {

  const userRef = adminDb
    .collection("users")
    .doc(creatorId);

  const userDoc = await userRef.get();

  if (userDoc.exists) {

    const userData = userDoc.data()!;

    await userRef.update({

      totalRevenue:
        Number(userData.totalRevenue || 0) + amount,

      availableBalance:
        Number(userData.availableBalance || 0) + amount,

      totalSales:
        Number(userData.totalSales || 0) + 1,
    });
  }
}
  console.log(
    "✅ Order saved from webhook"
  );

  break;
}
case "customer.subscription.updated": {

  const subscription =
    event.data.object as Stripe.Subscription;

  const customerId =
    subscription.customer as string;

  const users = await adminDb
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .get();

  if (!users.empty) {

    const userRef = users.docs[0].ref;

   await userRef.update({

  subscriptionStatus:
    subscription.status === "active"
      ? "active"
      : "inactive",

  cancelAtPeriodEnd:
    subscription.cancel_at_period_end,

  subscriptionPlan: "Creator Pro",

  subscriptionEnd: new Date(
    (subscription as any).current_period_end * 1000
  ),

});
const creatorId = userRef.id;

if (subscription.status === "active") {

  await activateCreatorProducts(
    creatorId
  );
}
  }
  break;
}
case "customer.subscription.deleted": {

  const subscription =
    event.data.object as Stripe.Subscription;

  const customerId =
    subscription.customer as string;

  const users = await adminDb
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .get();

  if (!users.empty) {

    const userDoc = users.docs[0];

    const creatorId = userDoc.id;

    // Update subscription
    await userDoc.ref.update({

      subscriptionStatus: "inactive",

      subscriptionPlan: "",

      cancelAtPeriodEnd: false,

      subscriptionEnd: null,

    });

    // Disable all creator products
    const products = await adminDb
      .collection("products")
      .where("userId", "==", creatorId)
      .get();

    const batch = adminDb.batch();

    products.forEach((product) => {

      batch.update(product.ref, {

        isActive: false,

      });

    });

    await batch.commit();

    console.log(
      "✅ Subscription expired. Products disabled."
    );
  }
  break;
}
    default:

      console.log(
        event.type
      );

  }

  return NextResponse.json({
    received: true,
  });

}