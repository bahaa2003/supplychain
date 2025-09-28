import Order from "../../models/Order.schema.js";
import { AppError } from "../../utils/AppError.js";
import { ORDER_ROLE_PERMISSIONS } from "../../enums/orderStatus.enum.js";

export const getAllowedStatus = async (req, res) => {
  const { orderId } = req.params;
  const userCompanyId = req.user.company?._id || req.user.company;

  // Validate orderId
  if (!orderId) {
    throw new AppError("Order ID is required", 400);
  }

  // Find the order and ensure user has access to it
  const order = await Order.findOne({
    _id: orderId,
    $or: [{ buyer: userCompanyId }, { supplier: userCompanyId }],
  });

  if (!order) {
    throw new AppError("Order not found or you don't have access to it", 404);
  }

  // Determine user's role for this order
  const userRole =
    order.buyer._id.toString() === userCompanyId.toString()
      ? "buyer"
      : "supplier";

  return res.status(200).json({
    status: "success",
    data: {
      allowedStatus: ORDER_ROLE_PERMISSIONS[userRole][order.status] || [],
    },
  });
};
