import express from "express";
import { getAllProducts } from "../controllers/product/getAllProducts.js";
import { getProductById } from "../controllers/product/getProductById.js";
import { createProduct } from "../controllers/product/createProduct.js";
import { updateProduct } from "../controllers/product/updateProduct.js";
import { deleteProduct } from "../controllers/product/deleteProduct.js";
import { catchError } from "../utils/catchError.js";
import { protectedRoute, allowedTo } from "../middleware/auth.middleware.js";
import {
  createProductValidator,
  updateProductValidator,
} from "../validators/product.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get(
  "/",
  allowedTo("admin", "manager", "staff"),
  catchError(getAllProducts)
);

router.get(
  "/:id",
  allowedTo("admin", "manager", "staff"),
  catchError(getProductById)
);

router.post(
  "/",
  protectedRoute,
  allowedTo("admin", "manager"),
  upload.array("images"),
  validate(createProductValidator()),
  catchError(createProduct)
);

router.patch(
  "/:id",
  protectedRoute,
  allowedTo("admin", "manager"),
  validate(updateProductValidator()),
  catchError(updateProduct)
);

router.delete("/:id", protectedRoute, allowedTo("admin"), catchError(deleteProduct));

export default router;
