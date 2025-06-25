import express from "express";
import { getAllProducts } from "../controllers/product/getAllProducts.controller.js";
import { getProductById } from "../controllers/product/getProductById.controller.js";
import { createProduct } from "../controllers/product/createProduct.controller.js";
import { updateProduct } from "../controllers/product/updateProduct.controller.js";
import { deleteProduct } from "../controllers/product/deleteProduct.controller.js";
import { catchError } from "../utils/catchError.js";
import { protectedRoute, allowedTo } from "../middlewares/auth.middleware.js";
import {
  createProductValidator,
  updateProductValidator,
} from "../validators/product.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router
  .route("/")
  .get(allowedTo("admin", "manager", "staff"), catchError(getAllProducts))
  .post(
    protectedRoute,
    allowedTo("admin", "manager"),
    upload.array("images"),
    validate(createProductValidator()),
    catchError(createProduct)
  );

router
  .route("/:id")
  .get(allowedTo("admin", "manager", "staff"), catchError(getProductById))
  .delete(protectedRoute, allowedTo("admin"), catchError(deleteProduct))
  .patch(
    protectedRoute,
    allowedTo("admin", "manager"),
    validate(updateProductValidator()),
    catchError(updateProduct)
  );

export default router;
