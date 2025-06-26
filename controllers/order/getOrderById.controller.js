import Order from "../../models/Order.js";
import { AppError } from "../../utils/AppError.js";
import { catchError } from "../../utils/catchError.js";

const getOrderById = catchError(async (req, res, next) => {
  const { orderId } = req.params;
  if (!orderId) {
    return next(new AppError("Order ID is required.", 400));
  }
  const order = await Order.findById(orderId)
    .populate("buyer")
    .populate("supplier")
    .populate("createdBy")
    .populate("assignedTo")
    .populate("items.product")
    .populate("shipments")
    .populate("documents")
    .populate("invoice");
  if (!order) {
    return next(new AppError("Order not found.", 404));
  }
  // Check if the order belongs to the user's company
  const companyId = req.user.companyId?.toString();
  if (
    order.buyer?._id?.toString() !== companyId &&
    order.supplier?._id?.toString() !== companyId
  ) {
    return next(
      new AppError("You do not have permission to view this order.", 403)
    );
  }
  res.status(200).json({
    status: "success",
    message: "Order fetched successfully.",
    data: order,
  });
});

export default getOrderById;
