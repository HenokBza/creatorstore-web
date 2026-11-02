import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  // =====================================================
  // 1. GET RAW STRIPE REQUEST BODY
  // =====================================================

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("Missing Stripe signature");

    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  // =====================================================
  // 2. VERIFY STRIPE WEBHOOK SIGNATURE
  // =====================================================

  const webhookSecret = process.env.MEDICAL_STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("MEDICAL_STRIPE_WEBHOOK_SECRET is not configured");

    return NextResponse.json(
      { error: "Webhook configuration error" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown signature error";

    console.error("Medical Stripe webhook signature error:", message);

    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  console.log(
    `MEDICAL STRIPE WEBHOOK RECEIVED: ${event.type} [${event.id}]`
  );

  // =====================================================
  // 3. PROCESS STRIPE EVENT
  // =====================================================

  try {
    switch (event.type) {
      // =================================================
      // CHECKOUT SESSION COMPLETED
      // =================================================

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};

        // Only process Medical Support payments.
        if (metadata.paymentType !== "medical_support") {
          console.log("Not a Medical Support payment. Ignoring.");
          break;
        }

        // -------------------------------------------------
        // Validate campaign ID
        // -------------------------------------------------

        const campaignId = metadata.campaignId || "";

        if (!campaignId) {
          console.error(
            "Medical payment is missing campaignId:",
            session.id
          );

          return NextResponse.json(
            { error: "Missing campaignId in payment metadata" },
            { status: 500 }
          );
        }

        // -------------------------------------------------
        // Confirm payment is complete
        // -------------------------------------------------

        if (session.payment_status !== "paid") {
          console.log(
            "Medical Checkout Session is not paid yet:",
            session.id,
            session.payment_status
          );
          break;
        }

        // -------------------------------------------------
        // Get the actual amount paid from Stripe
        // -------------------------------------------------

        const amountInCents = session.amount_total;

        if (
          amountInCents === null ||
          !Number.isSafeInteger(amountInCents) ||
          amountInCents <= 0
        ) {
          console.error(
            "Invalid Medical Support payment amount:",
            session.id,
            amountInCents
          );

          return NextResponse.json(
            { error: "Invalid payment amount" },
            { status: 500 }
          );
        }

        const amount = amountInCents / 100;

        if (session.currency?.toLowerCase() !== "cad") {
          console.error(
            "Unexpected Medical Support payment currency:",
            session.id,
            session.currency
          );

          return NextResponse.json(
            { error: "Unexpected payment currency" },
            { status: 500 }
          );
        }

        console.log("Processing Medical Support donation:", {
          sessionId: session.id,
          campaignId,
          amount,
          currency: session.currency,
        });

        // =================================================
        // FIRESTORE REFERENCES
        // =================================================

        const campaignRef = adminDb
          .collection("medicalSupport")
          .doc(campaignId);

        const orderRef = adminDb
          .collection("orders")
          .doc(session.id);

        // =================================================
        // FIRESTORE TRANSACTION
        // =================================================

        await adminDb.runTransaction(async (transaction) => {
          // 1. Check whether this payment was already processed.
          const existingOrder = await transaction.get(orderRef);

          if (existingOrder.exists) {
            throw new Error("MEDICAL_PAYMENT_ALREADY_PROCESSED");
          }

          // 2. Retrieve the campaign.
          const campaignSnap = await transaction.get(campaignRef);

          if (!campaignSnap.exists) {
            throw new Error("MEDICAL_CAMPAIGN_NOT_FOUND");
          }

          const campaign = campaignSnap.data()!;

          // 3. Validate current campaign totals.
          const currentRaised = Number(campaign.raisedAmount ?? 0);
          const currentDonors = Number(campaign.donors ?? 0);

          if (
            !Number.isFinite(currentRaised) ||
            currentRaised < 0 ||
            !Number.isSafeInteger(currentDonors) ||
            currentDonors < 0
          ) {
            throw new Error("INVALID_MEDICAL_CAMPAIGN_TOTALS");
          }

          // 4. Record the processed payment for idempotency.
          transaction.create(orderRef, {
            campaignId,
            productType: "medical_support",
            paymentType: "medical_support",
            customerEmail:
              session.customer_details?.email ||
              session.customer_email ||
              "",
            amount,
            currency: "cad",
            stripeSessionId: session.id,
            stripePaymentStatus: "paid",
            createdAt: new Date(),
          });

          // 5. Update campaign totals (`raisedAmount` and `donors`).
          transaction.update(campaignRef, {
            raisedAmount: currentRaised + amount,
            donors: currentDonors + 1,
          });
        });

        console.log("Medical donation successfully processed:", {
          sessionId: session.id,
          campaignId,
          amount,
        });

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.paymentType !== "medical_support") {
          break;
        }

        console.log("Medical donation Checkout Session expired:", session.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed. No Medical Support totals updated:", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled Medical Support webhook event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown webhook error";

    if (message === "MEDICAL_PAYMENT_ALREADY_PROCESSED") {
      console.log("Medical payment already processed. Skipping:", event.id);

      return NextResponse.json({
        received: true,
        alreadyProcessed: true,
      });
    }

    if (message === "MEDICAL_CAMPAIGN_NOT_FOUND") {
      console.error("Medical campaign not found.");

      return NextResponse.json(
        { error: "Medical campaign not found" },
        { status: 500 }
      );
    }

    console.error("MEDICAL STRIPE WEBHOOK ERROR:", error);

    return NextResponse.json(
      { error: "Medical webhook handler failed" },
      { status: 500 }
    );
  }
}