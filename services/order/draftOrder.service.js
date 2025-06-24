import Order from "../../models/Order.js";
import Inventory from "../../models/Inventory.js";
import mongoose from "mongoose";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Moves an order to 'Draft' status, initiating a refund and returning stock.
 * @param {string} orderId - The ID of the order to move to draft.
 * @param {string} supplierCompanyId - The ID of the supplier's company for verification.
 * @returns {Promise<Order>} The updated order.
 */
export default async function draftOrderService({
  orderId,
  supplierCompanyId,
}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      _id: orderId,
      supplier: supplierCompanyId,
    }).session(session);

    if (!order) {
      throw new Error("Order not found or you do not have permission.");
    }

    if (order.status !== "Pending") {
      throw new Error(
        `Order cannot be moved to draft from its current state (${order.status}).`
      );
    }

    // 1. Initiate a refund via Stripe
    if (order.stripePaymentIntentId) {
      await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
        reason: "requested_by_customer", // Or a more specific reason
      });
      order.paymentStatus = "Refunded";
    }

    // 2. Return items to inventory
    for (const item of order.items) {
      await Inventory.updateOne(
        { company: order.supplier, product: item.product },
        {
          $inc: {
            reservedQuantity: -item.quantity,
            availableQuantity: +item.quantity,
          },
        },
        { session }
      );
    }

    // 3. Update order status
    order.status = "Draft";
    await order.save({ session });

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    console.error(`Error moving order ${orderId} to draft:`, error);
    // Distinguish between Stripe errors and others
    if (error.type === "StripeCardError") {
      throw new Error(`Stripe Error: ${error.message}`);
    }
    throw error;
  } finally {
    session.endSession();
  }
}
