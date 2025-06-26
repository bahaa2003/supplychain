import Order from "../../models/Order.js";
import Inventory from "../../models/Inventory.js";
import mongoose from "mongoose";

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

  // Return items to inventory
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

  // Update order status
  order.status = "Draft";
  await order.save({ session });

  await session.commitTransaction();
  return order;
}
