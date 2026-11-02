import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebaseAdmin";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // =====================================================
    // 1. GET DATA FROM PUBLIC MEDICAL SUPPORT PAGE
    // =====================================================

    const {
      campaignId,
      donationAmount,
      email,
    } = await req.json();

    // =====================================================
    // 2. VALIDATE CAMPAIGN ID
    // =====================================================

    if (!campaignId) {
      return NextResponse.json(
        {
          error: "Medical support campaign is required.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 3. VALIDATE DONATION AMOUNT
    // =====================================================

    const amount = Number(donationAmount);

    if (!Number.isFinite(amount)) {
      return NextResponse.json(
        {
          error: "Please enter a valid donation amount.",
        },
        { status: 400 }
      );
    }

    if (amount < 1) {
      return NextResponse.json(
        {
          error: "Minimum donation amount is CA$5.",
        },
        { status: 400 }
      );
    }

    // Optional safety limit.
    // You can change this later if needed.
    if (amount > 1000000) {
      return NextResponse.json(
        {
          error:
            "The donation amount is too large.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 4. GET MEDICAL SUPPORT CAMPAIGN
    // =====================================================

    const campaignRef = adminDb
      .collection("medicalSupport")
      .doc(campaignId);

    const campaignSnap =
      await campaignRef.get();

    if (!campaignSnap.exists) {
      return NextResponse.json(
        {
          error:
            "Medical support campaign not found.",
        },
        { status: 404 }
      );
    }

    const campaign =
      campaignSnap.data();

    if (!campaign) {
      return NextResponse.json(
        {
          error:
            "Medical support campaign information is missing.",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // 5. CHECK CAMPAIGN STATUS
    // =====================================================
    //
    // If your campaign has a status field, only
    // "published" campaigns can receive donations.
    //
    // If status doesn't exist yet, this check will
    // not block the campaign.
    // =====================================================

    if (
      campaign.status &&
      campaign.status !== "published"
    ) {
      return NextResponse.json(
        {
          error:
            "This medical support campaign is not currently available.",
        },
        { status: 403 }
      );
    }

    // =====================================================
    // 6. GET CREATOR ID
    // =====================================================

    const creatorId =
      campaign.userId ||
      campaign.creatorId ||
      "";

    if (!creatorId) {
      return NextResponse.json(
        {
          error:
            "Creator information is missing from this campaign.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 7. GET CREATOR INFORMATION
    // =====================================================

    const creatorRef = adminDb
      .collection("users")
      .doc(creatorId);

    const creatorSnap =
      await creatorRef.get();

    const creatorData =
      creatorSnap.exists
        ? creatorSnap.data()
        : null;

    // =====================================================
    // 8. CHECK CREATOR STRIPE CONNECTION
    // =====================================================

    const isStripeConnected =
      creatorData?.stripeConnected === true;

    const stripeAccountId =
      creatorData?.stripeAccountId || "";

    // =====================================================
    // 9. CONVERT CAD TO CENTS
    // =====================================================

    const stripeAmount =
      Math.round(amount * 100);

    if (stripeAmount < 100) {
      return NextResponse.json(
        {
          error:
            "Donation amount must be at least CA$1.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 10. GET WEBSITE URL
    // =====================================================

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl) {
      return NextResponse.json(
        {
          error:
            "NEXT_PUBLIC_BASE_URL is not configured.",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // 11. CAMPAIGN TITLE
    // =====================================================

    const campaignTitle =
      String(
        campaign.title ||
          "Medical Support"
      );

    // =====================================================
    // 12. CREATE STRIPE CHECKOUT SESSION
    // =====================================================

    const sessionConfig: Stripe.Checkout.SessionCreateParams =
      {
        // If email is provided, Stripe will use it.
        // Otherwise Stripe Checkout can collect it.
        ...(email
          ? {
              customer_email:
                String(email),
            }
          : {}),

        payment_method_types: [
          "card",
        ],

        mode: "payment",

        line_items: [
          {
            quantity: 1,

            price_data: {
              currency: "cad",

              unit_amount:
                stripeAmount,

              product_data: {
                name:
                  `Medical Support: ${campaignTitle}`,

                description:
                  "Medical support donation through CreatorStore.",
              },
            },
          },
        ],

        // =================================================
        // AFTER SUCCESSFUL PAYMENT
        // =================================================

        success_url:
          `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,

        // =================================================
        // IF CUSTOMER CANCELS
        // =================================================

        cancel_url:
          `${baseUrl}/medical-support/${campaignId}`,

        // =================================================
        // IMPORTANT METADATA
        // =================================================
        //
        // The medical webhook will use these values
        // to identify the campaign and creator.
        // =================================================

        metadata: {
          paymentType:
            "medical_support",

          campaignId:
            String(campaignId),

          creatorId:
            String(creatorId),

          donorEmail:
            email
              ? String(email)
              : "",

          donationAmount:
            amount.toFixed(2),

          payoutType:
            isStripeConnected &&
            stripeAccountId
              ? "direct_stripe"
              : "manual_platform_payout",
        },
      };

    // =====================================================
    // 13. DIRECT STRIPE TRANSFER
    // =====================================================
    //
    // If the creator has connected Stripe,
    // the payment is transferred directly to
    // the creator's Stripe connected account.
    //
    // If they are not connected, this section
    // is skipped and the payment remains on
    // the platform Stripe account.
    // =====================================================

    if (
      isStripeConnected &&
      stripeAccountId
    ) {
      sessionConfig.payment_intent_data = {
        transfer_data: {
          destination:
            stripeAccountId,
        },
      };
    }

    // =====================================================
    // 14. CREATE CHECKOUT SESSION
    // =====================================================

    const session =
      await stripe.checkout.sessions.create(
        sessionConfig
      );

    // =====================================================
    // 15. RETURN STRIPE CHECKOUT URL
    // =====================================================

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error: any) {
    console.error(
      "❌ MEDICAL STRIPE CHECKOUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to create medical donation checkout.",
      },
      { status: 500 }
    );
  }
}