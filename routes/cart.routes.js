import { Router } from "express";
import {
  addToCart,
  getCarts,
  removeCartItem,
  updateCartItem,
} from "../controllers/cart/cart.controller.js";
import {
  addToCartValidator,
  removeCartItemValidator,
  updateCartItemValidator,
} from "../validators/cart.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import { catchError } from "../utils/catchError.js";

const router = Router();

// All cart routes require authentication
router.use(protectedRoute);

router
  .route("/")
  .get(catchError(getCarts)) // TODO: add role middleware
  .post(addToCartValidator, validate, catchError(addToCart));

router
  .route("/items/:cartItemId")
  .patch(updateCartItemValidator, validate, catchError(updateCartItem))
  .delete(removeCartItemValidator, validate, catchError(removeCartItem));

export default router;
