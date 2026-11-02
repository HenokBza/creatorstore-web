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

    const paymentType =
      session.metadata?.paymentType || "";

    const productType =
      session.metadata?.productType || "";

    const isMedicalSupport =
      paymentType === "medical_support" ||
      productType === "medical_support";

    const campaignId =
      session.metadata?.campaignId || "";

    const customerEmail =
      session.customer_email ||
      session.metadata?.donorEmail ||
      session.metadata?.buyerEmail ||
      "";

    const creatorId =
      session.metadata?.creatorId || "";

   // ==========================================
    // MEDICAL SUPPORT PAYMENT
    // ==========================================

    if (isMedicalSupport) {
      
      if (!campaignId) {
        return NextResponse.json(
          {
            error: "Missing campaign ID",
          },
          { status: 400 }
        );
      }

      if (session.payment_status !== "paid") {
        return NextResponse.json(
          {
            error: "Medical Support payment not completed",
            paymentStatus: session.payment_status,
          },
          { status: 400 }
        );
      }

      if (session.mode !== "payment") {
        return NextResponse.json(
          {
            error: "Invalid Medical Support payment session",
          },
          { status: 400 }
        );
      }

      const campaignDoc = await adminDb
        .collection("medicalSupport")
        .doc(campaignId)
        .get();

      if (!campaignDoc.exists) {
        return NextResponse.json(
          {
            error: "Medical Support campaign not found",
          },
          { status: 404 }
        );
      }

      const campaign = campaignDoc.data()!;

      return NextResponse.json({
        productType: "medical_support",
        paymentType: "medical_support",
        paymentStatus: "paid",
        campaignId,
        title: campaign.title || "Medical Support",
        description: campaign.description || "",
        images: Array.isArray(campaign.images) ? campaign.images : [],
        goal: Number(campaign.goalAmount || 0),
        raised: Number(campaign.raisedAmount || 0),
        donors: Number(campaign.donors || 0),
        donationAmount: session.amount_total
          ? session.amount_total / 100
          : 0,
        currency: session.currency || "cad",
        creatorId: campaign.userId || campaign.creatorId || "",
        customerEmail,
        sessionId: session.id,
      });
    }
    // ==========================================
    // COACHING PAYMENT
    // ==========================================

    const productId =
      session.metadata?.productId;

    if (productType === "coaching") {
      const bookingId =
        session.metadata?.bookingId || "";

      if (!bookingId || !productId) {
        return NextResponse.json(
          {
            error:
              "Missing coaching booking or product ID",
          },
          { status: 400 }
        );
      }

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

      if (
        slot.status === "expired" &&
        slot.paymentStatus === "refunded"
      ) {
        return NextResponse.json({
          productType: "coaching",
          paymentStatus: "refunded",
          reservationExpired: true,
          refundId: slot.refundId || null,
          sessionId: session.id,
          bookingId,
          title:
            coaching.title ||
            "1-on-1 Coaching Call",
          customerEmail,
        });
      }

      if (
        slot.status === "confirmed" &&
        slot.paymentStatus === "paid"
      ) {
        return NextResponse.json({
          productType: "coaching",
          paymentStatus: "paid",
          reservationExpired: false,
          title: coaching.title,
          description:
            coaching.description || "",
          duration: Number(
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
          sessionId: session.id,
        });
      }

      return NextResponse.json({
        productType: "coaching",
        paymentStatus: "processing",
        reservationExpired: false,
        bookingId,
        title:
          coaching.title ||
          "1-on-1 Coaching Call",
        customerEmail,
        sessionId: session.id,
      });
    }

    // ==========================================
    // DIGITAL PRODUCT
    // ==========================================

    if (!productId) {
      return NextResponse.json(
        {
          error: "Missing product",
        },
        { status: 400 }
      );
    }

    const productDoc =
      await adminDb
        .collection("products")
        .doc(productId)
        .get();

    if (!productDoc.exists) {
      return NextResponse.json(
        {
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    const product =
      productDoc.data()!;

    if (
      session.payment_status !==
      "paid"
    ) {
      return NextResponse.json(
        {
          error: "Payment not completed",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      productType: "digital",
      title: product.title,
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
      sessionId: session.id,
      paymentStatus: "paid",
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