import Order from "../../models/Order.js";
import { AppError } from "../../utils/AppError.js";
import createNotification from "../../utils/notification/createNotification.js";
import { notificationTemplates } from "../../utils/notificationTemplates/index.js";

export const deleteOrder = async (req, res) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError("Order not found", 404);
    // Only buyer can delete order and only if status is Draft
    if (
      order.buyer.toString() !== companyId.toString() ||
      order.status !== "Draft"
    ) {
      throw new AppError("Not authorized to delete this order", 403);
    }
    await order.deleteOne();

    // Send notification to supplier about order deletion
    await createNotification({
      recipient: order.supplier,
      type: "Order Status Change",
      title: `Order #${order.orderNumber} Deleted`,
      message: `Order #${order.orderNumber} was deleted by the buyer.`,
      htmlMessage: `<p>Order #${order.orderNumber} was deleted by the buyer.</p>`,
      related: "Order",
      relatedId: order._id,
    });

    res.status(204).send();
  } catch (err) {
    throw new AppError(err.message || "Failed to delete order", 500);
  }
};
