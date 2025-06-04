import Order from "../../models/Order.js";
import { AppError } from "../../utils/AppError.js";
import createNotification from "../../utils/notification/createNotification.js";
import { notificationTemplates } from "../../utils/notificationTemplates/index.js";

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
