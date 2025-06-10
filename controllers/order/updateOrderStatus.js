import Order from "../../models/Order.js";
import { AppError } from "../../utils/AppError.js";
import createNotification from "../../utils/notification/createNotification.js";
import { notificationTemplates } from "../../utils/notificationTemplates/index.js";
import Inventory from "../../models/Inventory.js";
import InventoryHistory from "../../models/InventoryHistory.js";

export const updateOrderStatus = async (req, res) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError("Order not found", 404);
    // Only supplier can update status
    if (order.supplier.toString() !== companyId.toString()) {
      throw new AppError("Not authorized to update this order", 403);
    }
    // When changing the order status to Confirmed or Completed:
    // 1. Check if the required quantity is available in inventory for each product.
    // 2. If the quantity is available, deduct it from the inventory.
    // 3. Record each deduction in InventoryHistory and link it to the order.
    // 4. If the quantity is not available for any product, return an error and do not perform any deduction.
    if (["Confirmed", "Completed"].includes(status)) {
      // Check inventory for each product in the order
      for (const item of order.items) {
        const inventory = await Inventory.findOne({
          product: item.product,
          company: order.supplier,
        });
        if (!inventory) {
          throw new AppError(
            `No inventory found for product ${item.product}`,
            400
          );
        }
        if (inventory.currentQuantity < item.quantity) {
          throw new AppError(
            `Insufficient inventory for product ${item.product}. Available: ${inventory.currentQuantity}, Required: ${item.quantity}`,
            400
          );
        }
      }
      // if the quantity is available, deduct it and record the deduction
      for (const item of order.items) {
        const inventory = await Inventory.findOne({
          product: item.product,
          company: order.supplier,
        });
        const previousQuantity = inventory.currentQuantity;
        inventory.currentQuantity -= item.quantity;
        await inventory.save();
        await InventoryHistory.create({
          inventory: inventory._id,
          changeType: "Order Deduction",
          quantityChange: -item.quantity,
          previousQuantity,
          newQuantity: inventory.currentQuantity,
          reason: "Order fulfillment",
          referenceType: "Order",
          referenceId: order._id,
          performedBy: req.user._id,
        });
      }
    }
    order.status = status;
    await order.save();

    // Send notification to buyer about status change
    const { title, message, htmlMessage } =
      notificationTemplates.orderStatusChange({
        orderNumber: order.orderNumber,
        newStatus: status,
      });
    await createNotification({
      recipient: order.buyer,
      type: "Order Status Change",
      title,
      message,
      htmlMessage,
      related: "Order",
      relatedId: order._id,
    });

    res.status(200).json({ status: "success", data: order });
  } catch (err) {
    throw new AppError(err.message || "Failed to update order status", 500);
  }
};
