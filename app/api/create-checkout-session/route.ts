import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/lib/firebase";

import {
  doc,
  getDoc,
} from "firebase/firestore";

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

    } = await req.json();

    if (!productId) {

      return NextResponse.json(

        {
          error: "Missing product"
        },

        {
          status: 400
        }

      );

    }

    const productRef =
      doc(
        db,
        "products",
        productId
      );

    const productSnap =
      await getDoc(productRef);

    if (!productSnap.exists()) {

      return NextResponse.json(

        {
          error: "Product not found"
        },

        {
          status: 404
        }

      );

    }

    const product =
      productSnap.data();
      // Prevent checkout for inactive products
if (product.isActive === false) {

  return NextResponse.json(
    {
      error:
        "This product is currently unavailable."
    },
    {
      status: 403
    }
  );

}
console.log("BASE URL:", process.env.NEXT_PUBLIC_BASE_URL);

console.log("Success URL:",
`${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`);

console.log("Cancel URL:",
`${process.env.NEXT_PUBLIC_BASE_URL}/payment-cancel`);
console.log( "Price ID:", process.env.STRIPE_CREATOR_PLAN_PRICE_ID);

console.log("Thumbnail:",
product.thumbnail);

console.log("Thumbnail length:",
product.thumbnail?.length);
    const session =
      await stripe.checkout.sessions.create({

        customer_email: email,

        payment_method_types: [

          "card"

        ],

        mode: "payment",

        line_items: [

          {

            quantity: 1,

            price_data: {

              currency:

                "cad",

              unit_amount:

                Math.round(
                  Number(product.discountPrice ? product.discountPrice : product.price) * 100
                ),

     product_data: {
  name: product.title,
  description: product.description,
},
            },

          },

        ],

        success_url:

          `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:

          `${process.env.NEXT_PUBLIC_BASE_URL}/payment-cancel`,

        metadata: {

          productId,

          creatorId:
            product.userId,
           buyerEmail: email, 

        },

    });

    return NextResponse.json({

      url: session.url,

    });

  }

 catch (error: any) {

  console.error("Stripe Error:", error);

  return NextResponse.json(
    {
      error: error.message || "Stripe Error"
    },
    {
      status: 500
    }
  );

}

}