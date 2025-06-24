import Order from "../../models/Order.js";
import Inventory from "../../models/Inventory.js";
import mongoose from "mongoose";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Cancels an order, refunds payment if applicable, and restocks items.
 * Can be initiated by either buyer or supplier.
 * @param {string} orderId - The ID of the order to cancel.
 * @param {string} companyId - The company ID of the user initiating the cancellation.
 * @returns {Promise<Order>} The updated order.
 */
export default async function cancelOrderService({ orderId, companyId }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new Error("Order not found.");
    }

    // Verify that the company cancelling is either the buyer or the supplier
    if (
      order.buyer.toString() !== companyId &&
      order.supplier.toString() !== companyId
    ) {
      throw new Error("You do not have permission to cancel this order.");
    }

    if (
      ["Shipped", "Delivered", "Cancelled", "Accepted"].includes(order.status)
    ) {
      throw new Error(
        `Order cannot be cancelled in its current state (${order.status}).`
      );
    }

    const wasPaid = order.paymentStatus === "Paid";
    const wasPending = order.status === "Pending";

    // 1. Initiate a refund if the order was paid
    if (wasPaid && order.stripePaymentIntentId) {
      await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
      });
      order.paymentStatus = "Refunded";
    }

    // 2. Return items to inventory if they were reserved
    if (wasPending) {
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
    }

    // 3. Update order status
    order.status = "Cancelled";
    await order.save({ session });

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    console.error(`Error cancelling order ${orderId}:`, error);
    if (error.type === "StripeCardError") {
      throw new Error(`Stripe Error: ${error.message}`);
    }
    throw error;
  } finally {
    session.endSession();
  }
}
