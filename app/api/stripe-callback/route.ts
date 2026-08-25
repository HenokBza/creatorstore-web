import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const stripeAccountId = searchParams.get("stripeAccountId");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!userId || !stripeAccountId) {
    return NextResponse.redirect(`${baseUrl}/dashboard/settings/payments?error=missing_params`);
  }

  try {
    // Check with Stripe if onboarding was fully completed
    const account = await stripe.accounts.retrieve(stripeAccountId);
    const isFullyConnected = account.details_submitted === true;

    // Update Firestore using Admin SDK
    await adminDb.collection("users").doc(userId).set(
      {
        stripeAccountId,
        stripeConnected: isFullyConnected,
      },
      { merge: true }
    );

    // Send them back to your settings page with the green badge unlocked!
    return NextResponse.redirect(`${baseUrl}/dashboard/settings/payments?success=true`);
  } catch (error) {
    console.error("Callback Error:", error);
    return NextResponse.redirect(`${baseUrl}/dashboard/settings/payments?error=failed`);
  }
}