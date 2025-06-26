import { Router } from "express";
import {
  acceptOrder,
  cancelOrder,
  draftOrder,
  getCompanyOrders,
} from "../controllers/order/order.controller.js";
import { createOrder } from "../controllers/order/createOrder.controller.js";
import { validateMongoId } from "../validators/common.validator.js";
import { createOrderValidator } from "../validators/order.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import { isSupplier, isBuyer } from "../middlewares/role.middleware.js";
import { catchError } from "../utils/catchError.js";

const router = Router();

// All order routes require authentication
router.use(protectedRoute);

router
  .route("/")
  .get(catchError(getCompanyOrders))
  .post(isBuyer, createOrderValidator, validate, catchError(createOrder));

router
  .route("/:orderId/draft")
  .post(
    validateMongoId("orderId"),
    validate,
    isSupplier,
    catchError(draftOrder)
  ); // Protect with role middleware

router
  .route("/:orderId/cancel")
  .post(validateMongoId("orderId"), validate, catchError(cancelOrder)); // Accessible to both buyer and supplier

router
  .route("/:orderId/accept")
  .post(validateMongoId("orderId"), validate, isBuyer, catchError(acceptOrder));

export default router;
