import Order from "../../models/Order.js";
import { AppError } from "../../utils/AppError.js";
import { ORDER_ROLE_PERMISSIONS } from "../../enums/orderStatus.enum.js";
export const getOrderById = async (req, res) => {
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
  })
    .select({
      __v: false,
    })
    .populate([
      {
        path: "buyer",
        select: "companyName email phone location",
        populate: {
          path: "location",
          select: "locationName city state country",
        },
      },
      {
        path: "supplier",
        select: "companyName email phone location",
        populate: {
          path: "location",
          select: "locationName city state country",
        },
      },
      { path: "createdBy", select: "name email" },
      {
        path: "deliveryLocation",
        select: "locationName city state country",
      },
      //   {
      //     path: "shipments",
      //     select: "trackingNumber status estimatedDelivery actualDelivery",
      //   },
      //   { path: "invoice", select: "invoiceNumber status totalAmount dueDate" },
      //   { path: "history.updatedBy", select: "name email" },
      //   { path: "returnInfo.returnedBy", select: "name email" },
      //   { path: "returnProcessing.processedBy", select: "name email" },
    ])
    .lean();

  if (!order) {
    throw new AppError("Order not found or you don't have access to it", 404);
  }

  // Determine user's role for this order
  const userRole =
    order.buyer._id.toString() === userCompanyId.toString()
      ? "buyer"
      : "supplier";

  // Add user role to the order object
  order.userRole = userRole;

  return res.status(200).json({
    status: "success",
    data: {
      order,
      acceptAction: ORDER_ROLE_PERMISSIONS[userRole][order.status],
    },
  });
};
