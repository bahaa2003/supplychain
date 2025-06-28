import { Router } from "express";
import { updateOrder } from "../controllers/order/updateOrder.controller.js";
import { getCompanyOrders } from "../controllers/order/getCompanyOrders.controller.js";
import { createOrder } from "../controllers/order/createOrder.controller.js";
import { validateOrderItems } from "../controllers/order/validateOrderItems.controller.js";
import { returnOrder } from "../controllers/order/returnOrder.controller.js";
import { processReturn } from "../controllers/order/processReturn.controller.js";
import {
  createOrderValidator,
  updateOrderValidator,
  returnOrderValidator,
} from "../validators/order.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import { catchError } from "../utils/catchError.js";

const router = Router();

// All order routes require authentication
router.use(protectedRoute);

router
  .route("/")
  .get(catchError(getCompanyOrders))
  .post(validate(createOrderValidator()), catchError(createOrder));

router
  .route("/:orderId")
  .patch(validate(updateOrderValidator()), catchError(updateOrder));

// Validate order items before approval or submission
router.route("/:orderId/validate").post(catchError(validateOrderItems));

// Return order functionality
router
  .route("/:orderId/return")
  .post(validate(returnOrderValidator()), catchError(returnOrder));

// Process return (supplier side)
router.route("/:orderId/process-return").patch(catchError(processReturn));

export default router;
