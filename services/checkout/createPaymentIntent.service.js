import Stripe from "stripe";
import validateCartService from "./validateCart.service.js";
import Order from "../../models/Order.js";
import Cart from "../../models/Cart.js";
import { generateOrderNumber } from "../../utils/orderNumber.js"; // Assuming this utility exists

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, (err) => {
  if (err) {
    console.error("Failed to connect to Stripe:", err);
  } else {
    console.log("connect to stripe...");
  }
});

/**
 * Creates a Stripe Payment Intent for a given cart.
 * @param {string} cartId - The ID of the cart to checkout.
 * @param {string} buyerCompanyId - The ID of the buyer's company.
 * @param {string} buyerUserId - The ID of the user creating the order.
 * @returns {Promise<object>} An object containing the clientSecret and orderId.
 */
export default async function createPaymentIntentService({
  cartId,
  buyerCompanyId,
  buyerUserId,
}) {
  // 1. Validate the cart first
  const validationResult = await validateCartService({
    cartId,
    buyerCompanyId,
  });
  if (!validationResult.isValid) {
    throw new Error("Cart is not valid for checkout. Please validate first.");
  }

  const { cart } = validationResult;

  // 2. Calculate total amount
  const totalAmount = cart.items.reduce((acc, item) => acc + item.subtotal, 0);
  if (totalAmount <= 0) {
    throw new Error("Cart total must be positive.");
  }

  // 3. Create a preliminary order
  const orderNumber = await generateOrderNumber();
  const preliminaryOrder = new Order({
    orderNumber,
    buyer: buyerCompanyId,
    supplier: cart.supplier,
    createdBy: buyerUserId,
    status: "Submitted", // Or 'Pending Payment'
    items: cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      unitPrice: item.priceAtTimeOfAddition,
      subtotal: item.subtotal,
    })),
    totalAmount: totalAmount,
    currency: "usd", // Assuming USD, can be dynamic
    paymentStatus: "Pending",
  });

  await preliminaryOrder.save();

  // 4. Create a Stripe Payment Intent
  // Amount should be in the smallest currency unit (e.g., cents)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount * 100),
    currency: "usd",
    metadata: {
      orderId: preliminaryOrder._id.toString(),
      buyerCompanyId: buyerCompanyId.toString(),
      supplierCompanyId: cart.supplier.toString(),
    },
  });

  // 5. Update the order with the Payment Intent ID
  preliminaryOrder.stripePaymentIntentId = paymentIntent.id;
  await preliminaryOrder.save();

  // 6. Return the client secret to the frontend
  return {
    clientSecret: paymentIntent.client_secret,
    orderId: preliminaryOrder._id,
  };
}
