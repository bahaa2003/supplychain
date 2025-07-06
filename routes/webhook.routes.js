import express from "express";
import Stripe from "stripe";
import Company from "../models/Company.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const IGNORED_EVENTS = [
  "charge.succeeded",
  "payment_method.attached",
  "payment_intent.created",
];

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;

    try {
      const sig = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      const { type, data } = event;

      if (IGNORED_EVENTS.includes(type)) {
        return res.json({ received: true });
      }

      switch (type) {
        case "checkout.session.completed":
          await handleCheckoutSession(data.object);
          break;

        case "customer.subscription.created":
          await handleSubscriptionCreated(data.object);
          break;

        case "payment_intent.succeeded":
          break;

        default:
          break;
      }

      res.json({ received: true });
    } catch (err) {
      console.error("❌ Webhook Error:", err.message);
      res.status(500).json({
        error: err.message,
        event_type: event?.type || "unknown",
      });
    }
  }
);

async function handleCheckoutSession(session) {
  if (!session.subscription) return;

  const companyId = session.metadata?.companyId;
  if (!companyId) return;

  const company = await Company.findById(companyId);
  if (!company) return;

  company.subscription.stripeCustomerId = session.customer;
  company.subscription.stripeSubscriptionId = session.subscription;

  await company.save();
}

async function handleSubscriptionCreated(subscription) {
  const companyId = subscription.metadata?.companyId;
  if (!companyId) return;

  const company = await Company.findById(companyId);
  if (!company) return;

  const priceId = subscription.items.data[0].price.id;
  const plan = getPlanFromPriceId(priceId);
  const endDate = new Date(subscription.current_period_end * 1000);

  if (isNaN(endDate.getTime())) return;

  company.subscription = {
    plan,
    status: "active",
    startDate: new Date(),
    endDate,
    stripeCustomerId: subscription.customer,
    stripeSubscriptionId: subscription.id,
  };

  await company.save();
}

function getPlanFromPriceId(priceId) {
  const PLANS = {
    "price_1Rg5uVFJR5x13atRSa8RRwjg": "Basic",
    "price_1Rg5wsFJR5x13atRhtxOCZ79": "Pro",
    "price_1Rg5xXFJR5x13atR6Eo4IhQo": "Enterprise",
  };

  return PLANS[priceId] || "Free";
}

export default router;
