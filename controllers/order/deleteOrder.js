import Order from "../../models/Order.js";
import { AppError } from "../../utils/AppError.js";
import createNotification from "../../services/notification.service.js";
import User from "../../models/User.js";

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

    // Get supplier company users with admin or manager role
    const recipients = await User.find({
      company: order.supplier,
      role: { $in: ["admin", "manager"] },
    });

    // Send notification to supplier about order deletion
    await createNotification(
      "orderStatusChange",
      {
        orderNumber: order.orderNumber,
        newStatus: "Deleted",
      },
      recipients
    );

    res.status(204).send();
  } catch (err) {
    throw new AppError(err.message || "Failed to delete order", 500);
  }
};
