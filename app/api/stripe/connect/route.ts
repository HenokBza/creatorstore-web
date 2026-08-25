import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebaseAdmin"; // Must use Admin SDK in server API routes!

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const userDocRef = adminDb.collection("users").doc(userId);
    const userSnap = await userDocRef.get();
    let stripeAccountId = userSnap.exists ? userSnap.data()?.stripeAccountId : null;

    // 1. Create a Stripe Express connected account if one doesn't exist
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;

      // Save using adminDb (bypasses permission denied errors)
      await userDocRef.set(
        {
          stripeAccountId,
          stripeConnected: false,
        },
        { merge: true }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // 2. Create an Account Link for onboarding
    // Instead of going directly to settings, route them to a callback handler or check handler
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/dashboard/settings/payments?stripe_refresh=true`,
      return_url: `${baseUrl}/api/stripe-callback?userId=${userId}&stripeAccountId=${stripeAccountId}`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error("Stripe Connect Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}