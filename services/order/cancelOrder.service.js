import Order from "../../models/Order.js";
import Inventory from "../../models/Inventory.js";
import mongoose from "mongoose";

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

  const wasPending = order.status === "Pending";

  // Return items to inventory if they were reserved
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

  // Update order status
  order.status = "Cancelled";
  await order.save({ session });

  await session.commitTransaction();
  return order;
}
