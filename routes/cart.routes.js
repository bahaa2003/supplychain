import express from "express";
import { validate } from "../middleware/validate.middleware.js";
import {
  createCartValidator,
  updateCartValidator,
} from "../validators/cart.validator.js";
import { createCart } from "../controllers/cart/createCart.controller.js";
import { updateCart } from "../controllers/cart/updateCart.controller.js";
import { getCart } from "../controllers/cart/getCart.controller.js";
import { deleteCart } from "../controllers/cart/deleteCart.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", validate(createCartValidator), createCart);
router.put("/", validate(updateCartValidator), updateCart);
router.get("/", getCart);
router.delete("/", deleteCart);

export default router;
