import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@repo/database";

let stripeInstance: Stripe | null = null;
const getStripe = () => {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
      apiVersion: "2023-10-16" as any,
    });
  }
  return stripeInstance;
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      // 1. Update Order Status
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: "PAID",
          // You could also store session details if needed
        }
      });

      // 2. Adjust Inventory (move from Reserved to Sold)
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: orderId }
      });

      for (const item of orderItems) {
        if (item.productVariantId) {
          await prisma.inventory.updateMany({
            where: { productVariantId: item.productVariantId },
            data: { 
              quantity: { decrement: item.quantity },
              reserved: { decrement: item.quantity }
            }
          });
        }
      }

      console.log(`✅ Order ${orderId} marked as PAID`);
    }
  }

  return NextResponse.json({ received: true });
}
