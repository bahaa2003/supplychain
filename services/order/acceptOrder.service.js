import Order from "../../models/Order.js";
import Inventory from "../../models/Inventory.js";
import InventoryHistory from "../../models/InventoryHistory.js";
import mongoose from "mongoose";

/**
 * Marks an order as 'Accepted' by the buyer.
 * Increases the buyer's inventory and creates history records.
 * @param {string} orderId - The ID of the order to accept.
 * @param {string} buyerCompanyId - The company ID of the buyer.
 * @param {string} buyerUserId - The user ID of the person accepting.
 * @returns {Promise<Order>} The updated order.
 */
export default async function acceptOrderService({
  orderId,
  buyerCompanyId,
  buyerUserId,
}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  const order = await Order.findOne({
    _id: orderId,
    buyer: buyerCompanyId,
  }).session(session);

  if (!order) {
    throw new Error("Order not found or you do not have permission.");
  }

  // Typically, an order should be 'Delivered' before it can be accepted.
  if (order.status !== "Delivered") {
    throw new Error("Order must be in 'Delivered' state to be accepted.");
  }

  // Update order status
  order.status = "Accepted";
  await order.save({ session });

  // Increase buyer's inventory for each item
  for (const item of order.items) {
    // Find or create an inventory record for the buyer's company and this product
    const inventory = await Inventory.findOneAndUpdate(
      { company: buyerCompanyId, product: item.product },
      {
        $inc: {
          currentQuantity: +item.quantity,
          availableQuantity: +item.quantity,
        },
        $set: { lastUpdated: new Date() },
      },
      { upsert: true, new: true, session }
    );

    // Create an inventory history record
    await InventoryHistory.create(
      [
        {
          inventory: inventory._id,
          company: buyerCompanyId,
          user: buyerUserId,
          changeType: "addition",
          quantityChange: item.quantity,
          reason: "Order received",
          referenceType: "Order",
          referenceId: order._id,
        },
      ],
      { session }
    );
  }

  await session.commitTransaction();
  return order;
}
