import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
);

export async function POST(
  req: NextRequest
) {
  try {
    const {
      productId,
      email,
      type = "digital",
      scheduledDate,
      scheduledTime,
    } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Missing product" }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const isCoaching = type === "coaching";
    const collectionName = isCoaching ? "coachingCalls" : "products";

    if (isCoaching && (!scheduledDate || !scheduledTime)) {
      return NextResponse.json(
        { error: "Please choose a coaching date and time." },
        { status: 400 }
      );
    }

    const productRef = adminDb.collection(collectionName).doc(productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return NextResponse.json(
        { error: isCoaching ? "Coaching call not found" : "Product not found" },
        { status: 404 }
      );
    }

    const product = productSnap.data();

    if (!product || product.isActive === false) {
      return NextResponse.json(
        { error: "This product is currently unavailable." },
        { status: 403 }
      );
    }

    const creatorId = product.userId || product.creatorId || "";

    if (!creatorId) {
      return NextResponse.json(
        { error: "Creator ID is missing." },
        { status: 400 }
      );
    }

    // ==========================================
    // CHECK CREATOR STRIPE CONNECTION STATUS
    // ==========================================
    const creatorDoc = await adminDb.collection("users").doc(creatorId).get();
    const creatorData = creatorDoc.exists ? creatorDoc.data() : null;

    const isStripeConnected = creatorData?.stripeConnected === true;
    const stripeAccountId = creatorData?.stripeAccountId;

    let bookingId = "";

    if (isCoaching) {
      const safeDate = String(scheduledDate).replace(
        /[^a-zA-Z0-9-]/g,
        "-"
      );

      const safeTime = String(scheduledTime).replace(
        /[^a-zA-Z0-9-]/g,
        "-"
      );

      const slotId = `${productId}_${safeDate}_${safeTime}`;
      bookingId = slotId;

      const slotRef = adminDb
        .collection("coachingSlots")
        .doc(slotId);

      try {
        await adminDb.runTransaction(
          async (transaction) => {
            const slotSnap = await transaction.get(slotRef);

            // ==========================================
            // CHECK EXISTING RESERVATION
            // ==========================================
            if (slotSnap.exists) {
              const existingSlot = slotSnap.data();

              const existingExpiresAt =
                existingSlot?.expiresAt
                  ?.toDate?.()
                  ?.getTime?.() || 0;

              const isPaid =
                existingSlot?.paymentStatus === "paid" ||
                existingSlot?.status === "confirmed";

              const isPending =
                existingSlot?.status === "pending" &&
                existingSlot?.paymentStatus === "pending";

              const isExpiredByTime =
                isPending &&
                existingExpiresAt > 0 &&
                Date.now() >= existingExpiresAt;

              const isExplicitlyExpiredOrRefunded =
                existingSlot?.status === "expired" ||
                existingSlot?.paymentStatus === "refunded";

              // 1. ALREADY PAID / CONFIRMED → CANNOT BOOK
              if (isPaid) {
                throw new Error("SLOT_ALREADY_BOOKED");
              }

              // 2. PENDING AND STILL WITHIN THE 7-MIN WINDOW → CANNOT BOOK
              if (isPending && !isExpiredByTime) {
                throw new Error("SLOT_ALREADY_BOOKED");
              }

              // If it's expired by time or explicitly marked expired/refunded, 
              // the transaction will safely fall through and overwrite it with a fresh 7-min reservation below.
            }

            // ==========================================
            // CREATE FRESH 7-MINUTE RESERVATION
            // ==========================================
            const reservationExpiresAt =
              admin.firestore.Timestamp.fromDate(
                new Date(
                  Date.now() + 7 * 60 * 1000
                )
              );

            transaction.set(slotRef, {
              coachingId: productId,
              creatorId: product.userId || product.creatorId || "",
              customerEmail: email,
              scheduledDate,
              scheduledTime,
              duration: Number(product.duration || 60),
              meetingLink: product.meetingLink || "",
              status: "pending",
              paymentStatus: "pending",
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              expiresAt: reservationExpiresAt,
            });
          }
        );

      } catch (error: any) {
        if (error?.message === "SLOT_ALREADY_BOOKED") {
          return NextResponse.json(
            {
              error: "Sorry, this time slot has already been booked. please try again later or check another Availability Schedule days and time ",
            },
            {
              status: 409,
            }
          );
        }

        throw error;
      }
    }

    const originalPrice = Number(product.price || 0);
    const discountPrice = Number(product.discountPrice || 0);
    const actualPrice =
      discountPrice > 0 && discountPrice < originalPrice
        ? discountPrice
        : originalPrice;
    const stripeAmount = Math.round(actualPrice * 100);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_BASE_URL is not configured." },
        { status: 500 }
      );
    }

    // ==========================================
    // BUILD STRIPE SESSION CONFIG
    // ==========================================
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer_email: email,
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "cad",
            unit_amount: stripeAmount,
            product_data: {
              name: isCoaching ? `Coaching Call: ${product.title}` : product.title,
              description: product.description || "",
              ...(product.thumbnail && product.thumbnail.startsWith("http")
                ? { images: [product.thumbnail] }
                : {}),
            },
          },
        },
      ],
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment-cancel`,
      metadata: {
        productId,
        productType: isCoaching ? "coaching" : "digital",
        creatorId,
        buyerEmail: email,
        bookingId: isCoaching ? bookingId : "",
        payoutType: isStripeConnected ? "direct_stripe" : "manual_platform_payout",
      },
    };

    if (isStripeConnected && stripeAccountId) {
      sessionConfig.payment_intent_data = {
        transfer_data: {
          destination: stripeAccountId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("❌ Stripe Error:", error);
    return NextResponse.json({ error: error?.message || "Stripe Error" }, { status: 500 });
  }
}