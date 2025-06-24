import Order from "../../models/Order.js";
import Inventory from "../../models/Inventory.js";
import Cart from "../../models/Cart.js";
import mongoose from "mongoose";

/**
 * Handles the logic for a successful payment.
 * Updates order status, adjusts inventory, and deletes the cart.
 * @param {string} stripePaymentIntentId - The payment intent ID from Stripe.
 * @returns {Promise<void>}
 */
export default async function updateOrderOnPaymentSuccess(
  stripePaymentIntentId
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ stripePaymentIntentId }).session(
      session
    );
    if (!order) {
      throw new Error("Order not found for this payment intent.");
    }

    // Prevent processing the same event multiple times
    if (order.status === "Pending" || order.paymentStatus === "Paid") {
      console.log(`Order ${order._id} already processed.`);
      await session.commitTransaction();
      return;
    }

    order.status = "Pending";
    order.paymentStatus = "Paid";
    await order.save({ session });

    // Adjust inventory for each item in the order
    for (const item of order.items) {
      const inventoryUpdate = await Inventory.findOneAndUpdate(
        {
          company: order.supplier,
          product: item.product,
          availableQuantity: { $gte: item.quantity },
        },
        {
          $inc: {
            availableQuantity: -item.quantity,
            reservedQuantity: +item.quantity,
          },
          $set: { lastUpdated: new Date() },
        },
        { new: true, session }
      );

      if (!inventoryUpdate) {
        throw new Error(
          `Insufficient stock for product ${item.product} during final processing.`
        );
      }
    }

    // Delete the cart used for this order
    // We need to find the cart based on the order details
    await Cart.findOneAndDelete({
      company: order.buyer,
      supplier: order.supplier,
    }).session(session);

    await session.commitTransaction();
    console.log(`Successfully processed order ${order._id}`);
  } catch (error) {
    await session.abortTransaction();
    console.error("Error processing successful payment:", error);
    throw error; // Re-throw to be caught by the webhook controller
  } finally {
    session.endSession();
  }
}
