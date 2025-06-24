import draftOrderService from "../../services/order/draftOrder.service.js";
import cancelOrderService from "../../services/order/cancelOrder.service.js";
import acceptOrderService from "../../services/order/acceptOrder.service.js";
import getCompanyOrdersService from "../../services/order/getCompanyOrders.service.js";
import { AppError } from "../../utils/AppError.js";

export const draftOrder = async (req, res, next) => {
  // This action is performed by a user belonging to the supplier company
  const supplierCompanyId = req.user.companyId;
  const { orderId } = req.params;

  if (!orderId) {
    return next(new AppError("Order ID is required.", 400));
  }

  try {
    const order = await draftOrderService({ orderId, supplierCompanyId });
    return res.status(200).json({
      status: "success",
      message: "Order successfully moved to draft.",
      data: order,
    });
  } catch (error) {
    return next(
      new AppError(error.message || "Failed to move order to draft", 500)
    );
  }
};

export const cancelOrder = async (req, res, next) => {
  const companyId = req.user.companyId; // Can be buyer or supplier
  const { orderId } = req.params;

  try {
    const order = await cancelOrderService({ orderId, companyId });
    return res.status(200).json({
      status: "success",
      message: "Order successfully cancelled.",
      data: order,
    });
  } catch (error) {
    return next(new AppError(error.message || "Failed to cancel order", 500));
  }
};

export const acceptOrder = async (req, res, next) => {
  const buyerCompanyId = req.user.companyId; // Action performed by buyer
  const buyerUserId = req.user._id;
  const { orderId } = req.params;

  try {
    const order = await acceptOrderService({
      orderId,
      buyerCompanyId,
      buyerUserId,
    });
    return res.status(200).json({
      status: "success",
      message: "Order successfully accepted.",
      data: order,
    });
  } catch (error) {
    return next(new AppError(error.message || "Failed to accept order", 500));
  }
};

export const getCompanyOrders = async (req, res, next) => {
  const companyId = req.user.companyId;
  const {
    direction, // sent | received | undefined
    filterCompanyId,
    from,
    to,
    page = 1,
    limit = 20,
  } = req.query;
  try {
    const result = await getCompanyOrdersService({
      companyId,
      direction,
      filterCompanyId,
      from,
      to,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    return res.status(200).json({
      status: "success",
      message: "Orders fetched successfully.",
      data: {
        orders: result.orders,
        page: result.page,
        limit: parseInt(limit, 10),
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    return next(new AppError(error.message || "Failed to fetch orders", 500));
  }
};
