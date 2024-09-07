import { findCheckoutSession } from "@/lib/stripe";
import { SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {config} from "@/config";
import {sign} from "node:crypto";
import {v4 as uuid} from "uuid";
import {createClient} from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// This is where we receive Stripe webhook events
// It used to update the user data, send emails, etc...
// By default, it'll store the user in the database
// See more: https://shipfa.st/docs/features/payments
export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature = headers().get("stripe-signature");

  let eventType;
  let event;

  console.log("KEYS")
  console.log(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Create a private supabase client using the secret service_role API key
  const supabase = new SupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // verify Stripe event is legit
  try {
    if (!signature) {
        // @ts-ignore
        console.error("⚠️ Webhook signature missing");
        // @ts-ignore
        return NextResponse.json({ error: "Webhook signature missing" }, { status: 400 });
    }

    if (!webhookSecret) {
        // @ts-ignore
        console.error("⚠️ Webhook secret missing");
        // @ts-ignore
        return NextResponse.json({ error: "Webhook secret missing" }, { status: 400 });
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    // @ts-ignore
    console.error(`Webhook signature verification failed. ${err.message}`);
    // @ts-ignore
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        // First payment is successful and a subscription is created (if mode was set to "subscription" in ButtonCheckout)
        // ✅ Grant access to the product
        const stripeObject: Stripe.Checkout.Session = event.data
          .object as Stripe.Checkout.Session;

        const session = await findCheckoutSession(stripeObject.id);

        console.log("session", session);

        const {notebook_id, team_name, team_number} = session?.metadata!;

        if (!session) {
          // @ts-ignore
          console.error("⚠️ Checkout session not found");
          return NextResponse.json({ error: "Checkout session not found" }, { status: 400 });
        }

        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price?.id;

        const userId = stripeObject.client_reference_id;
        const plan = config.stripe.plans.find((p) => p.priceId === priceId);

        const customer = (await stripe.customers.retrieve(
          customerId as string
        )) as Stripe.Customer;

        if (!plan) break;

        // insert notebook
        const {error: notebookError} = await supabase.from("notebooks").insert({
          id: notebook_id,
          team_name: team_name,
          team_number: team_number,
        });

        if (notebookError) {
          // @ts-ignore
          console.error("⚠️ Error inserting notebook", notebookError);
          return NextResponse.json({ error: "Error inserting notebook" }, { status: 400 });
        }

        const {error: userNotebooksError} = await supabase.from("user_notebooks").insert({
            user_id: userId,
            notebook_id: notebook_id,
        });

        if (userNotebooksError) {
          // @ts-ignore
          console.error("⚠️ Error inserting user_notebooks", userNotebooksError);
          return NextResponse.json({ error: "Error inserting user_notebooks" }, { status: 400 });
        }

        // let user;
        // if (!userId) {
        //   // check if user already exists
        //   const { data: profile } = await supabase
        //     .from("profiles")
        //     .select("*")
        //     .eq("email", customer.email)
        //     .single();
        //   if (profile) {
        //     user = profile;
        //   } else {
        //     // create a new user using supabase auth admin
        //     const { data } = await supabase.auth.admin.createUser({
        //       email: customer.email,
        //     });
        //
        //     user = data?.user;
        //   }
        // } else {
        //   // find user by ID
        //   const { data: profile } = await supabase
        //     .from("profiles")
        //     .select("*")
        //     .eq("id", userId)
        //     .single();
        //
        //   user = profile;
        // }
        //
        // await supabase
        //   .from("profiles")
        //   .update({
        //     customer_id: customerId,
        //     price_id: priceId,
        //     has_access: true,
        //   })
        //   .eq("id", user?.id);

        // Extra: send email with user link, product page, etc...
        // try {
        //   await sendEmail(...);
        // } catch (e) {
        //   console.error("Email issue:" + e?.message);
        // }

        break;
      }

      case "checkout.session.expired": {
        // User didn't complete the transaction
        // You don't need to do anything here, by you can send an email to the user to remind him to complete the transaction, for instance
        break;
      }

      case "customer.subscription.updated": {
        // The customer might have changed the plan (higher or lower plan, cancel soon etc...)
        // You don't need to do anything here, because Stripe will let us know when the subscription is canceled for good (at the end of the billing cycle) in the "customer.subscription.deleted" event
        // You can update the user data to show a "Cancel soon" badge for instance
        break;
      }

      case "customer.subscription.deleted": {
        // The customer subscription stopped
        // ❌ Revoke access to the product
        const stripeObject: Stripe.Subscription = event.data
          .object as Stripe.Subscription;
        const subscription = await stripe.subscriptions.retrieve(
          stripeObject.id
        );

        await supabase
          .from("profiles")
          .update({ has_access: false })
          .eq("customer_id", subscription.customer);
        break;
      }

      case "invoice.paid": {
        // Customer just paid an invoice (for instance, a recurring payment for a subscription)
        // ✅ Grant access to the product
        const stripeObject: Stripe.Invoice = event.data
          .object as Stripe.Invoice;
        const priceId = stripeObject.lines.data[0].price?.id;
        const customerId = stripeObject.customer;

        // Find profile where customer_id equals the customerId (in table called 'profiles')
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("customer_id", customerId)
          .single();

        // Make sure the invoice is for the same plan (priceId) the user subscribed to
        if (profile.price_id !== priceId) break;

        // Grant the profile access to your product. It's a boolean in the database, but could be a number of credits, etc...
        await supabase
          .from("profiles")
          .update({ has_access: true })
          .eq("customer_id", customerId);

        break;
      }

      case "invoice.payment_failed":
        // A payment failed (for instance the customer does not have a valid payment method)
        // ❌ Revoke access to the product
        // ⏳ OR wait for the customer to pay (more friendly):
        //      - Stripe will automatically email the customer (Smart Retries)
        //      - We will receive a "customer.subscription.deleted" when all retries were made and the subscription has expired

        break;

      default:
      // Unhandled event type
    }
  } catch (e) {
    // @ts-ignore
    console.error("stripe error: ", e.message);
  }

  return NextResponse.json({});
}
