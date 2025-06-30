import { Router } from "express";
import { updateOrder } from "../controllers/order/updateOrder.controller.js";
import { getCompanyOrders } from "../controllers/order/getCompanyOrders.controller.js";
import { getOrderById } from "../controllers/order/getOrderById.controller.js";
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
import { roles } from "../enums/role.enum.js";
import { allowedTo } from "../middlewares/auth.middleware.js";
const router = Router();

// All order routes require authentication
router.use(protectedRoute);

router
  .route("/")
  .get(
    allowedTo(roles.ADMIN, roles.MANAGER, roles.STAFF),
    catchError(getCompanyOrders)
  );
router
  .route("/:supplierId")
  .post(
    allowedTo(roles.ADMIN, roles.MANAGER, roles.STAFF),
    validate(createOrderValidator()),
    catchError(createOrder)
  );

router
  .route("/:orderId")
  .get(
    allowedTo(roles.ADMIN, roles.MANAGER, roles.STAFF),
    catchError(getOrderById)
  )
  .patch(
    allowedTo(roles.ADMIN, roles.MANAGER),
    validate(updateOrderValidator()),
    catchError(updateOrder)
  );

// Validate order items before approval or submission
router
  .route("/:orderId/validate")
  .get(
    allowedTo(roles.ADMIN, roles.MANAGER, roles.STAFF),
    catchError(validateOrderItems)
  );

// Return order functionality
router
  .route("/:orderId/return")
  .post(
    allowedTo(roles.ADMIN, roles.MANAGER),
    validate(returnOrderValidator()),
    catchError(returnOrder)
  );

// Process return (supplier side)
router
  .route("/:orderId/process-return")
  .patch(allowedTo(roles.ADMIN, roles.MANAGER), catchError(processReturn));

export default router;
