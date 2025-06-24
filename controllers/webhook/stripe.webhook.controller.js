import Stripe from "stripe";
import updateOrderOnPaymentSuccess from "../../services/order/updateOrderOnPaymentSuccess.service.js";
import updateOrderOnPaymentFailure from "../../services/order/updateOrderOnPaymentFailure.service.js";
import { AppError } from "../../utils/AppError.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const stripeWebhookHandler = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Error message: ${err.message}`);
    return next(new AppError(`Webhook Error: ${err.message}`, 400));
  }

  console.log(`✅ Received Stripe event: ${event.type}`);

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntentSucceeded = event.data.object;
      await updateOrderOnPaymentSuccess(paymentIntentSucceeded.id);
      break;
    case "payment_intent.payment_failed":
      const paymentIntentFailed = event.data.object;
      await updateOrderOnPaymentFailure(paymentIntentFailed.id);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
};
