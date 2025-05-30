import express from "express";
import { getAllProducts } from "../controllers/product/getAllProducts.js";
import { getProductById } from "../controllers/product/getProductById.js";
import { createProduct } from "../controllers/product/createProduct.js";
import { updateProduct } from "../controllers/product/updateProduct.js";
import { deleteProduct } from "../controllers/product/deleteProduct.js";

import { catchError } from "../utils/catchError.js";
import { protectedRoute, allowedTo } from "../middleware/auth.middleware.js";
import { productValidator } from "../validators/product.validator.js";
import { validationExecution } from "../middleware/validation.middleware.js";

const router = express.Router();

router.use(protectedRoute);

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
  allowedTo("admin", "manager"),
  productValidator(),
  validationExecution,
  catchError(createProduct)
);
router.put(
  "/:id",
  allowedTo("admin", "manager"),
  productValidator(),
  validationExecution,
  catchError(updateProduct)
);
router.delete("/:id", allowedTo("admin"), catchError(deleteProduct));

export default router;
