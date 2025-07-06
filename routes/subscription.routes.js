import express from "express";
import { protectedRoute, checkEmailVerified, allowedTo } from "../middlewares/auth.middleware.js";
import { createCheckoutSession } from "../controllers/subscription/checkout.controller.js";
import { catchError } from "../utils/catchError.js";

const router = express.Router();

router.post(
  "/checkout-session",
  protectedRoute,
  checkEmailVerified,
  allowedTo("admin"),
  catchError(createCheckoutSession)
);

export default router;
