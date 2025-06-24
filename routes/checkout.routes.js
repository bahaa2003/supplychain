import { Router } from "express";
import {
  createPaymentIntent,
  validateCartForCheckout,
} from "../controllers/checkout/checkout.controller.js";
import { validateCartIdValidator } from "../validators/checkout.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import { catchError } from "../utils/catchError.js";

const router = Router();

// All checkout routes require authentication
router.use(protectedRoute);

router
  .route("/validate")
  .post(validateCartIdValidator, validate, catchError(validateCartForCheckout));

router
  .route("/payment-intent")
  .post(validateCartIdValidator, validate, catchError(createPaymentIntent));

export default router;
