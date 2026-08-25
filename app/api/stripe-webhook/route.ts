import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function activateCreatorProducts(creatorId: string) {
  const products = await adminDb.collection("products").where("userId", "==", creatorId).get();
  if (products.empty) return;

  const batch = adminDb.batch();
  products.forEach((product) => {
    batch.update(product.ref, { isActive: true });
  });
  await batch.commit();
}

async function deactivateCreatorProducts(creatorId: string) {
  const products = await adminDb.collection("products").where("userId", "==", creatorId).get();
  if (products.empty) return;

  const batch = adminDb.batch();
  products.forEach((product) => {
    batch.update(product.ref, { isActive: false });
  });
  await batch.commit();
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error: any) {
    console.error("❌ Stripe webhook signature error:", error.message);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  console.log(`✅ STRIPE WEBHOOK RECEIVED: ${event.type} [ID: ${event.id}]`);

  try {
    switch (event.type) {
      // =================================================
      // 1. CHECKOUT SESSION COMPLETED
      // =================================================
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const mode = session.mode;
        const metadata = session.metadata || {};
        const productId = metadata.productId;
        const productType = metadata.productType || "digital";
        const creatorId = metadata.creatorId;
        const customerEmail = session.customer_email || metadata.buyerEmail || "";

        console.log("🔥 PROCESSING CHECKOUT COMPLETED:", { mode, productType, productId, creatorId });

        // A. CREATOR SUBSCRIPTION MODE
        if (mode === "subscription") {
          if (!creatorId) {
            console.error("❌ Subscription missing creatorId");
            break;
          }

          const customerId = typeof session.customer === "string" ? session.customer : null;
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;

          await adminDb.collection("users").doc(creatorId).update({
            subscriptionStatus: "active",
            subscriptionPlan: "Creator Pro",
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStart: new Date(),
            cancelAtPeriodEnd: false,
          });

          await activateCreatorProducts(creatorId);
          console.log("✅ Creator subscription activated:", creatorId);
          break;
        }

        // B. PRODUCT OR COACHING PAYMENT MODE
        if (!productId) {
          console.log("⚠️ No productId found. Skipping product processing.");
          break;
        }

        const stripePaidAmount = Number(session.amount_total || 0) / 100;
        if (!Number.isFinite(stripePaidAmount) || stripePaidAmount <= 0) {
          console.error("❌ Invalid payment amount:", session.amount_total);
          break;
        }
        const amount = stripePaidAmount;

        // --- COACHING CALL PURCHASE ---
        if (productType === "coaching") {
          const bookingId = metadata.bookingId || "";
          if (!bookingId) {
            console.error("❌ Coaching payment missing bookingId");
            break;
          }

          const coachingRef = adminDb.collection("coachingCalls").doc(productId);
          const slotRef = adminDb.collection("coachingSlots").doc(bookingId);
          const orderRef = adminDb.collection("orders").doc(session.id);

          try {
            await adminDb.runTransaction(async (transaction) => {
              const existingOrder = await transaction.get(orderRef);
              if (existingOrder.exists) throw new Error("ALREADY_PROCESSED");

              const slotDoc = await transaction.get(slotRef);
              if (!slotDoc.exists) throw new Error("SLOT_NOT_FOUND");

              const slot = slotDoc.data()!;
              
              if (slot.paymentStatus === "paid" && slot.status === "confirmed") {
                throw new Error("ALREADY_PROCESSED");
              }

              // Check Expiration
              const expiresAt = slot.expiresAt?.toDate ? slot.expiresAt.toDate().getTime() : 0;
             if (
  slot.status === "pending" &&
  slot.paymentStatus === "pending" &&
  expiresAt > 0 &&
  Date.now() >= expiresAt
) {
  throw new Error("RESERVATION_EXPIRED");
}
              const coachingDoc = await transaction.get(coachingRef);
              if (!coachingDoc.exists) throw new Error("COACHING_NOT_FOUND");
              const coaching = coachingDoc.data()!;

              const actualCreatorId = creatorId || coaching.userId || coaching.creatorId || "";
              if (!actualCreatorId) throw new Error("CREATOR_ID_MISSING");

              const userRef = adminDb.collection("users").doc(actualCreatorId);
              const userDoc = await transaction.get(userRef);
              if (!userDoc.exists) throw new Error("USER_NOT_FOUND");
              const userData = userDoc.data()!;

              const finalEmail = customerEmail || slot.customerEmail || "";

              // 1. Save Order
              transaction.set(orderRef, {
                productId,
                productType: "coaching",
                creatorId: actualCreatorId,
                customerEmail: finalEmail,
                amount,
                stripeSessionId: session.id,
                createdAt: new Date(),
              });

              // 2. Confirm Slot
              transaction.update(slotRef, {
                status: "confirmed",
                paymentStatus: "paid",
                stripeSessionId: session.id,
                paidAmount: amount,
                confirmedAt: new Date(),
              });

              // 3. Create Booking Record
              const bookingRef = adminDb.collection("coachingBookings").doc(bookingId);
              transaction.set(bookingRef, {
                coachingId: productId,
                creatorId: actualCreatorId,
                customerEmail: finalEmail,
                scheduledDate: slot.scheduledDate || metadata.scheduledDate || "",
                scheduledTime: slot.scheduledTime || metadata.scheduledTime || "",
                duration: Number(slot.duration || coaching.duration || 60),
                meetingLink: slot.meetingLink || coaching.meetingLink || "",
                coachingTitle: coaching.title || "1-on-1 Coaching Call",
                status: "confirmed",
                paymentStatus: "paid",
                amount,
                stripeSessionId: session.id,
                bookingId,
                unread: true,
                createdAt: slot.createdAt || new Date(),
                confirmedAt: new Date(),
              });

              // 4. Update Stats & Balances
              transaction.update(coachingRef, {
                customers: Number(coaching.customers || 0) + 1,
                revenue: Number(coaching.revenue || 0) + amount,
              });

              transaction.update(userRef, {
                totalRevenue: Number(userData.totalRevenue || 0) + amount,
                availableBalance: Number(userData.availableBalance || 0) + amount,
                totalSales: Number(userData.totalSales || 0) + 1,
              });
            });

            console.log("✅ Coaching call purchase processed successfully:", session.id);
          } catch (err: any) {
            if (err.message === "ALREADY_PROCESSED") {
              console.log("⚠️ Coaching payment already processed:", session.id);
              break;
            }

           if (err.message === "RESERVATION_EXPIRED") {
              const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent as any)?.id;
              
              if (paymentIntentId) {
                // 1. Double-check Firestore to see if this slot was already refunded
                const slotCheckDoc = await slotRef.get();
                const slotData = slotCheckDoc.data();

                if (slotData?.paymentStatus === "refunded") {
                  console.log("⚠️ Refund already processed for this slot. Skipping duplicate refund.");
                  break;
                }

                // 2. Perform the refund with an idempotency key (using session.id or bookingId)
                // Stripe guarantees that using the same idempotency key won't charge/refund twice.
                const refund = await stripe.refunds.create(
                  {
                    payment_intent: paymentIntentId,
                    metadata: { 
                      reason: "coaching_reservation_expired", 
                      bookingId, 
                      coachingId: productId, 
                      sessionId: session.id 
                    },
                  },
                  {
                    idempotencyKey: `refund_expired_${session.id}`, // <--- THIS PREVENTS DUPLICATE STRIPE REFUNDS
                  }
                );

                // 3. Update Firestore atomically
                await slotRef.update({
                  status: "expired",
                  paymentStatus: "refunded",
                  refundId: refund.id,
                  refundedAt: new Date(),
                });

                console.log("✅ Payment refunded successfully (Idempotent):", refund.id);
              }
              break;
            }
            throw err;
          }
          break;
        }

        // --- DIGITAL PRODUCT PURCHASE ---
        if (productType === "digital") {
          const productRef = adminDb.collection("products").doc(productId);
          const productDoc = await productRef.get();

          if (!productDoc.exists) {
            console.error("❌ Product not found:", productId);
            break;
          }

          const product = productDoc.data()!;
          const actualCreatorId = creatorId || product.userId || product.creatorId || "";
          if (!actualCreatorId) {
            console.error("❌ Creator ID missing for digital product");
            break;
          }

          const orderRef = adminDb.collection("orders").doc(session.id);
          const userRef = adminDb.collection("users").doc(actualCreatorId);

          await adminDb.runTransaction(async (transaction) => {
            const existingOrder = await transaction.get(orderRef);
            if (existingOrder.exists) return;

            const currentProduct = await transaction.get(productRef);
            const currentUser = await transaction.get(userRef);
            if (!currentProduct.exists || !currentUser.exists) throw new Error("DATA_NOT_FOUND");

            const currentProductData = currentProduct.data()!;
            const currentUserData = currentUser.data()!;

            transaction.create(orderRef, {
              productId,
              productType: "digital",
              creatorId: actualCreatorId,
              customerEmail,
              amount,
              stripeSessionId: session.id,
              createdAt: new Date(),
            });

            transaction.update(productRef, {
              customers: Number(currentProductData.customers || 0) + 1,
              revenue: Number(currentProductData.revenue || 0) + amount,
            });

            transaction.update(userRef, {
              totalRevenue: Number(currentUserData.totalRevenue || 0) + amount,
              availableBalance: Number(currentUserData.availableBalance || 0) + amount,
              totalSales: Number(currentUserData.totalSales || 0) + 1,
            });
          });

          console.log("✅ Digital payment processed successfully:", session.id);
          break;
        }

        break;
      }

      // =================================================
      // 2. SUBSCRIPTION UPDATED
      // =================================================
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        const users = await adminDb.collection("users").where("stripeCustomerId", "==", customerId).get();
        if (users.empty) break;

        const userRef = users.docs[0].ref;
        const creatorId = userRef.id;
        const isActive = subscription.status === "active" || subscription.status === "trialing";

        await userRef.update({
          subscriptionStatus: isActive ? "active" : "inactive",
          subscriptionPlan: isActive ? "Creator Pro" : "",
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          subscriptionEnd: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000) : null,
        });

        if (isActive) await activateCreatorProducts(creatorId);
        break;
      }

      // =================================================
      // 3. SUBSCRIPTION DELETED
      // =================================================
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const users = await adminDb.collection("users").where("stripeCustomerId", "==", customerId).get();
        if (users.empty) break;

        const userRef = users.docs[0].ref;
        const creatorId = userRef.id;

        await userRef.update({
          subscriptionStatus: "inactive",
          subscriptionPlan: "",
          cancelAtPeriodEnd: false,
          subscriptionEnd: null,
        });

        await deactivateCreatorProducts(creatorId);
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ WEBHOOK HANDLER ERROR:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}