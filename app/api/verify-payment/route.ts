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

    const sessionId =
      req.nextUrl.searchParams.get(
        "session_id"
      );

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session id" },
        { status: 400 }
      );
    }

    const session =
      await stripe.checkout.sessions.retrieve(
        sessionId
      );

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    const productId =
      session.metadata?.productId;

    const creatorId =
      session.metadata?.creatorId;

    const customerEmail =
      session.customer_email || "";

    if (!productId) {
      return NextResponse.json(
        { error: "Missing product" },
        { status: 400 }
      );
    }

    // Get product

    const productDoc =
      await adminDb
        .collection("products")
        .doc(productId)
        .get();

    if (!productDoc.exists) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const product =
      productDoc.data()!;

    return NextResponse.json({

      title:
        product.title,

      fileUrl:
        product.fileUrl,

    });

  } catch (error: any) {

    console.log(error);

    return NextResponse.json(
      {
        error:
          error.message,
      },
      {
        status: 500,
      }
    );

  }
}