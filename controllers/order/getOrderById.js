import Order from "../../models/Order.js";
import { AppError } from "../../utils/AppError.js";
import createNotification from "../../utils/notification/createNotification.js";
import { notificationTemplates } from "../../utils/notificationTemplates/index.js";

export const getOrderById = async (req, res) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError("Order not found", 404);
    // Only allow access if user is buyer or supplier
    if (
      order.buyer.toString() !== companyId.toString() &&
      order.supplier.toString() !== companyId.toString()
    ) {
      throw new AppError("Not authorized to view this order", 403);
    }
    // Send notification (optional, for auditing)
    await createNotification({
      recipient: companyId,
      type: "Order Status Change",
      title: `Viewed Order #${order.orderNumber}`,
      message: `You viewed order #${order.orderNumber}.`,
      htmlMessage: `<p>You viewed order #${order.orderNumber}.</p>`,
      related: "Order",
      relatedId: order._id,
    });
    res.status(200).json({ status: "success", data: order });
  } catch (err) {
    throw new AppError(err.message || "Failed to get order", 500);
  }
};
