import express from "express";
import { createInventory } from "../controllers/inventory/createInventory.controller.js";
import { getAllInventory } from "../controllers/inventory/getAllInventory.controller.js";
import { updateInventory } from "../controllers/inventory/updateInventory.controller.js";
import { getInventoryById } from "../controllers/inventory/getInventoryById.controller.js";
import { catchError } from "../utils/catchError.js";
import { updateInventoryValidator } from "../validators/inventory.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protectedRoute, allowedTo } from "../middlewares/auth.middleware.js";
import { createinventoryValidator } from "../validators/inventory.validator.js";

const router = express.Router();

router
  .route("/")
  .get(allowedTo("admin", "manager", "staff"), catchError(getAllInventory))
  .post(
    protectedRoute,
    allowedTo("admin", "manager"),
    validate(createinventoryValidator()),
    catchError(createInventory)
  );

router
  .route("/:inventoryId")
  .get(allowedTo("admin", "manager", "staff"), catchError(getInventoryById))
  .patch(
    allowedTo("admin", "manager"),
    validate(updateInventoryValidator()),
    catchError(updateInventory)
  );

export default router;
