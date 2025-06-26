import { createOrderService } from "../../services/order/createOrder.service.js";
import { catchError } from "../../utils/catchError.js";
import { httpStatusText } from "../../utils/httpStatusText.js";

export const createOrder = catchError(async (req, res, next) => {
  const orderData = req.body;
  const user = req.user; // Assuming user is populated by auth middleware

  const newOrder = await createOrderService(orderData, user);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { order: newOrder },
  });
});
