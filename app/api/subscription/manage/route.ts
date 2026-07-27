import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebaseAdmin";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
);

export async function POST(req: NextRequest) {

  try {

    const { uid } = await req.json();

    const userDoc = await adminDb
      .collection("users")
      .doc(uid)
      .get();

    if (!userDoc.exists) {

      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );

    }

    const user = userDoc.data();

    if (!user?.stripeCustomerId) {

      return NextResponse.json(
        { error: "No Stripe customer found." },
        { status: 400 }
      );

    }

    const session =
      await stripe.billingPortal.sessions.create({

        customer: user.stripeCustomerId,

       return_url:
`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings/profile`,

      });

    return NextResponse.json({

      url: session.url,

    });

  } catch (error: any) {

    return NextResponse.json(

      { error: error.message },

      { status: 500 }

    );

  }

}