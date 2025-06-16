import Order from "../../models/Order.js";
import { AppError } from "../../utils/AppError.js";
import createNotification from "../../services/notification.service.js";
import User from "../../models/User.js";

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

    // Get company users with admin or manager role
    const recipients = await User.find({
      company: companyId,
      role: { $in: ["admin", "manager"] },
    });

    // Send notification (optional, for auditing)
    await createNotification(
      "systemAlert",
      {
        message: `Viewed order #${order.orderNumber}`,
      },
      recipients
    );

    res.status(200).json({ status: "success", data: order });
  } catch (err) {
    throw new AppError(err.message || "Failed to get order", 500);
  }
};
