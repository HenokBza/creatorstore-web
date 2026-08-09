import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { adminDb } from "@/lib/firebaseAdmin";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
);


// =====================================================
// ACTIVATE CREATOR PRODUCTS
// =====================================================

async function activateCreatorProducts(
  creatorId: string
) {

  const products = await adminDb
    .collection("products")
    .where("userId", "==", creatorId)
    .get();

  if (products.empty) {
    console.log(
      "No products found for creator:",
      creatorId
    );

    return;
  }

  const batch = adminDb.batch();

  products.forEach((product) => {

    batch.update(product.ref, {
      isActive: true,
    });

  });

  await batch.commit();

  console.log(
    "✅ Creator products activated:",
    creatorId
  );
}


// =====================================================
// DISABLE CREATOR PRODUCTS
// =====================================================

async function deactivateCreatorProducts(
  creatorId: string
) {

  const products = await adminDb
    .collection("products")
    .where("userId", "==", creatorId)
    .get();

  if (products.empty) {
    console.log(
      "No products found for creator:",
      creatorId
    );

    return;
  }

  const batch = adminDb.batch();

  products.forEach((product) => {

    batch.update(product.ref, {
      isActive: false,
    });

  });

  await batch.commit();

  console.log(
    "✅ Creator products disabled:",
    creatorId
  );
}


// =====================================================
// WEBHOOK
// =====================================================

