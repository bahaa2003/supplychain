import { Router } from "express";
import { updateOrderStatus } from "../controllers/order/updateOrderStatus.controller.js";
import { getCompanyOrders } from "../controllers/order/getCompanyOrders.controller.js";
import { getOrderById } from "../controllers/order/getOrderById.controller.js";
import { createOrder } from "../controllers/order/createOrder.controller.js";
import {
  addOrderItem,
  editOrderItem,
  removeOrderItem,
} from "../controllers/order/updateOrderItem.controller.js";
import { getAllowedStatus } from "../controllers/order/getAllowedStatus.controller.js";

import {
  createOrderValidator,
  updateOrderStatusValidator,
  addOrderItemValidator,
  editOrderItemValidator,
  removeOrderItemValidator,
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
    validate(updateOrderStatusValidator()),
    catchError(updateOrderStatus)
  );

router.route("/:orderId/allowedStatus").get(getAllowedStatus);

// Order item management routes
router
  .route("/:orderId/edit/:itemId")
  .patch(
    allowedTo(roles.ADMIN, roles.MANAGER, roles.STAFF),
    validate(editOrderItemValidator()),
    catchError(editOrderItem)
  );

router
  .route("/:orderId/remove/:itemId")
  .delete(
    allowedTo(roles.ADMIN, roles.MANAGER, roles.STAFF),
    validate(removeOrderItemValidator()),
    catchError(removeOrderItem)
  );

router
  .route("/:orderId/add")
  .post(
    allowedTo(roles.ADMIN, roles.MANAGER, roles.STAFF),
    validate(addOrderItemValidator()),
    catchError(addOrderItem)
  );

export default router;
