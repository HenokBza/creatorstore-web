import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
);

export async function POST(req: NextRequest) {

  try {

    const {
  creatorId,
  email,
  returnTo,
} = await req.json();

    const session =
      await stripe.checkout.sessions.create({

        mode: "subscription",

        customer_email: email,

        payment_method_types: ["card"],

        line_items: [

          {
            price:
              process.env.STRIPE_CREATOR_PLAN_PRICE_ID!,

            quantity: 1,
          },

        ],

        metadata: {
          creatorId,
        },

        success_url:
`${process.env.NEXT_PUBLIC_BASE_URL}${returnTo}?subscribed=true`,

cancel_url:
`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscription?returnTo=${encodeURIComponent(returnTo)}`,

      });

   return NextResponse.json({
  url: session.url,
});

  } catch (error: any) {

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );

  }

}