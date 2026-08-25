import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { adminDb } from "@/lib/firebaseAdmin";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
);

export async function GET(
  req: NextRequest
) {
  try {
    // ==========================================
    // GET SESSION ID
    // ==========================================

    const sessionId =
      req.nextUrl.searchParams.get(
        "session_id"
      );

    if (!sessionId) {
      return NextResponse.json(
        {
          error: "Missing session id",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // VERIFY SESSION WITH STRIPE
    // ==========================================

    const session =
      await stripe.checkout.sessions.retrieve(
        sessionId
      );

    // ==========================================
    // GET METADATA
    // ==========================================

    const productId =
      session.metadata?.productId;

    const creatorId =
      session.metadata?.creatorId;

    const productType =
      session.metadata?.productType ||
      "digital";

    const customerEmail =
      session.customer_email ||
      session.metadata?.buyerEmail ||
      "";

    if (!productId) {
      return NextResponse.json(
        {
          error: "Missing product",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // COACHING PAYMENT
    // ==========================================

    if (productType === "coaching") {

      const bookingId =
        session.metadata?.bookingId || "";

      if (!bookingId) {
        return NextResponse.json(
          {
            error:
              "Missing coaching booking ID",
          },
          { status: 400 }
        );
      }

      // ========================================
      // GET COACHING
      // ========================================

      const coachingDoc =
        await adminDb
          .collection("coachingCalls")
          .doc(productId)
          .get();

      if (!coachingDoc.exists) {
        return NextResponse.json(
          {
            error:
              "Coaching call not found",
          },
          { status: 404 }
        );
      }

      const coaching =
        coachingDoc.data()!;

      // ========================================
      // GET RESERVED SLOT
      // ========================================

      const slotDoc =
        await adminDb
          .collection("coachingSlots")
          .doc(bookingId)
          .get();

      if (!slotDoc.exists) {
        return NextResponse.json(
          {
            error:
              "Reservation not found",
          },
          { status: 404 }
        );
      }

      const slot =
        slotDoc.data()!;

      // ========================================
      // IMPORTANT:
      // FIRESTORE SLOT IS SOURCE OF TRUTH
      // ========================================

      // ----------------------------------------
      // REFUNDED / EXPIRED
      // ----------------------------------------

      if (
        slot.status === "expired" &&
        slot.paymentStatus === "refunded"
      ) {

        console.log(
          "⏰ PAYMENT WAS REFUNDED:",
          session.id
        );

        return NextResponse.json({

          productType: "coaching",

          paymentStatus:
            "refunded",

          reservationExpired:
            true,

          refundId:
            slot.refundId || null,

          sessionId:
            session.id,

          bookingId,

          title:
            coaching.title ||
            "1-on-1 Coaching Call",

          customerEmail,

        });
      }

      // ----------------------------------------
      // CONFIRMED / PAID
      // ----------------------------------------

      if (
        slot.status === "confirmed" &&
        slot.paymentStatus === "paid"
      ) {

        console.log(
          "✅ COACHING PAYMENT CONFIRMED:",
          session.id
        );

        return NextResponse.json({

          productType: "coaching",

          paymentStatus:
            "paid",

          reservationExpired:
            false,

          title:
            coaching.title,

          description:
            coaching.description || "",

          duration:
            Number(
              slot.duration ||
              coaching.duration ||
              60
            ),

          meetingLink:
            slot.meetingLink ||
            coaching.meetingLink ||
            "",

          scheduledDate:
            slot.scheduledDate || "",

          scheduledTime:
            slot.scheduledTime || "",

          bookingId,

          creatorId:
            creatorId ||
            coaching.creatorId ||
            coaching.userId ||
            "",

          customerEmail,

          sessionId:
            session.id,

        });
      }

      // ========================================
      // PAYMENT STILL BEING PROCESSED
      // ========================================

      console.log(
        "⏳ PAYMENT PROCESSING:",
        session.id
      );

      return NextResponse.json({

        productType: "coaching",

        paymentStatus:
          "processing",

        reservationExpired:
          false,

        bookingId,

        title:
          coaching.title ||
          "1-on-1 Coaching Call",

        customerEmail,

        sessionId:
          session.id,

      });
    }

    // ==========================================
    // DIGITAL PRODUCT
    // ==========================================

    const productDoc =
      await adminDb
        .collection("products")
        .doc(productId)
        .get();

    if (!productDoc.exists) {
      return NextResponse.json(
        {
          error:
            "Product not found",
        },
        { status: 404 }
      );
    }

    const product =
      productDoc.data()!;

    // Digital products can continue using
    // Stripe payment status.

    if (
      session.payment_status !==
      "paid"
    ) {

      return NextResponse.json(
        {
          error:
            "Payment not completed",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({

      productType:
        "digital",

      title:
        product.title,

      description:
        product.description || "",

      downloadUrl:
        product.fileUrl || "",

      creatorId:
        creatorId ||
        product.userId ||
        product.creatorId ||
        "",

      customerEmail,

      sessionId:
        session.id,

      paymentStatus:
        "paid",

    });

  } catch (error: any) {

    console.error(
      "❌ VERIFY PAYMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Payment verification failed",
      },
      {
        status: 500,
      }
    );
  }
}