export async function POST(
  req: NextRequest
) {

  const body = await req.text();

  const signature =
    req.headers.get("stripe-signature");

  if (!signature) {

    console.error(
      "❌ Missing Stripe signature"
    );

    return NextResponse.json(
      {
        error: "Missing Stripe signature",
      },
      {
        status: 400,
      }
    );

  }


  // ===================================================
  // VERIFY STRIPE SIGNATURE
  // ===================================================

  let event: Stripe.Event;

  try {

    event =
      stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

  } catch (error: any) {

    console.error(
      "❌ Stripe webhook signature error:",
      error.message
    );

    return NextResponse.json(
      {
        error: "Invalid webhook signature",
      },
      {
        status: 400,
      }
    );

  }


  console.log(
    "========================================"
  );

  console.log(
    "✅ STRIPE WEBHOOK RECEIVED"
  );

  console.log(
    "Event:",
    event.type
  );

  console.log(
    "Event ID:",
    event.id
  );

  console.log(
    "========================================"
  );


  try {

    // =================================================
    // CHECKOUT COMPLETED
    // =================================================

    switch (event.type) {

      case "checkout.session.completed": {

        const session =
          event.data.object as Stripe.Checkout.Session;


        console.log(
          "✅ checkout.session.completed"
        );


        console.log(
          "Mode:",
          session.mode
        );


        console.log(
          "Metadata:",
          session.metadata
        );


        // =============================================
        // CREATOR SUBSCRIPTION
        // =============================================

        if (
          session.mode ===
          "subscription"
        ) {

          const creatorId =
            session.metadata?.creatorId;


          if (!creatorId) {

            console.error(
              "❌ Subscription missing creatorId"
            );

            break;

          }


          console.log(
            "Creator ID:",
            creatorId
          );


          const customerId =
            typeof session.customer ===
            "string"
              ? session.customer
              : null;


          const subscriptionId =
            typeof session.subscription ===
            "string"
              ? session.subscription
              : null;


          // =========================================
          // UPDATE CREATOR
          // =========================================

          await adminDb
            .collection("users")
            .doc(creatorId)
            .update({

              subscriptionStatus:
                "active",

              subscriptionPlan:
                "Creator Pro",

              stripeCustomerId:
                customerId,

              stripeSubscriptionId:
                subscriptionId,

              subscriptionStart:
                new Date(),

              cancelAtPeriodEnd:
                false,

            });


          console.log(
            "✅ Creator subscription activated:",
            creatorId
          );


          // =========================================
          // ACTIVATE PRODUCTS
          // =========================================

          await activateCreatorProducts(
            creatorId
          );


          break;
        }


        // =============================================
        // PRODUCT PURCHASE
        // =============================================

        const productId =
          session.metadata?.productId;


        const creatorId =
          session.metadata?.creatorId;


        const customerEmail =
          session.customer_email ||
          session.metadata?.buyerEmail ||
          "";
console.log("========== STRIPE WEBHOOK ==========");
  console.log("EVENT:", event.type);
  console.log("MODE:", session.mode);
  console.log("METADATA:", session.metadata);
  console.log("CREATOR ID:", creatorId);
  console.log("PRODUCT ID:", productId);
  console.log("CUSTOMER EMAIL:", customerEmail);
  console.log("SESSION ID:", session.id);
  console.log("====================================");

        if (!productId) {

          console.log(
            "No productId. Not a product purchase."
          );

          break;

        }


        // =============================================
        // GET PRODUCT
        // =============================================

        const productRef =
          adminDb
            .collection("products")
            .doc(productId);


        const productDoc =
          await productRef.get();


        if (!productDoc.exists) {

          console.error(
            "❌ Product not found:",
            productId
          );

          break;

        }


       const product = productDoc.data()!;

// =====================================================
// USE STRIPE AS THE SOURCE OF TRUTH
// =====================================================

const stripePaidAmount =
  Number(session.amount_total || 0) / 100;

if (stripePaidAmount <= 0) {
  console.error(
    "❌ Stripe paid amount is zero or invalid:",
    session.amount_total
  );

  break;
}

const amount = stripePaidAmount;

console.log("========== PAYMENT AMOUNT ==========");
console.log("Product ID:", productId);
console.log("Original price:", product.price);
console.log("Discount price:", product.discountPrice);
console.log(
  "Stripe amount_total:",
  session.amount_total
);
console.log(
  "Stripe actual paid amount:",
  stripePaidAmount
);
console.log(
  "FINAL AMOUNT SAVED:",
  amount
);
console.log("====================================");

        console.log(
          "Product amount:",
          amount
        );


        // =============================================
        // CREATE ORDER
        // =============================================

        await adminDb
          .collection("orders")
          .add({

            productId,

            creatorId:

              creatorId ||
              product.userId ||
              "",

            customerEmail,

            amount,

            stripeSessionId:
              session.id,

            createdAt:
              new Date(),

          });


        console.log(
          "✅ Order created"
        );


        // =============================================
        // UPDATE PRODUCT
        // =============================================

        await productRef.update({

          customers:
            Number(
              product.customers || 0
            ) + 1,

          revenue:
            Number(
              product.revenue || 0
            ) + amount,

        });


        console.log(
          "✅ Product revenue updated"
        );


        // =============================================
        // UPDATE CREATOR EARNINGS
        // =============================================

        const actualCreatorId =
          creatorId ||
          product.userId;


        if (!actualCreatorId) {

          console.error(
            "❌ Creator ID missing"
          );

          break;

        }


        const userRef =
          adminDb
            .collection("users")
            .doc(
              actualCreatorId
            );


        const userDoc =
          await userRef.get();


        if (!userDoc.exists) {

          console.error(
            "❌ Creator user document not found:",
            actualCreatorId
          );

          break;

        }


        const userData =
          userDoc.data()!;


        await userRef.update({

          totalRevenue:
            Number(
              userData.totalRevenue || 0
            ) + amount,

          availableBalance:
            Number(
              userData.availableBalance || 0
            ) + amount,

          totalSales:
            Number(
              userData.totalSales || 0
            ) + 1,

        });


        console.log(
          "✅ Creator earnings updated"
        );


        break;
      }


      // =================================================
      // SUBSCRIPTION UPDATED
      // =================================================

      case "customer.subscription.updated": {

        const subscription =
          event.data.object as Stripe.Subscription;


        const customerId =
          subscription.customer as string;


        console.log(
          "Subscription updated:",
          customerId
        );


        const users =
          await adminDb
            .collection("users")
            .where(
              "stripeCustomerId",
              "==",
              customerId
            )
            .get();


        if (users.empty) {

          console.error(
            "❌ No creator found for Stripe customer:",
            customerId
          );

          break;

        }


        const userRef =
          users.docs[0].ref;


        const creatorId =
          userRef.id;


        const isActive =
          subscription.status ===
            "active" ||
          subscription.status ===
            "trialing";


        await userRef.update({

          subscriptionStatus:
            isActive
              ? "active"
              : "inactive",

          subscriptionPlan:
            isActive
              ? "Creator Pro"
              : "",

          cancelAtPeriodEnd:
            subscription.cancel_at_period_end,

          subscriptionEnd:
            (subscription as any)
              .current_period_end
              ? new Date(
                  (
                    subscription as any
                  ).current_period_end *
                  1000
                )
              : null,

        });


        if (isActive) {

          await activateCreatorProducts(
            creatorId
          );

        }


        console.log(
          "✅ Subscription status updated"
        );


        break;
      }


      // =================================================
      // SUBSCRIPTION DELETED
      // =================================================

      case "customer.subscription.deleted": {

        const subscription =
          event.data.object as Stripe.Subscription;


        const customerId =
          subscription.customer as string;


        console.log(
          "Subscription deleted:",
          customerId
        );


        const users =
          await adminDb
            .collection("users")
            .where(
              "stripeCustomerId",
              "==",
              customerId
            )
            .get();


        if (users.empty) {

          console.error(
            "❌ Creator not found:",
            customerId
          );

          break;

        }


        const userRef =
          users.docs[0].ref;


        const creatorId =
          userRef.id;


        await userRef.update({

          subscriptionStatus:
            "inactive",

          subscriptionPlan:
            "",

          cancelAtPeriodEnd:
            false,

          subscriptionEnd:
            null,

        });


        await deactivateCreatorProducts(
          creatorId
        );


        console.log(
          "✅ Subscription expired"
        );


        break;
      }


      default:

        console.log(
          "Unhandled Stripe event:",
          event.type
        );

    }


    return NextResponse.json({

      received: true,

    });


  } catch (error: any) {

    console.error(
      "❌ WEBHOOK HANDLER ERROR:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Webhook handler failed",
      },
      {
        status: 500,
      }
    );

  }

}